import "server-only";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
  cleanupThreshold?: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(namespace: string): Map<string, RateLimitEntry> {
  let store = stores.get(namespace);
  if (!store) {
    store = new Map();
    stores.set(namespace, store);
  }
  return store;
}

export function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function isRateLimited(namespace: string, key: string, config: RateLimitConfig): boolean {
  const store = getStore(namespace);
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return false;
  }

  entry.count += 1;

  const threshold = config.cleanupThreshold ?? 500;
  if (store.size > threshold) {
    for (const [entryKey, entryValue] of store) {
      if (entryValue.resetAt <= now) store.delete(entryKey);
    }
  }

  return entry.count > config.max;
}

export function rateLimitResponse(retryAfterSeconds: number, message?: string) {
  return new Response(
    JSON.stringify({ ok: false, message: message ?? "Demasiadas solicitudes. Inténtalo más tarde." }),
    {
      status: 429,
      headers: {
        "content-type": "application/json",
        "retry-after": String(retryAfterSeconds),
      },
    },
  );
}

export const RATE_LIMITS = {
  newsletter: { windowMs: 15 * 60 * 1000, max: 5 },
  dealsApi: { windowMs: 60 * 1000, max: 30 },
  dealView: { windowMs: 60 * 1000, max: 20 },
  dealClick: { windowMs: 60 * 1000, max: 20 },
  login: { windowMs: 15 * 60 * 1000, max: 5 },
} as const;
