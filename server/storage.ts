import { User, InsertUser, Activity, InsertActivity } from "../shared/schema.js";
import { MongoStorage } from "./mongo-storage.js";

export interface IStorage {
  getUser(id: string | number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  getUserActivities(userId: string | number): Promise<Activity[]>;
  createActivity(insertActivity: InsertActivity): Promise<Activity>;
  updateActivity(id: string | number, activity: Partial<Activity>): Promise<Activity | undefined>;
  deleteActivity(id: string | number): Promise<boolean>;
}

export const storage = new MongoStorage();
