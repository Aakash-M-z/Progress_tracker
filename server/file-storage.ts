import { IStorage } from "./storage.js";
import { User, InsertUser, Activity, InsertActivity, AdminLog, InsertAdminLog, Task, InsertTask, ProblemReview, InsertProblemReview, ConnectedAccount, InsertConnectedAccount, Contest, ContestReminder } from "../shared/schema.js";
import fs from 'fs';
import path from 'path';

export class FileStorage implements IStorage {
    private users: Map<string, User>;
    private activities: Map<string, Activity>;
    private adminLogs: Map<string, AdminLog>;
    private tasks: Map<string, Task>;
    private problemReviews: Map<string, ProblemReview>;
    private jobResults: Map<string, any>;
    private connectedAccounts: Map<string, ConnectedAccount>;
    private contests: Map<string, Contest>;
    private contestReminders: Map<string, ContestReminder>;
    private currentUserId: number;
    private currentActivityId: number;
    private currentLogId: number;
    private currentTaskId: number;
    private currentReviewId: number;
    private currentAccountId: number;
    private currentContestId: number;
    private currentReminderId: number;
    private filePath: string;

    constructor() {
        this.users = new Map();
        this.activities = new Map();
        this.adminLogs = new Map();
        this.tasks = new Map();
        this.problemReviews = new Map();
        this.jobResults = new Map();
        this.connectedAccounts = new Map();
        this.contests = new Map();
        this.contestReminders = new Map();
        this.currentUserId = 1;
        this.currentActivityId = 1;
        this.currentLogId = 1;
        this.currentTaskId = 1;
        this.currentReviewId = 1;
        this.currentAccountId = 1;
        this.currentContestId = 1;
        this.currentReminderId = 1;
        this.filePath = path.join(process.cwd(), 'local-data.json');
        this.loadData();
    }

    private loadData() {
        if (fs.existsSync(this.filePath)) {
            try {
                const data = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
                if (data.users) {
                    data.users.forEach((u: User) => this.users.set(u.id.toString(), u));
                    const ids = data.users.map((u: User) => parseInt(u.id)).filter((n: number) => !isNaN(n));
                    this.currentUserId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
                }
                if (data.activities) {
                    data.activities.forEach((a: Activity) => this.activities.set(a.id.toString(), a));
                    const ids = data.activities.map((a: Activity) => parseInt(a.id)).filter((n: number) => !isNaN(n));
                    this.currentActivityId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
                }
                if (data.adminLogs) {
                    data.adminLogs.forEach((l: AdminLog) => this.adminLogs.set(l.id.toString(), l));
                    const ids = data.adminLogs.map((l: AdminLog) => parseInt(l.id)).filter((n: number) => !isNaN(n));
                    this.currentLogId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
                }
                if (data.tasks) {
                    data.tasks.forEach((t: Task) => this.tasks.set(t.id.toString(), t));
                    const ids = data.tasks.map((t: Task) => parseInt(t.id)).filter((n: number) => !isNaN(n));
                    this.currentTaskId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
                }
                if (data.problemReviews) {
                    data.problemReviews.forEach((r: ProblemReview) => this.problemReviews.set(r.id.toString(), {
                        ...r,
                        nextReviewDate: new Date(r.nextReviewDate),
                        lastReviewed: new Date(r.lastReviewed),
                        createdAt: new Date(r.createdAt)
                    }));
                    const ids = data.problemReviews.map((r: ProblemReview) => parseInt(r.id)).filter((n: number) => !isNaN(n));
                    this.currentReviewId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
                }
                if (data.jobResults) {
                    data.jobResults.forEach(([id, res]: [string, any]) => this.jobResults.set(id, res));
                }
                if (data.connectedAccounts) {
                    data.connectedAccounts.forEach((a: ConnectedAccount) => this.connectedAccounts.set(a.id.toString(), {
                        ...a,
                        lastSyncedAt: new Date(a.lastSyncedAt)
                    }));
                    const ids = data.connectedAccounts.map((a: ConnectedAccount) => parseInt(a.id)).filter((n: number) => !isNaN(n));
                    this.currentAccountId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
                }
                if (data.contests) {
                    data.contests.forEach((c: Contest) => this.contests.set(c.contestId, {
                        ...c,
                        startTime: new Date(c.startTime),
                        endTime: new Date(c.endTime)
                    }));
                }
                if (data.contestReminders) {
                    data.contestReminders.forEach((r: ContestReminder) => this.contestReminders.set(r.id.toString(), {
                        ...r,
                        reminderTime: new Date(r.reminderTime),
                        createdAt: new Date(r.createdAt)
                    }));
                    const ids = data.contestReminders.map((r: ContestReminder) => parseInt(r.id)).filter((n: number) => !isNaN(n));
                    this.currentReminderId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
                }
            } catch (e) {
                console.error("Failed to load local data:", e);
            }
        }
    }

    private saveData() {
        try {
            const data = {
                users: Array.from(this.users.values()),
                activities: Array.from(this.activities.values()),
                adminLogs: Array.from(this.adminLogs.values()),
                tasks: Array.from(this.tasks.values()),
                problemReviews: Array.from(this.problemReviews.values()),
                jobResults: Array.from(this.jobResults.entries()),
                connectedAccounts: Array.from(this.connectedAccounts.values()),
                contests: Array.from(this.contests.values()),
                contestReminders: Array.from(this.contestReminders.values()),
            };
            fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
        } catch (e) {
            console.error("Failed to save local data:", e);
        }
    }

    async getUser(id: string | number): Promise<User | undefined> {
        return this.users.get(id.toString());
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        return Array.from(this.users.values()).find(
            (user) => user.username === username
        );
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        return Array.from(this.users.values()).find(
            (user) => user.email === email
        );
    }

    async createUser(insertUser: InsertUser): Promise<User> {
        const id = this.currentUserId++;
        const user: User = { ...insertUser, id: id.toString(), createdAt: new Date() };
        this.users.set(id.toString(), user);
        this.saveData();
        return user;
    }

    async getUserActivities(userId: string | number): Promise<Activity[]> {
        return Array.from(this.activities.values()).filter(
            (activity) => activity.userId === userId.toString()
        );
    }

    async createActivity(insertActivity: InsertActivity): Promise<Activity> {
        const id = this.currentActivityId++;
        const activity: Activity = { ...insertActivity, id: id.toString(), createdAt: new Date() };
        this.activities.set(id.toString(), activity);
        this.saveData();
        return activity;
    }

    async updateActivity(id: string | number, activity: Partial<Activity>): Promise<Activity | undefined> {
        const strId = id.toString();
        const existing = this.activities.get(strId);
        if (!existing) return undefined;
        const updated = { ...existing, ...activity };
        this.activities.set(strId, updated);
        this.saveData();
        return updated;
    }

    async deleteActivity(id: string | number): Promise<boolean> {
        const strId = id.toString();
        const deleted = this.activities.delete(strId);
        if (deleted) this.saveData();
        return deleted;
    }

    async updateUser(id: string | number, user: Partial<User>): Promise<User | undefined> {
        const strId = id.toString();
        const existing = this.users.get(strId);
        if (!existing) return undefined;
        const updated = { ...existing, ...user };
        this.users.set(strId, updated);
        this.saveData();
        return updated;
    }

    async getAllUsers(): Promise<User[]> {
        return Array.from(this.users.values());
    }

    async deleteUser(id: string | number): Promise<boolean> {
        const strId = id.toString();
        const deleted = this.users.delete(strId);
        if (deleted) this.saveData();
        return deleted;
    }

    async getAllActivities(): Promise<Activity[]> {
        return Array.from(this.activities.values())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async createAdminLog(log: InsertAdminLog): Promise<AdminLog> {
        const id = this.currentLogId++;
        const entry: AdminLog = { ...log, id: id.toString(), createdAt: new Date() };
        this.adminLogs.set(id.toString(), entry);
        this.saveData();
        return entry;
    }

    async getAdminLogs(): Promise<AdminLog[]> {
        return Array.from(this.adminLogs.values())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async getUserTasks(userId: string): Promise<Task[]> {
        return Array.from(this.tasks.values())
            .filter(t => t.userId === userId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async createTask(insertTask: InsertTask): Promise<Task> {
        const id = this.currentTaskId++;
        const task: Task = { ...insertTask, id: id.toString(), createdAt: new Date().toISOString() };
        this.tasks.set(id.toString(), task);
        this.saveData();
        return task;
    }

    async updateTask(id: string, data: Partial<Task>): Promise<Task | undefined> {
        const existing = this.tasks.get(id);
        if (!existing) return undefined;
        const updated = { ...existing, ...data };
        this.tasks.set(id, updated);
        this.saveData();
        return updated;
    }

    async deleteTask(id: string): Promise<boolean> {
        const deleted = this.tasks.delete(id);
        if (deleted) this.saveData();
        return deleted;
    }

    async incrementAiUsage(userId: string | number): Promise<User | undefined> {
        const strId = userId.toString();
        const user = this.users.get(strId);
        if (!user) return undefined;
        const today = new Date().toISOString().slice(0, 10);
        const resetAt = (user as any).aiUsageResetAt ?? today;
        const count = resetAt === today ? ((user as any).aiUsageCount ?? 0) + 1 : 1;
        const updated = { ...user, aiUsageCount: count, aiUsageResetAt: today } as User;
        this.users.set(strId, updated);
        this.saveData();
        return updated;
    }

    async getDueReviews(userId: string): Promise<ProblemReview[]> {
        const now = new Date();
        return Array.from(this.problemReviews.values())
            .filter(r => r.userId === userId && new Date(r.nextReviewDate) <= now)
            .sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime());
    }

    async getProblemReview(userId: string, problemTitle: string): Promise<ProblemReview | undefined> {
        return Array.from(this.problemReviews.values()).find(
            r => r.userId === userId && r.problemTitle === problemTitle
        );
    }

    async upsertProblemReview(review: InsertProblemReview): Promise<ProblemReview> {
        const existing = Array.from(this.problemReviews.values()).find(
            r => r.userId === review.userId && r.problemTitle === review.problemTitle
        );

        if (existing) {
            const updated: ProblemReview = {
                ...existing,
                ...review,
                lastReviewed: new Date(),
            };
            this.problemReviews.set(existing.id, updated);
            this.saveData();
            return updated;
        } else {
            const id = this.currentReviewId++;
            const newReview: ProblemReview = {
                ...review,
                id: id.toString(),
                lastReviewed: new Date(),
                createdAt: new Date(),
            };
            this.problemReviews.set(id.toString(), newReview);
            this.saveData();
            return newReview;
        }
    }

    async saveJobResult(jobId: string, result: any): Promise<void> {
        this.jobResults.set(jobId, result);
        this.saveData();
    }

    async getJobResult(jobId: string): Promise<any | undefined> {
        return this.jobResults.get(jobId);
    }

    // ── Connected Platform Accounts ─────────────────────────────────────────
    async getConnectedAccounts(userId: string): Promise<ConnectedAccount[]> {
        return Array.from(this.connectedAccounts.values())
            .filter(a => a.userId === userId.toString())
            .sort((a, b) => new Date(b.lastSyncedAt).getTime() - new Date(a.lastSyncedAt).getTime());
    }

    async getConnectedAccount(userId: string, platform: string): Promise<ConnectedAccount | undefined> {
        return Array.from(this.connectedAccounts.values()).find(
            a => a.userId === userId.toString() && a.platform === platform
        );
    }

    async upsertConnectedAccount(account: InsertConnectedAccount): Promise<ConnectedAccount> {
        const existing = await this.getConnectedAccount(account.userId, account.platform);
        if (existing) {
            const updated: ConnectedAccount = {
                ...existing,
                ...account,
                lastSyncedAt: new Date(),
            };
            this.connectedAccounts.set(existing.id, updated);
            this.saveData();
            return updated;
        } else {
            const id = this.currentAccountId++;
            const newAcc: ConnectedAccount = {
                ...account,
                id: id.toString(),
                lastSyncedAt: new Date(),
            };
            this.connectedAccounts.set(id.toString(), newAcc);
            this.saveData();
            return newAcc;
        }
    }

    async deleteConnectedAccount(userId: string, platform: string): Promise<boolean> {
        const existing = await this.getConnectedAccount(userId, platform);
        if (existing) {
            this.connectedAccounts.delete(existing.id);
            this.saveData();
            return true;
        }
        return false;
    }

    // ── Contests ────────────────────────────────────────────────────────────
    async getUpcomingContests(): Promise<Contest[]> {
        const now = new Date();
        return Array.from(this.contests.values())
            .filter(c => new Date(c.endTime) >= now)
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }

    async upsertContests(contests: Omit<Contest, 'id'>[]): Promise<void> {
        for (const c of contests) {
            const id = this.currentContestId++;
            this.contests.set(c.contestId, { ...c, id: id.toString() });
        }
        this.saveData();
    }

    // ── Contest Reminders ───────────────────────────────────────────────────
    async getContestReminders(userId: string): Promise<ContestReminder[]> {
        return Array.from(this.contestReminders.values())
            .filter(r => r.userId === userId.toString())
            .sort((a, b) => new Date(a.reminderTime).getTime() - new Date(b.reminderTime).getTime());
    }

    async createContestReminder(userId: string, contestId: string, reminderTime: Date, reminderType: string): Promise<ContestReminder> {
        const existing = Array.from(this.contestReminders.values()).find(
            r => r.userId === userId.toString() && r.contestId === contestId && r.reminderType === reminderType
        );
        if (existing) {
            return existing;
        }
        const id = this.currentReminderId++;
        const reminder: ContestReminder = {
            id: id.toString(),
            userId: userId.toString(),
            contestId,
            reminderTime,
            reminderType,
            sent: false,
            createdAt: new Date(),
        };
        this.contestReminders.set(id.toString(), reminder);
        this.saveData();
        return reminder;
    }

    async deleteContestReminder(userId: string, contestId: string, reminderType?: string): Promise<boolean> {
        let deleted = false;
        for (const [id, r] of this.contestReminders.entries()) {
            if (r.userId === userId.toString() && r.contestId === contestId) {
                if (!reminderType || r.reminderType === reminderType) {
                    this.contestReminders.delete(id);
                    deleted = true;
                }
            }
        }
        if (deleted) this.saveData();
        return deleted;
    }
}
