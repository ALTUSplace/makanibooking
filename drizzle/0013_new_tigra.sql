ALTER TABLE `listings` ADD `ical_import_url` text;--> statement-breakpoint
ALTER TABLE `listings` ADD `ical_export_token` varchar(96);--> statement-breakpoint
ALTER TABLE `listings` ADD `ical_imported_ranges` text;--> statement-breakpoint
ALTER TABLE `listings` ADD `ical_last_synced_at` timestamp;--> statement-breakpoint
ALTER TABLE `listings` ADD `ical_sync_status` enum('never','ok','error') DEFAULT 'never' NOT NULL;--> statement-breakpoint
ALTER TABLE `listings` ADD `ical_sync_error` varchar(500);--> statement-breakpoint
ALTER TABLE `listings` ADD CONSTRAINT `listings_ical_export_token_unique` UNIQUE(`ical_export_token`);