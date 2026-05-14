import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// Redis connection configuration
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

let redisConnection: IORedis | null = null;
let aiQueue: Queue | null = null;
let complexityQueue: Queue | null = null;

// ONLY initialize Redis if explicitly configured in environment
// This prevents connection errors for users running locally without Redis
if (REDIS_HOST || process.env.REDIS_URL) {
  try {
    const redisConfig = {
      host: REDIS_HOST || '127.0.0.1',
      port: REDIS_PORT,
      password: REDIS_PASSWORD,
      maxRetriesPerRequest: null,
      retryStrategy(times: number) {
        if (times > 3) return null;
        return 5000;
      },
    };

    redisConnection = new IORedis({
      ...redisConfig,
      enableOfflineQueue: false,
      lazyConnect: true,
    });

    redisConnection.on('error', (err) => {
      console.warn('[Redis] ⚠️ Connection error. Falling back to sync mode.');
    });

    aiQueue = new Queue('ai-tasks', { connection: redisConnection });
    complexityQueue = new Queue('complexity-analysis', { connection: redisConnection });
    
    console.log('[Queue] 🚀 Redis queues initialized');
  } catch (err) {
    console.error('[Queue] ❌ Redis initialization failed:', err);
  }
} else {
  // If no Redis config, we stay in sync mode silently
  console.log('[Queue] ℹ️ Redis not configured - background jobs disabled (sync fallback active)');
}

export { redisConnection, aiQueue, complexityQueue };
