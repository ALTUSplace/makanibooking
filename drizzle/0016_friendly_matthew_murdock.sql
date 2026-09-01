CREATE TABLE `audit_logs` (
	`audit_log_id` int AUTO_INCREMENT NOT NULL,
	`actor_id` int NOT NULL,
	`action` varchar(120) NOT NULL,
	`entity_type` varchar(80) NOT NULL,
	`entity_id` int,
	`before_data` text,
	`after_data` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_audit_log_id` PRIMARY KEY(`audit_log_id`)
);
--> statement-breakpoint
CREATE TABLE `booking_messages` (
	`message_id` int AUTO_INCREMENT NOT NULL,
	`booking_id` int NOT NULL,
	`sender_id` int NOT NULL,
	`recipient_id` int NOT NULL,
	`body` text NOT NULL,
	`read_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `booking_messages_message_id` PRIMARY KEY(`message_id`)
);
--> statement-breakpoint
CREATE TABLE `refund_requests` (
	`refund_request_id` int AUTO_INCREMENT NOT NULL,
	`booking_id` int NOT NULL,
	`requested_by` int NOT NULL,
	`amount` int NOT NULL,
	`reason` text NOT NULL,
	`status` enum('Pending','Approved','Rejected','Paid') NOT NULL DEFAULT 'Pending',
	`admin_note` text,
	`reviewed_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`reviewed_at` timestamp,
	CONSTRAINT `refund_requests_refund_request_id` PRIMARY KEY(`refund_request_id`)
);
--> statement-breakpoint
CREATE INDEX `audit_logs_entity_idx` ON `audit_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_actor_created_idx` ON `audit_logs` (`actor_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `booking_messages_booking_created_idx` ON `booking_messages` (`booking_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `booking_messages_recipient_unread_idx` ON `booking_messages` (`recipient_id`,`read_at`);--> statement-breakpoint
CREATE INDEX `refund_requests_booking_idx` ON `refund_requests` (`booking_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `refund_requests_requester_idx` ON `refund_requests` (`requested_by`,`status`);