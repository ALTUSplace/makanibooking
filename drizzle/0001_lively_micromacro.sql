CREATE TABLE `invoices` (
	`invoice_id` int AUTO_INCREMENT NOT NULL,
	`invoice_number` varchar(80) NOT NULL,
	`booking_id` int NOT NULL,
	`payment_id` int NOT NULL,
	`payer_id` int NOT NULL,
	`subtotal` int NOT NULL,
	`commission_fee` int NOT NULL,
	`vat_rate_basis_points` int NOT NULL DEFAULT 2000,
	`vat_amount` int NOT NULL,
	`total` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'MAD',
	`status` enum('Pending','Issued') NOT NULL DEFAULT 'Issued',
	`issued_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoices_invoice_id` PRIMARY KEY(`invoice_id`),
	CONSTRAINT `invoices_invoice_number_unique` UNIQUE(`invoice_number`)
);
--> statement-breakpoint
CREATE TABLE `kyc_submissions` (
	`kyc_id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`applicant_role` enum('renter','owner','company') NOT NULL DEFAULT 'renter',
	`document_type` enum('cni','commercial_register') NOT NULL,
	`document_key` varchar(512) NOT NULL,
	`original_file_name` varchar(255) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`status` enum('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
	`rejection_reason` text,
	`submitted_at` timestamp NOT NULL DEFAULT (now()),
	`reviewed_at` timestamp,
	CONSTRAINT `kyc_submissions_kyc_id` PRIMARY KEY(`kyc_id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`payment_id` int AUTO_INCREMENT NOT NULL,
	`booking_id` int NOT NULL,
	`payer_id` int NOT NULL,
	`method` enum('cmi_card','bank_transfer') NOT NULL,
	`status` enum('Pending','Succeeded','Failed') NOT NULL DEFAULT 'Pending',
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'MAD',
	`provider_reference` varchar(120) NOT NULL,
	`simulated` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_payment_id` PRIMARY KEY(`payment_id`)
);
