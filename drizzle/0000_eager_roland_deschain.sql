CREATE TABLE `bookings` (
	`booking_id` int AUTO_INCREMENT NOT NULL,
	`renter_id` int NOT NULL,
	`listing_id` int NOT NULL,
	`secondary_listing_id` int,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	`total_price` int NOT NULL,
	`commission_fee` int NOT NULL,
	`net_profit` int NOT NULL,
	`status` enum('Pending','Confirmed','Cancelled') NOT NULL DEFAULT 'Pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookings_booking_id` PRIMARY KEY(`booking_id`)
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`listing_id` int AUTO_INCREMENT NOT NULL,
	`owner_id` int NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` varchar(64) NOT NULL,
	`price_per_day` int NOT NULL,
	`image_url` text,
	`status` enum('Pending','Approved','Available','Rented','Rejected') NOT NULL DEFAULT 'Pending',
	`city` varchar(64) NOT NULL DEFAULT 'الدار البيضاء',
	`fuel_type` varchar(32) DEFAULT 'ديزل',
	`transmission` varchar(32) DEFAULT 'أوتوماتيك',
	`rooms` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `listings_listing_id` PRIMARY KEY(`listing_id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`review_id` int AUTO_INCREMENT NOT NULL,
	`booking_id` int NOT NULL,
	`listing_id` int NOT NULL,
	`user_id` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_review_id` PRIMARY KEY(`review_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`passwordHash` varchar(255),
	`role` enum('renter','owner','admin','user') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
