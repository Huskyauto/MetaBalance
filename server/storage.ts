import { 
  users, weightLogs, meals, fastingSessions, dailyGoals, streaks, chatMessages,
  type User, type InsertUser,
  type WeightLog, type InsertWeightLog,
  type Meal, type InsertMeal,
  type FastingSession, type InsertFastingSession,
  type DailyGoal, type InsertDailyGoal,
  type Streak, type InsertStreak,
  type ChatMessage, type InsertChatMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // Weight Logs
  getWeightLogs(userId: string, limit?: number): Promise<WeightLog[]>;
  getLatestWeight(userId: string): Promise<WeightLog | undefined>;
  createWeightLog(log: InsertWeightLog): Promise<WeightLog>;
  
  // Meals
  getMealsByDate(userId: string, date: string): Promise<Meal[]>;
  getMeals(userId: string, limit?: number): Promise<Meal[]>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  deleteMeal(id: string): Promise<void>;
  getDailyNutrition(userId: string, date: string): Promise<{ calories: number; protein: number; carbs: number; fat: number }>;
  
  // Fasting Sessions
  getActiveFastingSession(userId: string): Promise<FastingSession | undefined>;
  getFastingSessions(userId: string, limit?: number): Promise<FastingSession[]>;
  createFastingSession(session: InsertFastingSession): Promise<FastingSession>;
  endFastingSession(id: string): Promise<FastingSession | undefined>;
  
  // Daily Goals
  getDailyGoals(userId: string, date: string): Promise<DailyGoal | undefined>;
  upsertDailyGoals(goal: InsertDailyGoal): Promise<DailyGoal>;
  
  // Streaks
  getStreak(userId: string): Promise<Streak | undefined>;
  updateStreak(userId: string, data: Partial<InsertStreak>): Promise<Streak>;
  
  // Chat Messages
  getChatMessages(userId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatHistory(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  // Weight Logs
  async getWeightLogs(userId: string, limit = 30): Promise<WeightLog[]> {
    return db.select().from(weightLogs)
      .where(eq(weightLogs.userId, userId))
      .orderBy(desc(weightLogs.date))
      .limit(limit);
  }

  async getLatestWeight(userId: string): Promise<WeightLog | undefined> {
    const [log] = await db.select().from(weightLogs)
      .where(eq(weightLogs.userId, userId))
      .orderBy(desc(weightLogs.date))
      .limit(1);
    return log || undefined;
  }

  async createWeightLog(log: InsertWeightLog): Promise<WeightLog> {
    const [weightLog] = await db.insert(weightLogs).values(log).returning();
    return weightLog;
  }

  // Meals
  async getMealsByDate(userId: string, date: string): Promise<Meal[]> {
    return db.select().from(meals)
      .where(and(eq(meals.userId, userId), eq(meals.date, date)))
      .orderBy(meals.time);
  }

  async getMeals(userId: string, limit = 50): Promise<Meal[]> {
    return db.select().from(meals)
      .where(eq(meals.userId, userId))
      .orderBy(desc(meals.date))
      .limit(limit);
  }

  async createMeal(meal: InsertMeal): Promise<Meal> {
    const [newMeal] = await db.insert(meals).values(meal).returning();
    return newMeal;
  }

  async deleteMeal(id: string): Promise<void> {
    await db.delete(meals).where(eq(meals.id, id));
  }

  async getDailyNutrition(userId: string, date: string): Promise<{ calories: number; protein: number; carbs: number; fat: number }> {
    const dayMeals = await this.getMealsByDate(userId, date);
    return dayMeals.reduce((acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fat: acc.fat + (meal.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }

  // Fasting Sessions
  async getActiveFastingSession(userId: string): Promise<FastingSession | undefined> {
    const [session] = await db.select().from(fastingSessions)
      .where(and(
        eq(fastingSessions.userId, userId),
        eq(fastingSessions.completed, false)
      ))
      .orderBy(desc(fastingSessions.startTime))
      .limit(1);
    return session || undefined;
  }

  async getFastingSessions(userId: string, limit = 10): Promise<FastingSession[]> {
    return db.select().from(fastingSessions)
      .where(eq(fastingSessions.userId, userId))
      .orderBy(desc(fastingSessions.startTime))
      .limit(limit);
  }

  async createFastingSession(session: InsertFastingSession): Promise<FastingSession> {
    const [newSession] = await db.insert(fastingSessions).values(session).returning();
    return newSession;
  }

  async endFastingSession(id: string): Promise<FastingSession | undefined> {
    const endTime = new Date();
    const [session] = await db.select().from(fastingSessions).where(eq(fastingSessions.id, id));
    if (!session) return undefined;
    
    const durationMinutes = Math.floor((endTime.getTime() - new Date(session.startTime).getTime()) / 60000);
    const [updated] = await db.update(fastingSessions)
      .set({ 
        endTime, 
        completed: true, 
        actualDurationMinutes: durationMinutes 
      })
      .where(eq(fastingSessions.id, id))
      .returning();
    return updated || undefined;
  }

  // Daily Goals
  async getDailyGoals(userId: string, date: string): Promise<DailyGoal | undefined> {
    const [goal] = await db.select().from(dailyGoals)
      .where(and(eq(dailyGoals.userId, userId), eq(dailyGoals.date, date)));
    return goal || undefined;
  }

  async upsertDailyGoals(goal: InsertDailyGoal): Promise<DailyGoal> {
    const existing = await this.getDailyGoals(goal.userId, goal.date);
    if (existing) {
      const [updated] = await db.update(dailyGoals)
        .set({ goals: goal.goals as { id: string; text: string; completed: boolean; rating?: number }[] })
        .where(eq(dailyGoals.id, existing.id))
        .returning();
      return updated;
    }
    const [newGoal] = await db.insert(dailyGoals).values({
      ...goal,
      goals: goal.goals as { id: string; text: string; completed: boolean; rating?: number }[]
    }).returning();
    return newGoal;
  }

  // Streaks
  async getStreak(userId: string): Promise<Streak | undefined> {
    const [streak] = await db.select().from(streaks).where(eq(streaks.userId, userId));
    return streak || undefined;
  }

  async updateStreak(userId: string, data: Partial<InsertStreak>): Promise<Streak> {
    const existing = await this.getStreak(userId);
    if (existing) {
      const [updated] = await db.update(streaks)
        .set(data)
        .where(eq(streaks.userId, userId))
        .returning();
      return updated;
    }
    const [newStreak] = await db.insert(streaks)
      .values({ userId, ...data })
      .returning();
    return newStreak;
  }

  // Chat Messages
  async getChatMessages(userId: string, limit = 50): Promise<ChatMessage[]> {
    return db.select().from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(chatMessages.createdAt)
      .limit(limit);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async clearChatHistory(userId: string): Promise<void> {
    await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
  }
}

export const storage = new DatabaseStorage();
