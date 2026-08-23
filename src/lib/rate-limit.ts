const PREFIX = "naf:rl:";
const _url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const _token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const hits = new Map<string, { count: number; start: number }>();
function memRl(key: string, max: number, windowMs: number) {
  const now = Date.now(); const e = hits.get(key);
  if (!e || now - e.start > windowMs) { hits.set(key, { count: 1, start: now }); return { ok: true, remaining: max - 1, retryAfter: 0 }; }
  if (e.count >= max) return { ok: false, remaining: 0, retryAfter: Math.ceil((windowMs - (now - e.start)) / 1000) };
  e.count++; return { ok: true, remaining: max - e.count, retryAfter: 0 };
}
async function restIncr(key: string, ttlSec: number): Promise<number | null> {
  if (!_url || !_token) return null;
  try {
    const r = await fetch(`${_url}/incr/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${_token}` } });
    const j = (await r.json()) as { result?: number };
    const c = Number(j.result || 0);
    if (c === 1) await fetch(`${_url}/expire/${encodeURIComponent(key)}/${ttlSec}`, { headers: { Authorization: `Bearer ${_token}` } });
    return c;
  } catch { return null; }
}
export async function rateLimit(key: string, max: number, windowMs: number): Promise<{ ok: boolean; remaining: number; retryAfter: number }> {
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const count = await restIncr(PREFIX + key, windowSec);
  if (count !== null) { const ok = count <= max; return { ok, remaining: Math.max(0, max - count), retryAfter: ok ? 0 : windowSec }; }
  return memRl(key, max, windowMs);
}
export function clientIp(req: Request): string { const fwd = req.headers.get("x-forwarded-for") || ""; return fwd.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown"; }
