// Generated from drizzle/schema.ts for the opt-in Supabase PostgreSQL adapter.
// Enums remain text columns because supabase/migrations/0001_b2rent_schema.sql
// enforces the allowed values with CHECK constraints. Do not edit manually.
import { boolean, integer, pgSchema, text, timestamp, varchar, index, uniqueIndex } from "drizzle-orm/pg-core";

const b2rent = pgSchema("b2rent");

export const users = b2rent.table("users", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  whatsappPhone: varchar("whatsapp_phone", { length: 32 }),
  commercialRegister: varchar("commercial_register", { length: 120 }),
  agencyName: varchar("agency_name", { length: 180 }),
  agencyLogoUrl: text("agency_logo_url"),
  agencyPhone: varchar("agency_phone", { length: 32 }),
  agencyEmail: varchar("agency_email", { length: 320 }),
  agencyAddress: varchar("agency_address", { length: 255 }),
  agencyWebsite: varchar("agency_website", { length: 255 }),
  agencyLatitude: varchar("agency_latitude", { length: 32 }),
  agencyLongitude: varchar("agency_longitude", { length: 32 }),
  agencyHours: text("agency_hours"),
  loginMethod: varchar("login_method", { length: 64 }),
  passwordHash: varchar("password_hash", { length: 255 }),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
  legalConsentVersion: varchar("legal_consent_version", { length: 80 }),
  legalConsentAt: timestamp("legal_consent_at"),
});

export const listings = b2rent.table("listings", {
  id: integer("listing_id").generatedAlwaysAsIdentity().primaryKey(),
  ownerId: integer("owner_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: varchar("category", { length: 64 }).notNull(), // car أو real_estate
  pricePerDay: integer("price_per_day").notNull(),
  imageUrl: text("image_url"),
  status: text("status").default("Published").notNull(),
  city: varchar("city", { length: 64 }).default("الدار البيضاء").notNull(),
  fuelType: varchar("fuel_type", { length: 32 }).default("ديزل"),
  transmission: varchar("transmission", { length: 32 }).default("أوتوماتيك"),
  rooms: integer("rooms").default(0),
  officeType: varchar("office_type", { length: 64 }),
  rentalPeriod: text("rental_period"),
  amenities: text("amenities"),
  availability: text("availability"), // JSON array of blocked date ranges managed by the owner
  icalImportUrl: text("ical_import_url"), // private external calendar URL, never returned by public listing queries
  icalExportToken: varchar("ical_export_token", { length: 96 }).unique(),
  icalImportedRanges: text("ical_imported_ranges"), // JSON array of normalized external blocked ranges
  icalLastSyncedAt: timestamp("ical_last_synced_at"),
  icalSyncStatus: text("ical_sync_status").default("never").notNull(),
  icalSyncError: varchar("ical_sync_error", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const listingAnalyticsEvents = b2rent.table("listing_analytics_events", {
  id: integer("event_id").generatedAlwaysAsIdentity().primaryKey(),
  listingId: integer("listing_id").notNull(),
  eventType: text("event_type").notNull(),
  visitorKey: varchar("visitor_key", { length: 128 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  listingEventIdx: index("listing_analytics_listing_event_idx").on(table.listingId, table.eventType),
  listingCreatedIdx: index("listing_analytics_listing_created_idx").on(table.listingId, table.createdAt),
}));

export const bookings = b2rent.table("bookings", {
  id: integer("booking_id").generatedAlwaysAsIdentity().primaryKey(),
  renterId: integer("renter_id").notNull(),
  listingId: integer("listing_id").notNull(),
  secondaryListingId: integer("secondary_listing_id"), // للباقات المدمجة (عقاب + سيارة)
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalPrice: integer("total_price").notNull(),
  commissionFee: integer("commission_fee").notNull(), // 10% عمولة المنصة
  netProfit: integer("net_profit").notNull(), // صافي ربح الشريك
  status: text("status").default("Pending").notNull(),
  cancellationPolicyVersion: varchar("cancellation_policy_version", { length: 80 }),
  cancellationPolicySnapshot: text("cancellation_policy_snapshot"),
  cancellationPolicyFingerprint: varchar("cancellation_policy_fingerprint", { length: 80 }),
  cancellationPolicyAcceptedAt: timestamp("cancellation_policy_accepted_at"),
  cancellationPolicyAcceptedBy: integer("cancellation_policy_accepted_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = b2rent.table("reviews", {
  id: integer("review_id").generatedAlwaysAsIdentity().primaryKey(),
  bookingId: integer("booking_id").notNull(),
  listingId: integer("listing_id").notNull(),
  userId: integer("user_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const kycSubmissions = b2rent.table("kyc_submissions", {
  id: integer("kyc_id").generatedAlwaysAsIdentity().primaryKey(),
  userId: integer("user_id").notNull(),
  applicantRole: text("applicant_role").default("renter").notNull(),
  documentType: text("document_type").notNull(),
  documentKey: varchar("document_key", { length: 512 }).notNull(),
  originalFileName: varchar("original_file_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  status: text("status").default("Pending").notNull(),
  rejectionReason: text("rejection_reason"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

export const payments = b2rent.table("payments", {
  id: integer("payment_id").generatedAlwaysAsIdentity().primaryKey(),
  bookingId: integer("booking_id").notNull(),
  payerId: integer("payer_id").notNull(),
  method: text("method").notNull(),
  status: text("status").default("Pending").notNull(),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("_m_a_d").notNull(),
  providerReference: varchar("provider_reference", { length: 120 }).notNull(),
  simulated: boolean("simulated").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commercialLeaseContracts = b2rent.table("commercial_lease_contracts", {
  id: integer("contract_id").generatedAlwaysAsIdentity().primaryKey(),
  bookingId: integer("booking_id").notNull().unique(),
  landlordId: integer("landlord_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  reference: varchar("reference", { length: 80 }).notNull().unique(),
  leaseType: text("lease_type").notNull(),
  landlordName: varchar("landlord_name", { length: 255 }).notNull(),
  landlordRc: varchar("landlord_rc", { length: 120 }),
  tenantName: varchar("tenant_name", { length: 255 }).notNull(),
  premises: text("premises").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  monthlyRent: integer("monthly_rent").notNull(),
  deposit: integer("deposit").default(0).notNull(),
  pdfKey: varchar("pdf_key", { length: 512 }),
  status: text("status").default("Generated").notNull(),
  legalNotice: text("legal_notice").notNull(),
  leaseEndReminderTaskUid: varchar("lease_end_reminder_task_uid", { length: 65 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = b2rent.table("notifications", {
  id: integer("notification_id").generatedAlwaysAsIdentity().primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  href: varchar("href", { length: 512 }),
  entityType: varchar("entity_type", { length: 64 }),
  entityId: integer("entity_id"),
  readAt: timestamp("read_at"),
  emailStatus: text("email_status").default("not_sent").notNull(),
  emailSentAt: timestamp("email_sent_at"),
  dedupeKey: varchar("dedupe_key", { length: 191 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userCreatedIdx: index("notifications_user_created_idx").on(table.userId, table.createdAt),
  userUnreadIdx: index("notifications_user_unread_idx").on(table.userId, table.readAt),
  notificationDedupeIdx: uniqueIndex("notifications_dedupe_idx").on(table.userId, table.dedupeKey),
}));

export const bookingMessages = b2rent.table("booking_messages", {
  id: integer("message_id").generatedAlwaysAsIdentity().primaryKey(),
  bookingId: integer("booking_id").notNull(),
  senderId: integer("sender_id").notNull(),
  recipientId: integer("recipient_id").notNull(),
  body: text("body").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  bookingCreatedIdx: index("booking_messages_booking_created_idx").on(table.bookingId, table.createdAt),
  recipientUnreadIdx: index("booking_messages_recipient_unread_idx").on(table.recipientId, table.readAt),
}));

export const auditLogs = b2rent.table("audit_logs", {
  id: integer("audit_log_id").generatedAlwaysAsIdentity().primaryKey(),
  actorId: integer("actor_id").notNull(),
  action: varchar("action", { length: 120 }).notNull(),
  entityType: varchar("entity_type", { length: 80 }).notNull(),
  entityId: integer("entity_id"),
  beforeData: text("before_data"),
  afterData: text("after_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  entityIdx: index("audit_logs_entity_idx").on(table.entityType, table.entityId),
  actorCreatedIdx: index("audit_logs_actor_created_idx").on(table.actorId, table.createdAt),
}));

export const refundRequests = b2rent.table("refund_requests", {
  id: integer("refund_request_id").generatedAlwaysAsIdentity().primaryKey(),
  bookingId: integer("booking_id").notNull(),
  requestedBy: integer("requested_by").notNull(),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  status: text("status").default("Pending").notNull(),
  adminNote: text("admin_note"),
  reviewedBy: integer("reviewed_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
}, (table) => ({
  bookingIdx: index("refund_requests_booking_idx").on(table.bookingId, table.createdAt),
  requesterIdx: index("refund_requests_requester_idx").on(table.requestedBy, table.status),
}));

export const platformSettings = b2rent.table("platform_settings", {
  id: integer("setting_id").generatedAlwaysAsIdentity().primaryKey(),
  commissionRateBasisPoints: integer("commission_rate_basis_points").default(1000).notNull(),
  vatRateBasisPoints: integer("vat_rate_basis_points").default(2000).notNull(),
  updatedBy: integer("updated_by"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const payoutRequests = b2rent.table("payout_requests", {
  id: integer("payout_id").generatedAlwaysAsIdentity().primaryKey(),
  ownerId: integer("owner_id").notNull(),
  amount: integer("amount").notNull(),
  method: text("method").notNull(),
  status: text("status").default("Pending").notNull(),
  reference: varchar("reference", { length: 120 }),
  adminNote: text("admin_note"),
  reviewedBy: integer("reviewed_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

export const bookingVouchers = b2rent.table("booking_vouchers", {
  id: integer("voucher_id").generatedAlwaysAsIdentity().primaryKey(),
  bookingId: integer("booking_id").notNull().unique(),
  renterId: integer("renter_id").notNull(),
  code: varchar("code", { length: 80 }).notNull().unique(),
  qrPayload: text("qr_payload").notNull(),
  status: text("status").default("Issued").notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
});

export const invoices = b2rent.table("invoices", {
  id: integer("invoice_id").generatedAlwaysAsIdentity().primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 80 }).notNull().unique(),
  bookingId: integer("booking_id").notNull(),
  paymentId: integer("payment_id").notNull(),
  payerId: integer("payer_id").notNull(),
  subtotal: integer("subtotal").notNull(),
  commissionFee: integer("commission_fee").notNull(),
  vatRateBasisPoints: integer("vat_rate_basis_points").default(2000).notNull(),
  vatAmount: integer("vat_amount").notNull(),
  total: integer("total").notNull(),
  currency: varchar("currency", { length: 3 }).default("_m_a_d").notNull(),
  status: text("status").default("Issued").notNull(),
  cancellationPolicyVersion: varchar("cancellation_policy_version", { length: 80 }),
  cancellationPolicySnapshot: text("cancellation_policy_snapshot"),
  cancellationPolicyFingerprint: varchar("cancellation_policy_fingerprint", { length: 80 }),
  cancellationPolicyAcceptedAt: timestamp("cancellation_policy_accepted_at"),
  cancellationPolicyAcceptedBy: integer("cancellation_policy_accepted_by"),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
});

export const disputes = b2rent.table("disputes", {
  id: integer("dispute_id").generatedAlwaysAsIdentity().primaryKey(),
  bookingId: integer("booking_id").notNull(),
  openedBy: integer("opened_by").notNull(),
  type: varchar("type", { length: 120 }).notNull(),
  description: text("description").notNull(),
  status: text("status").default("Open").notNull(),
  resolutionNote: text("resolution_note"),
  reviewedBy: integer("reviewed_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const disputeAttachments = b2rent.table("dispute_attachments", {
  id: integer("attachment_id").generatedAlwaysAsIdentity().primaryKey(),
  disputeId: integer("dispute_id").notNull(),
  fileKey: varchar("file_key", { length: 512 }).notNull(),
  originalFileName: varchar("original_file_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supportTickets = b2rent.table("support_tickets", {
  id: integer("ticket_id").generatedAlwaysAsIdentity().primaryKey(),
  userId: integer("user_id").notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  description: text("description").notNull(),
  status: text("status").default("Open").notNull(),
  lastResponse: text("last_response"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = typeof listings.$inferInsert;
export type ListingAnalyticsEvent = typeof listingAnalyticsEvents.$inferSelect;
export type InsertListingAnalyticsEvent = typeof listingAnalyticsEvents.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
export type KycSubmission = typeof kycSubmissions.$inferSelect;
export type InsertKycSubmission = typeof kycSubmissions.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type BookingMessage = typeof bookingMessages.$inferSelect;
export type InsertBookingMessage = typeof bookingMessages.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
export type RefundRequest = typeof refundRequests.$inferSelect;
export type InsertRefundRequest = typeof refundRequests.$inferInsert;
export type InsertNotification = typeof notifications.$inferInsert;
export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertPlatformSetting = typeof platformSettings.$inferInsert;
export type PayoutRequest = typeof payoutRequests.$inferSelect;
export type InsertPayoutRequest = typeof payoutRequests.$inferInsert;
export type BookingVoucher = typeof bookingVouchers.$inferSelect;
export type InsertBookingVoucher = typeof bookingVouchers.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
export type CommercialLeaseContract = typeof commercialLeaseContracts.$inferSelect;
export type InsertCommercialLeaseContract = typeof commercialLeaseContracts.$inferInsert;
export type Dispute = typeof disputes.$inferSelect;
export type InsertDispute = typeof disputes.$inferInsert;
export type DisputeAttachment = typeof disputeAttachments.$inferSelect;
export type InsertDisputeAttachment = typeof disputeAttachments.$inferInsert;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

