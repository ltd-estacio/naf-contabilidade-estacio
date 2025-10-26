import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'
import { performance } from 'node:perf_hooks'
import JSZip from 'jszip'
import type { SupabaseClient } from '@supabase/supabase-js'

import { supabaseAdmin, supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

const SCHEMA_PATH = path.join(process.cwd(), 'src', 'sql', 'tables.sql')
const DEFAULT_PAGE_SIZE = 1000
const MAX_ROWS_IN_MEMORY = 200_000

const SUPPORTED_FORMATS = new Set(['json', 'sql', 'csv', 'zip'])
type BackupFormat = 'json' | 'sql' | 'csv' | 'zip'

type CompressionMode = 'gzip' | 'store'

interface TableResult {
  name: string
  rows: Record<string, unknown>[]
  rowCount: number
  estimatedBytes: number
  columns: string[]
  durationMs: number
  truncated: boolean
}

interface BackupMetadata {
  generatedAt: string
  format: BackupFormat
  preview: boolean
  tableCount: number
  totalRows: number
  totalBytes: number
  schemaIncluded: boolean
  extras: string[]
  scope: string[]
  fetchDurationMs: number
  serviceRole: boolean
  errors: Array<{ table: string; message: string }>
  tables: Array<{
    name: string
    rowCount: number
    estimatedBytes: number
    durationMs: number
    truncated: boolean
    columns: string[]
    empty: boolean
  }>
}

interface BackupOptions {
  format: BackupFormat
  includeSchema: boolean
  preview: boolean
  requestedTables: string[] | null
  extras: string[]
  pageSize: number
}

const parseBoolean = (value: string | null | undefined, defaultValue = false): boolean => {
  if (value === null || value === undefined || value === '') return defaultValue
  const normalized = value.toString().trim().toLowerCase()
  return ['1', 'true', 'yes', 'sim', 'on'].includes(normalized)
}

const ensureSupabaseClient = (): SupabaseClient | typeof supabaseAdmin => {
  // Usar supabaseAdmin se disponível, senão usar o cliente padrão
  // O sistema já trata o fallback para mock internamente
  return supabaseAdmin
}

const extractTablesFromSchema = async (): Promise<string[]> => {
  const sql = await fs.readFile(SCHEMA_PATH, 'utf-8').catch(() => '')
  const matches = sql.matchAll(/CREATE\s+TABLE\s+public\.([a-zA-Z0-9_]+)/g)
  const tables = new Set<string>()
  for (const match of matches) {
    if (match[1]) tables.add(match[1])
  }
  return Array.from(tables)
}

const resolveScope = (available: string[], requested: string[] | null): string[] => {
  if (!requested || requested.length === 0) {
    return available
  }
  const normalized = requested.map((name) => name.trim().toLowerCase())
  const filtered = available.filter((table) => normalized.includes(table.toLowerCase()))
  if (filtered.length === 0) {
    throw new Error('Nenhuma tabela correspondente encontrada para o escopo informado.')
  }
  return filtered
}

const fetchTableData = async (
  client: SupabaseClient | typeof supabaseAdmin,
  tableName: string,
  preview: boolean,
  pageSize: number
): Promise<TableResult> => {
  const tableStart = performance.now()
  const rows: Record<string, unknown>[] = []
  const columnSet = new Set<string>()
  let rowCount = 0
  let truncated = false

  if (preview) {
    const countResult = await (client as any)
      .from(tableName)
      .select('*', { count: 'exact', head: true }) as { count: number | null; error: any }

    if (countResult.error) {
      throw new Error(`Falha ao contar registros: ${countResult.error.message}`)
    }

    rowCount = countResult.count ?? 0

    if (rowCount > 0) {
      const sampleResult = await (client as any)
        .from(tableName)
        .select('*')
        .limit(1) as { data: any[] | null; error: any }

      if (sampleResult.error) {
        throw new Error(`Falha ao obter amostra: ${sampleResult.error.message}`)
      }

      if (sampleResult.data && sampleResult.data[0]) {
        Object.keys(sampleResult.data[0]).forEach((key) => columnSet.add(key))
      }
    }

    const durationMs = Math.round(performance.now() - tableStart)
    return {
      name: tableName,
      rows: [],
      rowCount,
      estimatedBytes: 0,
      columns: Array.from(columnSet),
      durationMs,
      truncated
    }
  }

  let from = 0
  let fetched = 0
  let totalKnown = 0

  let hasMore = true

  while (hasMore) {
    const to = from + pageSize - 1
    const result = await (client as any)
      .from(tableName)
      .select('*', { count: from === 0 ? 'exact' : undefined })
      .range(from, to) as { data: any[] | null; error: any; count?: number | null }

    if (result.error) {
      throw new Error(`Erro ao obter dados: ${result.error.message}`)
    }

    if (typeof result.count === 'number' && totalKnown === 0) {
      totalKnown = result.count
    }

    if (result.data && result.data.length > 0) {
      rows.push(...result.data)
      result.data.forEach((row: any) => {
        Object.keys(row || {}).forEach((key) => columnSet.add(key))
      })
      fetched += result.data.length
    }

    if (!result.data || result.data.length < pageSize) {
      hasMore = false
      continue
    }

    from += pageSize

    if (rows.length >= MAX_ROWS_IN_MEMORY) {
      truncated = true
      hasMore = false
    }
  }

  rowCount = totalKnown || fetched
  const estimatedBytes = Buffer.byteLength(JSON.stringify(rows))
  const durationMs = Math.round(performance.now() - tableStart)

  return {
    name: tableName,
    rows,
    rowCount,
    estimatedBytes,
    columns: Array.from(columnSet),
    durationMs,
    truncated
  }
}

const escapeSqlValue = (value: unknown): string => {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'number' && Number.isFinite(value)) return value.toString()
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
  if (value instanceof Date) return `'${value.toISOString()}'`
  if (Array.isArray(value) || typeof value === 'object') {
    const serialized = JSON.stringify(value)
    return `'$${serialized.replace(/'/g, "''")}$'::jsonb`
  }
  const text = value.toString().replace(/'/g, "''")
  return `'${text}'`
}

const buildInsertStatements = (table: TableResult): string => {
  if (!table.rows.length) {
    return `-- Nenhum registro para ${table.name}`
  }

  const columns = table.columns.length
    ? table.columns
    : Object.keys(table.rows[0] ?? {})

  const quotedColumns = columns.map((col) => `"${col}"`).join(', ')
  const lines: string[] = []

  table.rows.forEach((row) => {
    const values = columns.map((column) => escapeSqlValue((row as Record<string, unknown>)[column]))
    lines.push(`INSERT INTO public."${table.name}" (${quotedColumns}) VALUES (${values.join(', ')});`)
  })

  return lines.join('\n')
}

const buildSqlDump = (
  schemaSql: string,
  tables: TableResult[],
  metadata: BackupMetadata
): string => {
  const parts: string[] = []
  parts.push('-- NAF Contábil • Backup do Coordenador')
  parts.push(`-- Gerado em: ${metadata.generatedAt}`)
  parts.push(`-- Formato: ${metadata.format} | Tabelas: ${metadata.tableCount} | Registros: ${metadata.totalRows}`)
  parts.push('--')

  if (metadata.schemaIncluded && schemaSql) {
    parts.push(schemaSql.trim())
    parts.push('-- Dados das tabelas')
  }

  tables.forEach((table) => {
    parts.push(`\n-- Tabela: ${table.name}`)
    if (table.truncated) {
      parts.push(`-- Atenção: exportação truncada após ${MAX_ROWS_IN_MEMORY} registros.`)
    }
    const inserts = buildInsertStatements(table)
    parts.push(inserts)
  })

  return parts.join('\n')
}

const escapeCsv = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  const text = typeof value === 'object' ? JSON.stringify(value) : value.toString()
  if (/["]|,|\n/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

const buildCsv = (table: TableResult): string => {
  const columns = table.columns.length
    ? table.columns
    : table.rows.length
    ? Object.keys(table.rows[0] ?? {})
    : []

  const lines: string[] = []
  lines.push(columns.join(','))

  table.rows.forEach((row) => {
    const values = columns.map((column) => escapeCsv((row as Record<string, unknown>)[column]))
    lines.push(values.join(','))
  })

  return lines.join('\n')
}

const buildZipPackage = async (
  tables: TableResult[],
  metadata: BackupMetadata,
  schemaSql: string,
  includeSchema: boolean,
  extras: string[],
  compression: CompressionMode,
  preview: boolean
): Promise<Uint8Array> => {
  const zip = new JSZip()
  zip.file('metadata.json', JSON.stringify(metadata, null, 2))

  if (includeSchema && schemaSql) {
    zip.file('schema.sql', schemaSql)
  }

  const tablesFolder = zip.folder('tables')

  tables.forEach((table) => {
    const tableMeta = {
      name: table.name,
      rowCount: table.rowCount,
      estimatedBytes: table.estimatedBytes,
      columns: table.columns,
      truncated: table.truncated
    }

    tablesFolder?.file(`${table.name}.meta.json`, JSON.stringify(tableMeta, null, 2))

    if (preview) return

    if (extras.includes('json')) {
      tablesFolder?.file(`${table.name}.json`, JSON.stringify(table.rows, null, 2))
    }

    if (extras.includes('csv')) {
      tablesFolder?.file(`${table.name}.csv`, buildCsv(table))
    }

    if (extras.includes('sql')) {
      tablesFolder?.file(`${table.name}.sql`, buildInsertStatements(table))
    }
  })

  const compressionMode = compression === 'gzip' ? 'DEFLATE' : 'STORE'
  return zip.generateAsync({
    type: 'uint8array',
    compression: compressionMode,
    compressionOptions: compressionMode === 'DEFLATE' ? { level: 9 } : undefined
  })
}

const summariseMetadata = (metadata: BackupMetadata) => ({
  generatedAt: metadata.generatedAt,
  format: metadata.format,
  preview: metadata.preview,
  tableCount: metadata.tableCount,
  totalRows: metadata.totalRows,
  totalBytes: metadata.totalBytes,
  schemaIncluded: metadata.schemaIncluded,
  fetchDurationMs: metadata.fetchDurationMs,
  serviceRole: metadata.serviceRole,
  errorCount: metadata.errors.length
})

const formatFilename = (format: BackupFormat, preview: boolean): string => {
  const timestamp = new Date().toISOString().replace(/[:]/g, '').replace(/\..+$/, '').replace('T', '_')
  const suffix = preview ? 'preview' : 'full'
  return `naf-backup_${suffix}_${timestamp}.${format === 'zip' ? 'zip' : format === 'csv' ? 'zip' : format}`
}

const createBackup = async (options: BackupOptions) => {
  const client = ensureSupabaseClient()
  const availableTables = await extractTablesFromSchema()
  if (availableTables.length === 0) {
    throw new Error('Nenhuma tabela encontrada no arquivo database/tables.sql.')
  }

  const scopeTables = resolveScope(availableTables, options.requestedTables)
  const schemaSql = options.includeSchema ? await fs.readFile(SCHEMA_PATH, 'utf-8').catch(() => '') : ''

  const errors: Array<{ table: string; message: string }> = []
  const tables: TableResult[] = []
  const start = performance.now()

  for (const tableName of scopeTables) {
    try {
      const tableData = await fetchTableData(client, tableName, options.preview, options.pageSize)
      tables.push(tableData)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      errors.push({ table: tableName, message: errorMessage })
    }
  }

  if (tables.length === 0) {
    const detail = errors.map((err) => `${err.table}: ${err.message}`).join(' | ')
    throw new Error(detail || 'Não foi possível gerar o backup solicitado.')
  }

  const totalRows = tables.reduce((sum, table) => sum + table.rowCount, 0)
  const totalBytes = tables.reduce((sum, table) => sum + table.estimatedBytes, 0)

  const metadata: BackupMetadata = {
    generatedAt: new Date().toISOString(),
    format: options.format,
    preview: options.preview,
    tableCount: scopeTables.length,
    totalRows,
    totalBytes,
    schemaIncluded: options.includeSchema,
    extras: options.extras,
    scope: scopeTables,
    fetchDurationMs: Math.round(performance.now() - start),
    serviceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    errors,
    tables: tables.map((table) => ({
      name: table.name,
      rowCount: table.rowCount,
      estimatedBytes: table.estimatedBytes,
      durationMs: table.durationMs,
      truncated: table.truncated,
      columns: table.columns,
      empty: table.rowCount === 0
    }))
  }

  return { metadata, tables, schemaSql }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const formatParam = (searchParams.get('format') || 'zip').toLowerCase()
    if (!SUPPORTED_FORMATS.has(formatParam)) {
      return NextResponse.json({ success: false, message: 'Formato de backup inválido.' }, { status: 400 })
    }
    const format = formatParam as BackupFormat

    const preview = parseBoolean(searchParams.get('preview'))
    if (preview && format !== 'json') {
      return NextResponse.json(
        { success: false, message: 'Modo preview disponível apenas para o formato JSON.' },
        { status: 400 }
      )
    }

    const includeSchema = parseBoolean(searchParams.get('includeSchema'), true)
    const scopeParam = searchParams.get('scope')
    const requestedTables = scopeParam && scopeParam.trim().length > 0 && scopeParam.trim().toLowerCase() !== 'full'
      ? scopeParam.split(',').map((name) => name.trim()).filter(Boolean)
      : null

    const extrasParam = searchParams.get('extras')
    const extras = extrasParam
      ? extrasParam.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean)
      : format === 'zip'
      ? ['json', 'csv', 'sql']
      : format === 'csv'
      ? ['csv']
      : []

    const compressionParam = (searchParams.get('compression') || (format === 'zip' ? 'gzip' : 'store')).toLowerCase()
    const compression: CompressionMode = compressionParam === 'gzip' ? 'gzip' : 'store'

    const pageSizeParam = Number.parseInt(searchParams.get('batchSize') || '', 10)
    const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0
      ? Math.min(Math.max(pageSizeParam, 100), 2000)
      : DEFAULT_PAGE_SIZE

    const { metadata, tables, schemaSql } = await createBackup({
      format,
      includeSchema,
      preview,
      requestedTables,
      extras,
      pageSize
    })

    const metadataHeader = JSON.stringify(summariseMetadata(metadata))
    const filename = formatFilename(format, preview)

    if (format === 'json') {
      const body = {
        metadata,
        schema: includeSchema ? schemaSql : null,
        tables: preview
          ? []
          : tables.map((table) => ({ name: table.name, rows: table.rows }))
      }

      return NextResponse.json(body, {
        headers: {
          'Content-Disposition': `attachment; filename="${filename}"`,
          'X-Backup-Metadata': metadataHeader
        }
      })
    }

    if (format === 'sql') {
      const dump = buildSqlDump(schemaSql, tables, metadata)
      return new NextResponse(dump, {
        headers: {
          'Content-Type': 'application/sql; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'X-Backup-Metadata': metadataHeader
        }
      })
    }

    const zipExtras = format === 'csv' ? ['csv'] : extras.length ? extras : ['json', 'csv', 'sql']
    const archive = await buildZipPackage(tables, metadata, schemaSql, includeSchema, zipExtras, compression, preview)

    return new NextResponse(archive as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': archive.byteLength.toString(),
        'X-Backup-Metadata': metadataHeader
      }
    })
  } catch (error: unknown) {
    console.error('Erro ao gerar backup:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { success: false, message: 'Erro ao gerar backup', detail: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))

    if (body?.schedule) {
      const schedule = {
        enabled: true,
        frequency: body.frequency || 'daily',
        time: body.time || '02:00',
        retentionDays: body.retentionDays || 30,
        formats: Array.isArray(body.formats) && body.formats.length ? body.formats : ['zip'],
        lastBackup: new Date().toISOString(),
        nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      return NextResponse.json({
        success: true,
        message: 'Agendamento de backup configurado (simulação).',
        schedule
      })
    }

    const format = (body?.format || 'zip').toLowerCase()
    if (!SUPPORTED_FORMATS.has(format)) {
      return NextResponse.json({ success: false, message: 'Formato de backup inválido.' }, { status: 400 })
    }

    const includeSchema = body?.includeSchema ?? true
    const preview = body?.preview ?? true
    const requestedTables = Array.isArray(body?.tables) ? body.tables : null
    const extras = Array.isArray(body?.extras) && body.extras.length ? body.extras : ['json', 'csv', 'sql']
    const pageSize = Number.isFinite(body?.batchSize)
      ? Math.min(Math.max(Number(body.batchSize), 100), 2000)
      : DEFAULT_PAGE_SIZE

    const { metadata } = await createBackup({
      format: format as BackupFormat,
      includeSchema,
      preview,
      requestedTables,
      extras,
      pageSize
    })

    return NextResponse.json({
      success: true,
      message: preview ? 'Pré-visualização de backup gerada.' : 'Backup concluído com sucesso.',
      metadata
    })
  } catch (error: unknown) {
    console.error('Erro ao processar requisição de backup:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { success: false, message: 'Erro interno durante o processamento do backup.', detail: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'cleanup') {
      const cleanupResult = {
        simulated: true,
        removed: 8,
        retained: 42,
        spaceRecovered: '3.1 GB',
        oldestBackupKept: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      }

      return NextResponse.json({
        success: true,
        message: 'Rotina de limpeza concluída (simulação).',
        result: cleanupResult
      })
    }

    return NextResponse.json(
      { success: false, message: 'Ação não reconhecida. Utilize action=cleanup.' },
      { status: 400 }
    )
  } catch (error: unknown) {
    console.error('Erro durante a limpeza de backups:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { success: false, message: 'Erro interno durante a limpeza de backups.', detail: errorMessage },
      { status: 500 }
    )
  }
}
