import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Metabolic profile - stores user's health assessment and personalized data
 */
export const metabolicProfiles = mysqlTable("metabolic_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Basic metrics (in US units)
  currentWeight: int("currentWeight"), // pounds
  targetWeight: int("targetWeight"), // pounds
  height: int("height"), // inches
  age: int("age"),
  gender: mysqlEnum("gender", ["male", "female", "other"]),
  
  // Health conditions
  hasObesity: boolean("hasObesity").default(false),
  hasDiabetes: boolean("hasDiabetes").default(false),
  hasMetabolicSyndrome: boolean("hasMetabolicSyndrome").default(false),
  hasNAFLD: boolean("hasNAFLD").default(false),
  
  // Medications
  currentMedications: text("currentMedications"), // JSON array
  takingGLP1: boolean("takingGLP1").default(false),
  
  // Lifestyle factors
  stressLevel: mysqlEnum("stressLevel", ["low", "moderate", "high"]),
  sleepQuality: mysqlEnum("sleepQuality", ["poor", "fair", "good", "excellent"]),
  activityLevel: mysqlEnum("activityLevel", ["sedentary", "light", "moderate", "active", "very_active"]),
  
  // Risk factors
  susceptibleToLinoleicAcid: boolean("susceptibleToLinoleicAcid").default(false),
  lowNADLevels: boolean("lowNADLevels").default(false),
  poorGutHealth: boolean("poorGutHealth").default(false),
  
  // Goals
  primaryGoal: text("primaryGoal"),
  targetDate: timestamp("targetDate"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MetabolicProfile = typeof metabolicProfiles.$inferSelect;
export type InsertMetabolicProfile = typeof metabolicProfiles.$inferInsert;

/**
 * Dietary tracking - logs meals with comprehensive nutrition data
 */
export const mealLogs = mysqlTable("meal_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  loggedAt: timestamp("loggedAt").notNull(), // UTC timestamp
  mealType: mysqlEnum("mealType", ["breakfast", "lunch", "dinner", "snack"]).notNull(),
  
  // Food details
  foodName: varchar("foodName", { length: 255 }).notNull(),
  servingSize: varchar("servingSize", { length: 100 }), // e.g., "1 cup", "100g", "1 medium"
  
  // Macronutrients
  calories: int("calories"), // kcal
  protein: int("protein"), // grams
  carbs: int("carbs"), // grams
  fats: int("fats"), // grams
  fiber: int("fiber"), // grams
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MealLog = typeof mealLogs.$inferSelect;
export type InsertMealLog = typeof mealLogs.$inferInsert;

/**
 * Fasting schedules - tracks intermittent fasting protocols
 */
export const fastingSchedules = mysqlTable("fasting_schedules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  fastingType: mysqlEnum("fastingType", ["adf", "tre", "wdf"]).notNull(), // Alternate Day, Time-Restricted, Whole Day
  
  // For TRE: eating window times
  eatingWindowStart: int("eatingWindowStart"), // hour of day (0-23)
  eatingWindowEnd: int("eatingWindowEnd"), // hour of day (0-23)
  
  // For WDF: fasting days
  fastingDays: text("fastingDays"), // JSON array of day numbers (0-6)
  
  isActive: boolean("isActive").default(true),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FastingSchedule = typeof fastingSchedules.$inferSelect;
export type InsertFastingSchedule = typeof fastingSchedules.$inferInsert;

/**
 * Fasting logs - daily adherence tracking
 */
export const fastingLogs = mysqlTable("fasting_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  scheduleId: int("scheduleId").notNull(),
  
  date: timestamp("date").notNull(), // Date of the fast
  adhered: boolean("adhered").notNull(), // Did they stick to the plan?
  
  // For TRE tracking
  actualEatingStart: timestamp("actualEatingStart"),
  actualEatingEnd: timestamp("actualEatingEnd"),
  
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FastingLog = typeof fastingLogs.$inferSelect;
export type InsertFastingLog = typeof fastingLogs.$inferInsert;

/**
 * Supplement tracking
 */
export const supplements = mysqlTable("supplements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["berberine", "probiotic", "nmn", "resveratrol", "other"]).notNull(),
  
  dosage: varchar("dosage", { length: 100 }).notNull(),
  frequency: varchar("frequency", { length: 100 }).notNull(), // e.g., "twice daily", "once daily"
  timing: varchar("timing", { length: 100 }), // e.g., "with meals", "morning"
  
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  isActive: boolean("isActive").default(true),
  
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Supplement = typeof supplements.$inferSelect;
export type InsertSupplement = typeof supplements.$inferInsert;

/**
 * Supplement logs - daily adherence
 */
export const supplementLogs = mysqlTable("supplement_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  supplementId: int("supplementId").notNull(),
  
  takenAt: timestamp("takenAt").notNull(), // UTC timestamp
  adhered: boolean("adhered").notNull(),
  
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SupplementLog = typeof supplementLogs.$inferSelect;
export type InsertSupplementLog = typeof supplementLogs.$inferInsert;

/**
 * Progress tracking - weight, measurements, photos
 */
export const progressLogs = mysqlTable("progress_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  loggedAt: timestamp("loggedAt").notNull(), // UTC timestamp
  
  // Weight and measurements (US units)
  weight: int("weight"), // pounds
  waistCircumference: int("waistCircumference"), // inches
  hipCircumference: int("hipCircumference"), // inches
  chestCircumference: int("chestCircumference"), // inches
  
  // Subjective metrics
  energyLevel: mysqlEnum("energyLevel", ["very_low", "low", "moderate", "high", "very_high"]),
  mood: mysqlEnum("mood", ["poor", "fair", "good", "excellent"]),
  sleepQuality: mysqlEnum("sleepQuality", ["poor", "fair", "good", "excellent"]),
  
  // Photo storage (S3 URLs)
  photoFront: text("photoFront"),
  photoSide: text("photoSide"),
  photoBack: text("photoBack"),
  
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProgressLog = typeof progressLogs.$inferSelect;
export type InsertProgressLog = typeof progressLogs.$inferInsert;

/**
 * Daily insights - AI-generated personalized messages
 */
export const dailyInsights = mysqlTable("daily_insights", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  date: timestamp("date").notNull(),
  
  insightType: mysqlEnum("insightType", ["motivation", "education", "tip", "reminder", "celebration"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  
  viewed: boolean("viewed").default(false),
  viewedAt: timestamp("viewedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyInsight = typeof dailyInsights.$inferSelect;
export type InsertDailyInsight = typeof dailyInsights.$inferInsert;

/**
 * Chat history - AI conversation logs
 */
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
