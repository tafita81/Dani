CREATE TABLE `delinquency` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patient_id` int NOT NULL,
	`user_id` int NOT NULL,
	`total_delinquent` float NOT NULL,
	`days_overdue` int DEFAULT 0,
	`status` enum('ativo','pago','parcial','cancelado') DEFAULT 'ativo',
	`last_notification_date` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `delinquency_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patient_id` int NOT NULL,
	`user_id` int NOT NULL,
	`session_id` int,
	`appointment_id` int,
	`type` enum('consulta','reembolso','ajuste','desconto','taxa') NOT NULL,
	`amount` float NOT NULL,
	`status` enum('pago','pendente','cancelado','reembolsado') DEFAULT 'pendente',
	`payment_method` enum('dinheiro','cartao_credito','cartao_debito','pix','transferencia','outro'),
	`payment_date` timestamp,
	`due_date` timestamp,
	`notes` text,
	`receipt_url` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financial_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patient_id` int NOT NULL,
	`user_id` int NOT NULL,
	`old_price` float,
	`new_price` float NOT NULL,
	`reason` text,
	`changed_at` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `price_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `patients` ADD `consultation_app` enum('telemedicina','zoom','whatsapp','presencial','outro');--> statement-breakpoint
ALTER TABLE `patients` ADD `consultation_origin` enum('particular','plano_saude','convenio','app_telemedicina','outro') DEFAULT 'particular';--> statement-breakpoint
ALTER TABLE `patients` ADD `current_consultation_price` float;--> statement-breakpoint
ALTER TABLE `patients` ADD `payment_status` enum('pago','pendente','inadimplente','cancelado') DEFAULT 'pendente';--> statement-breakpoint
ALTER TABLE `patients` ADD `payment_method` enum('dinheiro','cartao_credito','cartao_debito','pix','transferencia','outro');--> statement-breakpoint
ALTER TABLE `patients` ADD `last_payment_date` timestamp;--> statement-breakpoint
ALTER TABLE `patients` ADD `last_payment_amount` float;--> statement-breakpoint
ALTER TABLE `patients` ADD `total_received` float DEFAULT 0;--> statement-breakpoint
ALTER TABLE `patients` ADD `total_pending` float DEFAULT 0;--> statement-breakpoint
ALTER TABLE `delinquency` ADD CONSTRAINT `delinquency_patient_id_patients_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `delinquency` ADD CONSTRAINT `delinquency_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `financial_transactions` ADD CONSTRAINT `financial_transactions_patient_id_patients_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `financial_transactions` ADD CONSTRAINT `financial_transactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `financial_transactions` ADD CONSTRAINT `financial_transactions_session_id_session_notes_id_fk` FOREIGN KEY (`session_id`) REFERENCES `session_notes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `financial_transactions` ADD CONSTRAINT `financial_transactions_appointment_id_appointments_id_fk` FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `price_history` ADD CONSTRAINT `price_history_patient_id_patients_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `price_history` ADD CONSTRAINT `price_history_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `del_patient_idx` ON `delinquency` (`patient_id`);--> statement-breakpoint
CREATE INDEX `del_user_idx` ON `delinquency` (`user_id`);--> statement-breakpoint
CREATE INDEX `del_status_idx` ON `delinquency` (`status`);--> statement-breakpoint
CREATE INDEX `ft_patient_idx` ON `financial_transactions` (`patient_id`);--> statement-breakpoint
CREATE INDEX `ft_user_idx` ON `financial_transactions` (`user_id`);--> statement-breakpoint
CREATE INDEX `ft_status_idx` ON `financial_transactions` (`status`);--> statement-breakpoint
CREATE INDEX `ft_type_idx` ON `financial_transactions` (`type`);--> statement-breakpoint
CREATE INDEX `ph_patient_idx` ON `price_history` (`patient_id`);--> statement-breakpoint
CREATE INDEX `ph_user_idx` ON `price_history` (`user_id`);