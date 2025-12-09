CREATE TABLE `favorite_foods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`foodName` varchar(255) NOT NULL,
	`servingSize` varchar(100),
	`calories` int,
	`protein` int,
	`carbs` int,
	`fats` int,
	`fiber` int,
	`timesUsed` int NOT NULL DEFAULT 0,
	`lastUsed` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorite_foods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `favorite_foods` ADD CONSTRAINT `favorite_foods_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `favorite_foods_userId_idx` ON `favorite_foods` (`userId`);--> statement-breakpoint
CREATE INDEX `favorite_foods_lastUsed_idx` ON `favorite_foods` (`lastUsed`);