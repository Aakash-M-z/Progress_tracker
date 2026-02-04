import { IStorage } from "./storage.js";
import { User, InsertUser, Activity, InsertActivity } from "../shared/schema.js";
import fs from 'fs';
import path from 'path';

export class FileStorage implements IStorage {
    private users: Map<string, User>;
    private activities: Map<string, Activity>;
    private currentUserId: number;
    private currentActivityId: number;
    private filePath: string;

    constructor() {
        this.users = new Map();
        this.activities = new Map();
        this.currentUserId = 1;
        this.currentActivityId = 1;
        this.filePath = path.join(process.cwd(), 'local-data.json');
        this.loadData();
    }

    private loadData() {
        if (fs.existsSync(this.filePath)) {
            try {
                const data = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
                if (data.users) {
                    data.users.forEach((u: User) => this.users.set(u.id.toString(), u));
                    // Update ID counter
                    this.currentUserId = Math.max(...data.users.map((u: User) => parseInt(u.id))) + 1;
                }
                if (data.activities) {
                    data.activities.forEach((a: Activity) => this.activities.set(a.id.toString(), a));
                    this.currentActivityId = Math.max(...data.activities.map((a: Activity) => parseInt(a.id))) + 1;
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
                activities: Array.from(this.activities.values())
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
}
