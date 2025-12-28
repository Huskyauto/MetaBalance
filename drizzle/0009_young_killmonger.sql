CREATE TABLE `mindfulness_exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` enum('breathing','urge_surfing','mindful_eating','body_scan','meditation','grounding') NOT NULL,
	`duration` int NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
	`instructions` text NOT NULL,
	`audioUrl` text,
	`imageUrl` text,
	`benefits` text,
	`bestFor` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mindfulness_exercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mindfulness_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exerciseId` int NOT NULL,
	`startedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`durationMinutes` int NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`moodBefore` enum('very_low','low','neutral','good','great'),
	`moodAfter` enum('very_low','low','neutral','good','great'),
	`cravingIntensityBefore` int,
	`cravingIntensityAfter` int,
	`notes` text,
	`trigger` enum('scheduled','craving','stress','emotional','before_meal','other'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mindfulness_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `mindfulness_sessions` ADD CONSTRAINT `mindfulness_sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mindfulness_sessions` ADD CONSTRAINT `mindfulness_sessions_exerciseId_mindfulness_exercises_id_fk` FOREIGN KEY (`exerciseId`) REFERENCES `mindfulness_exercises`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `mindfulness_sessions_userId_idx` ON `mindfulness_sessions` (`userId`);--> statement-breakpoint
CREATE INDEX `mindfulness_sessions_exerciseId_idx` ON `mindfulness_sessions` (`exerciseId`);--> statement-breakpoint
CREATE INDEX `mindfulness_sessions_startedAt_idx` ON `mindfulness_sessions` (`startedAt`);