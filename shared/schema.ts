import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull().default("User"),
  email: text("email"),
  targetWeight: real("target_weight"),
  startWeight: real("start_weight"),
  heightInches: integer("height_inches"),
  dailyCalorieTarget: integer("daily_calorie_target").default(2000),
  dailyProteinTarget: integer("daily_protein_target").default(120),
  dailyCarbsTarget: integer("daily_carbs_target").default(200),
  dailyFatTarget: integer("daily_fat_target").default(65),
  preferredFastingProtocol: text("preferred_fasting_protocol").default("16:8"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  weightLogs: many(weightLogs),
  meals: many(meals),
  fastingSessions: many(fastingSessions),
  dailyGoals: many(dailyGoals),
  chatMessages: many(chatMessages),
}));

// Weight logs table
export const weightLogs = pgTable("weight_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  weight: real("weight").notNull(),
  date: date("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const weightLogsRelations = relations(weightLogs, ({ one }) => ({
  user: one(users, {
    fields: [weightLogs.userId],
    references: [users.id],
  }),
}));

// Meals table
export const meals = pgTable("meals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner, snack
  calories: integer("calories").notNull(),
  protein: real("protein").default(0),
  carbs: real("carbs").default(0),
  fat: real("fat").default(0),
  fiber: real("fiber").default(0),
  servingSize: text("serving_size"),
  date: date("date").notNull(),
  time: text("time"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mealsRelations = relations(meals, ({ one }) => ({
  user: one(users, {
    fields: [meals.userId],
    references: [users.id],
  }),
}));

// Fasting sessions table
export const fastingSessions = pgTable("fasting_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  protocol: text("protocol").notNull(), // 16:8, 18:6, 20:4, OMAD
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  targetDurationHours: integer("target_duration_hours").notNull(),
  actualDurationMinutes: integer("actual_duration_minutes"),
  completed: boolean("completed").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fastingSessionsRelations = relations(fastingSessions, ({ one }) => ({
  user: one(users, {
    fields: [fastingSessions.userId],
    references: [users.id],
  }),
}));

// Daily goals table
export const dailyGoals = pgTable("daily_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  goals: jsonb("goals").notNull().$type<{
    id: string;
    text: string;
    completed: boolean;
    rating?: number;
  }[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyGoalsRelations = relations(dailyGoals, ({ one }) => ({
  user: one(users, {
    fields: [dailyGoals.userId],
    references: [users.id],
  }),
}));

// Streaks table
export const streaks = pgTable("streaks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActiveDate: date("last_active_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const streaksRelations = relations(streaks, ({ one }) => ({
  user: one(users, {
    fields: [streaks.userId],
    references: [users.id],
  }),
}));

// Chat messages table for AI coach
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role").notNull(), // user, assistant
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertWeightLogSchema = createInsertSchema(weightLogs).omit({ id: true, createdAt: true });
export const insertMealSchema = createInsertSchema(meals).omit({ id: true, createdAt: true });
export const insertFastingSessionSchema = createInsertSchema(fastingSessions).omit({ id: true, createdAt: true });
export const insertDailyGoalSchema = createInsertSchema(dailyGoals).omit({ id: true, createdAt: true });
export const insertStreakSchema = createInsertSchema(streaks).omit({ id: true, createdAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWeightLog = z.infer<typeof insertWeightLogSchema>;
export type WeightLog = typeof weightLogs.$inferSelect;

export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Meal = typeof meals.$inferSelect;

export type InsertFastingSession = z.infer<typeof insertFastingSessionSchema>;
export type FastingSession = typeof fastingSessions.$inferSelect;

export type InsertDailyGoal = z.infer<typeof insertDailyGoalSchema>;
export type DailyGoal = typeof dailyGoals.$inferSelect;

export type InsertStreak = z.infer<typeof insertStreakSchema>;
export type Streak = typeof streaks.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
