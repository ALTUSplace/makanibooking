import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar, index } from "drizzle-orm/mysql-core";

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
  officeType: varchar("office_type", { length: 64 }),
  rentalPeriod: mysqlEnum("rental_period", ["daily", "monthly", "yearly"]),
  amenities: text("amenities"),
  availability: text("availability"), // JSON array of blocked date ranges managed by the owner
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

export const kycSubmissions = mysqlTable("kyc_submissions", {
  id: int("kyc_id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  applicantRole: mysqlEnum("applicant_role", ["renter", "owner", "company"]).default("renter").notNull(),
  documentType: mysqlEnum("document_type", ["cni", "commercial_register"]).notNull(),
  documentKey: varchar("document_key", { length: 512 }).notNull(),
  originalFileName: varchar("original_file_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["Pending", "Approved", "Rejected"]).default("Pending").notNull(),
  rejectionReason: text("rejection_reason"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

export const payments = mysqlTable("payments", {
  id: int("payment_id").autoincrement().primaryKey(),
  bookingId: int("booking_id").notNull(),
  payerId: int("payer_id").notNull(),
  method: mysqlEnum("method", ["cmi_card", "bank_transfer"]).notNull(),
  status: mysqlEnum("status", ["Pending", "Succeeded", "Failed"]).default("Pending").notNull(),
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("MAD").notNull(),
  providerReference: varchar("provider_reference", { length: 120 }).notNull(),
  simulated: boolean("simulated").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commercialLeaseContracts = mysqlTable("commercial_lease_contracts", {
  id: int("contract_id").autoincrement().primaryKey(),
  bookingId: int("booking_id").notNull().unique(),
  landlordId: int("landlord_id").notNull(),
  tenantId: int("tenant_id").notNull(),
  reference: varchar("reference", { length: 80 }).notNull().unique(),
  leaseType: mysqlEnum("lease_type", ["commercial", "professional"]).notNull(),
  landlordName: varchar("landlord_name", { length: 255 }).notNull(),
  tenantName: varchar("tenant_name", { length: 255 }).notNull(),
  premises: text("premises").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  monthlyRent: int("monthly_rent").notNull(),
  deposit: int("deposit").default(0).notNull(),
  pdfKey: varchar("pdf_key", { length: 512 }),
  status: mysqlEnum("status", ["Draft", "Generated", "Signed"]).default("Generated").notNull(),
  legalNotice: text("legal_notice").notNull(),
  leaseEndReminderTaskUid: varchar("lease_end_reminder_task_uid", { length: 65 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: int("notification_id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  type: mysqlEnum("type", ["booking_new", "booking_accepted", "booking_rejected", "lease_expiring", "system"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  href: varchar("href", { length: 512 }),
  entityType: varchar("entity_type", { length: 64 }),
  entityId: int("entity_id"),
  readAt: timestamp("read_at"),
  emailStatus: mysqlEnum("email_status", ["not_sent", "sent", "skipped", "failed"]).default("not_sent").notNull(),
  emailSentAt: timestamp("email_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userCreatedIdx: index("notifications_user_created_idx").on(table.userId, table.createdAt),
  userUnreadIdx: index("notifications_user_unread_idx").on(table.userId, table.readAt),
}));

export const platformSettings = mysqlTable("platform_settings", {
  id: int("setting_id").autoincrement().primaryKey(),
  commissionRateBasisPoints: int("commission_rate_basis_points").default(1000).notNull(),
  vatRateBasisPoints: int("vat_rate_basis_points").default(2000).notNull(),
  updatedBy: int("updated_by"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const payoutRequests = mysqlTable("payout_requests", {
  id: int("payout_id").autoincrement().primaryKey(),
  ownerId: int("owner_id").notNull(),
  amount: int("amount").notNull(),
  method: mysqlEnum("method", ["bank_transfer", "cash_plus", "wafacash"]).notNull(),
  status: mysqlEnum("status", ["Pending", "Approved", "Paid", "Rejected"]).default("Pending").notNull(),
  reference: varchar("reference", { length: 120 }),
  adminNote: text("admin_note"),
  reviewedBy: int("reviewed_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

export const invoices = mysqlTable("invoices", {
  id: int("invoice_id").autoincrement().primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 80 }).notNull().unique(),
  bookingId: int("booking_id").notNull(),
  paymentId: int("payment_id").notNull(),
  payerId: int("payer_id").notNull(),
  subtotal: int("subtotal").notNull(),
  commissionFee: int("commission_fee").notNull(),
  vatRateBasisPoints: int("vat_rate_basis_points").default(2000).notNull(),
  vatAmount: int("vat_amount").notNull(),
  total: int("total").notNull(),
  currency: varchar("currency", { length: 3 }).default("MAD").notNull(),
  status: mysqlEnum("status", ["Pending", "Issued"]).default("Issued").notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = typeof listings.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
export type KycSubmission = typeof kycSubmissions.$inferSelect;
export type InsertKycSubmission = typeof kycSubmissions.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertPlatformSetting = typeof platformSettings.$inferInsert;
export type PayoutRequest = typeof payoutRequests.$inferSelect;
export type InsertPayoutRequest = typeof payoutRequests.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
export type CommercialLeaseContract = typeof commercialLeaseContracts.$inferSelect;
export type InsertCommercialLeaseContract = typeof commercialLeaseContracts.$inferInsert;
