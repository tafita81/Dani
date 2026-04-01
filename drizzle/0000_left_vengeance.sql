CREATE TABLE `anamnesis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patient_id` int NOT NULL,
	`main_complaint` text,
	`history` text,
	`family_history` text,
	`medical_history` text,
	`medications` json,
	`previous_therapy` boolean DEFAULT false,
	`previous_therapy_details` text,
	`sleep_pattern` text,
	`exercise_habits` text,
	`substance_use` text,
	`social_support` text,
	`work_situation` text,
	`completed` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `anamnesis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`patient_id` int,
	`title` varchar(255),
	`start_time` timestamp NOT NULL,
	`end_time` timestamp NOT NULL,
	`status` enum('scheduled','confirmed','done','cancelled','no_show') DEFAULT 'scheduled',
	`type` enum('online','presential') DEFAULT 'presential',
	`google_event_id` varchar(255),
	`outlook_event_id` varchar(255),
	`meet_link` varchar(500),
	`reminder_sent` boolean DEFAULT false,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cognitive_concepts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patient_id` int NOT NULL,
	`core_beliefs` json,
	`intermediate_beliefs` json,
	`automatic_thoughts` json,
	`compensatory_strategies` json,
	`triggers` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cognitive_concepts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `google_calendar_integration` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`access_token` varchar(500),
	`refresh_token` varchar(500),
	`calendar_id` varchar(255),
	`active` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `google_calendar_integration_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patient_id` int NOT NULL,
	`type` enum('BDI-II','BAI','PHQ-9','GAD-7','DASS-21','PCL-5') NOT NULL,
	`answers` json NOT NULL,
	`total_score` int NOT NULL,
	`severity` varchar(50),
	`interpretation` text,
	`applied_at` timestamp DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lead_interactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lead_id` int NOT NULL,
	`type` enum('call','message','email','meeting','note') DEFAULT 'note',
	`content` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lead_interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(20),
	`email` varchar(255),
	`source` enum('instagram','whatsapp','telegram','site','tiktok','other') DEFAULT 'other',
	`stage` enum('lead','prospect','scheduled','converted','lost') DEFAULT 'lead',
	`score` int DEFAULT 0,
	`notes` text,
	`converted_at` timestamp,
	`patient_id` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mood_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patient_id` int NOT NULL,
	`score` int NOT NULL,
	`emotion` varchar(50),
	`notes` text,
	`recorded_at` timestamp DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mood_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255),
	`phone` varchar(20),
	`birth_date` varchar(10),
	`gender` enum('M','F','other'),
	`occupation` varchar(100),
	`origin` enum('instagram','whatsapp','telegram','site','indication','other') DEFAULT 'other',
	`status` enum('active','inactive','waitlist') DEFAULT 'active',
	`notes` text,
	`emergency_contact` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `professional_profile` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`crp` varchar(20),
	`bio` text,
	`specialties` json,
	`approaches` json,
	`session_price` float,
	`session_duration` int DEFAULT 50,
	`phone` varchar(20),
	`address` text,
	`instagram` varchar(100),
	`whatsapp` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `professional_profile_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session_evolutions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patient_id` int NOT NULL,
	`session_note_id` int,
	`period` varchar(7),
	`progress_score` int,
	`observations` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `session_evolutions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patient_id` int NOT NULL,
	`user_id` int NOT NULL,
	`appointment_id` int,
	`transcript` text,
	`summary` text,
	`key_themes` json,
	`interventions` json,
	`homework` text,
	`next_session` text,
	`ai_suggestions` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `session_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`patient_alias` varchar(100),
	`content` text NOT NULL,
	`rating` int DEFAULT 5,
	`approved` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `treatment_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patient_id` int NOT NULL,
	`goals` json,
	`approach` varchar(100),
	`techniques` json,
	`estimated_sessions` int,
	`frequency` varchar(50),
	`active` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `treatment_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `whatsapp_integration` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`phone_number_id` varchar(255) NOT NULL,
	`access_token` varchar(500),
	`business_account_id` varchar(255),
	`webhook_token` varchar(255),
	`active` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whatsapp_integration_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsapp_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`patient_id` int,
	`lead_id` int,
	`message_id` varchar(255) NOT NULL,
	`phone_number` varchar(20),
	`content` text,
	`direction` enum('inbound','outbound') NOT NULL,
	`status` enum('sent','delivered','read','failed') DEFAULT 'sent',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whatsapp_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `anamnesis` ADD CONSTRAINT `anamnesis_patient_id_patients_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_patient_id_patients_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cognitive_concepts` ADD CONSTRAINT `cognitive_concepts_patient_id_patients_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `google_calendar_integration` ADD CONSTRAINT `google_calendar_integration_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_results` ADD CONSTRAINT `inventory_results_patient_id_patients_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lead_interactions` ADD CONSTRAINT `lead_interactions_lead_id_leads_id_fk` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leads` ADD CONSTRAINT `leads_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leads` ADD CONSTRAINT `leads_patient_id_patients_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mood_entries` ADD CONSTRAINT `mood_entries_patient_id_patients_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `patients` ADD CONSTRAINT `patients_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `professional_profile` ADD CONSTRAINT `professional_profile_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_evolutions` ADD CONSTRAINT `session_evolutions_patient_id_patients_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_evolutions` ADD CONSTRAINT `session_evolutions_session_note_id_session_notes_id_fk` FOREIGN KEY (`session_note_id`) REFERENCES `session_notes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_notes` ADD CONSTRAINT `session_notes_patient_id_patients_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_notes` ADD CONSTRAINT `session_notes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_notes` ADD CONSTRAINT `session_notes_appointment_id_appointments_id_fk` FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `testimonials` ADD CONSTRAINT `testimonials_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `treatment_plans` ADD CONSTRAINT `treatment_plans_patient_id_patients_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `whatsapp_integration` ADD CONSTRAINT `whatsapp_integration_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `whatsapp_messages` ADD CONSTRAINT `whatsapp_messages_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `whatsapp_messages` ADD CONSTRAINT `whatsapp_messages_patient_id_patients_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `whatsapp_messages` ADD CONSTRAINT `whatsapp_messages_lead_id_leads_id_fk` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `anam_patient_idx` ON `anamnesis` (`patient_id`);--> statement-breakpoint
CREATE INDEX `appt_user_idx` ON `appointments` (`user_id`);--> statement-breakpoint
CREATE INDEX `appt_patient_idx` ON `appointments` (`patient_id`);--> statement-breakpoint
CREATE INDEX `appt_start_idx` ON `appointments` (`start_time`);--> statement-breakpoint
CREATE INDEX `cog_patient_idx` ON `cognitive_concepts` (`patient_id`);--> statement-breakpoint
CREATE INDEX `gc_user_idx` ON `google_calendar_integration` (`user_id`);--> statement-breakpoint
CREATE INDEX `inv_patient_idx` ON `inventory_results` (`patient_id`);--> statement-breakpoint
CREATE INDEX `inv_type_idx` ON `inventory_results` (`type`);--> statement-breakpoint
CREATE INDEX `li_lead_idx` ON `lead_interactions` (`lead_id`);--> statement-breakpoint
CREATE INDEX `leads_user_idx` ON `leads` (`user_id`);--> statement-breakpoint
CREATE INDEX `leads_stage_idx` ON `leads` (`stage`);--> statement-breakpoint
CREATE INDEX `mood_patient_idx` ON `mood_entries` (`patient_id`);--> statement-breakpoint
CREATE INDEX `patients_user_idx` ON `patients` (`user_id`);--> statement-breakpoint
CREATE INDEX `patients_status_idx` ON `patients` (`status`);--> statement-breakpoint
CREATE INDEX `prof_user_idx` ON `professional_profile` (`user_id`);--> statement-breakpoint
CREATE INDEX `se_patient_idx` ON `session_evolutions` (`patient_id`);--> statement-breakpoint
CREATE INDEX `sn_patient_idx` ON `session_notes` (`patient_id`);--> statement-breakpoint
CREATE INDEX `sn_user_idx` ON `session_notes` (`user_id`);--> statement-breakpoint
CREATE INDEX `test_user_idx` ON `testimonials` (`user_id`);--> statement-breakpoint
CREATE INDEX `tp_patient_idx` ON `treatment_plans` (`patient_id`);--> statement-breakpoint
CREATE INDEX `wa_user_idx` ON `whatsapp_integration` (`user_id`);--> statement-breakpoint
CREATE INDEX `wm_user_idx` ON `whatsapp_messages` (`user_id`);--> statement-breakpoint
CREATE INDEX `wm_patient_idx` ON `whatsapp_messages` (`patient_id`);