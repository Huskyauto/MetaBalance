CREATE TABLE `blood_work_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`testDate` timestamp NOT NULL,
	`glucose` decimal(5,2),
	`a1c` decimal(4,2),
	`totalCholesterol` decimal(5,2),
	`ldl` decimal(5,2),
	`hdl` decimal(5,2),
	`triglycerides` decimal(6,2),
	`tsh` decimal(5,3),
	`alt` decimal(5,2),
	`ast` decimal(5,2),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `blood_work_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `extended_fasting_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp,
	`type` enum('24hr','3-5day','7-10day') NOT NULL,
	`targetDuration` int NOT NULL,
	`actualDuration` int,
	`electrolytesLog` text,
	`weightBefore` decimal(5,2),
	`weightAfter` decimal(5,2),
	`notes` text,
	`completed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `extended_fasting_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journey_phases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phaseNumber` int NOT NULL,
	`phaseName` varchar(255) NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`goalWeightLoss` decimal(5,2) NOT NULL,
	`actualWeightLoss` decimal(5,2) DEFAULT '0',
	`status` enum('active','completed','skipped') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `journey_phases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journey_supplements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`dosage` varchar(100) NOT NULL,
	`frequency` varchar(100) NOT NULL,
	`monthlyCost` decimal(6,2),
	`category` enum('foundation','advanced','optional') NOT NULL,
	`phaseIntroduced` int NOT NULL,
	`benefits` text,
	`brands` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `journey_supplements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_supplement_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`supplementId` int NOT NULL,
	`date` timestamp NOT NULL,
	`taken` boolean NOT NULL DEFAULT false,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_supplement_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `blood_work_results` ADD CONSTRAINT `blood_work_results_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `extended_fasting_sessions` ADD CONSTRAINT `extended_fasting_sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `journey_phases` ADD CONSTRAINT `journey_phases_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_supplement_log` ADD CONSTRAINT `user_supplement_log_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_supplement_log` ADD CONSTRAINT `user_supplement_log_supplementId_journey_supplements_id_fk` FOREIGN KEY (`supplementId`) REFERENCES `journey_supplements`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `blood_work_results_userId_idx` ON `blood_work_results` (`userId`);--> statement-breakpoint
CREATE INDEX `blood_work_results_testDate_idx` ON `blood_work_results` (`testDate`);--> statement-breakpoint
CREATE INDEX `extended_fasting_sessions_userId_idx` ON `extended_fasting_sessions` (`userId`);--> statement-breakpoint
CREATE INDEX `extended_fasting_sessions_startTime_idx` ON `extended_fasting_sessions` (`startTime`);--> statement-breakpoint
CREATE INDEX `journey_phases_userId_idx` ON `journey_phases` (`userId`);--> statement-breakpoint
CREATE INDEX `journey_phases_phaseNumber_idx` ON `journey_phases` (`phaseNumber`);--> statement-breakpoint
CREATE INDEX `journey_phases_user_phase_idx` ON `journey_phases` (`userId`,`phaseNumber`);--> statement-breakpoint
CREATE INDEX `user_supplement_log_userId_idx` ON `user_supplement_log` (`userId`);--> statement-breakpoint
CREATE INDEX `user_supplement_log_date_idx` ON `user_supplement_log` (`date`);--> statement-breakpoint
CREATE INDEX `user_supplement_log_user_date_idx` ON `user_supplement_log` (`userId`,`date`);