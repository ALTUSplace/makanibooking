CREATE TABLE `notifications` (
	`notification_id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`type` enum('booking_new','booking_accepted','booking_rejected','lease_expiring','system') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`href` varchar(512),
	`entity_type` varchar(64),
	`entity_id` int,
	`read_at` timestamp,
	`email_status` enum('not_sent','sent','skipped','failed') NOT NULL DEFAULT 'not_sent',
	`email_sent_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_notification_id` PRIMARY KEY(`notification_id`)
);
--> statement-breakpoint
ALTER TABLE `commercial_lease_contracts` ADD `lease_end_reminder_task_uid` varchar(65);--> statement-breakpoint
CREATE INDEX `notifications_user_created_idx` ON `notifications` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `notifications_user_unread_idx` ON `notifications` (`user_id`,`read_at`);