import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Simple proxy to Google Gemini Generate Content API
// Expects body: { messages: { role: 'user'|'model'|'system', content: string }[], model?: string }
export async function POST(request: NextRequest) {
  try {
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_API_KEY ||
      process.env.GOOGLE_GEMINI_API_KEY ||
      ''
    if (!apiKey) {
      return NextResponse.json({ message: 'GEMINI_API_KEY não configurada no .env' }, { status: 500 })
    }

    const body = await request.json().catch(() => null) as unknown
    if (!body || !Array.isArray(body.messages)) {
      return NextResponse.json({ message: 'Corpo inválido: messages é obrigatório' }, { status: 400 })
    }

    const model = body.model || 'gemini-1.5-flash'

    // Map messages to Gemini content parts
    // Gemini expects: contents: [{ role: 'user' | 'model', parts: [{ text }] }]
    const contents = body.messages
      .filter((m: unknown) => m && m.content)
      .map((m: unknown) => ({
        role: m.role === 'assistant' ? 'model' : (m.role === 'system' ? 'user' : m.role || 'user'),
        parts: [{ text: String(m.content) }]
      }))

    const safetySettings = body.safetySettings || undefined
    const generationConfig = body.generationConfig || {
      temperature: 0.4,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }

    const envUrl = process.env.GEMINI_API_URL || process.env.NEXT_PUBLIC_GEMINI_API_URL
    // If a full URL was provided in env (e.g., https://.../models/gemini-2.0-flash:generateContent), honor it
    const url = envUrl
      ? `${envUrl}${envUrl.includes('?') ? '&' : '?'}key=${encodeURIComponent(apiKey)}`
      : `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, safetySettings, generationConfig })
    })

    if (!geminiRes.ok) {
      const text = await geminiRes.text().catch(() => '')
      console.error('Gemini API error:', geminiRes.status, text)
      return NextResponse.json({ message: 'Erro na IA', status: geminiRes.status, detail: text }, { status: 502 })
    }

    const data = await geminiRes.json()
    const candidates = data?.candidates || []
    // Support both text parts and safety-blocked responses with promptFeedback
    const firstText = candidates[0]?.content?.parts?.map((p: unknown) => p?.text).join('\n') || data?.output_text || ''

    return NextResponse.json({ text: firstText, raw: data })
  } catch (err) {
    console.error('Assistant API error:', err)
    return NextResponse.json({ message: 'Erro interno do servidor', error: String(err) }, { status: 500 })
  }
}
