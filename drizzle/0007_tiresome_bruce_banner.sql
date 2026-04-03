CREATE TABLE `blocked_time_slots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`start_time` varchar(5) NOT NULL,
	`end_time` varchar(5) NOT NULL,
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blocked_time_slots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `blocked_time_slots` ADD CONSTRAINT `blocked_time_slots_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `bts_user_date_idx` ON `blocked_time_slots` (`user_id`,`date`);--> statement-breakpoint
CREATE INDEX `bts_date_idx` ON `blocked_time_slots` (`date`);