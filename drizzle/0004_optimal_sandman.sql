ALTER TABLE `session_notes` ADD `approach_type` enum('cognitiva','comportamental','psicodramática','humanista','psicodinâmica','mista','outro') DEFAULT 'mista';--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `consultation_app`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `consultation_origin`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `current_consultation_price`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `payment_status`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `payment_method`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `last_payment_date`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `last_payment_amount`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `total_received`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `total_pending`;