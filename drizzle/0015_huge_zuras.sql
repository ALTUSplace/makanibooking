ALTER TABLE `bookings` ADD `cancellation_policy_version` varchar(80);--> statement-breakpoint
ALTER TABLE `bookings` ADD `cancellation_policy_snapshot` text;--> statement-breakpoint
ALTER TABLE `bookings` ADD `cancellation_policy_fingerprint` varchar(80);--> statement-breakpoint
ALTER TABLE `bookings` ADD `cancellation_policy_accepted_at` timestamp;--> statement-breakpoint
ALTER TABLE `bookings` ADD `cancellation_policy_accepted_by` int;--> statement-breakpoint
ALTER TABLE `invoices` ADD `cancellation_policy_version` varchar(80);--> statement-breakpoint
ALTER TABLE `invoices` ADD `cancellation_policy_snapshot` text;--> statement-breakpoint
ALTER TABLE `invoices` ADD `cancellation_policy_fingerprint` varchar(80);--> statement-breakpoint
ALTER TABLE `invoices` ADD `cancellation_policy_accepted_at` timestamp;--> statement-breakpoint
ALTER TABLE `invoices` ADD `cancellation_policy_accepted_by` int;