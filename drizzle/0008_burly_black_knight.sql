CREATE TABLE `dispute_attachments` (
	`attachment_id` int AUTO_INCREMENT NOT NULL,
	`dispute_id` int NOT NULL,
	`file_key` varchar(512) NOT NULL,
	`original_file_name` varchar(255) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`file_size` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dispute_attachments_attachment_id` PRIMARY KEY(`attachment_id`)
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`ticket_id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`subject` varchar(255) NOT NULL,
	`category` varchar(120) NOT NULL,
	`description` text NOT NULL,
	`status` enum('Open','InProgress','Resolved') NOT NULL DEFAULT 'Open',
	`last_response` text,
	`responded_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `support_tickets_ticket_id` PRIMARY KEY(`ticket_id`)
);
