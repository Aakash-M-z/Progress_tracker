import { Request, Response } from 'express';
import { AIService, AIChatMessage, AIUserStats } from '../services/ai.service.js';
import { aiQueue, complexityQueue, redisConnection } from '../config/queue.js';
import { storage } from '../storage.js';
import { extractBearer, verifyToken } from '../jwt.js';

const AI_FREE_DAILY_LIMIT = 5;

export class AIController {
    static async chat(req: Request, res: Response) {
        try {
            let authUser: any = null;

            // Optional Auth Check
            const token = extractBearer(req.headers.authorization);
            if (token) {
                const payload = verifyToken(token);
                if (payload) {
                    // Check usage if not admin/premium
                    if (payload.role !== 'admin' && payload.plan !== 'premium') {
                        const user = await storage.getUser(payload.id);
                        if (user) {
                            const today = new Date().toISOString().slice(0, 10);
                            const resetAt = (user as any).aiUsageResetAt ?? today;
                            const usageToday = resetAt === today ? ((user as any).aiUsageCount ?? 0) : 0;
                            if (usageToday >= AI_FREE_DAILY_LIMIT) {
                                res.status(403).json({
                                    error: 'AI_LIMIT_REACHED',
                                    message: `Free plan allows ${AI_FREE_DAILY_LIMIT} AI requests per day. Upgrade to Premium for unlimited access.`
                                }); return;
                            }

                            // Increment usage
                            await storage.updateUser(payload.id, {
                                aiUsageCount: usageToday + 1,
                                aiUsageResetAt: today
                            });
                        }
                    }
                    authUser = payload;
                }
            }

            const { message, history = [], userStats = {} } = req.body;

            if (!message) {
                return res.status(400).json({ error: 'Message is required' });
            }

            // Enrich userStats with connected accounts if user is authenticated
            let enrichedStats = { ...userStats };
            if (authUser?.id) {
                try {
                    const accounts = await storage.getConnectedAccounts(authUser.id);
                    if (accounts && accounts.length > 0) {
                        enrichedStats.connectedAccounts = accounts.map(a => ({
                            platform: a.platform,
                            username: a.username,
                            rating: a.rating,
                            rank: a.rank,
                            solvedCount: a.solvedCount,
                            contestCount: a.contestCount,
                        }));
                    }
                } catch (accErr) {
                    console.warn('[AIController] Could not fetch connected accounts for AI context:', accErr);
                }
            }

            const reply = await AIService.generateResponse(message, history, enrichedStats);
            res.json({ reply });

        } catch (error: any) {
            console.error('[AIController] Error:', error.message);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
    }

    static async chatAsync(req: Request, res: Response) {
        try {
            const { message, history = [], userStats } = req.body;
            if (!message) return res.status(400).json({ error: 'Message is required' });

            // Fallback if Redis is down or not initialized
            if (!redisConnection || redisConnection.status !== 'ready' || !aiQueue) {
                console.warn('[AIController] Redis not available, falling back to sync chat');
                const reply = await AIService.generateResponse(message, history, userStats);
                return res.json({ reply });
            }

            const job = await aiQueue.add('chat', {
                type: 'chat',
                data: { message, history, userStats }
            });

            res.json({ jobId: job.id });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async analyzeComplexity(req: Request, res: Response) {
        try {
            const { code, language } = req.body;
            if (!code || !language) {
                return res.status(400).json({ error: 'Code and language are required' });
            }

            // Fallback if Redis is down or not initialized
            if (!redisConnection || redisConnection.status !== 'ready' || !complexityQueue) {
                console.warn('[AIController] Redis not available, falling back to sync complexity analysis');
                const analysis = await AIService.analyzeCodeComplexity(code, language);
                return res.json({ analysis });
            }

            const job = await complexityQueue.add('analyze-complexity', {
                type: 'complexity',
                data: { code, language }
            });

            res.json({ jobId: job.id });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getJobStatus(req: Request, res: Response) {
        try {
            const { jobId } = req.params;
            const result = await storage.getJobResult(jobId as string);
            
            if (result) {
                return res.json({ status: 'completed', result });
            }

            // Check if job exists in queue
            const job = (aiQueue && await aiQueue.getJob(jobId as string)) || (complexityQueue && await complexityQueue.getJob(jobId as string));
            if (!job) return res.status(404).json({ error: 'Job not found' });

            const state = await job.getState();
            res.json({ status: state });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
