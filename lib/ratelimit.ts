/**
 * Simple in-memory rate limiter.
 * Effective per-region on Vercel (each lambda has its own memory).
 * Not perfect but a real defense-in-depth.
 * For production-grade: swap with @upstash/ratelimit + Redis.
 */

const store = new Map<string, { count: number; resetAt: number }>();
const CLEANUP_EVERY = 5 * 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_EVERY) return;
  lastCleanup = now;
  for (const [k, v] of store) if (v.resetAt < now) store.delete(k);
}

/**
 * @param key   identifier (e.g., "login:1.2.3.4")
 * @param max   max requests in window
 * @param windowMs   window size in ms
 * @returns true if allowed, false if rate-limited
 */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  cleanup();
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

export function getIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}
