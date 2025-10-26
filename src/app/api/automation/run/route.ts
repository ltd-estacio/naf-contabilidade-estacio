import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import { runPlaywrightAutomation } from '@/lib/automation/runPlaywrightAutomation'

type AutomationError = Error & { logs?: string[] }

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let tmpDir: string | null = null

  try {
    const formData = await request.formData()
    const formId = formData.get('formId')?.toString()
    const file = formData.get('file') as File | null

    if (!formId) {
      return NextResponse.json({ success: false, error: 'Formulário não informado.' }, { status: 400 })
    }

    if (!file) {
      return NextResponse.json({ success: false, error: 'Arquivo não enviado.' }, { status: 400 })
    }

    const fileName = file.name?.toLowerCase() ?? 'dados.csv'
    if (!fileName.endsWith('.csv')) {
      return NextResponse.json({ success: false, error: 'Atualmente apenas arquivos CSV são suportados para automação.' }, { status: 400 })
    }

    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'naf-automation-'))
    const tmpFilePath = path.join(tmpDir, file.name || 'input.csv')

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(tmpFilePath, fileBuffer)

    const result = await runPlaywrightAutomation(formId, tmpFilePath)

    return NextResponse.json({
      success: true,
      message: 'Automação executada com sucesso.',
      logs: result.logs,
      summary: result.summary,
    })
  } catch (error) {
    console.error('Erro na automação:', error)
    const automationError = error as AutomationError
    return NextResponse.json(
      {
        success: false,
        error: automationError.message,
        logs: automationError.logs ?? [],
      },
      { status: 500 },
    )
  } finally {
    if (tmpDir) {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
    }
  }
}
