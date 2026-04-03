ALTER TABLE `appointments` ADD `appointment_type` enum('first','return','routine','evaluation','follow_up','emergency') DEFAULT 'routine';--> statement-breakpoint
ALTER TABLE `appointments` ADD `modality` enum('online','presential','hybrid') DEFAULT 'presential';--> statement-breakpoint
ALTER TABLE `appointments` ADD `observations` text;