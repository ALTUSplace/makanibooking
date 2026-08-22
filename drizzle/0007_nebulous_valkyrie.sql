CREATE TABLE `disputes` (
	`dispute_id` int AUTO_INCREMENT NOT NULL,
	`booking_id` int NOT NULL,
	`opened_by` int NOT NULL,
	`type` varchar(120) NOT NULL,
	`description` text NOT NULL,
	`status` enum('Open','UnderReview','Resolved','Rejected') NOT NULL DEFAULT 'Open',
	`resolution_note` text,
	`reviewed_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `disputes_dispute_id` PRIMARY KEY(`dispute_id`)
);
