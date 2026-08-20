import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: mysqlEnum("role", ["renter", "owner", "admin", "user"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const listings = mysqlTable("listings", {
  id: int("listing_id").autoincrement().primaryKey(),
  ownerId: int("owner_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: varchar("category", { length: 64 }).notNull(), // car أو real_estate
  pricePerDay: int("price_per_day").notNull(),
  imageUrl: text("image_url"),
  status: mysqlEnum("status", ["Pending", "Approved", "Available", "Rented", "Rejected"]).default("Pending").notNull(),
  city: varchar("city", { length: 64 }).default("الدار البيضاء").notNull(),
  fuelType: varchar("fuel_type", { length: 32 }).default("ديزل"),
  transmission: varchar("transmission", { length: 32 }).default("أوتوماتيك"),
  rooms: int("rooms").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const bookings = mysqlTable("bookings", {
  id: int("booking_id").autoincrement().primaryKey(),
  renterId: int("renter_id").notNull(),
  listingId: int("listing_id").notNull(),
  secondaryListingId: int("secondary_listing_id"), // للباقات المدمجة (عقاب + سيارة)
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalPrice: int("total_price").notNull(),
  commissionFee: int("commission_fee").notNull(), // 10% عمولة المنصة
  netProfit: int("net_profit").notNull(), // صافي ربح الشريك
  status: mysqlEnum("status", ["Pending", "Confirmed", "Cancelled"]).default("Pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const reviews = mysqlTable("reviews", {
  id: int("review_id").autoincrement().primaryKey(),
  bookingId: int("booking_id").notNull(),
  listingId: int("listing_id").notNull(),
  userId: int("user_id").notNull(),
  rating: int("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = typeof listings.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
