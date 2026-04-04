import { redis } from "./redis";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory fallback when Redis is not available
const memStore = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memStore) {
    if (entry.resetAt < now) memStore.delete(key);
  }
}, 60_000);

export async function rateLimitAsync(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  // Use Redis if available
  if (redis) {
    try {
      const redisKey = `rl:${key}`;
      const windowSec = Math.ceil(windowMs / 1000);
      const count = await redis.incr(redisKey);

      if (count === 1) {
        await redis.expire(redisKey, windowSec);
      }

      const ttl = await redis.ttl(redisKey);
      const resetAt = Date.now() + ttl * 1000;

      if (count > limit) {
        return { success: false, remaining: 0, resetAt };
      }

      return { success: true, remaining: limit - count, resetAt };
    } catch {
      // Fall through to in-memory
    }
  }

  // In-memory fallback
  return rateLimit(key, limit, windowMs);
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = memStore.get(key);

  if (!entry || entry.resetAt < now) {
    memStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

// Pre-configured rate limiters (sync - in-memory fallback)
export function rateLimitAuth(ip: string) {
  return rateLimit(`auth:${ip}`, 5, 60_000);
}

export function rateLimitWrite(key: string) {
  return rateLimit(`write:${key}`, 30, 60_000);
}

export function rateLimitRead(key: string) {
  return rateLimit(`read:${key}`, 120, 60_000);
}

// Async rate limiters (use Redis when available)
export async function rateLimitAuthAsync(ip: string) {
  return rateLimitAsync(`auth:${ip}`, 5, 60_000);
}

export async function rateLimitWriteAsync(key: string) {
  return rateLimitAsync(`write:${key}`, 30, 60_000);
}
