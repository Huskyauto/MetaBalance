ALTER TABLE `metabolic_profiles` ADD `notificationsEnabled` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `metabolic_profiles` ADD `dailyReminderTime` varchar(5);--> statement-breakpoint
ALTER TABLE `metabolic_profiles` ADD `streakAlertsEnabled` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `metabolic_profiles` ADD `milestoneAlertsEnabled` boolean DEFAULT true;