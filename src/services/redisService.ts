import { createClient } from 'redis';
import { logger } from './loggerService';

let redisClient: ReturnType<typeof createClient> | null = null;
let isRedisConnected = false;

export async function getRedisClient() {
  if (redisClient) return redisClient;

  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  redisClient = createClient({
    url,
    socket: {
      connectTimeout: 1000,
      reconnectStrategy: false,
    },
  });

  redisClient.on('error', () => {
    isRedisConnected = false;
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    logger.info('[REDIS] Connected to Redis Cache & Pub/Sub Server');
  });

  try {
    await redisClient.connect();
    isRedisConnected = true;
  } catch (err: any) {
    isRedisConnected = false;
    logger.warn('[REDIS] Redis server offline. Operating without Redis cache.');
  }

  return redisClient;
}

export function isRedisActive(): boolean {
  return isRedisConnected;
}

export async function cacheGet(key: string): Promise<string | null> {
  if (!isRedisConnected || !redisClient) return null;
  try {
    const val = await redisClient.get(key);
    return val ? String(val) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: string, ttlSeconds: number = 300): Promise<void> {
  if (!isRedisConnected || !redisClient) return;
  try {
    await redisClient.set(key, value, { EX: ttlSeconds });
  } catch {
    // ignore cache write error
  }
}
