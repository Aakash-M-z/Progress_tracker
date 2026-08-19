import { Router, Request, Response } from 'express';
import { storage } from './storage.js';
import { authenticate } from './userRoutes.js';
import { ContestService } from './services/contestService.js';

const router = Router();

// ── GET /api/contests/upcoming ──────────────────────────────────────────────
router.get('/upcoming', async (_req: Request, res: Response) => {
    try {
        const contests = await ContestService.getUpcomingContests();
        res.json({ contests });
    } catch (err: any) {
        console.error('[contestRoutes] Error fetching upcoming contests:', err.message);
        res.status(500).json({ error: 'Failed to fetch upcoming contests' });
    }
});

// ── GET /api/contests/reminders ─────────────────────────────────────────────
router.get('/reminders', authenticate, async (req: any, res: Response) => {
    try {
        const userId = req.user.id.toString();
        const reminders = await storage.getContestReminders(userId);
        res.json({ reminders });
    } catch (err: any) {
        console.error('[contestRoutes] Error fetching reminders:', err.message);
        res.status(500).json({ error: 'Failed to fetch contest reminders' });
    }
});

// ── POST /api/contests/:id/reminder ─────────────────────────────────────────
router.post('/:id/reminder', authenticate, async (req: any, res: Response) => {
    try {
        const userId = req.user.id.toString();
        const contestId = req.params.id;
        const { reminderType = '1h', contestStartTime } = req.body;

        const startTime = contestStartTime ? new Date(contestStartTime) : new Date(Date.now() + 24 * 60 * 60 * 1000);
        let minutesBefore = 60;
        if (reminderType === '24h') minutesBefore = 24 * 60;
        if (reminderType === '30m') minutesBefore = 30;
        if (reminderType === '10m') minutesBefore = 10;

        const reminderTime = new Date(startTime.getTime() - minutesBefore * 60 * 1000);

        const reminder = await storage.createContestReminder(userId, contestId, reminderTime, reminderType);
        res.json({ success: true, reminder });
    } catch (err: any) {
        console.error('[contestRoutes] Error setting reminder:', err.message);
        res.status(500).json({ error: 'Failed to set contest reminder' });
    }
});

// ── DELETE /api/contests/:id/reminder ───────────────────────────────────────
router.delete('/:id/reminder', authenticate, async (req: any, res: Response) => {
    try {
        const userId = req.user.id.toString();
        const contestId = req.params.id;
        const { reminderType } = req.query;

        await storage.deleteContestReminder(userId, contestId, reminderType as string | undefined);
        res.json({ success: true, message: 'Reminder deleted' });
    } catch (err: any) {
        console.error('[contestRoutes] Error deleting reminder:', err.message);
        res.status(500).json({ error: 'Failed to delete contest reminder' });
    }
});

export default router;
