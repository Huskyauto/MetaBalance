CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL,
	`mealLoggingComplete` boolean DEFAULT false,
	`proteinGoalComplete` boolean DEFAULT false,
	`fastingGoalComplete` boolean DEFAULT false,
	`exerciseGoalComplete` boolean DEFAULT false,
	`waterGoalComplete` boolean DEFAULT false,
	`winScore` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL,
	`insightType` enum('motivation','education','tip','reminder','celebration') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`viewed` boolean DEFAULT false,
	`viewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `daily_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fasting_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`scheduleId` int NOT NULL,
	`date` timestamp NOT NULL,
	`adhered` boolean NOT NULL,
	`actualEatingStart` timestamp,
	`actualEatingEnd` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fasting_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fasting_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fastingType` enum('adf','tre','wdf') NOT NULL,
	`eatingWindowStart` int,
	`eatingWindowEnd` int,
	`fastingDays` text,
	`isActive` boolean DEFAULT true,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fasting_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meal_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`loggedAt` timestamp NOT NULL,
	`mealType` enum('breakfast','lunch','dinner','snack') NOT NULL,
	`foodName` varchar(255) NOT NULL,
	`servingSize` varchar(100),
	`calories` int,
	`protein` int,
	`carbs` int,
	`fats` int,
	`fiber` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meal_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `metabolic_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currentWeight` int,
	`targetWeight` int,
	`height` int,
	`age` int,
	`gender` enum('male','female','other'),
	`hasObesity` boolean DEFAULT false,
	`hasDiabetes` boolean DEFAULT false,
	`hasMetabolicSyndrome` boolean DEFAULT false,
	`hasNAFLD` boolean DEFAULT false,
	`currentMedications` text,
	`takingGLP1` boolean DEFAULT false,
	`stressLevel` enum('low','moderate','high'),
	`sleepQuality` enum('poor','fair','good','excellent'),
	`activityLevel` enum('sedentary','light','moderate','active','very_active'),
	`susceptibleToLinoleicAcid` boolean DEFAULT false,
	`lowNADLevels` boolean DEFAULT false,
	`poorGutHealth` boolean DEFAULT false,
	`primaryGoal` text,
	`targetDate` timestamp,
	`dailyCalorieGoal` int,
	`dailyProteinGoal` int,
	`dailyCarbsGoal` int,
	`dailyFatsGoal` int,
	`dailyFiberGoal` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `metabolic_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `progress_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`loggedAt` timestamp NOT NULL,
	`weight` int,
	`waistCircumference` int,
	`hipCircumference` int,
	`chestCircumference` int,
	`energyLevel` enum('very_low','low','moderate','high','very_high'),
	`mood` enum('poor','fair','good','excellent'),
	`sleepQuality` enum('poor','fair','good','excellent'),
	`photoFront` text,
	`photoSide` text,
	`photoBack` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `progress_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `research_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`category` enum('overview','glp1','fasting','nutrition','exercise','metabolic') NOT NULL,
	`content` text NOT NULL,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`viewed` boolean DEFAULT false,
	`viewedAt` timestamp,
	`bookmarked` boolean DEFAULT false,
	CONSTRAINT `research_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplement_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`supplementId` int NOT NULL,
	`takenAt` timestamp NOT NULL,
	`adhered` boolean NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supplement_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('berberine','probiotic','nmn','resveratrol','other') NOT NULL,
	`dosage` varchar(100) NOT NULL,
	`frequency` varchar(100) NOT NULL,
	`timing` varchar(100),
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`isActive` boolean DEFAULT true,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supplements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `weekly_reflections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weekStartDate` timestamp NOT NULL,
	`weekEndDate` timestamp NOT NULL,
	`wentWell` text,
	`challenges` text,
	`nextWeekPlan` text,
	`aiInsights` text,
	`daysLogged` int DEFAULT 0,
	`avgWinScore` int DEFAULT 0,
	`weightChange` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weekly_reflections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `daily_goals` ADD CONSTRAINT `daily_goals_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `daily_insights` ADD CONSTRAINT `daily_insights_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fasting_logs` ADD CONSTRAINT `fasting_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fasting_logs` ADD CONSTRAINT `fasting_logs_scheduleId_fasting_schedules_id_fk` FOREIGN KEY (`scheduleId`) REFERENCES `fasting_schedules`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fasting_schedules` ADD CONSTRAINT `fasting_schedules_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meal_logs` ADD CONSTRAINT `meal_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `metabolic_profiles` ADD CONSTRAINT `metabolic_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `progress_logs` ADD CONSTRAINT `progress_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `research_content` ADD CONSTRAINT `research_content_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `supplement_logs` ADD CONSTRAINT `supplement_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `supplement_logs` ADD CONSTRAINT `supplement_logs_supplementId_supplements_id_fk` FOREIGN KEY (`supplementId`) REFERENCES `supplements`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `supplements` ADD CONSTRAINT `supplements_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `weekly_reflections` ADD CONSTRAINT `weekly_reflections_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `daily_goals_userId_idx` ON `daily_goals` (`userId`);--> statement-breakpoint
CREATE INDEX `daily_goals_date_idx` ON `daily_goals` (`date`);--> statement-breakpoint
CREATE INDEX `daily_goals_user_date_idx` ON `daily_goals` (`userId`,`date`);--> statement-breakpoint
CREATE INDEX `meal_logs_userId_idx` ON `meal_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `meal_logs_loggedAt_idx` ON `meal_logs` (`loggedAt`);--> statement-breakpoint
CREATE INDEX `meal_logs_user_date_idx` ON `meal_logs` (`userId`,`loggedAt`);--> statement-breakpoint
CREATE INDEX `metabolic_profiles_userId_idx` ON `metabolic_profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `progress_logs_userId_idx` ON `progress_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `progress_logs_loggedAt_idx` ON `progress_logs` (`loggedAt`);--> statement-breakpoint
CREATE INDEX `progress_logs_user_date_idx` ON `progress_logs` (`userId`,`loggedAt`);--> statement-breakpoint
CREATE INDEX `weekly_reflections_userId_idx` ON `weekly_reflections` (`userId`);--> statement-breakpoint
CREATE INDEX `weekly_reflections_weekStart_idx` ON `weekly_reflections` (`weekStartDate`);--> statement-breakpoint
CREATE INDEX `weekly_reflections_user_week_idx` ON `weekly_reflections` (`userId`,`weekStartDate`);