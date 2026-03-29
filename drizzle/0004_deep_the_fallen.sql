CREATE TABLE `agentActionLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`actionType` enum('post_created','post_published','post_edited','instagram_sync','analytics_generated','content_idea_generated','caption_optimized','appointment_created','appointment_published','patient_interaction','message_sent','document_uploaded','assessment_completed','ai_suggestion_applied','optimization_executed') NOT NULL,
	`description` text,
	`actionData` json,
	`success` boolean NOT NULL DEFAULT true,
	`errorMessage` text,
	`resultMetrics` json,
	`userFeedback` enum('positive','neutral','negative'),
	`feedbackNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agentActionLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiLearningModel` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`modelVersion` varchar(32) NOT NULL,
	`modelName` varchar(255) NOT NULL,
	`trainingDataSize` int NOT NULL DEFAULT 0,
	`trainingDataSources` json,
	`accuracy` decimal(5,2) DEFAULT '0.00',
	`precision` decimal(5,2) DEFAULT '0.00',
	`recall` decimal(5,2) DEFAULT '0.00',
	`f1Score` decimal(5,2) DEFAULT '0.00',
	`engagementImprovement` decimal(8,2) DEFAULT '0.00',
	`conversionImprovement` decimal(8,2) DEFAULT '0.00',
	`description` text,
	`changes` json,
	`isActive` boolean NOT NULL DEFAULT false,
	`deployedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiLearningModel_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `continuousImprovementPlan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`objective` varchar(255) NOT NULL,
	`description` text,
	`targetMetric` varchar(128) NOT NULL,
	`currentValue` decimal(10,2) DEFAULT '0.00',
	`targetValue` decimal(10,2) DEFAULT '0.00',
	`plannedActions` json,
	`startDate` date NOT NULL,
	`targetDate` date NOT NULL,
	`improvementStatus` enum('planning','in_progress','completed','paused') NOT NULL DEFAULT 'planning',
	`progressPercentage` int NOT NULL DEFAULT 0,
	`actualValue` decimal(10,2),
	`achieved` boolean,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `continuousImprovementPlan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `githubSyncLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`commitHash` varchar(40) NOT NULL,
	`commitMessage` text NOT NULL,
	`filesChanged` int NOT NULL DEFAULT 0,
	`insertions` int NOT NULL DEFAULT 0,
	`deletions` int NOT NULL DEFAULT 0,
	`changesSummary` json,
	`triggerReason` enum('optimization_applied','learning_discovered','model_updated','daily_snapshot','manual_commit','bug_fix','feature_added') NOT NULL,
	`branchName` varchar(255) NOT NULL DEFAULT 'main',
	`author` varchar(255),
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `githubSyncLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learningInsights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`insightType` enum('best_posting_time','best_content_type','high_engagement_pattern','low_engagement_pattern','conversion_driver','audience_preference','seasonal_trend','optimization_opportunity','risk_pattern','success_factor') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`supportingData` json,
	`confidence` int NOT NULL DEFAULT 0,
	`recommendations` json,
	`expectedImpact` varchar(128),
	`isActive` boolean NOT NULL DEFAULT true,
	`appliedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learningInsights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `optimizationHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`optimizationType` enum('posting_time_adjustment','caption_rewrite','hashtag_optimization','content_format_change','audience_targeting_adjustment','engagement_strategy_change','frequency_adjustment','ai_model_tuning') NOT NULL,
	`description` text,
	`changeDetails` json,
	`metricsBeforeOptimization` json,
	`metricsAfterOptimization` json,
	`impactPercentage` decimal(8,2) DEFAULT '0.00',
	`isSuccessful` boolean NOT NULL DEFAULT false,
	`userApproval` boolean,
	`notes` text,
	`appliedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `optimizationHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performanceMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`metricsPeriod` enum('hourly','daily','weekly','monthly') NOT NULL,
	`periodDate` date NOT NULL,
	`totalActionsExecuted` int NOT NULL DEFAULT 0,
	`successfulActions` int NOT NULL DEFAULT 0,
	`failedActions` int NOT NULL DEFAULT 0,
	`successRate` decimal(5,2) DEFAULT '0.00',
	`totalEngagement` int NOT NULL DEFAULT 0,
	`totalReach` int NOT NULL DEFAULT 0,
	`avgEngagementPerAction` decimal(10,2) DEFAULT '0.00',
	`totalConversions` int NOT NULL DEFAULT 0,
	`conversionRate` decimal(5,2) DEFAULT '0.00',
	`positiveActions` int NOT NULL DEFAULT 0,
	`negativeActions` int NOT NULL DEFAULT 0,
	`satisfactionScore` decimal(5,2) DEFAULT '0.00',
	`avgExecutionTime` int NOT NULL DEFAULT 0,
	`resourceUsage` decimal(5,2) DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `performanceMetrics_id` PRIMARY KEY(`id`)
);
