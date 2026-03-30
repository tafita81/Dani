CREATE TABLE `carSessionRecordings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`patientId` int,
	`sessionStartTime` timestamp NOT NULL,
	`sessionEndTime` timestamp,
	`durationSeconds` int,
	`audioUrl` text,
	`transcription` text,
	`aiAnalysis` json,
	`suggestions` json,
	`voiceFeedbackGiven` boolean DEFAULT false,
	`vibrationFeedback` boolean DEFAULT false,
	`isActive` boolean DEFAULT false,
	`carSessionStatus` enum('active','paused','completed','cancelled') NOT NULL DEFAULT 'completed',
	`siriActivated` boolean DEFAULT false,
	`siriCommand` varchar(255),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`deviceType` varchar(64),
	`browserAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `carSessionRecordings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `carSessionTranscripts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`carSessionId` int NOT NULL,
	`phrase` text NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`confidence` decimal(3,2),
	`sentiment` enum('positive','neutral','negative'),
	`emotion` varchar(64),
	`keywords` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `carSessionTranscripts_id` PRIMARY KEY(`id`)
);
