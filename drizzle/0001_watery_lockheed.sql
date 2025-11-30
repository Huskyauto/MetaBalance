CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
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
	`mealType` enum('breakfast','lunch','dinner','snack'),
	`description` text NOT NULL,
	`containsSoybeanOil` boolean DEFAULT false,
	`containsCornOil` boolean DEFAULT false,
	`containsSunflowerOil` boolean DEFAULT false,
	`highLinoleicAcid` boolean DEFAULT false,
	`isProcessedFood` boolean DEFAULT false,
	`fiberContent` enum('none','low','moderate','high'),
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
