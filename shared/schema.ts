export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
}

export type InsertUser = Omit<User, 'id' | 'createdAt'>;

export interface Activity {
  id: string;
  userId: string;
  date: string;
  category: string;
  topic: string;
  difficulty: string;
  platform: string;
  timeSpent: number;
  problemDescription: string | null;
  notes: string | null;
  timeComplexity: string | null;
  spaceComplexity: string | null;
  solved: boolean;
  createdAt: Date;
}

export type InsertActivity = Omit<Activity, 'id' | 'createdAt'>;
