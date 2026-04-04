interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 60_000);

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

// Pre-configured rate limiters
export function rateLimitAuth(ip: string) {
  return rateLimit(`auth:${ip}`, 5, 60_000); // 5 per minute
}

export function rateLimitWrite(key: string) {
  return rateLimit(`write:${key}`, 30, 60_000); // 30 per minute
}

export function rateLimitRead(key: string) {
  return rateLimit(`read:${key}`, 120, 60_000); // 120 per minute
}
