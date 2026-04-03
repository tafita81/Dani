DROP TABLE `delinquency`;--> statement-breakpoint
DROP TABLE `financial_transactions`;--> statement-breakpoint
DROP TABLE `price_history`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `address_street`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `address_number`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `address_complement`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `address_city`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `address_state`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `address_zip`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `cpf`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `rg`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `marital_status`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `children`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `education_level`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `income`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `attendance_type`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `payment_type`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `health_plan`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `health_plan_number`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `medical_history`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `medications`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `allergies`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `previous_therapies`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `psychiatric_history`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `family_history`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `social_history`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `substance_use`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `suicide_risk`;--> statement-breakpoint
ALTER TABLE `session_notes` DROP COLUMN `approach_type`;