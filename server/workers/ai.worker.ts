import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/queue.js';
import { AIService } from '../services/ai.service.js';
import { storage } from '../storage.js';

let aiWorker: Worker | null = null;

if (redisConnection) {
  aiWorker = new Worker('ai-tasks', async (job: Job) => {
    const { type, data } = job.data;
    console.log(`[AI Worker] Processing job ${job.id} of type ${type}`);

    if (type === 'chat') {
      const { message, history, userStats, userId } = data;
      const reply = await AIService.generateResponse(message, history, userStats);
      await storage.saveJobResult(job.id!, { reply });
      return { reply };
    }

    if (type === 'complexity') {
      const { code, language } = data;
      const analysis = await AIService.analyzeCodeComplexity(code, language);
      await storage.saveJobResult(job.id!, { analysis });
      return { analysis };
    }
  }, { connection: redisConnection });

  aiWorker.on('completed', (job) => {
    console.log(`[AI Worker] Job ${job.id} completed`);
  });

  aiWorker.on('failed', (job, err) => {
    console.error(`[AI Worker] Job ${job?.id} failed:`, err.message);
  });

  aiWorker.on('error', (err) => {
    // Silent - handled by central redisConnection listener
  });

  console.log('[AI Worker] 🤖 AI Worker initialized');
} else {
  console.log('[AI Worker] ⚠️ Redis not available - background worker disabled');
}

export { aiWorker };
