export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
function showBlockedFallback(): void {
  document.querySelectorAll<HTMLElement>(".cf-turnstile").forEach((el) => {
    if (el.querySelector("iframe")) return;
    if (el.getAttribute("data-fallback")) return;
    el.setAttribute("data-fallback", "1");
    el.innerHTML = '<div role="alert" style="font-size:13px;line-height:1.45;color:#f59e0b;border:1px solid rgba(245,158,11,.4);background:rgba(245,158,11,.10);border-radius:10px;padding:10px 12px">⚠️ Não foi possível carregar a verificação de segurança. Se você usa um bloqueador (ex.: Brave Shields ou uma extensão de anúncios), desative-o para este site e recarregue a página.</div>';
  });
}
export function loadTurnstile(): void {
  if (typeof document === "undefined" || !TURNSTILE_SITE_KEY) return;
  if (document.getElementById("cf-turnstile-script")) return;
  const s = document.createElement("script"); s.id = "cf-turnstile-script";
  s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"; s.async = true; s.defer = true;
  s.onerror = () => showBlockedFallback();
  document.head.appendChild(s);
  window.setTimeout(() => { const w = window as unknown as { turnstile?: unknown }; if (!w.turnstile) showBlockedFallback(); }, 6000);
}
export async function ensureHuman(): Promise<{ ok: boolean; reason?: string }> {
  if (!TURNSTILE_SITE_KEY) return { ok: true };
  const w = window as unknown as { turnstile?: { getResponse: () => string; reset: () => void } };
  if (!w.turnstile) return { ok: false, reason: "A verificação de segurança foi bloqueada. Desative o bloqueador (ex.: Brave Shields) para este site e recarregue a página." };
  const token = w.turnstile.getResponse?.();
  if (!token) return { ok: false, reason: "Confirme que você não é um robô." };
  const ok = await fetch("/api/auth/turnstile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }).then((r) => r.ok).catch(() => false);
  try { w.turnstile.reset?.(); } catch { /* noop */ }
  return ok ? { ok: true } : { ok: false, reason: "Verificação anti-robô falhou. Recarregue a página e tente novamente." };
}
