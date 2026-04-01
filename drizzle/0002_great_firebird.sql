ALTER TABLE `patients` ADD `address_street` varchar(255);--> statement-breakpoint
ALTER TABLE `patients` ADD `address_number` varchar(20);--> statement-breakpoint
ALTER TABLE `patients` ADD `address_complement` varchar(255);--> statement-breakpoint
ALTER TABLE `patients` ADD `address_city` varchar(100);--> statement-breakpoint
ALTER TABLE `patients` ADD `address_state` varchar(2);--> statement-breakpoint
ALTER TABLE `patients` ADD `address_zip` varchar(10);--> statement-breakpoint
ALTER TABLE `patients` ADD `cpf` varchar(14);--> statement-breakpoint
ALTER TABLE `patients` ADD `rg` varchar(20);--> statement-breakpoint
ALTER TABLE `patients` ADD `marital_status` enum('single','married','divorced','widowed','other');--> statement-breakpoint
ALTER TABLE `patients` ADD `children` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `patients` ADD `education_level` enum('elementary','high_school','college','postgraduate','other');--> statement-breakpoint
ALTER TABLE `patients` ADD `income` enum('< 1000','1000-2000','2000-5000','5000-10000','> 10000');--> statement-breakpoint
ALTER TABLE `patients` ADD `attendance_type` enum('presencial','online','hibrido') DEFAULT 'presencial';--> statement-breakpoint
ALTER TABLE `patients` ADD `payment_type` enum('particular','plano_saude','convenio','gratuito') DEFAULT 'particular';--> statement-breakpoint
ALTER TABLE `patients` ADD `health_plan` varchar(100);--> statement-breakpoint
ALTER TABLE `patients` ADD `health_plan_number` varchar(50);--> statement-breakpoint
ALTER TABLE `patients` ADD `medical_history` text;--> statement-breakpoint
ALTER TABLE `patients` ADD `medications` json;--> statement-breakpoint
ALTER TABLE `patients` ADD `allergies` json;--> statement-breakpoint
ALTER TABLE `patients` ADD `previous_therapies` json;--> statement-breakpoint
ALTER TABLE `patients` ADD `psychiatric_history` text;--> statement-breakpoint
ALTER TABLE `patients` ADD `family_history` text;--> statement-breakpoint
ALTER TABLE `patients` ADD `social_history` text;--> statement-breakpoint
ALTER TABLE `patients` ADD `substance_use` json;--> statement-breakpoint
ALTER TABLE `patients` ADD `suicide_risk` enum('low','moderate','high','unknown') DEFAULT 'unknown';