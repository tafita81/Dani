ALTER TABLE `session_notes` ADD COLUMN `approach_type` ENUM('cognitiva', 'comportamental', 'psicodramática', 'humanista', 'psicodinâmica', 'mista', 'outro') DEFAULT 'mista';
