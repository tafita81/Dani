ALTER TABLE `session_notes` ADD `full_analysis` text;--> statement-breakpoint
ALTER TABLE `session_notes` ADD `emotional_analysis` json;--> statement-breakpoint
ALTER TABLE `session_notes` ADD `session_type` varchar(50);--> statement-breakpoint
ALTER TABLE `session_notes` ADD `duration` int;--> statement-breakpoint
ALTER TABLE `session_notes` ADD `session_date` timestamp;