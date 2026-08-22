ALTER TABLE `listings` ADD `office_type` varchar(64);--> statement-breakpoint
ALTER TABLE `listings` ADD `rental_period` enum('daily','monthly','yearly');--> statement-breakpoint
ALTER TABLE `listings` ADD `amenities` text;