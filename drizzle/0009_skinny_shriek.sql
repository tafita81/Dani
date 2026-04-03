CREATE TABLE `protocol_answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`protocol_id` int NOT NULL,
	`question_id` int NOT NULL,
	`answer` text,
	`extracted_from_transcription` boolean DEFAULT false,
	`transcription_source` text,
	`confirmed_by_psychologist` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `protocol_answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `protocol_exports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`protocol_id` int NOT NULL,
	`export_format` enum('pdf','docx','html') DEFAULT 'pdf',
	`exported_at` timestamp DEFAULT (now()),
	`file_url` text,
	`file_name` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `protocol_exports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `protocol_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`section_id` int NOT NULL,
	`question_text` text NOT NULL,
	`question_type` enum('text','textarea','number','date','select','checkbox','radio') DEFAULT 'text',
	`required` boolean DEFAULT true,
	`order` int NOT NULL,
	`options` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `protocol_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `protocol_sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`protocol_id` int NOT NULL,
	`section_name` varchar(100) NOT NULL,
	`section_order` int NOT NULL,
	`content` json,
	`completed_at` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `protocol_sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `protocol_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cfp_resolution_number` varchar(20) NOT NULL,
	`cfp_resolution_year` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`effective_date` timestamp NOT NULL,
	`status` enum('active','archived','deprecated') DEFAULT 'active',
	`content` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `protocol_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `psychotherapy_protocols` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patient_id` int NOT NULL,
	`user_id` int NOT NULL,
	`protocol_version_id` int NOT NULL,
	`status` enum('draft','active','completed','archived') DEFAULT 'draft',
	`start_date` timestamp NOT NULL,
	`end_date` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `psychotherapy_protocols_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `protocol_answers` ADD CONSTRAINT `protocol_answers_protocol_id_psychotherapy_protocols_id_fk` FOREIGN KEY (`protocol_id`) REFERENCES `psychotherapy_protocols`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `protocol_answers` ADD CONSTRAINT `protocol_answers_question_id_protocol_questions_id_fk` FOREIGN KEY (`question_id`) REFERENCES `protocol_questions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `protocol_exports` ADD CONSTRAINT `protocol_exports_protocol_id_psychotherapy_protocols_id_fk` FOREIGN KEY (`protocol_id`) REFERENCES `psychotherapy_protocols`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `protocol_questions` ADD CONSTRAINT `protocol_questions_section_id_protocol_sections_id_fk` FOREIGN KEY (`section_id`) REFERENCES `protocol_sections`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `protocol_sections` ADD CONSTRAINT `protocol_sections_protocol_id_psychotherapy_protocols_id_fk` FOREIGN KEY (`protocol_id`) REFERENCES `psychotherapy_protocols`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `psychotherapy_protocols` ADD CONSTRAINT `psychotherapy_protocols_patient_id_patients_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `psychotherapy_protocols` ADD CONSTRAINT `psychotherapy_protocols_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `psychotherapy_protocols` ADD CONSTRAINT `psychotherapy_protocols_protocol_version_id_protocol_versions_id_fk` FOREIGN KEY (`protocol_version_id`) REFERENCES `protocol_versions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `pa_protocol_idx` ON `protocol_answers` (`protocol_id`);--> statement-breakpoint
CREATE INDEX `pa_question_idx` ON `protocol_answers` (`question_id`);--> statement-breakpoint
CREATE INDEX `pe_protocol_idx` ON `protocol_exports` (`protocol_id`);--> statement-breakpoint
CREATE INDEX `pq_section_idx` ON `protocol_questions` (`section_id`);--> statement-breakpoint
CREATE INDEX `ps_protocol_idx` ON `protocol_sections` (`protocol_id`);--> statement-breakpoint
CREATE INDEX `pv_resolution_idx` ON `protocol_versions` (`cfp_resolution_number`);--> statement-breakpoint
CREATE INDEX `pv_status_idx` ON `protocol_versions` (`status`);--> statement-breakpoint
CREATE INDEX `pp_patient_idx` ON `psychotherapy_protocols` (`patient_id`);--> statement-breakpoint
CREATE INDEX `pp_user_idx` ON `psychotherapy_protocols` (`user_id`);--> statement-breakpoint
CREATE INDEX `pp_status_idx` ON `psychotherapy_protocols` (`status`);