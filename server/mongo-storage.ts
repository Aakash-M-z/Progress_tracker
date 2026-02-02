import mongoose from 'mongoose';
import { UserModel, ActivityModel } from './models.js';
import { IStorage } from './storage.js';
import { User, InsertUser, Activity, InsertActivity } from '../shared/schema.js';

export class MongoStorage implements IStorage {
    constructor() {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/progress_tracker';
        mongoose.connect(uri)
            .then(() => console.log('Connected to MongoDB'))
            .catch(err => console.error('MongoDB connection error:', err));
    }

    async getUser(id: string | number): Promise<User | undefined> {
        const user = await UserModel.findById(id);
        return user ? this.mapUser(user) : undefined;
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

    async getUserActivities(userId: string | number): Promise<Activity[]> {
        const activities = await ActivityModel.find({ userId: userId.toString() });
        return activities.map((a: any) => this.mapActivity(a));
    }

    async createActivity(insertActivity: InsertActivity): Promise<Activity> {
        const activity = new ActivityModel(insertActivity);
        await activity.save();
        return this.mapActivity(activity);
    }

    async updateActivity(id: string | number, activity: Partial<Activity>): Promise<Activity | undefined> {
        const updated = await ActivityModel.findByIdAndUpdate(id, activity, { new: true });
        return updated ? this.mapActivity(updated) : undefined;
    }

    async deleteActivity(id: string | number): Promise<boolean> {
        const result = await ActivityModel.findByIdAndDelete(id);
        return !!result;
    }

    async updateUser(id: string | number, user: Partial<User>): Promise<User | undefined> {
        const updated = await UserModel.findByIdAndUpdate(id, user, { new: true });
        return updated ? this.mapUser(updated) : undefined;
    }

    private mapUser(mongoUser: any): User {
        return {
            id: mongoUser._id.toString(),
            username: mongoUser.username,
            email: mongoUser.email,
            password: mongoUser.password,
            role: mongoUser.role,
            createdAt: mongoUser.createdAt
        } as any;
    }

    private mapActivity(mongoActivity: any): Activity {
        return {
            id: mongoActivity._id.toString(),
            userId: mongoActivity.userId.toString(),
            date: mongoActivity.date,
            category: mongoActivity.category,
            topic: mongoActivity.topic,
            difficulty: mongoActivity.difficulty,
            platform: mongoActivity.platform,
            timeSpent: mongoActivity.timeSpent,
            problemDescription: mongoActivity.problemDescription,
            notes: mongoActivity.notes,
            timeComplexity: mongoActivity.timeComplexity,
            spaceComplexity: mongoActivity.spaceComplexity,
            solved: mongoActivity.solved,
            createdAt: mongoActivity.createdAt
        } as any;
    }
}
