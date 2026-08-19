import { Router, Request, Response } from 'express';
import { storage } from './storage.js';
import { authenticate } from './userRoutes.js';
import { PlatformFetcher } from './services/platformFetcher.js';
import { ContestService } from './services/contestService.js';

const router = Router();

// ── GET /api/platforms/accounts ─────────────────────────────────────────────
router.get('/accounts', authenticate, async (req: any, res: Response) => {
    try {
        const userId = req.user.id.toString();
        const accounts = await storage.getConnectedAccounts(userId);
        res.json({ accounts });
    } catch (err: any) {
        console.error('[platformRoutes] Error fetching accounts:', err.message);
        res.status(500).json({ error: 'Failed to fetch connected accounts' });
    }
});

// ── POST /api/platforms/:platform/connect ───────────────────────────────────
router.post('/:platform/connect', authenticate, async (req: any, res: Response) => {
    try {
        const userId = req.user.id.toString();
        const { platform } = req.params;
        const { username } = req.body;

        if (!username || !username.trim()) {
            return res.status(400).json({ error: 'Platform username or handle is required' });
        }

        // Fetch fresh stats from the platform
        const stats = await PlatformFetcher.fetchStats(platform, username.trim());

        const account = await storage.upsertConnectedAccount({
            userId,
            platform: stats.platform,
            username: stats.username,
            profileUrl: stats.profileUrl,
            rating: stats.rating,
            rank: stats.rank,
            solvedCount: stats.solvedCount,
            contestCount: stats.contestCount,
            syncStatus: stats.syncStatus,
            metadata: stats.metadata,
        });

        res.json({ success: true, message: `Connected to ${stats.platform}`, account });
    } catch (err: any) {
        console.error('[platformRoutes] Error connecting platform:', err.message);
        res.status(400).json({ error: err.message || 'Failed to connect account' });
    }
});

// ── DELETE /api/platforms/:platform/disconnect ──────────────────────────────
router.delete('/:platform/disconnect', authenticate, async (req: any, res: Response) => {
    try {
        const userId = req.user.id.toString();
        const { platform } = req.params;

        const deleted = await storage.deleteConnectedAccount(userId, platform.toLowerCase());
        if (!deleted) {
            return res.status(404).json({ error: 'Account not found' });
        }

        res.json({ success: true, message: `Disconnected from ${platform}` });
    } catch (err: any) {
        console.error('[platformRoutes] Error disconnecting platform:', err.message);
        res.status(500).json({ error: 'Failed to disconnect account' });
    }
});

// ── POST /api/platforms/:platform/sync ──────────────────────────────────────
router.post('/:platform/sync', authenticate, async (req: any, res: Response) => {
    try {
        const userId = req.user.id.toString();
        const { platform } = req.params;

        const existing = await storage.getConnectedAccount(userId, platform.toLowerCase());
        if (!existing) {
            return res.status(404).json({ error: 'No connected account for this platform' });
        }

        // Fetch latest stats
        const stats = await PlatformFetcher.fetchStats(existing.platform, existing.username);

        const updated = await storage.upsertConnectedAccount({
            userId,
            platform: stats.platform,
            username: stats.username,
            profileUrl: stats.profileUrl,
            rating: stats.rating,
            rank: stats.rank,
            solvedCount: stats.solvedCount,
            contestCount: stats.contestCount,
            syncStatus: stats.syncStatus,
            metadata: stats.metadata,
        });

        res.json({ success: true, message: `Synchronized ${platform}`, account: updated });
    } catch (err: any) {
        console.error('[platformRoutes] Sync error:', err.message);
        res.status(500).json({ error: err.message || 'Failed to synchronize account' });
    }
});

// ── POST /api/platforms/sync-all ────────────────────────────────────────────
router.post('/sync-all', authenticate, async (req: any, res: Response) => {
    try {
        const userId = req.user.id.toString();
        const accounts = await storage.getConnectedAccounts(userId);

        const results = await Promise.allSettled(
            accounts.map(async (acc) => {
                const stats = await PlatformFetcher.fetchStats(acc.platform, acc.username);
                return storage.upsertConnectedAccount({
                    userId,
                    platform: stats.platform,
                    username: stats.username,
                    profileUrl: stats.profileUrl,
                    rating: stats.rating,
                    rank: stats.rank,
                    solvedCount: stats.solvedCount,
                    contestCount: stats.contestCount,
                    syncStatus: stats.syncStatus,
                    metadata: stats.metadata,
                });
            })
        );

        const updatedAccounts = await storage.getConnectedAccounts(userId);
        res.json({ success: true, accounts: updatedAccounts });
    } catch (err: any) {
        console.error('[platformRoutes] Sync-all error:', err.message);
        res.status(500).json({ error: 'Failed to synchronize accounts' });
    }
});

export default router;
