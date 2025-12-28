CREATE TABLE `emotional_eating_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`triggerEmotion` enum('stress','anxiety','sadness','boredom','anger','loneliness','other') NOT NULL,
	`triggerDescription` text,
	`situation` text,
	`foodConsumed` text NOT NULL,
	`estimatedCalories` int,
	`intensity` int NOT NULL,
	`copingStrategyUsed` text,
	`effectivenessRating` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emotional_eating_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medication_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`medicationId` int NOT NULL,
	`takenAt` timestamp NOT NULL,
	`dosageTaken` varchar(100) NOT NULL,
	`sideEffectsNoted` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `medication_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('glp1_agonist','ssri','stimulant','combination','other') NOT NULL,
	`dosage` varchar(100) NOT NULL,
	`frequency` varchar(100) NOT NULL,
	`startDate` date NOT NULL,
	`endDate` date,
	`prescribedFor` text,
	`sideEffects` text,
	`effectiveness` int,
	`notes` text,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `emotional_eating_logs` ADD CONSTRAINT `emotional_eating_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `medication_logs` ADD CONSTRAINT `medication_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `medication_logs` ADD CONSTRAINT `medication_logs_medicationId_medications_id_fk` FOREIGN KEY (`medicationId`) REFERENCES `medications`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `medications` ADD CONSTRAINT `medications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;