import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

function createRedisClient() {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  try {
    return new Redis(url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  } catch {
    return null;
  }
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production" && redis) {
  globalForRedis.redis = redis;
}
