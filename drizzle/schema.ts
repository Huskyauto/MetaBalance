import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, date, index, uniqueIndex, foreignKey } from "drizzle-orm/mysql-core";

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
  
  // Notification preferences
  notificationsEnabled: boolean("notificationsEnabled").default(true),
  dailyReminderTime: varchar("dailyReminderTime", { length: 5 }), // HH:MM format (e.g., "09:00")
  streakAlertsEnabled: boolean("streakAlertsEnabled").default(true),
  milestoneAlertsEnabled: boolean("milestoneAlertsEnabled").default(true),
  
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

/**
 * Water intake tracking - logs daily water consumption
 */
export const waterIntake = mysqlTable("water_intake", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  date: timestamp("date").notNull(), // Date for this water log
  glassesConsumed: int("glassesConsumed").default(0).notNull(), // Number of 8oz glasses
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("water_intake_userId_idx").on(table.userId),
  dateIdx: index("water_intake_date_idx").on(table.date),
  userDateIdx: index("water_intake_user_date_idx").on(table.userId, table.date),
}));

export type WaterIntake = typeof waterIntake.$inferSelect;
export type InsertWaterIntake = typeof waterIntake.$inferInsert;

/**
 * Favorite foods - stores user's frequently logged foods for quick access
 */
export const favoriteFoods = mysqlTable("favorite_foods", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Food details (copied from meal log)
  foodName: varchar("foodName", { length: 255 }).notNull(),
  servingSize: varchar("servingSize", { length: 100 }),
  
  // Nutrition info
  calories: int("calories"),
  protein: int("protein"),
  carbs: int("carbs"),
  fats: int("fats"),
  fiber: int("fiber"),
  
  // Usage tracking
  timesUsed: int("timesUsed").default(0).notNull(),
  lastUsed: timestamp("lastUsed"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("favorite_foods_userId_idx").on(table.userId),
  lastUsedIdx: index("favorite_foods_lastUsed_idx").on(table.lastUsed),
}));

export type FavoriteFood = typeof favoriteFoods.$inferSelect;
export type InsertFavoriteFood = typeof favoriteFoods.$inferInsert;

/**
 * User achievements - tracks earned badges and milestones
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Achievement identifier
  achievementId: varchar("achievementId", { length: 100 }).notNull(), // e.g., "first_week", "weight_10lbs", "streak_100"
  
  // Unlock details
  unlockedAt: timestamp("unlockedAt").notNull(),
  viewed: boolean("viewed").default(false).notNull(), // Whether user has seen the unlock notification
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("achievements_userId_idx").on(table.userId),
  achievementIdIdx: index("achievements_achievementId_idx").on(table.achievementId),
  userAchievementIdx: index("achievements_user_achievement_idx").on(table.userId, table.achievementId),
}));

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * Journey Phases - tracks user's progress through the 90lb Journey 4-phase program
 */
export const journeyPhases = mysqlTable("journey_phases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  phaseNumber: int("phaseNumber").notNull(), // 1-4
  phaseName: varchar("phaseName", { length: 255 }).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  
  goalWeightLoss: decimal("goalWeightLoss", { precision: 5, scale: 2 }).notNull(), // lbs
  actualWeightLoss: decimal("actualWeightLoss", { precision: 5, scale: 2 }).default("0"),
  
  status: mysqlEnum("status", ["active", "completed", "skipped"]).notNull().default("active"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("journey_phases_userId_idx").on(table.userId),
  phaseNumberIdx: index("journey_phases_phaseNumber_idx").on(table.phaseNumber),
  userPhaseIdx: index("journey_phases_user_phase_idx").on(table.userId, table.phaseNumber),
}));

export type JourneyPhase = typeof journeyPhases.$inferSelect;
export type InsertJourneyPhase = typeof journeyPhases.$inferInsert;

/**
 * Journey Supplements - master list of supplements recommended in the 90lb Journey
 */
export const journeySupplements = mysqlTable("journey_supplements", {
  id: int("id").autoincrement().primaryKey(),
  
  name: varchar("name", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 100 }).notNull(),
  frequency: varchar("frequency", { length: 100 }).notNull(), // daily, weekly, as-needed
  monthlyCost: decimal("monthlyCost", { precision: 6, scale: 2 }),
  category: mysqlEnum("category", ["foundation", "advanced", "optional"]).notNull(),
  phaseIntroduced: int("phaseIntroduced").notNull(), // 1-4
  benefits: text("benefits"),
  brands: varchar("brands", { length: 500 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JourneySupplement = typeof journeySupplements.$inferSelect;
export type InsertJourneySupplement = typeof journeySupplements.$inferInsert;

/**
 * User Supplement Log - tracks daily supplement intake for journey supplements
 */
export const userSupplementLog = mysqlTable("user_supplement_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  supplementId: int("supplementId").notNull().references(() => journeySupplements.id, { onDelete: "cascade" }),
  
  date: timestamp("date").notNull(),
  taken: boolean("taken").notNull().default(false),
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_supplement_log_userId_idx").on(table.userId),
  dateIdx: index("user_supplement_log_date_idx").on(table.date),
  userDateIdx: index("user_supplement_log_user_date_idx").on(table.userId, table.date),
}));

export type UserSupplementLog = typeof userSupplementLog.$inferSelect;
export type InsertUserSupplementLog = typeof userSupplementLog.$inferInsert;

/**
 * Extended Fasting Sessions - tracks water-only fasting protocols (24hr, 3-5 day, 7-10 day)
 */
export const extendedFastingSessions = mysqlTable("extended_fasting_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime"),
  
  type: mysqlEnum("type", ["24hr", "3-5day", "7-10day"]).notNull(),
  targetDuration: int("targetDuration").notNull(), // hours
  actualDuration: int("actualDuration"), // hours
  
  // Electrolyte tracking (JSON string with daily log)
  electrolytesLog: text("electrolytesLog"),
  
  // Weight tracking
  weightBefore: decimal("weightBefore", { precision: 5, scale: 2 }),
  weightAfter: decimal("weightAfter", { precision: 5, scale: 2 }),
  
  notes: text("notes"),
  completed: boolean("completed").notNull().default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("extended_fasting_sessions_userId_idx").on(table.userId),
  startTimeIdx: index("extended_fasting_sessions_startTime_idx").on(table.startTime),
}));

export type ExtendedFastingSession = typeof extendedFastingSessions.$inferSelect;
export type InsertExtendedFastingSession = typeof extendedFastingSessions.$inferInsert;

/**
 * Blood Work Results - tracks metabolic health markers over time
 */
export const bloodWorkResults = mysqlTable("blood_work_results", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  testDate: timestamp("testDate").notNull(),
  
  // Glucose & diabetes markers
  glucose: decimal("glucose", { precision: 5, scale: 2 }), // mg/dL
  a1c: decimal("a1c", { precision: 4, scale: 2 }), // %
  
  // Lipid panel
  totalCholesterol: decimal("totalCholesterol", { precision: 5, scale: 2 }), // mg/dL
  ldl: decimal("ldl", { precision: 5, scale: 2 }), // mg/dL
  hdl: decimal("hdl", { precision: 5, scale: 2 }), // mg/dL
  triglycerides: decimal("triglycerides", { precision: 6, scale: 2 }), // mg/dL
  
  // Thyroid
  tsh: decimal("tsh", { precision: 5, scale: 3 }), // mIU/L
  
  // Liver function
  alt: decimal("alt", { precision: 5, scale: 2 }), // U/L
  ast: decimal("ast", { precision: 5, scale: 2 }), // U/L
  
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("blood_work_results_userId_idx").on(table.userId),
  testDateIdx: index("blood_work_results_testDate_idx").on(table.testDate),
}));

export type BloodWorkResult = typeof bloodWorkResults.$inferSelect;
export type InsertBloodWorkResult = typeof bloodWorkResults.$inferInsert;


// Journey Initialization & Reminders
export const journeyInitializations = mysqlTable('journey_initializations', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id),
  startDate: timestamp('start_date').notNull(),
  initialWeight: varchar('initial_weight', { length: 10 }),
  goalWeight: varchar('goal_weight', { length: 10 }),
  currentPhase: int('current_phase').default(1),
  completedPhases: int('completed_phases').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export type JourneyInitialization = typeof journeyInitializations.$inferSelect;
export type InsertJourneyInitialization = typeof journeyInitializations.$inferInsert;

export const supplementReminders = mysqlTable('supplement_reminders', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id),
  supplementId: int('supplement_id').notNull().references(() => journeySupplements.id),
  reminderTime: varchar('reminder_time', { length: 5 }).notNull(), // HH:MM format
  enabled: boolean('enabled').default(true),
  frequency: varchar('frequency', { length: 20 }).default('daily'), // daily, weekdays, weekends, custom
  lastRemindedAt: timestamp('last_reminded_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type SupplementReminder = typeof supplementReminders.$inferSelect;
export type InsertSupplementReminder = typeof supplementReminders.$inferInsert;

export const fastingAnalytics = mysqlTable('fasting_analytics', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id),
  totalFasts: int('total_fasts').default(0),
  completedFasts: int('completed_fasts').default(0),
  abandonedFasts: int('abandoned_fasts').default(0),
  longestStreak: int('longest_streak').default(0),
  currentStreak: int('current_streak').default(0),
  totalWeightLost: varchar('total_weight_lost', { length: 10 }),
  averageFastDuration: int('average_fast_duration'), // in hours
  lastFastDate: timestamp('last_fast_date'),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export type FastingAnalytic = typeof fastingAnalytics.$inferSelect;
export type InsertFastingAnalytic = typeof fastingAnalytics.$inferInsert;

/**
 * Emotional Eating Logs - Track emotional eating episodes with triggers and patterns
 */
export const emotionalEatingLogs = mysqlTable("emotional_eating_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  
  // Trigger information
  triggerEmotion: mysqlEnum("triggerEmotion", ["stress", "anxiety", "sadness", "boredom", "anger", "loneliness", "other"]).notNull(),
  triggerDescription: text("triggerDescription"),
  situation: text("situation"),
  
  // Food consumed
  foodConsumed: text("foodConsumed").notNull(),
  estimatedCalories: int("estimatedCalories"),
  
  // Intensity and coping
  intensity: int("intensity").notNull(), // 1-10 scale
  copingStrategyUsed: text("copingStrategyUsed"),
  effectivenessRating: int("effectivenessRating"), // 1-10 scale, null if no strategy used
  
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmotionalEatingLog = typeof emotionalEatingLogs.$inferSelect;
export type InsertEmotionalEatingLog = typeof emotionalEatingLogs.$inferInsert;

/**
 * Medications - Track medications including GLP-1 agonists, SSRIs, and other treatments
 */
export const medications = mysqlTable("medications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", [
    "glp1_agonist",      // Semaglutide, Liraglutide, etc.
    "ssri",              // Fluoxetine, Sertraline, etc.
    "stimulant",         // Lisdexamfetamine (Vyvanse), etc.
    "combination",       // Bupropion/Naltrexone, Phentermine/Topiramate
    "other"
  ]).notNull(),
  
  dosage: varchar("dosage", { length: 100 }).notNull(), // e.g., "1mg", "20mg", "0.5ml"
  frequency: varchar("frequency", { length: 100 }).notNull(), // e.g., "once daily", "twice daily", "weekly"
  
  startDate: date("startDate").notNull(),
  endDate: date("endDate"), // null if currently taking
  
  prescribedFor: text("prescribedFor"), // e.g., "Binge Eating Disorder", "Weight Loss", "Depression"
  sideEffects: text("sideEffects"), // Track any side effects
  effectiveness: int("effectiveness"), // 1-10 scale, user's subjective rating
  
  notes: text("notes"),
  active: boolean("active").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Medication = typeof medications.$inferSelect;
export type InsertMedication = typeof medications.$inferInsert;

/**
 * Medication Logs - Track daily medication adherence
 */
export const medicationLogs = mysqlTable("medication_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  medicationId: int("medicationId").notNull().references(() => medications.id, { onDelete: "cascade" }),
  
  takenAt: timestamp("takenAt").notNull(),
  dosageTaken: varchar("dosageTaken", { length: 100 }).notNull(),
  
  sideEffectsNoted: text("sideEffectsNoted"),
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MedicationLog = typeof medicationLogs.$inferSelect;
export type InsertMedicationLog = typeof medicationLogs.$inferInsert;
