import { NextResponse } from "next/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { rateLimit, clientIp } from "@/lib/rate-limit";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = await rateLimit(`turnstile:${ip}`, 30, 60000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: "Muitas tentativas." }, { status: 429 });
  let b: { token?: string } = {};
  try { b = await req.json(); } catch { /* vazio */ }
  const ok = await verifyTurnstile(String(b.token || ""), ip);
  return NextResponse.json({ ok }, { status: ok ? 200 : 400 });
}
