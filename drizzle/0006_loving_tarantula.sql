CREATE TABLE `fasting_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`total_fasts` int DEFAULT 0,
	`completed_fasts` int DEFAULT 0,
	`abandoned_fasts` int DEFAULT 0,
	`longest_streak` int DEFAULT 0,
	`current_streak` int DEFAULT 0,
	`total_weight_lost` varchar(10),
	`average_fast_duration` int,
	`last_fast_date` timestamp,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fasting_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journey_initializations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`start_date` timestamp NOT NULL,
	`initial_weight` varchar(10),
	`goal_weight` varchar(10),
	`current_phase` int DEFAULT 1,
	`completed_phases` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `journey_initializations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplement_reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`supplement_id` int NOT NULL,
	`reminder_time` varchar(5) NOT NULL,
	`enabled` boolean DEFAULT true,
	`frequency` varchar(20) DEFAULT 'daily',
	`last_reminded_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supplement_reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `fasting_analytics` ADD CONSTRAINT `fasting_analytics_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `journey_initializations` ADD CONSTRAINT `journey_initializations_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `supplement_reminders` ADD CONSTRAINT `supplement_reminders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `supplement_reminders` ADD CONSTRAINT `supplement_reminders_supplement_id_journey_supplements_id_fk` FOREIGN KEY (`supplement_id`) REFERENCES `journey_supplements`(`id`) ON DELETE no action ON UPDATE no action;