import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, index, uniqueIndex, foreignKey } from "drizzle-orm/mysql-core";

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
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
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
  
  // Daily nutrition goals (calculated based on BMR/TDEE)
  dailyCalorieGoal: int("dailyCalorieGoal"),
  dailyProteinGoal: int("dailyProteinGoal"), // grams
  dailyCarbsGoal: int("dailyCarbsGoal"), // grams
  dailyFatsGoal: int("dailyFatsGoal"), // grams
  dailyFiberGoal: int("dailyFiberGoal"), // grams
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("metabolic_profiles_userId_idx").on(table.userId),
}));

export type MetabolicProfile = typeof metabolicProfiles.$inferSelect;
export type InsertMetabolicProfile = typeof metabolicProfiles.$inferInsert;

/**
 * Dietary tracking - logs meals with comprehensive nutrition data
 */
export const mealLogs = mysqlTable("meal_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
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
}, (table) => ({
  userIdIdx: index("meal_logs_userId_idx").on(table.userId),
  loggedAtIdx: index("meal_logs_loggedAt_idx").on(table.loggedAt),
  userDateIdx: index("meal_logs_user_date_idx").on(table.userId, table.loggedAt),
}));

export type MealLog = typeof mealLogs.$inferSelect;
export type InsertMealLog = typeof mealLogs.$inferInsert;

/**
 * Fasting schedules - tracks intermittent fasting protocols
 */
export const fastingSchedules = mysqlTable("fasting_schedules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
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
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  scheduleId: int("scheduleId").notNull().references(() => fastingSchedules.id, { onDelete: "cascade" }),
  
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
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
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
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  supplementId: int("supplementId").notNull().references(() => supplements.id, { onDelete: "cascade" }),
  
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
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
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
}, (table) => ({
  userIdIdx: index("progress_logs_userId_idx").on(table.userId),
  loggedAtIdx: index("progress_logs_loggedAt_idx").on(table.loggedAt),
  userDateIdx: index("progress_logs_user_date_idx").on(table.userId, table.loggedAt),
}));

export type ProgressLog = typeof progressLogs.$inferSelect;
export type InsertProgressLog = typeof progressLogs.$inferInsert;

/**
 * Daily insights - AI-generated personalized messages
 */
export const dailyInsights = mysqlTable("daily_insights", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
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
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * Research content - stores Grok-generated weight loss research
 */
export const researchContent = mysqlTable("research_content", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  category: mysqlEnum("category", ["overview", "glp1", "fasting", "nutrition", "exercise", "metabolic"]).notNull(),
  content: text("content").notNull(), // Markdown content from Grok
  
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  
  // Optional metadata
  viewed: boolean("viewed").default(false),
  viewedAt: timestamp("viewedAt"),
  bookmarked: boolean("bookmarked").default(false),
});

export type ResearchContent = typeof researchContent.$inferSelect;
export type InsertResearchContent = typeof researchContent.$inferInsert;

/**
 * Daily goals - tracks daily micro-goals and completion status
 */
export const dailyGoals = mysqlTable("daily_goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  date: timestamp("date").notNull(), // Date for this goal set
  
  // Goal completion flags
  mealLoggingComplete: boolean("mealLoggingComplete").default(false), // Logged 3+ meals
  proteinGoalComplete: boolean("proteinGoalComplete").default(false), // Hit protein target
  fastingGoalComplete: boolean("fastingGoalComplete").default(false), // Completed fasting window
  exerciseGoalComplete: boolean("exerciseGoalComplete").default(false), // Logged exercise
  waterGoalComplete: boolean("waterGoalComplete").default(false), // Drank 8+ glasses
  
  // Calculated win score (0-5 stars)
  winScore: int("winScore").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("daily_goals_userId_idx").on(table.userId),
  dateIdx: index("daily_goals_date_idx").on(table.date),
  userDateIdx: index("daily_goals_user_date_idx").on(table.userId, table.date),
}));

export type DailyGoal = typeof dailyGoals.$inferSelect;
export type InsertDailyGoal = typeof dailyGoals.$inferInsert;

/**
 * Weekly reflections - stores user's weekly self-assessment and AI insights
 */
export const weeklyReflections = mysqlTable("weekly_reflections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  weekStartDate: timestamp("weekStartDate").notNull(), // Monday of the week
  weekEndDate: timestamp("weekEndDate").notNull(), // Sunday of the week
  
  // User's reflection answers
  wentWell: text("wentWell"), // What went well this week?
  challenges: text("challenges"), // What was challenging?
  nextWeekPlan: text("nextWeekPlan"), // What will you do differently next week?
  
  // AI-generated insights
  aiInsights: text("aiInsights"), // Pattern recognition from Grok
  
  // Weekly stats (calculated)
  daysLogged: int("daysLogged").default(0), // Days with meal logging (0-7)
  avgWinScore: int("avgWinScore").default(0), // Average daily win score
  weightChange: int("weightChange"), // Weight change in pounds (can be negative)
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("weekly_reflections_userId_idx").on(table.userId),
  weekStartIdx: index("weekly_reflections_weekStart_idx").on(table.weekStartDate),
  userWeekIdx: index("weekly_reflections_user_week_idx").on(table.userId, table.weekStartDate),
}));

export type WeeklyReflection = typeof weeklyReflections.$inferSelect;
export type InsertWeeklyReflection = typeof weeklyReflections.$inferInsert;
