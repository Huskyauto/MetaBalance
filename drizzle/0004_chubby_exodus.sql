CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`achievementId` varchar(100) NOT NULL,
	`unlockedAt` timestamp NOT NULL,
	`viewed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `achievements` ADD CONSTRAINT `achievements_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `achievements_userId_idx` ON `achievements` (`userId`);--> statement-breakpoint
CREATE INDEX `achievements_achievementId_idx` ON `achievements` (`achievementId`);--> statement-breakpoint
CREATE INDEX `achievements_user_achievement_idx` ON `achievements` (`userId`,`achievementId`);