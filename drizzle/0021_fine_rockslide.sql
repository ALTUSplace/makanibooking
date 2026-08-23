ALTER TABLE `notifications` ADD `dedupe_key` varchar(191);--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_dedupe_idx` UNIQUE(`user_id`,`dedupe_key`);