CREATE TABLE `listing_analytics_events` (
	`event_id` int AUTO_INCREMENT NOT NULL,
	`listing_id` int NOT NULL,
	`event_type` enum('view','whatsapp_click','contact_click') NOT NULL,
	`visitor_key` varchar(128),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `listing_analytics_events_event_id` PRIMARY KEY(`event_id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `agency_latitude` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `agency_longitude` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `agency_hours` text;--> statement-breakpoint
CREATE INDEX `listing_analytics_listing_event_idx` ON `listing_analytics_events` (`listing_id`,`event_type`);--> statement-breakpoint
CREATE INDEX `listing_analytics_listing_created_idx` ON `listing_analytics_events` (`listing_id`,`created_at`);