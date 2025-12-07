import { eq, and, desc, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  metabolicProfiles, InsertMetabolicProfile,
  mealLogs, InsertMealLog,
  fastingSchedules, InsertFastingSchedule,
  fastingLogs, InsertFastingLog,
  supplements, InsertSupplement,
  supplementLogs, InsertSupplementLog,
  progressLogs, InsertProgressLog,
  dailyInsights, InsertDailyInsight,
  chatMessages, InsertChatMessage,
  researchContent, InsertResearchContent,
  dailyGoals, InsertDailyGoal,
  weeklyReflections, InsertWeeklyReflection
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ===== USER FUNCTIONS =====

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== METABOLIC PROFILE FUNCTIONS =====

export async function getMetabolicProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(metabolicProfiles).where(eq(metabolicProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertMetabolicProfile(profile: InsertMetabolicProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getMetabolicProfile(profile.userId);
  
  if (existing) {
    await db.update(metabolicProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(metabolicProfiles.userId, profile.userId));
  } else {
    await db.insert(metabolicProfiles).values(profile);
  }
}

// ===== MEAL LOG FUNCTIONS =====

export async function createMealLog(meal: InsertMealLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(mealLogs).values(meal);
}

export async function getMealsByDate(userId: number, date: Date) {
  const db = await getDb();
  if (!db) return [];
  
  // Get start and end of the day in UTC
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const result = await db.select().from(mealLogs)
    .where(and(
      eq(mealLogs.userId, userId),
      gte(mealLogs.loggedAt, startOfDay),
      lte(mealLogs.loggedAt, endOfDay)
    ))
    .orderBy(mealLogs.loggedAt);
  
  return result;
}

export async function getDailyNutritionTotals(userId: number, date: Date) {
  const db = await getDb();
  if (!db) return { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };
  
  const meals = await getMealsByDate(userId, date);
  
  const totals = meals.reduce((acc, meal) => {
    return {
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fats: acc.fats + (meal.fats || 0),
      fiber: acc.fiber + (meal.fiber || 0),
    };
  }, { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });
  
  return totals;
}

export async function getWeeklyNutritionData(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(mealLogs)
    .where(and(
      eq(mealLogs.userId, userId),
      gte(mealLogs.loggedAt, startDate),
      lte(mealLogs.loggedAt, endDate)
    ))
    .orderBy(mealLogs.loggedAt);
  
  // Group by date and calculate daily totals
  const dailyData = new Map<string, { date: string; calories: number; protein: number; carbs: number; fats: number; fiber: number }>();
  
  result.forEach(meal => {
    const dateKey = meal.loggedAt.toISOString().split('T')[0];
    const existing = dailyData.get(dateKey) || { date: dateKey, calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };
    
    dailyData.set(dateKey, {
      date: dateKey,
      calories: existing.calories + (meal.calories || 0),
      protein: existing.protein + (meal.protein || 0),
      carbs: existing.carbs + (meal.carbs || 0),
      fats: existing.fats + (meal.fats || 0),
      fiber: existing.fiber + (meal.fiber || 0),
    });
  });
  
  return Array.from(dailyData.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export async function deleteMealLog(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(mealLogs).where(and(eq(mealLogs.id, id), eq(mealLogs.userId, userId)));
}

// ===== FASTING SCHEDULE FUNCTIONS =====

export async function createFastingSchedule(schedule: InsertFastingSchedule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Deactivate any existing active schedules
  await db.update(fastingSchedules)
    .set({ isActive: false })
    .where(and(eq(fastingSchedules.userId, schedule.userId), eq(fastingSchedules.isActive, true)));
  
  await db.insert(fastingSchedules).values(schedule);
}

export async function getActiveFastingSchedule(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(fastingSchedules)
    .where(and(eq(fastingSchedules.userId, userId), eq(fastingSchedules.isActive, true)))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getFastingSchedules(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(fastingSchedules)
    .where(eq(fastingSchedules.userId, userId))
    .orderBy(desc(fastingSchedules.createdAt));
  
  return result;
}

// ===== FASTING LOG FUNCTIONS =====

export async function createFastingLog(log: InsertFastingLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(fastingLogs).values(log);
}

export async function getFastingLogs(userId: number, scheduleId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(fastingLogs.userId, userId), eq(fastingLogs.scheduleId, scheduleId)];
  
  if (startDate && endDate) {
    conditions.push(gte(fastingLogs.date, startDate));
    conditions.push(lte(fastingLogs.date, endDate));
  }
  
  const result = await db.select().from(fastingLogs)
    .where(and(...conditions))
    .orderBy(desc(fastingLogs.date));
  
  return result;
}

// ===== SUPPLEMENT FUNCTIONS =====

export async function createSupplement(supplement: InsertSupplement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(supplements).values(supplement);
}

export async function getActiveSupplements(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(supplements)
    .where(and(eq(supplements.userId, userId), eq(supplements.isActive, true)))
    .orderBy(desc(supplements.createdAt));
  
  return result;
}

export async function getAllSupplements(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(supplements)
    .where(eq(supplements.userId, userId))
    .orderBy(desc(supplements.createdAt));
  
  return result;
}

export async function updateSupplement(id: number, userId: number, updates: Partial<InsertSupplement>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(supplements)
    .set({ ...updates, updatedAt: new Date() })
    .where(and(eq(supplements.id, id), eq(supplements.userId, userId)));
}

export async function deleteSupplement(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(supplements).where(and(eq(supplements.id, id), eq(supplements.userId, userId)));
}

// ===== SUPPLEMENT LOG FUNCTIONS =====

export async function createSupplementLog(log: InsertSupplementLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(supplementLogs).values(log);
}

export async function getSupplementLogs(userId: number, supplementId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(supplementLogs.userId, userId), eq(supplementLogs.supplementId, supplementId)];
  
  if (startDate && endDate) {
    conditions.push(gte(supplementLogs.takenAt, startDate));
    conditions.push(lte(supplementLogs.takenAt, endDate));
  }
  
  const result = await db.select().from(supplementLogs)
    .where(and(...conditions))
    .orderBy(desc(supplementLogs.takenAt));
  
  return result;
}

// ===== PROGRESS LOG FUNCTIONS =====

export async function createProgressLog(log: InsertProgressLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(progressLogs).values(log);
}

export async function getProgressLogs(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(progressLogs.userId, userId)];
  
  if (startDate && endDate) {
    conditions.push(gte(progressLogs.loggedAt, startDate));
    conditions.push(lte(progressLogs.loggedAt, endDate));
  }
  
  const result = await db.select().from(progressLogs)
    .where(and(...conditions))
    .orderBy(desc(progressLogs.loggedAt));
  return result;
}

export async function getLatestProgressLog(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(progressLogs)
    .where(eq(progressLogs.userId, userId))
    .orderBy(desc(progressLogs.loggedAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

// ===== DAILY INSIGHT FUNCTIONS =====

export async function createDailyInsight(insight: InsertDailyInsight) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(dailyInsights).values(insight);
}

export async function getTodayInsight(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const result = await db.select().from(dailyInsights)
    .where(and(
      eq(dailyInsights.userId, userId),
      gte(dailyInsights.date, today),
      lte(dailyInsights.date, tomorrow)
    ))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function markInsightViewed(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(dailyInsights)
    .set({ viewed: true, viewedAt: new Date() })
    .where(and(eq(dailyInsights.id, id), eq(dailyInsights.userId, userId)));
}

// ===== CHAT MESSAGE FUNCTIONS =====

export async function createChatMessage(message: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(chatMessages).values(message);
}

export async function getChatHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);
  
  return result.reverse(); // Return in chronological order
}

export async function clearChatHistory(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
}


// ===== RESEARCH CONTENT FUNCTIONS =====

export async function saveResearchContent(content: InsertResearchContent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(researchContent).values(content);
}

export async function getResearchHistory(
  userId: number, 
  category?: 'overview' | 'glp1' | 'fasting' | 'nutrition' | 'exercise' | 'metabolic',
  limit: number = 10
) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(researchContent)
    .where(eq(researchContent.userId, userId))
    .orderBy(desc(researchContent.generatedAt))
    .limit(limit);
  
  if (category) {
    query = db.select().from(researchContent)
      .where(and(
        eq(researchContent.userId, userId),
        eq(researchContent.category, category)
      ))
      .orderBy(desc(researchContent.generatedAt))
      .limit(limit);
  }
  
  return await query;
}

export async function getLatestResearchByCategory(userId: number, category: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(researchContent)
    .where(and(
      eq(researchContent.userId, userId),
      eq(researchContent.category, category as any)
    ))
    .orderBy(desc(researchContent.generatedAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function markResearchViewed(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(researchContent)
    .set({ viewed: true, viewedAt: new Date() })
    .where(and(eq(researchContent.id, id), eq(researchContent.userId, userId)));
}

export async function toggleResearchBookmark(id: number, userId: number, bookmarked: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(researchContent)
    .set({ bookmarked })
    .where(and(eq(researchContent.id, id), eq(researchContent.userId, userId)));
}


// ===== DAILY GOALS FUNCTIONS =====

export async function upsertDailyGoal(userId: number, date: Date, goals: Partial<InsertDailyGoal>) {
  const db = await getDb();
  if (!db) return null;

  try {
    // Calculate win score (0-5 based on completed goals)
    const completedGoals = [
      goals.mealLoggingComplete,
      goals.proteinGoalComplete,
      goals.fastingGoalComplete,
      goals.exerciseGoalComplete,
      goals.waterGoalComplete
    ].filter(Boolean).length;

    const winScore = completedGoals;

    await db.insert(dailyGoals).values({
      userId,
      date,
      ...goals,
      winScore
    }).onDuplicateKeyUpdate({
      set: {
        ...goals,
        winScore,
        updatedAt: new Date()
      }
    });

    return { success: true, winScore };
  } catch (error) {
    console.error("[Database] Failed to upsert daily goal:", error);
    return null;
  }
}

export async function getDailyGoal(userId: number, date: Date) {
  const db = await getDb();
  if (!db) return null;

  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await db
      .select()
      .from(dailyGoals)
      .where(
        and(
          eq(dailyGoals.userId, userId),
          gte(dailyGoals.date, startOfDay),
          lte(dailyGoals.date, endOfDay)
        )
      )
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get daily goal:", error);
    return null;
  }
}

export async function getWeeklyGoals(userId: number, weekStartDate: Date) {
  const db = await getDb();
  if (!db) return [];

  try {
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 7);

    const result = await db
      .select()
      .from(dailyGoals)
      .where(
        and(
          eq(dailyGoals.userId, userId),
          gte(dailyGoals.date, weekStartDate),
          lte(dailyGoals.date, weekEndDate)
        )
      )
      .orderBy(dailyGoals.date);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get weekly goals:", error);
    return [];
  }
}

// ===== WEEKLY REFLECTIONS FUNCTIONS =====

export async function createWeeklyReflection(userId: number, reflection: Partial<InsertWeeklyReflection>) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(weeklyReflections).values({
      userId,
      ...reflection
    } as InsertWeeklyReflection);

    return { success: true, id: result[0].insertId };
  } catch (error) {
    console.error("[Database] Failed to create weekly reflection:", error);
    return null;
  }
}

export async function getWeeklyReflection(userId: number, weekStartDate: Date) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(weeklyReflections)
      .where(
        and(
          eq(weeklyReflections.userId, userId),
          eq(weeklyReflections.weekStartDate, weekStartDate)
        )
      )
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get weekly reflection:", error);
    return null;
  }
}

export async function getRecentReflections(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(weeklyReflections)
      .where(eq(weeklyReflections.userId, userId))
      .orderBy(desc(weeklyReflections.weekStartDate))
      .limit(limit);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get recent reflections:", error);
    return [];
  }
}
