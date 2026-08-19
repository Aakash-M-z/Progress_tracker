import mongoose from 'mongoose';
import { UserModel, ActivityModel, AdminLogModel, TaskModel, ProblemReviewModel, JobResultModel, ConnectedAccountModel, ContestModel, ContestReminderModel } from './models.js';
import { IStorage } from './storage.js';
import { User, InsertUser, Activity, InsertActivity, AdminLog, InsertAdminLog, Task, InsertTask, ProblemReview, InsertProblemReview, ConnectedAccount, InsertConnectedAccount, Contest, ContestReminder } from '../shared/schema.js';

export let mongoConnected = false;

/**
 * Connects to MongoDB with enhanced logging and error handling.
 * Does NOT fallback silenty if connection fails.
 */
export async function connectMongo(): Promise<boolean> {
    const uri = process.env.MONGODB_URI || '';

    if (!uri) {
        console.error('❌ MONGODB_URI is not defined in .env file');
        return false;
    }

    // Mask URI for safe logging
    const maskedUri = uri.replace(/\/\/.*:.*@/, '//****:****@');
    console.log(`📡 Connecting to MongoDB: ${maskedUri}`);

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
        });

        mongoConnected = true;
        console.log('✅ MongoDB Connected Successfully');
        return true;
    } catch (err: any) {
        mongoConnected = false;

        let errorHint = '';
        if (err.message.includes('authentication failed')) {
            errorHint = 'Check your MongoDB Atlas username and password (ensure special chars are URL encoded).';
        } else if (err.message.includes('IP address') || err.message.includes('reachable')) {
            errorHint = 'Check your MongoDB Atlas IP Whitelist / Network Access.';
        }

        console.error(`❌ MongoDB Connection Failed: ${err.message}`);
        if (errorHint) console.error(`💡 Hint: ${errorHint}`);

        return false;
    }
}

export class MongoStorage implements IStorage {
    // ... rest of the file remains same
    async getUser(id: string | number): Promise<User | undefined> {
        try {
            const user = await UserModel.findById(id.toString());
            return user ? this.mapUser(user) : undefined;
        } catch { return undefined; }
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        const user = await UserModel.findOne({ username });
        return user ? this.mapUser(user) : undefined;
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        const user = await UserModel.findOne({ email });
        return user ? this.mapUser(user) : undefined;
    }

    async createUser(insertUser: InsertUser): Promise<User> {
        const user = new UserModel(insertUser);
        await user.save();
        return this.mapUser(user);
    }

    async updateUser(id: string | number, data: Partial<User>): Promise<User | undefined> {
        const updated = await UserModel.findByIdAndUpdate(id.toString(), data, { new: true });
        return updated ? this.mapUser(updated) : undefined;
    }

    async getAllUsers(): Promise<User[]> {
        const users = await UserModel.find().sort({ createdAt: -1 });
        return users.map(u => this.mapUser(u));
    }

    async deleteUser(id: string | number): Promise<boolean> {
        const result = await UserModel.findByIdAndDelete(id.toString());
        return !!result;
    }

    async getUserActivities(userId: string | number): Promise<Activity[]> {
        const activities = await ActivityModel.find({ userId: userId.toString() }).sort({ createdAt: -1 });
        return activities.map(a => this.mapActivity(a));
    }

    async getAllActivities(): Promise<Activity[]> {
        const activities = await ActivityModel.find().sort({ createdAt: -1 });
        return activities.map(a => this.mapActivity(a));
    }

    async createActivity(insertActivity: InsertActivity): Promise<Activity> {
        const activity = new ActivityModel(insertActivity);
        await activity.save();
        return this.mapActivity(activity);
    }

    async updateActivity(id: string | number, data: Partial<Activity>): Promise<Activity | undefined> {
        const updated = await ActivityModel.findByIdAndUpdate(id.toString(), data, { new: true });
        return updated ? this.mapActivity(updated) : undefined;
    }

    async deleteActivity(id: string | number): Promise<boolean> {
        const result = await ActivityModel.findByIdAndDelete(id.toString());
        return !!result;
    }

    async createAdminLog(log: InsertAdminLog): Promise<AdminLog> {
        const entry = new AdminLogModel(log);
        await entry.save();
        return this.mapLog(entry);
    }

    async getAdminLogs(): Promise<AdminLog[]> {
        const logs = await AdminLogModel.find().sort({ createdAt: -1 }).limit(200);
        return logs.map(l => this.mapLog(l));
    }

    async getUserTasks(userId: string): Promise<Task[]> {
        const tasks = await TaskModel.find({ userId }).sort({ createdAt: -1 });
        return tasks.map(t => this.mapTask(t));
    }

    async createTask(insertTask: InsertTask): Promise<Task> {
        const task = new TaskModel(insertTask);
        await task.save();
        return this.mapTask(task);
    }

    async updateTask(id: string, data: Partial<Task>): Promise<Task | undefined> {
        const updated = await TaskModel.findByIdAndUpdate(id, data, { new: true });
        return updated ? this.mapTask(updated) : undefined;
    }

    async deleteTask(id: string): Promise<boolean> {
        const result = await TaskModel.findByIdAndDelete(id);
        return !!result;
    }

    async incrementAiUsage(userId: string | number): Promise<User | undefined> {
        const today = new Date().toISOString().slice(0, 10);
        const user = await UserModel.findById(userId.toString());
        if (!user) return undefined;
        const resetAt = (user as any).aiUsageResetAt ?? today;
        const newCount = resetAt === today ? ((user as any).aiUsageCount ?? 0) + 1 : 1;
        const updated = await UserModel.findByIdAndUpdate(
            userId.toString(),
            { aiUsageCount: newCount, aiUsageResetAt: today },
            { new: true }
        );
        return updated ? this.mapUser(updated) : undefined;
    }

    async getDueReviews(userId: string): Promise<ProblemReview[]> {
        const reviews = await ProblemReviewModel.find({
            userId,
            nextReviewDate: { $lte: new Date() }
        }).sort({ nextReviewDate: 1 });
        return reviews.map(r => this.mapProblemReview(r));
    }

    async getProblemReview(userId: string, problemTitle: string): Promise<ProblemReview | undefined> {
        const review = await ProblemReviewModel.findOne({ userId, problemTitle });
        return review ? this.mapProblemReview(review) : undefined;
    }

    async upsertProblemReview(review: InsertProblemReview): Promise<ProblemReview> {
        const updated = await ProblemReviewModel.findOneAndUpdate(
            { userId: review.userId, problemTitle: review.problemTitle },
            { 
                ...review,
                lastReviewed: new Date()
            },
            { new: true, upsert: true }
        );
        return this.mapProblemReview(updated);
    }

    async saveJobResult(jobId: string, result: any): Promise<void> {
        await JobResultModel.findOneAndUpdate({ jobId }, { result }, { upsert: true });
    }

    async getJobResult(jobId: string): Promise<any | undefined> {
        const doc = await JobResultModel.findOne({ jobId });
        return doc ? doc.result : undefined;
    }

    private mapUser(doc: any): User {
        return {
            id: doc._id.toString(),
            username: doc.username,
            name: doc.name,
            email: doc.email,
            password: doc.password,
            profileImage: doc.profileImage,
            learningGoal: doc.learningGoal,
            role: doc.role ?? 'user',
            plan: doc.plan ?? 'free',
            isActive: doc.isActive !== false, // default true for existing docs without field
            aiUsageCount: doc.aiUsageCount ?? 0,
            aiUsageResetAt: doc.aiUsageResetAt ?? new Date().toISOString().slice(0, 10),
            createdAt: doc.createdAt,
        };
    }

    private mapActivity(doc: any): Activity {
        return {
            id: doc._id.toString(),
            userId: doc.userId.toString(),
            date: doc.date,
            category: doc.category,
            topic: doc.topic,
            difficulty: doc.difficulty,
            platform: doc.platform,
            timeSpent: doc.timeSpent,
            problemDescription: doc.problemDescription ?? null,
            notes: doc.notes ?? null,
            timeComplexity: doc.timeComplexity ?? null,
            spaceComplexity: doc.spaceComplexity ?? null,
            solved: doc.solved,
            createdAt: doc.createdAt,
        };
    }

    private mapLog(doc: any): AdminLog {
        return {
            id: doc._id.toString(),
            adminId: doc.adminId,
            adminEmail: doc.adminEmail,
            action: doc.action,
            targetId: doc.targetId,
            targetEmail: doc.targetEmail,
            detail: doc.detail,
            createdAt: doc.createdAt,
        };
    }

    private mapTask(doc: any): Task {
        return {
            id: doc._id.toString(),
            userId: doc.userId,
            title: doc.title,
            category: doc.category,
            priority: doc.priority,
            deadline: doc.deadline ?? '',
            completed: doc.completed,
            completedAt: doc.completedAt,
            notes: doc.notes,
            createdAt: doc.createdAt,
        };
    }

    private mapProblemReview(doc: any): ProblemReview {
        return {
            id: doc._id.toString(),
            userId: doc.userId,
            problemTitle: doc.problemTitle,
            category: doc.category,
            difficulty: doc.difficulty,
            platform: doc.platform,
            rating: doc.rating,
            nextReviewDate: doc.nextReviewDate,
            interval: doc.interval,
            easeFactor: doc.easeFactor,
            lastReviewed: doc.lastReviewed,
            createdAt: doc.createdAt,
        };
    }

    // ── Connected Platform Accounts ─────────────────────────────────────────
    async getConnectedAccounts(userId: string): Promise<ConnectedAccount[]> {
        const accounts = await ConnectedAccountModel.find({ userId }).sort({ lastSyncedAt: -1 });
        return accounts.map(a => this.mapConnectedAccount(a));
    }

    async getConnectedAccount(userId: string, platform: string): Promise<ConnectedAccount | undefined> {
        const account = await ConnectedAccountModel.findOne({ userId, platform });
        return account ? this.mapConnectedAccount(account) : undefined;
    }

    async upsertConnectedAccount(data: InsertConnectedAccount): Promise<ConnectedAccount> {
        const account = await ConnectedAccountModel.findOneAndUpdate(
            { userId: data.userId, platform: data.platform },
            { ...data, lastSyncedAt: new Date() },
            { new: true, upsert: true }
        );
        return this.mapConnectedAccount(account);
    }

    async deleteConnectedAccount(userId: string, platform: string): Promise<boolean> {
        const result = await ConnectedAccountModel.findOneAndDelete({ userId, platform });
        return !!result;
    }

    // ── Contests ────────────────────────────────────────────────────────────
    async getUpcomingContests(): Promise<Contest[]> {
        const now = new Date();
        const contests = await ContestModel.find({ endTime: { $gte: now } }).sort({ startTime: 1 });
        return contests.map(c => this.mapContest(c));
    }

    async upsertContests(contests: Omit<Contest, 'id'>[]): Promise<void> {
        for (const c of contests) {
            await ContestModel.findOneAndUpdate(
                { contestId: c.contestId },
                c,
                { upsert: true }
            );
        }
    }

    // ── Contest Reminders ───────────────────────────────────────────────────
    async getContestReminders(userId: string): Promise<ContestReminder[]> {
        const reminders = await ContestReminderModel.find({ userId }).sort({ reminderTime: 1 });
        return reminders.map(r => this.mapContestReminder(r));
    }

    async createContestReminder(userId: string, contestId: string, reminderTime: Date, reminderType: string): Promise<ContestReminder> {
        const reminder = await ContestReminderModel.findOneAndUpdate(
            { userId, contestId, reminderType },
            { userId, contestId, reminderTime, reminderType, sent: false, createdAt: new Date() },
            { new: true, upsert: true }
        );
        return this.mapContestReminder(reminder);
    }

    async deleteContestReminder(userId: string, contestId: string, reminderType?: string): Promise<boolean> {
        const query: any = { userId, contestId };
        if (reminderType) query.reminderType = reminderType;
        const result = await ContestReminderModel.deleteMany(query);
        return result.deletedCount > 0;
    }

    private mapConnectedAccount(doc: any): ConnectedAccount {
        return {
            id: doc._id.toString(),
            userId: doc.userId,
            platform: doc.platform,
            username: doc.username,
            profileUrl: doc.profileUrl ?? '',
            rating: doc.rating ?? null,
            rank: doc.rank ?? null,
            solvedCount: doc.solvedCount ?? 0,
            contestCount: doc.contestCount ?? null,
            lastSyncedAt: doc.lastSyncedAt,
            syncStatus: doc.syncStatus ?? 'success',
            metadata: doc.metadata ?? {},
        };
    }

    private mapContest(doc: any): Contest {
        return {
            id: doc._id.toString(),
            platform: doc.platform,
            contestId: doc.contestId,
            title: doc.title,
            startTime: doc.startTime,
            endTime: doc.endTime,
            url: doc.url ?? '',
            status: doc.status ?? 'upcoming',
        };
    }

    private mapContestReminder(doc: any): ContestReminder {
        return {
            id: doc._id.toString(),
            userId: doc.userId,
            contestId: doc.contestId,
            reminderTime: doc.reminderTime,
            reminderType: doc.reminderType,
            sent: doc.sent ?? false,
            createdAt: doc.createdAt,
        };
    }
}

