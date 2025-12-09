CREATE TABLE `water_intake` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL,
	`glassesConsumed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `water_intake_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `water_intake` ADD CONSTRAINT `water_intake_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `water_intake_userId_idx` ON `water_intake` (`userId`);--> statement-breakpoint
CREATE INDEX `water_intake_date_idx` ON `water_intake` (`date`);--> statement-breakpoint
CREATE INDEX `water_intake_user_date_idx` ON `water_intake` (`userId`,`date`);