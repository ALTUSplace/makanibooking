CREATE TABLE `payout_requests` (
	`payout_id` int AUTO_INCREMENT NOT NULL,
	`owner_id` int NOT NULL,
	`amount` int NOT NULL,
	`method` enum('bank_transfer','cash_plus','wafacash') NOT NULL,
	`status` enum('Pending','Approved','Paid','Rejected') NOT NULL DEFAULT 'Pending',
	`reference` varchar(120),
	`admin_note` text,
	`reviewed_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`reviewed_at` timestamp,
	CONSTRAINT `payout_requests_payout_id` PRIMARY KEY(`payout_id`)
);
--> statement-breakpoint
CREATE TABLE `platform_settings` (
	`setting_id` int AUTO_INCREMENT NOT NULL,
	`commission_rate_basis_points` int NOT NULL DEFAULT 1000,
	`vat_rate_basis_points` int NOT NULL DEFAULT 2000,
	`updated_by` int,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platform_settings_setting_id` PRIMARY KEY(`setting_id`)
);
