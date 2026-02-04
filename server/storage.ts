import { User, InsertUser, Activity, InsertActivity } from "../shared/schema.js";
import { FileStorage } from "./file-storage.js";

export interface IStorage {
  getUser(id: string | number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  getUserActivities(userId: string | number): Promise<Activity[]>;
  createActivity(insertActivity: InsertActivity): Promise<Activity>;
  updateActivity(id: string | number, activity: Partial<Activity>): Promise<Activity | undefined>;
  deleteActivity(id: string | number): Promise<boolean>;
  updateUser(id: string | number, user: Partial<User>): Promise<User | undefined>;
}

export const storage = new FileStorage();
