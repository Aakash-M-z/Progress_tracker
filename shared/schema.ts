import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  date: text('date').notNull(),
  category: text('category').notNull(),
  topic: text('topic').notNull(),
  difficulty: text('difficulty').notNull(),
  platform: text('platform').notNull(),
  timeSpent: integer('time_spent').notNull(),
  problemDescription: text('problem_description'),
  notes: text('notes'),
  timeComplexity: text('time_complexity'),
  spaceComplexity: text('space_complexity'),
  solved: boolean('solved').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;