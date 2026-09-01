CREATE TABLE `booking_vouchers` (
	`voucher_id` int AUTO_INCREMENT NOT NULL,
	`booking_id` int NOT NULL,
	`renter_id` int NOT NULL,
	`code` varchar(80) NOT NULL,
	`qr_payload` text NOT NULL,
	`status` enum('Issued','Revoked') NOT NULL DEFAULT 'Issued',
	`issued_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `booking_vouchers_voucher_id` PRIMARY KEY(`voucher_id`),
	CONSTRAINT `booking_vouchers_booking_id_unique` UNIQUE(`booking_id`),
	CONSTRAINT `booking_vouchers_code_unique` UNIQUE(`code`)
);
