import type { Browser, BrowserContext, Page } from 'playwright'
import { promises as fs } from 'fs'
import path from 'path'
import Papa from 'papaparse'

export type AutomationSummary = {
  totalRows: number
  succeeded: number
  failed: number
}

export type AutomationResult = {
  logs: string[]
  summary: AutomationSummary
}

type AutomationError = Error & { logs?: string[] }

type AutomationFormConfig = {
  id: string
  url: string
  mapping: Record<string, string[]>
}

const FORM_CONFIGS: Record<string, AutomationFormConfig> = {
  'ficha-servico': {
    id: 'ficha-servico',
    url: 'https://forms.office.com/pages/responsepage.aspx?id=Q6pJbyqCIEyWcNt3AL8esLOeSofjsRxAvgRIQVYNlxJURFpFREtLWjhKODlZMDBZS09QTkhJNU82QyQlQCN0PWcu&route=shorturl',
    mapping: {
      nome: ['nome completo', 'nome', 'nome do contribuinte'],
      cpf: ['cpf', 'documento'],
      email: ['email', 'e-mail'],
      telefone: ['telefone', 'celular', 'contato'],
      cidade: ['cidade', 'município', 'municipio'],
      estado: ['estado', 'uf'],
      servico: ['serviço', 'tipo de serviço', 'tipo atendimento', 'tipo de atendimento'],
      data: ['data', 'data do atendimento'],
      modalidade: ['modalidade', 'formato', 'presencial', 'remoto'],
    },
  },
  'boas-praticas': {
    id: 'boas-praticas',
    url: 'https://forms.office.com/pages/responsepage.aspx?id=Q6pJbyqCIEyWcNt3AL8esDZnJHy5FONNgoCmZesCVIhUOE9GVlhZWlZOTzlFMlVUT0xLOTNDOVdPOS4u&route=shorturl',
    mapping: {
      campus: ['campus', 'unidade', 'cidade'],
      acao: ['ação', 'boas práticas', 'prática'],
      descricao: ['descrição', 'detalhes', 'relato'],
      resultados: ['resultados', 'impacto'],
      equipe: ['equipe', 'responsáveis', 'responsaveis'],
    },
  },
}

function normalise(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

async function fillField(page: Page, label: string, value: string, log: (msg: string) => void) {
  const cleanedLabel = normalise(label)
  const locator = page.locator('input[aria-label], textarea[aria-label]')
  const count = await locator.count()

  for (let i = 0; i < count; i++) {
    const element = locator.nth(i)
    const aria = await element.getAttribute('aria-label')
    if (!aria) continue
    const normalisedAria = normalise(aria)

    if (
      normalisedAria === cleanedLabel ||
      normalisedAria.includes(cleanedLabel) ||
      cleanedLabel.includes(normalisedAria)
    ) {
      try {
        await element.fill('')
        await element.type(value, { delay: 10 })
        log(`   ↳ campo "${aria}" preenchido com sucesso`)
        return true
      } catch (error) {
        log(`   ⚠️ falha ao preencher campo "${aria}": ${(error as Error).message}`)
        return false
      }
    }
  }

  log(`   ⚠️ campo correspondente a "${label}" não localizado no formulário`)
  return false
}

export async function runPlaywrightAutomation(formId: string, filePath: string): Promise<AutomationResult> {
  const config = FORM_CONFIGS[formId]
  if (!config) {
    throw new Error(`Formulário não suportado: ${formId}`)
  }

  const logs: string[] = []
  const summary: AutomationSummary = {
    totalRows: 0,
    succeeded: 0,
    failed: 0,
  }

  const log = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1]?.split('.')[0] ?? '??'
    logs.push(`[${timestamp}] ${message}`)
  }

  log('📥 Lendo dados do arquivo recebido...')
  const fileContent = await fs.readFile(filePath, 'utf-8')
  const parsed = Papa.parse<Record<string, unknown>>(fileContent, {
    header: true,
    skipEmptyLines: true,
  })

  if (parsed.errors.length > 0) {
    const errorMessages = parsed.errors.map(err => err.message).join('; ')
    throw new Error(`Erro ao interpretar CSV: ${errorMessages}`)
  }

  const headers = (parsed.meta.fields ?? []) as string[]
  const rows = parsed.data.filter(row =>
    Object.values(row).some(value => value !== undefined && value !== null && `${value}`.trim().length > 0)
  )

  if (rows.length === 0) {
    throw new Error('Nenhum registro válido foi encontrado no arquivo CSV.')
  }

  summary.totalRows = rows.length
  log(`📑 Registros detectados: ${rows.length}`)

  let browser: Browser | null = null
  let context: BrowserContext | null = null

  const runningOnServerless = Boolean(
    process.env.VERCEL || process.env.AWS_REGION || process.env.AWS_EXECUTION_ENV,
  )

  const LAMBDA_CHROMIUM_ARGS = [
    '--disable-background-timer-throttling',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-cloud-import',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--disable-gesture-typing',
    '--disable-hang-monitor',
    '--disable-infobars',
    '--disable-notifications',
    '--disable-offer-store-unmasked-wallet-cards',
    '--disable-offer-upload-credit-cards',
    '--disable-popup-blocking',
    '--disable-print-preview',
    '--disable-prompt-on-repost',
    '--disable-setuid-sandbox',
    '--disable-speech-api',
    '--disable-sync',
    '--disable-tab-for-desktop-share',
    '--disable-translate',
    '--disable-voice-input',
    '--disable-wake-on-wifi',
    '--disk-cache-size=33554432',
    '--enable-async-dns',
    '--enable-simple-cache-backend',
    '--enable-tcp-fast-open',
    '--enable-webgl',
    '--hide-scrollbars',
    '--ignore-gpu-blacklist',
    '--media-cache-size=33554432',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-first-run',
    '--no-pings',
    '--no-sandbox',
    '--no-zygote',
    '--password-store=basic',
    '--prerender-from-omnibox=disabled',
    '--use-gl=swiftshader',
    '--use-mock-keychain',
  ]

  const raise = (message: string): never => {
    log(`❌ ${message}`)
    const error = new Error(message) as AutomationError
    error.logs = [...logs]
    throw error
  }

  try {
    if (runningOnServerless) {
      log('☁️ Ambiente serverless detectado; preparando Chromium do Playwright')
      const browsersRoot = process.env.PLAYWRIGHT_BROWSERS_PATH
        ? path.resolve(process.cwd(), process.env.PLAYWRIGHT_BROWSERS_PATH)
        : path.join(process.cwd(), 'playwright-browsers')

      const chromiumCandidates: string[] = []

      try {
        const entries = await fs.readdir(browsersRoot)
        for (const entry of entries) {
          if (!entry.startsWith('chromium-')) continue
          chromiumCandidates.push(path.join(browsersRoot, entry, 'chrome-linux', 'chrome'))
        }
      } catch (error) {
        log(`⚠️ Diretório de navegadores não acessível (${browsersRoot}): ${(error as Error).message}`)
      }

      const { chromium } = await import('playwright')
      const fallbackExecutable = chromium.executablePath()
      if (fallbackExecutable) {
        chromiumCandidates.push(fallbackExecutable)
      }

      const executablePath = await (async () => {
        for (const candidate of chromiumCandidates) {
          try {
            await fs.access(candidate)
            log(`🔍 Executável Chromium encontrado: ${candidate}`)
            return candidate
          } catch {
            log(`⚠️ Executável indisponível em ${candidate}`)
          }
        }
        return ''
      })()

      if (!executablePath) {
        raise(
          'Executável do Chromium não localizado. Garanta que "PLAYWRIGHT_BROWSERS_PATH=./playwright-browsers npx playwright install chromium --target=linux" seja executado durante o build.',
        )
      }

      process.env.PLAYWRIGHT_BROWSERS_PATH = browsersRoot

      browser = await chromium.launch({
        headless: true,
        executablePath,
        args: [...LAMBDA_CHROMIUM_ARGS, '--single-process'],
        ignoreHTTPSErrors: true,
      })
    } else {
      const { chromium } = await import('playwright')
      log('🖥️ Executando automação com Chromium local do Playwright')
      browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    }

    context = await browser.newContext()

    for (let index = 0; index < rows.length; index++) {
      const record = rows[index]
      const humanIndex = index + 1
      log(`\n▶️  Processando registro ${humanIndex}/${rows.length}`)

      const page = await context.newPage()

      try {
        await page.goto(config.url, { waitUntil: 'domcontentloaded' })
        await page.waitForTimeout(1500)
        log('  • Formulário carregado')

        const entries = headers.map(fieldName => [fieldName, record[fieldName]]) as Array<[string, unknown]>
        let filledCount = 0

        for (const [rawHeader, rawValue] of entries) {
          const keyNormalized = normalise(rawHeader)
          const value = rawValue === undefined || rawValue === null ? '' : String(rawValue).trim()
          if (!value) continue

          const synonyms = config.mapping[keyNormalized] ?? []
          const candidates = [rawHeader, ...synonyms]
          const seen = new Set<string>()
          let success = false

          for (const candidate of candidates) {
            if (!candidate || seen.has(candidate)) continue
            seen.add(candidate)

            success = await fillField(page, candidate, value, log)
            if (success) {
              filledCount += 1
              break
            }
          }

          if (!success) {
            log(`   ⚠️ nenhum campo compatível encontrado para coluna "${rawHeader}"`)
          }
        }

        log(`  • Campos preenchidos: ${filledCount}`)

        const submitButton = page.getByRole('button', { name: /enviar|submit|enviar respostas/i }).first()
        if (await submitButton.count()) {
          await submitButton.click()
          await page.waitForTimeout(2000)
          log('  ✅ Formulário enviado com sucesso')
          summary.succeeded += 1
        } else {
          log('  ❌ Botão de envio não encontrado; registro marcado como falha')
          summary.failed += 1
        }
      } catch (error) {
        log(`  ❌ Erro ao processar registro ${humanIndex}: ${(error as Error).message}`)
        summary.failed += 1
      } finally {
        await page.close().catch(() => undefined)
      }
    }
  } catch (error) {
    const automationError = error as AutomationError
    if (!automationError.logs) {
      log(`❌ Erro inesperado: ${automationError.message}`)
      automationError.logs = [...logs]
    }
    throw automationError
  } finally {
    await context?.close().catch(() => undefined)
    await browser?.close().catch(() => undefined)
  }

  log('\n📊 Resumo da execução:')
  log(`   • Total de registros: ${summary.totalRows}`)
  log(`   • Submissões concluídas: ${summary.succeeded}`)
  log(`   • Falhas: ${summary.failed}`)

  return { logs, summary }
}
