/**
 * Simple in-memory rate limiter.
 * Effective per-lambda (each Vercel function instance has its own memory).
 * Not perfect but a real defense-in-depth.
 * For production-grade distributed limiting: swap with @upstash/ratelimit + Redis.
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

/**
 * Tracks cumulative failures across a long window (separate from the burst
 * rate-limit). Used to lock an account out for ~1 hour after too many failed
 * logins. Call `recordFailure(key)` after a failed attempt and `clearFailures`
 * after success.
 */
const failStore = new Map<string, { count: number; lockedUntil: number; resetAt: number }>();
const FAIL_WINDOW = 60 * 60_000; // 1h

export function checkLockout(key: string, maxFails = 10): { locked: boolean; retryAfter?: number } {
  const now = Date.now();
  const e = failStore.get(key);
  if (!e) return { locked: false };
  if (e.resetAt < now) { failStore.delete(key); return { locked: false }; }
  if (e.lockedUntil > now) return { locked: true, retryAfter: e.lockedUntil - now };
  if (e.count >= maxFails) {
    e.lockedUntil = now + FAIL_WINDOW;
    return { locked: true, retryAfter: FAIL_WINDOW };
  }
  return { locked: false };
}

export function recordFailure(key: string) {
  const now = Date.now();
  const e = failStore.get(key);
  if (!e || e.resetAt < now) {
    failStore.set(key, { count: 1, lockedUntil: 0, resetAt: now + FAIL_WINDOW });
  } else {
    e.count++;
  }
}

export function clearFailures(key: string) {
  failStore.delete(key);
}

/**
 * Extract the real client IP, preferring Vercel's signed header which the
 * client cannot forge. Falls back to the LAST hop of X-Forwarded-For so
 * client-supplied prefixes can't bypass per-IP limits.
 */
export function getIp(req: Request): string {
  // Vercel adds this header itself; clients cannot set it.
  const vercel = req.headers.get('x-vercel-forwarded-for');
  if (vercel) return vercel.split(',').pop()?.trim() || 'unknown';

  // Cloudflare path (in case the project ever moves).
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf.trim();

  // Fallback: take the LAST hop. Trusted proxies append; the client-supplied
  // value (if any) is at the start, not the end.
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',').pop()?.trim() || 'unknown';

  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}
