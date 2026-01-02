import { 
  users, weightLogs, meals, fastingSessions, dailyGoals, streaks, chatMessages,
  moodCheckIns, emotionalJournals, copingStrategies, workshopProgress,
  type User, type InsertUser, type UpsertUser,
  type WeightLog, type InsertWeightLog,
  type Meal, type InsertMeal,
  type FastingSession, type InsertFastingSession,
  type DailyGoal, type InsertDailyGoal,
  type Streak, type InsertStreak,
  type ChatMessage, type InsertChatMessage,
  type MoodCheckIn, type InsertMoodCheckIn,
  type EmotionalJournal, type InsertEmotionalJournal,
  type CopingStrategy, type InsertCopingStrategy,
  type WorkshopProgress, type InsertWorkshopProgress
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
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
  
  // Mood Check-ins
  getMoodCheckIns(userId: string, limit?: number): Promise<MoodCheckIn[]>;
  getMoodCheckInsByDate(userId: string, date: string): Promise<MoodCheckIn[]>;
  createMoodCheckIn(checkIn: InsertMoodCheckIn): Promise<MoodCheckIn>;
  
  // Emotional Journals
  getEmotionalJournals(userId: string, limit?: number): Promise<EmotionalJournal[]>;
  createEmotionalJournal(journal: InsertEmotionalJournal): Promise<EmotionalJournal>;
  deleteEmotionalJournal(id: string): Promise<void>;
  
  // Coping Strategies
  getCopingStrategies(userId: string): Promise<CopingStrategy[]>;
  createCopingStrategy(strategy: InsertCopingStrategy): Promise<CopingStrategy>;
  updateCopingStrategy(id: string, data: Partial<InsertCopingStrategy>): Promise<CopingStrategy | undefined>;
  deleteCopingStrategy(id: string): Promise<void>;
  
  // Workshop Progress
  getWorkshopProgress(userId: string): Promise<WorkshopProgress[]>;
  getWorkshopProgressByDay(userId: string, dayNumber: number): Promise<WorkshopProgress | undefined>;
  upsertWorkshopProgress(progress: InsertWorkshopProgress): Promise<WorkshopProgress>;
  markDayComplete(userId: string, dayNumber: number): Promise<WorkshopProgress | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id)).returning();
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

  // Mood Check-ins
  async getMoodCheckIns(userId: string, limit = 50): Promise<MoodCheckIn[]> {
    return db.select().from(moodCheckIns)
      .where(eq(moodCheckIns.userId, userId))
      .orderBy(desc(moodCheckIns.createdAt))
      .limit(limit);
  }

  async getMoodCheckInsByDate(userId: string, date: string): Promise<MoodCheckIn[]> {
    return db.select().from(moodCheckIns)
      .where(and(eq(moodCheckIns.userId, userId), eq(moodCheckIns.date, date)))
      .orderBy(moodCheckIns.time);
  }

  async createMoodCheckIn(checkIn: InsertMoodCheckIn): Promise<MoodCheckIn> {
    const [newCheckIn] = await db.insert(moodCheckIns).values(checkIn).returning();
    return newCheckIn;
  }

  // Emotional Journals
  async getEmotionalJournals(userId: string, limit = 50): Promise<EmotionalJournal[]> {
    return db.select().from(emotionalJournals)
      .where(eq(emotionalJournals.userId, userId))
      .orderBy(desc(emotionalJournals.createdAt))
      .limit(limit);
  }

  async createEmotionalJournal(journal: InsertEmotionalJournal): Promise<EmotionalJournal> {
    const [newJournal] = await db.insert(emotionalJournals).values(journal).returning();
    return newJournal;
  }

  async deleteEmotionalJournal(id: string): Promise<void> {
    await db.delete(emotionalJournals).where(eq(emotionalJournals.id, id));
  }

  // Coping Strategies
  async getCopingStrategies(userId: string): Promise<CopingStrategy[]> {
    return db.select().from(copingStrategies)
      .where(eq(copingStrategies.userId, userId))
      .orderBy(desc(copingStrategies.isFavorite), copingStrategies.name);
  }

  async createCopingStrategy(strategy: InsertCopingStrategy): Promise<CopingStrategy> {
    const [newStrategy] = await db.insert(copingStrategies).values(strategy).returning();
    return newStrategy;
  }

  async updateCopingStrategy(id: string, data: Partial<InsertCopingStrategy>): Promise<CopingStrategy | undefined> {
    const [updated] = await db.update(copingStrategies)
      .set(data)
      .where(eq(copingStrategies.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCopingStrategy(id: string): Promise<void> {
    await db.delete(copingStrategies).where(eq(copingStrategies.id, id));
  }

  // Workshop Progress
  async getWorkshopProgress(userId: string): Promise<WorkshopProgress[]> {
    return db.select().from(workshopProgress)
      .where(eq(workshopProgress.userId, userId))
      .orderBy(workshopProgress.dayNumber);
  }

  async getWorkshopProgressByDay(userId: string, dayNumber: number): Promise<WorkshopProgress | undefined> {
    const [progress] = await db.select().from(workshopProgress)
      .where(and(eq(workshopProgress.userId, userId), eq(workshopProgress.dayNumber, dayNumber)));
    return progress || undefined;
  }

  async upsertWorkshopProgress(progress: InsertWorkshopProgress): Promise<WorkshopProgress> {
    const existing = await this.getWorkshopProgressByDay(progress.userId, progress.dayNumber);
    
    if (existing) {
      const [updated] = await db.update(workshopProgress)
        .set({
          exerciseResponse: progress.exerciseResponse ?? existing.exerciseResponse,
          reflectionResponse: progress.reflectionResponse ?? existing.reflectionResponse,
          completed: progress.completed ?? existing.completed,
        })
        .where(eq(workshopProgress.id, existing.id))
        .returning();
      return updated;
    }
    
    const [newProgress] = await db.insert(workshopProgress).values(progress).returning();
    return newProgress;
  }

  async markDayComplete(userId: string, dayNumber: number): Promise<WorkshopProgress | undefined> {
    const existing = await this.getWorkshopProgressByDay(userId, dayNumber);
    
    if (existing) {
      const [updated] = await db.update(workshopProgress)
        .set({ completed: true, completedAt: new Date() })
        .where(eq(workshopProgress.id, existing.id))
        .returning();
      return updated;
    }
    
    const [newProgress] = await db.insert(workshopProgress)
      .values({ userId, dayNumber, completed: true, completedAt: new Date() })
      .returning();
    return newProgress;
  }
}

export const storage = new DatabaseStorage();
