import { COOKIE_NAME } from "@shared/const";
import { randomUUID } from "node:crypto";
import QRCode from "qrcode";
import { TRPCError } from "@trpc/server";
import { parse as parseCookie } from "cookie";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, ownerProcedure, publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { listings, bookings, reviews, users, commercialLeaseContracts, notifications, platformSettings, payoutRequests, disputes, disputeAttachments, supportTickets, payments, invoices, kycSubmissions, bookingVouchers, bookingMessages, auditLogs, refundRequests } from "../drizzle/schema";
import { eq, and, lte, gte, lt, gt, desc, count, isNull, inArray, ne, sql } from "drizzle-orm";
import { safeNotifyUser, buildEmailContent } from "./notificationService";
import { z } from "zod";
import { storageGet, storagePut } from "./storage";
import { generateServerCommercialLeasePdf } from "./commercialLeasePdf";
import { createHeartbeatJob } from "./_core/heartbeat";
import { calculateInvoiceTotals, createInvoiceNumber, getSimulatedPaymentStatus } from "./billing";
import { buildVoucherOwnerMessage, buildVoucherRenterMessage, createMapsSearchUrl, createVoucherCode } from "../shared/voucher";
import { escapeIcal, parseIcalEvents, validateIcalImportUrl } from "../shared/ical";
import { syncListingIcal } from "./ical";
import { CANCELLATION_POLICY_VERSION, CANCELLATION_POLICY_TEXT, CANCELLATION_POLICY_FINGERPRINT } from "../shared/cancellationPolicySnapshot";

async function writeAuditLog(input: {
  actorId: number;
  action: string;
  entityType: string;
  entityId?: number;
  beforeData?: unknown;
  afterData?: unknown;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values({
    actorId: input.actorId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    beforeData: input.beforeData === undefined ? null : JSON.stringify(input.beforeData),
    afterData: input.afterData === undefined ? null : JSON.stringify(input.afterData),
  });
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => {
      const user = ctx.user;
      if (!user) return null;
      return {
        id: user.id,
        openId: user.openId,
        name: user.name,
        email: user.email,
        whatsappPhone: user.whatsappPhone,
        commercialRegister: user.commercialRegister,
        loginMethod: user.loginMethod,
        role: user.role,
      };
    }),
    updateProfile: protectedProcedure
      .input(z.object({
        whatsappPhone: z.string().trim().max(32).optional().nullable(),
        commercialRegister: z.string().trim().max(120).optional().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
        const normalize = (value?: string | null) => value?.trim() || null;
        await db.update(users).set({
          whatsappPhone: normalize(input.whatsappPhone),
          commercialRegister: normalize(input.commercialRegister),
        }).where(eq(users.id, ctx.user!.id));
        return { success: true as const };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  notifications: router({
    list: protectedProcedure
      .input(z.object({ unreadOnly: z.boolean().optional().default(false) }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];
        const filters = [eq(notifications.userId, ctx.user!.id)];
        if (input.unreadOnly) filters.push(isNull(notifications.readAt));
        return db.select().from(notifications)
          .where(and(...filters))
          .orderBy(desc(notifications.createdAt))
          .limit(50);
      }),

    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return 0;
      const result = await db.select({ value: count() }).from(notifications)
        .where(and(eq(notifications.userId, ctx.user!.id), isNull(notifications.readAt)));
      return Number(result[0]?.value ?? 0);
    }),

    markRead: protectedProcedure
      .input(z.object({ notificationId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db.update(notifications)
          .set({ readAt: new Date() })
          .where(and(eq(notifications.id, input.notificationId), eq(notifications.userId, ctx.user!.id)));
        return { success: true };
      }),

    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(notifications)
        .set({ readAt: new Date() })
        .where(and(eq(notifications.userId, ctx.user!.id), isNull(notifications.readAt)));
      return { success: true };
    }),
  }),

  messages: router({
    listByBooking: protectedProcedure
      .input(z.object({ bookingId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];
        const bookingRows = await db.select({ renterId: bookings.renterId, ownerId: listings.ownerId })
          .from(bookings).innerJoin(listings, eq(bookings.listingId, listings.id))
          .where(eq(bookings.id, input.bookingId)).limit(1);
        const booking = bookingRows[0];
        if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "الحجز غير موجود." });
        const canRead = ctx.user!.role === "admin" || ctx.user!.id === booking.renterId || ctx.user!.id === booking.ownerId;
        if (!canRead) throw new TRPCError({ code: "FORBIDDEN", message: "لا يمكنك الوصول إلى رسائل هذا الحجز." });
        return db.select({ id: bookingMessages.id, bookingId: bookingMessages.bookingId, senderId: bookingMessages.senderId, recipientId: bookingMessages.recipientId, body: bookingMessages.body, readAt: bookingMessages.readAt, createdAt: bookingMessages.createdAt, senderName: users.name })
          .from(bookingMessages).leftJoin(users, eq(bookingMessages.senderId, users.id))
          .where(eq(bookingMessages.bookingId, input.bookingId)).orderBy(bookingMessages.createdAt);
      }),
    send: protectedProcedure
      .input(z.object({ bookingId: z.number().int().positive(), body: z.string().trim().min(1).max(2000) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
        const bookingRows = await db.select({ renterId: bookings.renterId, ownerId: listings.ownerId, listingTitle: listings.title })
          .from(bookings).innerJoin(listings, eq(bookings.listingId, listings.id))
          .where(eq(bookings.id, input.bookingId)).limit(1);
        const booking = bookingRows[0];
        if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "الحجز غير موجود." });
        const participants = [booking.renterId, booking.ownerId];
        if (!participants.includes(ctx.user!.id)) throw new TRPCError({ code: "FORBIDDEN", message: "المراسلة متاحة فقط لأطراف الحجز." });
        const recipientId = ctx.user!.id === booking.renterId ? booking.ownerId : booking.renterId;
        const [inserted] = await db.insert(bookingMessages).values({ bookingId: input.bookingId, senderId: ctx.user!.id, recipientId, body: input.body });
        const messageId = Number(inserted.insertId);
        await safeNotifyUser({ userId: recipientId, type: "system", title: "رسالة جديدة حول الحجز / Nouveau message", message: input.body.slice(0, 180), href: `/my-bookings?booking=${input.bookingId}`, entityType: "booking_message", entityId: messageId });
        return { success: true as const, messageId };
      }),
    markRead: protectedProcedure
      .input(z.object({ messageId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
        await db.update(bookingMessages).set({ readAt: new Date() }).where(and(eq(bookingMessages.id, input.messageId), eq(bookingMessages.recipientId, ctx.user!.id)));
        return { success: true as const };
      }),
  }),

  refunds: router({
    listMine: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(refundRequests).where(eq(refundRequests.requestedBy, ctx.user!.id)).orderBy(desc(refundRequests.createdAt)).limit(100);
    }),
    request: protectedProcedure
      .input(z.object({ bookingId: z.number().int().positive(), amount: z.number().int().positive(), reason: z.string().trim().min(5).max(2000) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
        const bookingRows = await db.select({ renterId: bookings.renterId, totalPrice: bookings.totalPrice, status: bookings.status, ownerId: listings.ownerId })
          .from(bookings).innerJoin(listings, eq(bookings.listingId, listings.id)).where(eq(bookings.id, input.bookingId)).limit(1);
        const booking = bookingRows[0];
        if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "الحجز غير موجود." });
        if (ctx.user!.id !== booking.renterId && ctx.user!.id !== booking.ownerId && ctx.user!.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "لا يمكنك طلب استرداد لهذا الحجز." });
        if (input.amount > booking.totalPrice) throw new TRPCError({ code: "BAD_REQUEST", message: "مبلغ الاسترداد لا يمكن أن يتجاوز قيمة الحجز." });
        const pending = await db.select({ id: refundRequests.id }).from(refundRequests).where(and(eq(refundRequests.bookingId, input.bookingId), eq(refundRequests.status, "Pending"))).limit(1);
        if (pending.length) throw new TRPCError({ code: "CONFLICT", message: "يوجد طلب استرداد قيد المراجعة لهذا الحجز." });
        const [inserted] = await db.insert(refundRequests).values({ bookingId: input.bookingId, requestedBy: ctx.user!.id, amount: input.amount, reason: input.reason });
        const refundId = Number(inserted.insertId);
        await writeAuditLog({ actorId: ctx.user!.id, action: "refund.requested", entityType: "refund_request", entityId: refundId, afterData: { bookingId: input.bookingId, amount: input.amount, reason: input.reason } });
        return { success: true as const, refundId };
      }),
  }),

  storage: router({
    uploadImage: ownerProcedure
      .input(z.object({
        fileName: z.string().trim().min(1).max(160),
        mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
        contentBase64: z.string().min(1).max(8_500_000),
      }))
      .mutation(async ({ ctx, input }) => {
        const normalizedName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120) || "listing-image";
        const imageBuffer = Buffer.from(input.contentBase64, "base64");
        if (imageBuffer.length === 0 || imageBuffer.length > 6 * 1024 * 1024) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "حجم الصورة يجب أن يكون بين 1 بايت و6 ميجابايت." });
        }
        const uploaded = await storagePut(`users/${ctx.user!.id}/listings/${Date.now()}-${normalizedName}`, imageBuffer, input.mimeType);
        return { ...uploaded, fileName: normalizedName, mimeType: input.mimeType };
      }),
  }),

  kyc: router({
    listMine: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select({
        id: kycSubmissions.id,
        applicantRole: kycSubmissions.applicantRole,
        documentType: kycSubmissions.documentType,
        originalFileName: kycSubmissions.originalFileName,
        mimeType: kycSubmissions.mimeType,
        status: kycSubmissions.status,
        rejectionReason: kycSubmissions.rejectionReason,
        submittedAt: kycSubmissions.submittedAt,
        reviewedAt: kycSubmissions.reviewedAt,
      }).from(kycSubmissions).where(eq(kycSubmissions.userId, ctx.user!.id)).orderBy(desc(kycSubmissions.submittedAt));
    }),
    submit: protectedProcedure
      .input(z.object({
        applicantRole: z.enum(["renter", "owner", "company"]),
        documentType: z.enum(["cni", "commercial_register"]),
        fileName: z.string().trim().min(1).max(255),
        mimeType: z.enum(["application/pdf", "image/jpeg", "image/png"]),
        contentBase64: z.string().min(1).max(12_000_000),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
        const existing = await db.select({ id: kycSubmissions.id }).from(kycSubmissions)
          .where(and(eq(kycSubmissions.userId, ctx.user!.id), eq(kycSubmissions.status, "Pending"))).limit(1);
        if (existing.length) throw new TRPCError({ code: "CONFLICT", message: "لديك طلب تحقق قيد المراجعة بالفعل." });
        const bytes = Buffer.from(input.contentBase64, "base64");
        if (!bytes.length || bytes.length > 8 * 1024 * 1024) throw new TRPCError({ code: "BAD_REQUEST", message: "حجم المستند يجب ألا يتجاوز 8 ميجابايت." });
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-180) || "identity-document";
        const stored = await storagePut(`users/${ctx.user!.id}/kyc/${Date.now()}-${safeName}`, bytes, input.mimeType);
        const [created] = await db.insert(kycSubmissions).values({ userId: ctx.user!.id, applicantRole: input.applicantRole, documentType: input.documentType, documentKey: stored.key, originalFileName: input.fileName, mimeType: input.mimeType, status: "Pending" }).$returningId();
        return { id: created.id, status: "Pending" as const };
      }),
    adminList: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(kycSubmissions).orderBy(desc(kycSubmissions.submittedAt)).limit(100);
    }),
    review: adminProcedure
      .input(z.object({ id: z.number().int().positive(), status: z.enum(["Approved", "Rejected"]), rejectionReason: z.string().trim().max(500).optional() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
        await db.update(kycSubmissions).set({ status: input.status, rejectionReason: input.status === "Rejected" ? (input.rejectionReason || "لم يتم تقديم سبب.") : null, reviewedAt: new Date() }).where(eq(kycSubmissions.id, input.id));
        return { success: true } as const;
      }),
  }),
  admin: router({
    auditLogs: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select({ id: auditLogs.id, actorId: auditLogs.actorId, actorName: users.name, action: auditLogs.action, entityType: auditLogs.entityType, entityId: auditLogs.entityId, beforeData: auditLogs.beforeData, afterData: auditLogs.afterData, createdAt: auditLogs.createdAt })
        .from(auditLogs).leftJoin(users, eq(auditLogs.actorId, users.id)).orderBy(desc(auditLogs.createdAt)).limit(200);
    }),
    refundRequests: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select({ id: refundRequests.id, bookingId: refundRequests.bookingId, requestedBy: refundRequests.requestedBy, requesterName: users.name, amount: refundRequests.amount, reason: refundRequests.reason, status: refundRequests.status, adminNote: refundRequests.adminNote, reviewedBy: refundRequests.reviewedBy, createdAt: refundRequests.createdAt, reviewedAt: refundRequests.reviewedAt })
        .from(refundRequests).leftJoin(users, eq(refundRequests.requestedBy, users.id)).orderBy(desc(refundRequests.createdAt)).limit(200);
    }),
    reviewRefund: adminProcedure
      .input(z.object({ refundId: z.number().int().positive(), status: z.enum(["Approved", "Rejected", "Paid"]), adminNote: z.string().trim().max(2000).optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
        const current = await db.select().from(refundRequests).where(eq(refundRequests.id, input.refundId)).limit(1);
        if (!current[0]) throw new TRPCError({ code: "NOT_FOUND", message: "طلب الاسترداد غير موجود." });
        await db.update(refundRequests).set({ status: input.status, adminNote: input.adminNote || null, reviewedBy: ctx.user!.id, reviewedAt: new Date() }).where(eq(refundRequests.id, input.refundId));
        await writeAuditLog({ actorId: ctx.user!.id, action: "refund.reviewed", entityType: "refund_request", entityId: input.refundId, beforeData: current[0], afterData: { ...current[0], status: input.status, adminNote: input.adminNote || null } });
        await safeNotifyUser({ userId: current[0].requestedBy, type: "system", title: "تحديث طلب الاسترداد / Mise à jour du remboursement", message: `تم تحديث طلب الاسترداد #${input.refundId} إلى حالة ${input.status}.`, href: "/my-bookings", entityType: "refund_request", entityId: input.refundId });
        return { success: true as const };
      }),
    overview: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { users: 0, owners: 0, renters: 0, listings: 0, pendingListings: 0, bookings: 0, grossRevenue: 0, platformFees: 0 };
      const [userRows, ownerRows, renterRows, listingRows, pendingRows, bookingRows, revenueRows] = await Promise.all([
        db.select({ value: count() }).from(users),
        db.select({ value: count() }).from(users).where(eq(users.role, 'owner')),
        db.select({ value: count() }).from(users).where(eq(users.role, 'renter')),
        db.select({ value: count() }).from(listings),
        db.select({ value: count() }).from(listings).where(eq(listings.status, 'Pending')),
        db.select({ value: count() }).from(bookings),
        db.select({ gross: bookings.totalPrice, fees: bookings.commissionFee }).from(bookings).where(eq(bookings.status, 'Confirmed')),
      ]);
      return {
        users: Number(userRows[0]?.value ?? 0), owners: Number(ownerRows[0]?.value ?? 0), renters: Number(renterRows[0]?.value ?? 0),
        listings: Number(listingRows[0]?.value ?? 0), pendingListings: Number(pendingRows[0]?.value ?? 0), bookings: Number(bookingRows[0]?.value ?? 0),
        grossRevenue: revenueRows.reduce((sum, row) => sum + row.gross, 0), platformFees: revenueRows.reduce((sum, row) => sum + row.fees, 0),
      };
    }),
    users: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt }).from(users).orderBy(desc(users.createdAt)).limit(200);
    }),
    updateUserRole: adminProcedure
      .input(z.object({ userId: z.number().int().positive(), role: z.enum(['renter', 'owner', 'admin', 'user']) }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database unavailable');
        await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
        return { success: true };
      }),
    bookings: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select({ id: bookings.id, status: bookings.status, totalPrice: bookings.totalPrice, commissionFee: bookings.commissionFee, startDate: bookings.startDate, endDate: bookings.endDate, listingTitle: listings.title, renterName: users.name })
        .from(bookings).innerJoin(listings, eq(bookings.listingId, listings.id)).leftJoin(users, eq(bookings.renterId, users.id)).orderBy(desc(bookings.createdAt)).limit(200);
    }),
    cancelBooking: adminProcedure
      .input(z.object({ bookingId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database unavailable');
        const before = await db.select().from(bookings).where(eq(bookings.id, input.bookingId)).limit(1);
        await db.update(bookings).set({ status: 'Cancelled' }).where(eq(bookings.id, input.bookingId));
        await writeAuditLog({ actorId: ctx.user!.id, action: "booking.cancelled", entityType: "booking", entityId: input.bookingId, beforeData: before[0], afterData: { ...before[0], status: "Cancelled" } });
        return { success: true };
      }),
    listings: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select({ id: listings.id, title: listings.title, category: listings.category, status: listings.status, pricePerDay: listings.pricePerDay, ownerId: listings.ownerId, ownerName: users.name, createdAt: listings.createdAt })
        .from(listings).leftJoin(users, eq(listings.ownerId, users.id)).orderBy(desc(listings.createdAt)).limit(200);
    }),
    moderateListing: adminProcedure
      .input(z.object({ listingId: z.number().int().positive(), status: z.enum(['Approved', 'Rejected']) }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database unavailable');
        await db.update(listings).set({ status: input.status }).where(eq(listings.id, input.listingId));
        return { success: true };
      }),
    commissionSettings: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { commissionRateBasisPoints: 1000, vatRateBasisPoints: 2000 };
      const rows = await db.select().from(platformSettings).limit(1);
      return rows[0] ?? { commissionRateBasisPoints: 1000, vatRateBasisPoints: 2000 };
    }),
    updateCommission: adminProcedure
      .input(z.object({ commissionRateBasisPoints: z.number().int().min(0).max(3000) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database unavailable');
        const existing = await db.select({ id: platformSettings.id }).from(platformSettings).limit(1);
        if (existing[0]) {
          await db.update(platformSettings).set({ commissionRateBasisPoints: input.commissionRateBasisPoints, updatedBy: ctx.user.id }).where(eq(platformSettings.id, existing[0].id));
        } else {
          await db.insert(platformSettings).values({ commissionRateBasisPoints: input.commissionRateBasisPoints, updatedBy: ctx.user.id });
        }
        return { success: true, commissionRateBasisPoints: input.commissionRateBasisPoints };
      }),
    payouts: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select({ id: payoutRequests.id, ownerId: payoutRequests.ownerId, ownerName: users.name, ownerEmail: users.email, amount: payoutRequests.amount, method: payoutRequests.method, status: payoutRequests.status, reference: payoutRequests.reference, adminNote: payoutRequests.adminNote, createdAt: payoutRequests.createdAt, reviewedAt: payoutRequests.reviewedAt })
        .from(payoutRequests).leftJoin(users, eq(payoutRequests.ownerId, users.id)).orderBy(desc(payoutRequests.createdAt)).limit(200);
    }),
    reviewPayout: adminProcedure
      .input(z.object({ payoutId: z.number().int().positive(), status: z.enum(['Approved', 'Paid', 'Rejected']), adminNote: z.string().max(1000).optional(), reference: z.string().max(120).optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database unavailable');
        await db.update(payoutRequests).set({ status: input.status, adminNote: input.adminNote, reference: input.reference, reviewedBy: ctx.user!.id, reviewedAt: new Date() }).where(eq(payoutRequests.id, input.payoutId));
        return { success: true };
      }),
    payments: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select({ id: payments.id, bookingId: payments.bookingId, payerId: payments.payerId, payerName: users.name, payerEmail: users.email, method: payments.method, status: payments.status, amount: payments.amount, currency: payments.currency, providerReference: payments.providerReference, simulated: payments.simulated, createdAt: payments.createdAt })
        .from(payments).leftJoin(users, eq(payments.payerId, users.id)).orderBy(desc(payments.createdAt)).limit(200);
    }),
    disputes: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select({ id: disputes.id, bookingId: disputes.bookingId, openedBy: disputes.openedBy, type: disputes.type, description: disputes.description, status: disputes.status, resolutionNote: disputes.resolutionNote, createdAt: disputes.createdAt, openerName: users.name })
        .from(disputes).leftJoin(users, eq(disputes.openedBy, users.id)).orderBy(desc(disputes.createdAt)).limit(200);
    }),
    supportTickets: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select({ id: supportTickets.id, userId: supportTickets.userId, subject: supportTickets.subject, category: supportTickets.category, description: supportTickets.description, status: supportTickets.status, lastResponse: supportTickets.lastResponse, respondedAt: supportTickets.respondedAt, createdAt: supportTickets.createdAt, userName: users.name, userEmail: users.email })
        .from(supportTickets).leftJoin(users, eq(supportTickets.userId, users.id)).orderBy(desc(supportTickets.createdAt)).limit(200);
    }),
    updateSupportTicket: adminProcedure
      .input(z.object({ ticketId: z.number().int().positive(), status: z.enum(["Open", "InProgress", "Resolved"]), response: z.string().max(2000).optional() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db.update(supportTickets).set({ status: input.status, ...(input.response ? { lastResponse: input.response, respondedAt: new Date() } : {}) }).where(eq(supportTickets.id, input.ticketId));
        return { success: true };
      }),
    resolveDispute: adminProcedure
      .input(z.object({ disputeId: z.number().int().positive(), status: z.enum(['UnderReview', 'Resolved', 'Rejected']), resolutionNote: z.string().min(2).max(2000) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database unavailable');
        await db.update(disputes).set({ status: input.status, resolutionNote: input.resolutionNote, reviewedBy: ctx.user.id, updatedAt: new Date() }).where(eq(disputes.id, input.disputeId));
        return { success: true };
      }),
    ownerFinancials: ownerProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { gross: 0, platformFees: 0, net: 0, requested: 0, paid: 0 };
      const rows = await db.select({ totalPrice: bookings.totalPrice, commissionFee: bookings.commissionFee, netProfit: bookings.netProfit })
        .from(bookings).innerJoin(listings, eq(bookings.listingId, listings.id))
        .where(and(eq(listings.ownerId, ctx.user!.id), eq(bookings.status, 'Confirmed')));
      const payouts = await db.select({ amount: payoutRequests.amount, status: payoutRequests.status }).from(payoutRequests).where(eq(payoutRequests.ownerId, ctx.user!.id));
      return {
        gross: rows.reduce((sum, row) => sum + row.totalPrice, 0),
        platformFees: rows.reduce((sum, row) => sum + row.commissionFee, 0),
        net: rows.reduce((sum, row) => sum + row.netProfit, 0),
        requested: payouts.filter(p => p.status === 'Pending' || p.status === 'Approved').reduce((sum, p) => sum + p.amount, 0),
        paid: payouts.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0),
      };
    }),
  }),

  supportTickets: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select({ id: supportTickets.id, subject: supportTickets.subject, category: supportTickets.category, description: supportTickets.description, status: supportTickets.status, lastResponse: supportTickets.lastResponse, respondedAt: supportTickets.respondedAt, createdAt: supportTickets.createdAt, updatedAt: supportTickets.updatedAt })
        .from(supportTickets).where(eq(supportTickets.userId, ctx.user!.id)).orderBy(desc(supportTickets.createdAt)).limit(100);
    }),
    create: protectedProcedure
      .input(z.object({ subject: z.string().trim().min(3).max(255), category: z.string().trim().min(2).max(120), description: z.string().trim().min(5).max(5000) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        const [inserted] = await db.insert(supportTickets).values({ userId: ctx.user!.id, subject: input.subject, category: input.category, description: input.description, status: "Open" });
        const ticketId = Number(inserted.insertId);
        const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")).limit(20);
        await Promise.all(admins.filter(admin => admin.id !== ctx.user!.id).map(admin => safeNotifyUser({
          userId: admin.id,
          type: "system",
          title: "تذكرة دعم جديدة / Nouveau ticket",
          message: `تم فتح تذكرة دعم جديدة: ${input.subject}`,
          href: "/admin",
          entityType: "support_ticket",
          entityId: ticketId,
        })));
        return { success: true, ticketId };
      }),
  }),

  disputes: router({
    listMine: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db.select({ id: disputes.id, bookingId: disputes.bookingId, type: disputes.type, description: disputes.description, status: disputes.status, resolutionNote: disputes.resolutionNote, createdAt: disputes.createdAt, updatedAt: disputes.updatedAt })
        .from(disputes).where(eq(disputes.openedBy, ctx.user!.id)).orderBy(desc(disputes.createdAt)).limit(100);
      if (!rows.length) return [];
      const attachments = await db.select({ id: disputeAttachments.id, disputeId: disputeAttachments.disputeId, originalFileName: disputeAttachments.originalFileName, fileKey: disputeAttachments.fileKey, mimeType: disputeAttachments.mimeType, fileSize: disputeAttachments.fileSize })
        .from(disputeAttachments).where(inArray(disputeAttachments.disputeId, rows.map(row => row.id)));
      return rows.map(row => ({ ...row, attachments: attachments.filter(file => file.disputeId === row.id).map(file => ({ id: file.id, name: file.originalFileName, mimeType: file.mimeType, size: file.fileSize, url: `/manus-storage/${file.fileKey}` })) }));
    }),
    create: protectedProcedure
      .input(z.object({ bookingId: z.number().int().positive(), type: z.string().trim().min(2).max(120), description: z.string().trim().min(5).max(5000), attachments: z.array(z.object({ name: z.string().trim().min(1).max(255), mimeType: z.string().trim().min(1).max(100), contentBase64: z.string().max(14000000) })).max(5).optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        const booking = await db.select({ id: bookings.id, renterId: bookings.renterId, listingId: bookings.listingId }).from(bookings).where(eq(bookings.id, input.bookingId)).limit(1);
        if (!booking[0]) throw new Error("الحجز المرتبط بالنزاع غير موجود.");
        const listing = await db.select({ ownerId: listings.ownerId, title: listings.title }).from(listings).where(eq(listings.id, booking[0].listingId)).limit(1);
        const canOpen = ctx.user!.role === "admin" || booking[0].renterId === ctx.user!.id || listing[0]?.ownerId === ctx.user!.id;
        if (!canOpen) throw new Error("لا يمكنك فتح نزاع حول حجز لا يخصك.");
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        const files = input.attachments ?? [];
        if (files.some(file => !allowedTypes.includes(file.mimeType))) throw new Error("نوع ملف مرفق غير مدعوم.");
        const totalBytes = files.reduce((total, file) => total + Math.floor(file.contentBase64.length * 0.75), 0);
        if (totalBytes > 10 * 1024 * 1024) throw new Error("إجمالي المرفقات يتجاوز 10 ميجابايت.");
        const [inserted] = await db.insert(disputes).values({ bookingId: input.bookingId, openedBy: ctx.user!.id, type: input.type, description: input.description, status: "Open" });
        const disputeId = Number(inserted.insertId);
        for (const file of files) {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const uploaded = await storagePut(`disputes/${disputeId}/${safeName}`, Buffer.from(file.contentBase64, "base64"), file.mimeType);
          await db.insert(disputeAttachments).values({ disputeId, fileKey: uploaded.key, originalFileName: file.name, mimeType: file.mimeType, fileSize: Math.floor(file.contentBase64.length * 0.75) });
        }
        const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")).limit(20);
        await Promise.all(admins.filter(admin => admin.id !== ctx.user!.id).map(admin => safeNotifyUser({
          userId: admin.id,
          type: "system",
          title: "نزاع جديد / Nouveau litige",
          message: `تم فتح نزاع جديد مرتبط بالحجز #${input.bookingId}.`,
          href: "/admin",
          entityType: "dispute",
          entityId: disputeId,
        })));
        return { success: true, disputeId };
      }),
  }),

  payouts: router({
    request: ownerProcedure
      .input(z.object({ amount: z.number().int().positive(), method: z.enum(['bank_transfer', 'cash_plus', 'wafacash']) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database unavailable');
        const rows = await db.select({ netProfit: bookings.netProfit }).from(bookings).innerJoin(listings, eq(bookings.listingId, listings.id)).where(and(eq(listings.ownerId, ctx.user!.id), eq(bookings.status, 'Confirmed')));
        const previous = await db.select({ amount: payoutRequests.amount, status: payoutRequests.status }).from(payoutRequests).where(eq(payoutRequests.ownerId, ctx.user!.id));
        const available = rows.reduce((sum, row) => sum + row.netProfit, 0) - previous.filter(p => p.status !== 'Rejected').reduce((sum, p) => sum + p.amount, 0);
        if (input.amount > available) throw new Error('Requested amount exceeds available owner balance');
        await db.insert(payoutRequests).values({ ownerId: ctx.user!.id, amount: input.amount, method: input.method });
        return { success: true };
      }),
  }),
  listings: router({
    list: publicProcedure
      .input(
        z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const allListings = await db.select({ listing: listings, ownerName: users.name }).from(listings).leftJoin(users, eq(listings.ownerId, users.id)).where(inArray(listings.status, ['Approved', 'Available'])).orderBy(desc(listings.createdAt));

        // Dynamic Pricing Engine calculation
        return allListings.map(({ listing: item, ownerName }) => {
          let adjustedPrice = item.pricePerDay;
          if (input?.startDate && input?.endDate) {
            const start = new Date(input.startDate);
            const end = new Date(input.endDate);
            const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

            // Weekend surge (Friday/Saturday)
            const dayOfWeek = start.getDay();
            if (dayOfWeek === 5 || dayOfWeek === 6) {
              adjustedPrice = Math.round(adjustedPrice * 1.20); // 20% weekend surge
            }

            // Long-stay discount
            if (days > 30) {
              adjustedPrice = Math.round(adjustedPrice * 0.80); // 20% off for > 1 month
            } else if (days > 7) {
              adjustedPrice = Math.round(adjustedPrice * 0.90); // 10% off for > 7 days
            }
          }
          return {
            ...item,
            ownerName: ownerName ?? null,
            dynamicPricePerDay: adjustedPrice,
          };
        });
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const result = await db.select().from(listings).where(and(eq(listings.id, input.id), inArray(listings.status, ['Approved', 'Available']))).limit(1);
        return result[0] || null;
      }),

    getBookedDates: publicProcedure
      .input(z.object({ listingId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const res = await db.select({ start: bookings.startDate, end: bookings.endDate }).from(bookings).where(and(eq(bookings.listingId, input.listingId), eq(bookings.status, "Confirmed")));
        const listingRows = await db.select({ availability: listings.availability, icalImportedRanges: listings.icalImportedRanges }).from(listings).where(eq(listings.id, input.listingId)).limit(1);
        const parseRanges = (value: string | null | undefined, source: "manual" | "ical") => {
          if (!value) return [];
          try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((range) => typeof range?.start === "string" && typeof range?.end === "string").map((range) => ({ start: range.start, end: range.end, source })) : []; } catch { return []; }
        };
        return [
          ...res.map(b => ({ start: new Date(b.start).toISOString().split('T')[0], end: new Date(b.end).toISOString().split('T')[0], source: "booking" as const })),
          ...parseRanges(listingRows[0]?.availability, "manual"),
          ...parseRanges(listingRows[0]?.icalImportedRanges, "ical"),
        ];
      }),

    setAvailability: ownerProcedure
      .input(z.object({ listingId: z.number().int().positive(), blockedRanges: z.array(z.object({ start: z.string(), end: z.string() })).max(100) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database unavailable');
        const listing = await db.select({ id: listings.id }).from(listings).where(and(eq(listings.id, input.listingId), eq(listings.ownerId, ctx.user!.id))).limit(1);
        if (!listing[0]) throw new Error('لا يمكنك تعديل توفر إعلان لا تملكه');
        const normalized = input.blockedRanges.map(range => {
          const start = new Date(range.start);
          const end = new Date(range.end);
          if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) throw new Error('فترة التوفر غير صالحة');
          return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
        });
        await db.update(listings).set({ availability: JSON.stringify(normalized) }).where(and(eq(listings.id, input.listingId), eq(listings.ownerId, ctx.user!.id)));
        return { success: true, blockedRanges: normalized };
      }),

    getIcalSettings: ownerProcedure
      .input(z.object({ listingId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        const rows = await db.select({ id: listings.id, icalImportUrl: listings.icalImportUrl, icalExportToken: listings.icalExportToken, icalLastSyncedAt: listings.icalLastSyncedAt, icalSyncStatus: listings.icalSyncStatus, icalSyncError: listings.icalSyncError }).from(listings).where(and(eq(listings.id, input.listingId), eq(listings.ownerId, ctx.user!.id))).limit(1);
        if (!rows[0]) throw new Error("الإعلان غير موجود ضمن ممتلكاتك.");
        return { ...rows[0], exportPath: rows[0].icalExportToken ? `/api/ical/export/${rows[0].icalExportToken}` : null };
      }),

    saveIcalSettings: ownerProcedure
      .input(z.object({ listingId: z.number().int().positive(), importUrl: z.string().trim().url().max(2000).nullable().optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        const owned = await db.select({ id: listings.id, icalExportToken: listings.icalExportToken }).from(listings).where(and(eq(listings.id, input.listingId), eq(listings.ownerId, ctx.user!.id))).limit(1);
        if (!owned[0]) throw new Error("الإعلان غير موجود ضمن ممتلكاتك.");
        const importUrl = input.importUrl ? validateIcalImportUrl(input.importUrl) : null;
        const token = owned[0].icalExportToken ?? randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "");
        await db.update(listings).set({ icalImportUrl: importUrl, icalExportToken: token, icalImportedRanges: null, icalLastSyncedAt: null, icalSyncStatus: importUrl ? "never" : "never", icalSyncError: null }).where(eq(listings.id, input.listingId));
        return { success: true, exportPath: `/api/ical/export/${token}`, importConfigured: Boolean(importUrl) };
      }),

    syncIcalNow: ownerProcedure
      .input(z.object({ listingId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        const owned = await db.select({ id: listings.id }).from(listings).where(and(eq(listings.id, input.listingId), eq(listings.ownerId, ctx.user!.id))).limit(1);
        if (!owned[0]) throw new Error("الإعلان غير موجود ضمن ممتلكاتك.");
        return syncListingIcal(input.listingId);
      }),

    create: ownerProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          category: z.string(),
          pricePerDay: z.number(),
          imageUrl: z.string().optional(),
          city: z.string(),
          officeType: z.string().optional(),
          rentalPeriod: z.enum(['daily', 'monthly', 'yearly']).optional(),
          amenities: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db.insert(listings).values({
          ownerId: ctx.user!.id,
          title: input.title,
          description: input.description,
          category: input.category,
          pricePerDay: input.pricePerDay,
          imageUrl: input.imageUrl,
          city: input.city,
          officeType: input.officeType,
          rentalPeriod: input.rentalPeriod,
          amenities: input.amenities?.join(',') || null,
          status: "Pending",
        });
        return { success: true };
      }),

    update: ownerProcedure
      .input(z.object({
        id: z.number().int().positive(),
        title: z.string().min(2).optional(),
        description: z.string().optional(),
        pricePerDay: z.number().int().nonnegative().optional(),
        city: z.string().min(2).optional(),
        imageUrl: z.string().optional(),
        officeType: z.string().optional(),
        rentalPeriod: z.enum(['daily', 'monthly', 'yearly']).optional(),
        amenities: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database unavailable');
        const { id, amenities, ...fields } = input;
        const owned = await db.select({ id: listings.id }).from(listings)
          .where(and(eq(listings.id, id), eq(listings.ownerId, ctx.user!.id))).limit(1);
        if (!owned[0]) throw new Error('الإعلان غير موجود ضمن ممتلكاتك.');
        await db.update(listings).set({ ...fields, ...(amenities ? { amenities: amenities.join(',') } : {}), status: 'Pending' }).where(eq(listings.id, id));
        return { success: true };
      }),

    remove: ownerProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database unavailable');
        const owned = await db.select({ id: listings.id }).from(listings)
          .where(and(eq(listings.id, input.id), eq(listings.ownerId, ctx.user!.id))).limit(1);
        if (!owned[0]) throw new Error('الإعلان غير موجود ضمن ممتلكاتك.');
        await db.delete(listings).where(eq(listings.id, input.id));
        return { success: true };
      }),

    mine: ownerProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      if (!['owner', 'admin'].includes(ctx.user!.role)) throw new Error('هذه الصفحة مخصصة للملاك.');
      return db.select().from(listings).where(eq(listings.ownerId, ctx.user!.id)).orderBy(desc(listings.createdAt));
    }),
  }),



  bookings: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      if (ctx.user!.role === 'admin') {
        return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
      }
      return await db.select().from(bookings).where(eq(bookings.renterId, ctx.user!.id));
    }),

    getById: protectedProcedure
      .input(z.object({ bookingId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        const rows = await db.select({
          id: bookings.id,
          renterId: bookings.renterId,
          listingId: bookings.listingId,
          startDate: bookings.startDate,
          endDate: bookings.endDate,
          totalPrice: bookings.totalPrice,
          commissionFee: bookings.commissionFee,
          netProfit: bookings.netProfit,
          status: bookings.status,
          createdAt: bookings.createdAt,
          listingTitle: listings.title,
          listingCity: listings.city,
          listingCategory: listings.category,
          ownerName: users.name,
          ownerWhatsApp: users.whatsappPhone,
        }).from(bookings)
          .innerJoin(listings, eq(bookings.listingId, listings.id))
          .leftJoin(users, eq(listings.ownerId, users.id))
          .where(eq(bookings.id, input.bookingId)).limit(1);
        const booking = rows[0];
        if (!booking || (ctx.user!.role !== "admin" && booking.renterId !== ctx.user!.id)) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الحجز غير موجود أو لا يخص حسابك." });
        }
        return booking;
      }),

    create: protectedProcedure
      .input(
        z.object({
          listingId: z.number().int().positive(),
          startDate: z.string(),
          endDate: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        const start = new Date(input.startDate);
        const end = new Date(input.endDate);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
          throw new Error("تواريخ الحجز غير صالحة.");
        }
        const listing = await db.select().from(listings).where(eq(listings.id, input.listingId)).limit(1);
        if (!listing[0]) throw new Error("الإعلان غير موجود.");
        const owner = await db.select({ id: users.id, name: users.name, email: users.email })
          .from(users).where(eq(users.id, listing[0].ownerId)).limit(1);

        const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (!Number.isInteger(durationDays) || durationDays <= 0) throw new Error("مدة الحجز غير صالحة.");
        const subtotal = listing[0].pricePerDay * durationDays;
        const settings = await db.select({ commissionRateBasisPoints: platformSettings.commissionRateBasisPoints }).from(platformSettings).limit(1);
        const commissionRateBasisPoints = settings[0]?.commissionRateBasisPoints ?? 1_000;
        const commissionFee = Math.round(subtotal * commissionRateBasisPoints / 10_000);
        const netProfit = subtotal - commissionFee;

        // Pending requests may overlap while awaiting approval. The owner/admin confirmation path below
        // takes the same row lock and performs the authoritative confirmed-overlap check.
        const policyAcceptedAt = new Date();
        const [inserted] = await db.insert(bookings).values({
          renterId: ctx.user!.id,
          listingId: input.listingId,
          startDate: start,
          endDate: end,
          totalPrice: subtotal,
          commissionFee,
          netProfit,
          status: "Pending",
          cancellationPolicyVersion: CANCELLATION_POLICY_VERSION,
          cancellationPolicySnapshot: CANCELLATION_POLICY_TEXT,
          cancellationPolicyFingerprint: CANCELLATION_POLICY_FINGERPRINT,
          cancellationPolicyAcceptedAt: policyAcceptedAt,
          cancellationPolicyAcceptedBy: ctx.user!.id,
        });
        const bookingId = Number(inserted.insertId);
        const dateLabel = `${start.toLocaleDateString("fr-MA")} → ${end.toLocaleDateString("fr-MA")}`;
        const ownerTitle = "حجز جديد / Nouvelle réservation";
        const ownerMessage = `توصلت بحجز جديد للإعلان «${listing[0].title}» من ${dateLabel}.\nVous avez reçu une nouvelle réservation pour «${listing[0].title}».`;
        await safeNotifyUser({
          userId: listing[0].ownerId,
          type: "booking_new",
          title: ownerTitle,
          message: ownerMessage,
          href: "/host",
          entityType: "booking",
          entityId: bookingId,
          email: owner[0]?.email ? { to: owner[0].email, subject: ownerTitle, ...buildEmailContent(ownerTitle, ownerMessage, "/host") } : undefined,
        });

        return { success: true, bookingId, subtotal, durationDays, commissionFee, netProfit };
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          bookingId: z.number(),
          status: z.enum(["Pending", "Confirmed", "Cancelled"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        if (ctx.user!.role !== 'admin') {
          throw new Error("عذراً، هذه العملية مخصصة لمدير المنصة والمشرفين فقط.");
        }
        await db
          .update(bookings)
          .set({ status: input.status })
          .where(eq(bookings.id, input.bookingId));
        return { success: true };
      }),

    ownerList: ownerProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      if (!['owner', 'admin'].includes(ctx.user!.role)) throw new Error('هذه العملية مخصصة للملاك.');
      const rows = await db.select({
        id: bookings.id,
        renterId: bookings.renterId,
        listingId: bookings.listingId,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
        totalPrice: bookings.totalPrice,
        commissionFee: bookings.commissionFee,
        netProfit: bookings.netProfit,
        status: bookings.status,
        createdAt: bookings.createdAt,
        listingTitle: listings.title,
        renterName: users.name,
      }).from(bookings)
        .innerJoin(listings, eq(bookings.listingId, listings.id))
        .leftJoin(users, eq(bookings.renterId, users.id))
        .where(eq(listings.ownerId, ctx.user!.id))
        .orderBy(desc(bookings.createdAt));
      return rows;
    }),

    ownerUpdateStatus: ownerProcedure
      .input(z.object({ bookingId: z.number(), status: z.enum(['Confirmed', 'Cancelled']) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database unavailable');
        if (!['owner', 'admin'].includes(ctx.user!.role)) throw new Error('هذه العملية مخصصة للملاك.');
        const owned = await db.select({ id: bookings.id }).from(bookings)
          .innerJoin(listings, eq(bookings.listingId, listings.id))
          .where(and(eq(bookings.id, input.bookingId), eq(listings.ownerId, ctx.user!.id)))
          .limit(1);
        if (!owned[0]) throw new Error('الحجز غير موجود ضمن إعلاناتك.');
        const bookingDetails = await db.select({
          bookingId: bookings.id,
          renterId: bookings.renterId,
          listingId: bookings.listingId,
          startDate: bookings.startDate,
          endDate: bookings.endDate,
          status: bookings.status,
          listingTitle: listings.title,
          renterEmail: users.email,
        }).from(bookings)
          .innerJoin(listings, eq(bookings.listingId, listings.id))
          .leftJoin(users, eq(bookings.renterId, users.id))
          .where(eq(bookings.id, input.bookingId)).limit(1);
        const booking = bookingDetails[0];
        if (!booking) throw new Error("الحجز غير موجود.");
        if (booking.status !== "Pending") {
          throw new Error("لا يمكن تغيير حالة هذا الحجز بعد حسمه.");
        }

        const updated = await db.transaction(async (tx) => {
          if (input.status === "Confirmed") {
            const start = new Date(booking.startDate);
            const end = new Date(booking.endDate);
            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) throw new Error("تواريخ الحجز غير صالحة.");
            // MySQL row lock serializes confirmations for the same listing.
            await tx.execute(sql`SELECT listing_id FROM listings WHERE listing_id = ${booking.listingId} FOR UPDATE`);
            const overlapping = await tx.select({ id: bookings.id }).from(bookings).where(and(
              eq(bookings.listingId, booking.listingId),
              eq(bookings.status, "Confirmed"),
              ne(bookings.id, booking.bookingId),
              lt(bookings.startDate, end),
              gt(bookings.endDate, start),
            )).limit(1);
            if (overlapping[0]) throw new Error("لا يمكن قبول الحجز لأن الفترة أصبحت محجوزة.");
          }
          return tx.update(bookings).set({ status: input.status }).where(and(eq(bookings.id, input.bookingId), eq(bookings.status, "Pending")));
        });
        if (Number(updated[0]?.affectedRows ?? 0) === 0) throw new Error("تم تحديث الحجز من مستخدم آخر؛ أعد تحميل الصفحة.");

        const accepted = input.status === "Confirmed";
        const title = accepted ? "تم قبول الحجز / Réservation acceptée" : "تم رفض الحجز / Réservation refusée";
        const message = accepted
          ? `تم قبول حجزك لـ «${bookingDetails[0].listingTitle}».\nVotre réservation pour «${bookingDetails[0].listingTitle}» a été acceptée.`
          : `تم رفض حجزك لـ «${bookingDetails[0].listingTitle}».\nVotre réservation pour «${bookingDetails[0].listingTitle}» a été refusée.`;
        await safeNotifyUser({
          userId: bookingDetails[0].renterId,
          type: accepted ? "booking_accepted" : "booking_rejected",
          title,
          message,
          href: "/my-bookings",
          entityType: "booking",
          entityId: bookingDetails[0].bookingId,
          email: bookingDetails[0].renterEmail ? { to: bookingDetails[0].renterEmail, subject: title, ...buildEmailContent(title, message, "/my-bookings") } : undefined,
        });
        return { success: true };
      }),
  }),

  payments: router({
    create: protectedProcedure
      .input(z.object({
        bookingId: z.number().int().positive(),
        method: z.enum(["cmi_card", "bank_transfer"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        const bookingRows = await db.select({
          id: bookings.id,
          renterId: bookings.renterId,
          listingId: bookings.listingId,
          startDate: bookings.startDate,
          endDate: bookings.endDate,
          totalPrice: bookings.totalPrice,
          commissionFee: bookings.commissionFee,
          status: bookings.status,
          cancellationPolicyVersion: bookings.cancellationPolicyVersion,
          cancellationPolicySnapshot: bookings.cancellationPolicySnapshot,
          cancellationPolicyFingerprint: bookings.cancellationPolicyFingerprint,
          cancellationPolicyAcceptedAt: bookings.cancellationPolicyAcceptedAt,
          cancellationPolicyAcceptedBy: bookings.cancellationPolicyAcceptedBy,
        }).from(bookings).where(eq(bookings.id, input.bookingId)).limit(1);
        const booking = bookingRows[0];
        if (!booking) throw new Error("الحجز غير موجود.");
        if (ctx.user!.role !== "admin" && booking.renterId !== ctx.user!.id) {
          throw new Error("لا يمكنك الدفع لحجز لا يخص حسابك.");
        }
        if (booking.status === "Cancelled") throw new Error("لا يمكن دفع حجز ملغى.");

        const existingPaymentRows = await db.select().from(payments)
          .where(and(eq(payments.bookingId, input.bookingId), eq(payments.payerId, booking.renterId)))
          .orderBy(desc(payments.createdAt)).limit(1);
        const existingPayment = existingPaymentRows[0];
        if (existingPayment) {
          if (existingPayment.method !== input.method) {
            throw new Error("يوجد دفع سابق لهذا الحجز بطريقة مختلفة.");
          }
          const existingInvoice = await db.select().from(invoices)
            .where(eq(invoices.paymentId, existingPayment.id)).limit(1);
          if (existingInvoice[0]) {
            return { payment: existingPayment, invoice: existingInvoice[0] };
          }
        }

        const settings = await db.select({
          vatRateBasisPoints: platformSettings.vatRateBasisPoints,
        }).from(platformSettings).limit(1);
        const vatRateBasisPoints = settings[0]?.vatRateBasisPoints ?? 2_000;
        const totals = calculateInvoiceTotals(booking.totalPrice, booking.commissionFee, vatRateBasisPoints);
        const paymentStatus = getSimulatedPaymentStatus(input.method);
        const providerPrefix = input.method === "cmi_card" ? "CMI-SIM" : "BANK-SIM";
        const providerReference = `${providerPrefix}-${randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;

        const [paymentInsert] = await db.insert(payments).values({
          bookingId: booking.id,
          payerId: booking.renterId,
          method: input.method,
          status: paymentStatus,
          amount: totals.total,
          currency: totals.currency,
          providerReference,
          simulated: true,
        });
        const paymentId = Number(paymentInsert.insertId);
        const [invoiceInsert] = await db.insert(invoices).values({
          invoiceNumber: createInvoiceNumber(booking.id),
          bookingId: booking.id,
          paymentId,
          payerId: booking.renterId,
          subtotal: totals.subtotal,
          commissionFee: totals.commissionFee,
          vatRateBasisPoints: totals.vatRateBasisPoints,
          vatAmount: totals.vatAmount,
          total: totals.total,
          currency: totals.currency,
          status: paymentStatus === "Succeeded" ? "Issued" : "Pending",
          cancellationPolicyVersion: booking.cancellationPolicyVersion ?? CANCELLATION_POLICY_VERSION,
          cancellationPolicySnapshot: booking.cancellationPolicySnapshot ?? CANCELLATION_POLICY_TEXT,
          cancellationPolicyFingerprint: booking.cancellationPolicyFingerprint ?? CANCELLATION_POLICY_FINGERPRINT,
          cancellationPolicyAcceptedAt: booking.cancellationPolicyAcceptedAt ?? new Date(),
          cancellationPolicyAcceptedBy: booking.cancellationPolicyAcceptedBy ?? booking.renterId,
        });
        const invoiceId = Number(invoiceInsert.insertId);
        const createdInvoice = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
        const createdPayment = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
        if (!createdInvoice[0] || !createdPayment[0]) throw new Error("تعذر حفظ تفاصيل الفاتورة.");

        let voucher: typeof bookingVouchers.$inferSelect | null = null;
        const requestOrigin = `${ctx.req.protocol}://${ctx.req.get("host")}`;
        if (paymentStatus === "Succeeded") {
          const existingVoucher = await db.select().from(bookingVouchers)
            .where(eq(bookingVouchers.bookingId, booking.id)).limit(1);
          if (existingVoucher[0]) {
            voucher = existingVoucher[0];
          } else {
            const code = createVoucherCode(booking.id);
            const voucherUrl = `${requestOrigin}/voucher/${code}`;
            const [voucherInsert] = await db.insert(bookingVouchers).values({
              bookingId: booking.id,
              renterId: booking.renterId,
              code,
              qrPayload: voucherUrl,
              status: "Issued",
            });
            const voucherRows = await db.select().from(bookingVouchers)
              .where(eq(bookingVouchers.id, Number(voucherInsert.insertId))).limit(1);
            voucher = voucherRows[0] ?? null;
          }

          const details = await db.select({
            listingTitle: listings.title,
            listingCity: listings.city,
            ownerId: listings.ownerId,
            ownerName: users.name,
            ownerEmail: users.email,
            ownerWhatsApp: users.whatsappPhone,
            renterName: users.name,
          }).from(listings)
            .leftJoin(users, eq(listings.ownerId, users.id))
            .where(eq(listings.id, booking.listingId)).limit(1);
          const detail = details[0];
          if (voucher && detail) {
            const voucherUrl = voucher.qrPayload;
            const renterMessage = buildVoucherRenterMessage(booking.id, detail.listingTitle, voucher.code, voucherUrl);
            const ownerMessage = buildVoucherOwnerMessage(booking.id, detail.listingTitle, booking.startDate, booking.endDate);
            await safeNotifyUser({
              userId: booking.renterId,
              type: "voucher_issued",
              title: "تذكرة الوصول الذكي جاهزة / Voucher prêt",
              message: renterMessage,
              href: `/voucher/${voucher.code}`,
              entityType: "voucher",
              entityId: voucher.id,
              email: ctx.user!.email ? { to: ctx.user!.email, subject: "B2-Rent — تذكرة الوصول الذكي", ...buildEmailContent("تذكرة الوصول الذكي جاهزة / Voucher prêt", renterMessage, voucherUrl) } : undefined,
            });
            if (detail.ownerId !== booking.renterId) {
              await safeNotifyUser({
                userId: detail.ownerId,
                type: "voucher_issued",
                title: "دفع جديد وتجهيز الخدمة / Paiement reçu",
                message: ownerMessage,
                href: "/host",
                entityType: "booking",
                entityId: booking.id,
                email: detail.ownerEmail ? { to: detail.ownerEmail, subject: "B2-Rent — دفع حجز جديد", ...buildEmailContent("دفع جديد وتجهيز الخدمة / Paiement reçu", ownerMessage, `${requestOrigin}/host`) } : undefined,
              });
            }
          }
        }
        return { payment: createdPayment[0], invoice: createdInvoice[0], voucher };
      }),
  }),

  vouchers: router({
    getByCode: protectedProcedure
      .input(z.object({ code: z.string().min(8).max(80) }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        const rows = await db.select({
          voucher: bookingVouchers,
          bookingId: bookings.id,
          renterId: bookings.renterId,
          startDate: bookings.startDate,
          endDate: bookings.endDate,
          totalPrice: bookings.totalPrice,
          bookingStatus: bookings.status,
          listingId: listings.id,
          listingTitle: listings.title,
          listingCategory: listings.category,
          listingCity: listings.city,
          listingImageUrl: listings.imageUrl,
          ownerId: listings.ownerId,
          ownerName: users.name,
          ownerEmail: users.email,
          ownerWhatsApp: users.whatsappPhone,
        }).from(bookingVouchers)
          .innerJoin(bookings, eq(bookingVouchers.bookingId, bookings.id))
          .innerJoin(listings, eq(bookings.listingId, listings.id))
          .leftJoin(users, eq(listings.ownerId, users.id))
          .where(eq(bookingVouchers.code, input.code)).limit(1);
        const result = rows[0];
        if (!result || result.voucher.status !== "Issued" || result.bookingStatus === "Cancelled" || (ctx.user!.role !== "admin" && result.renterId !== ctx.user!.id && result.ownerId !== ctx.user!.id)) {
          throw new TRPCError({ code: "NOT_FOUND", message: "تذكرة الوصول غير موجودة أو لا تخص حسابك." });
        }
        const qrCodeDataUrl = await QRCode.toDataURL(result.voucher.qrPayload, { width: 320, margin: 2 });
        const mapsUrl = createMapsSearchUrl(result.listingTitle, result.listingCity);
        return { ...result, qrCodeDataUrl, mapsUrl };
      }),
  }),

  invoices: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const query = db.select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        bookingId: invoices.bookingId,
        payerId: invoices.payerId,
        subtotal: invoices.subtotal,
        commissionFee: invoices.commissionFee,
        vatRateBasisPoints: invoices.vatRateBasisPoints,
        vatAmount: invoices.vatAmount,
        total: invoices.total,
        currency: invoices.currency,
        status: invoices.status,
        issuedAt: invoices.issuedAt,
        cancellationPolicyVersion: invoices.cancellationPolicyVersion,
        cancellationPolicySnapshot: invoices.cancellationPolicySnapshot,
        cancellationPolicyFingerprint: invoices.cancellationPolicyFingerprint,
        cancellationPolicyAcceptedAt: invoices.cancellationPolicyAcceptedAt,
        cancellationPolicyAcceptedBy: invoices.cancellationPolicyAcceptedBy,
        paymentId: invoices.paymentId,
        paymentMethod: payments.method,
        paymentStatus: payments.status,
        bookingStatus: bookings.status,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
        listingTitle: listings.title,
      }).from(invoices)
        .innerJoin(bookings, eq(invoices.bookingId, bookings.id))
        .innerJoin(payments, eq(invoices.paymentId, payments.id))
        .leftJoin(listings, eq(bookings.listingId, listings.id));
      if (ctx.user!.role === "admin") return query.orderBy(desc(invoices.issuedAt));
      return query.where(eq(invoices.payerId, ctx.user!.id)).orderBy(desc(invoices.issuedAt));
    }),

    getByBooking: protectedProcedure
      .input(z.object({ bookingId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        const rows = await db.select({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          bookingId: invoices.bookingId,
          payerId: invoices.payerId,
          subtotal: invoices.subtotal,
          commissionFee: invoices.commissionFee,
          vatRateBasisPoints: invoices.vatRateBasisPoints,
          vatAmount: invoices.vatAmount,
          total: invoices.total,
          currency: invoices.currency,
          status: invoices.status,
          issuedAt: invoices.issuedAt,
          cancellationPolicyVersion: invoices.cancellationPolicyVersion,
          cancellationPolicySnapshot: invoices.cancellationPolicySnapshot,
          cancellationPolicyFingerprint: invoices.cancellationPolicyFingerprint,
          cancellationPolicyAcceptedAt: invoices.cancellationPolicyAcceptedAt,
          cancellationPolicyAcceptedBy: invoices.cancellationPolicyAcceptedBy,
          paymentId: invoices.paymentId,
          paymentMethod: payments.method,
          paymentStatus: payments.status,
          bookingStatus: bookings.status,
          startDate: bookings.startDate,
          endDate: bookings.endDate,
          listingTitle: listings.title,
          city: listings.city,
        }).from(invoices)
          .innerJoin(bookings, eq(invoices.bookingId, bookings.id))
          .innerJoin(payments, eq(invoices.paymentId, payments.id))
          .leftJoin(listings, eq(bookings.listingId, listings.id))
          .where(eq(invoices.bookingId, input.bookingId)).limit(1);
        const invoice = rows[0];
        if (!invoice || (ctx.user!.role !== "admin" && invoice.payerId !== ctx.user!.id)) {
          throw new Error("الفاتورة غير موجودة أو لا تخص حسابك.");
        }
        return invoice;
      }),
  }),

  commercialLeaseContracts: router({
    create: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        leaseType: z.enum(["commercial", "professional"]),
        language: z.enum(["ar", "fr"]).default("fr"),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        const booking = await db.select().from(bookings).where(eq(bookings.id, input.bookingId)).limit(1);
        if (!booking[0] || booking[0].renterId !== ctx.user!.id) {
          throw new Error("لا يمكن إنشاء عقد لهذا الحجز.");
        }
        if (booking[0].status !== "Confirmed") {
          throw new Error("لا يمكن إنشاء عقد الكراء قبل اعتماد الحجز من المالك.");
        }
        const existing = await db.select().from(commercialLeaseContracts).where(eq(commercialLeaseContracts.bookingId, input.bookingId)).limit(1);
        if (existing[0]) {
          const stored = existing[0].pdfKey ? await storageGet(existing[0].pdfKey) : null;
          return { success: true, contractId: existing[0].id, reference: existing[0].reference, pdfUrl: stored?.url || null };
        }
        const listing = await db.select().from(listings).where(eq(listings.id, booking[0].listingId)).limit(1);
        if (!listing[0]) throw new Error("الإعلان المرتبط بالحجز غير موجود.");
        const landlord = await db.select({ name: users.name, commercialRegister: users.commercialRegister }).from(users).where(eq(users.id, listing[0].ownerId)).limit(1);
        const canonicalLandlordName = landlord[0]?.name || "المالك / الشركة المؤجرة";
        const canonicalLandlordRc = landlord[0]?.commercialRegister || null;
        const canonicalTenantName = ctx.user!.name || "المستأجر";
        const canonicalStartDate = new Date(booking[0].startDate);
        const canonicalEndDate = new Date(booking[0].endDate);
        const canonicalMonthlyRent = booking[0].totalPrice;
        const reference = `B2R-LEASE-${input.bookingId}-${Date.now().toString(36).toUpperCase()}`;
        const legalNotice = input.language === "ar"
          ? "تنبيه قانوني: هذا نموذج تقني عام، ويجب مراجعته واعتماده من طرف محامٍ أو موثق مغربي قبل التوقيع أو الاستعمال الفعلي."
          : "Avertissement légal : ce modèle technique doit être validé par un avocat ou un notaire au Maroc avant toute signature ou utilisation réelle.";
        const pdfBuffer = generateServerCommercialLeasePdf({
          reference,
          landlordName: canonicalLandlordName,
          landlordRc: canonicalLandlordRc,
          tenantName: canonicalTenantName,
          premises: listing[0].title,
          city: listing[0].city,
          startDate: canonicalStartDate.toISOString(),
          endDate: canonicalEndDate.toISOString(),
          monthlyRent: canonicalMonthlyRent,
          deposit: 0,
          purpose: input.leaseType,
          language: input.language,
        });
        const storedPdf = await storagePut(`contracts/${reference}.pdf`, pdfBuffer, "application/pdf");
        const [inserted] = await db.insert(commercialLeaseContracts).values({
          bookingId: input.bookingId,
          landlordId: listing[0].ownerId,
          tenantId: ctx.user!.id,
          reference,
          leaseType: input.leaseType,
          landlordName: canonicalLandlordName,
          landlordRc: canonicalLandlordRc,
          tenantName: canonicalTenantName,
          premises: listing[0].title,
          city: listing[0].city,
          startDate: canonicalStartDate,
          endDate: canonicalEndDate,
          monthlyRent: canonicalMonthlyRent,
          deposit: 0,
          legalNotice,
          pdfKey: storedPdf.key,
          status: "Generated",
        });
        const contractId = Number(inserted.insertId);
        let reminderTaskUid: string | null = null;
        try {
          const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
          const job = await createHeartbeatJob({
            name: `lease-end-reminder-${contractId}`,
            cron: "0 0 8 * * *",
            path: "/api/scheduled/lease-end-reminder",
            description: `تذكير انتهاء عقد الكراء ${reference} قبل 48 ساعة`,
          }, sessionToken);
          reminderTaskUid = job.taskUid;
          await db.update(commercialLeaseContracts)
            .set({ leaseEndReminderTaskUid: job.taskUid })
            .where(eq(commercialLeaseContracts.id, contractId));
        } catch (error) {
          console.warn("[LeaseReminder] Could not schedule contract reminder:", error instanceof Error ? error.message : String(error));
        }
        return { success: true, contractId, reference, pdfUrl: storedPdf.url, reminderTaskUid };
      }),

    getByBooking: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return null;
        const result = await db.select().from(commercialLeaseContracts)
          .where(and(eq(commercialLeaseContracts.bookingId, input.bookingId), eq(commercialLeaseContracts.tenantId, ctx.user!.id)))
          .limit(1);
        if (!result[0]) return null;
        const stored = result[0].pdfKey ? await storageGet(result[0].pdfKey) : null;
        return { ...result[0], pdfUrl: stored?.url || null };
      }),
  }),

  reviews: router({
    listByListing: publicProcedure
      .input(z.object({ listingId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const result = await db
          .select({
            id: reviews.id,
            rating: reviews.rating,
            comment: reviews.comment,
            createdAt: reviews.createdAt,
            userName: users.name,
          })
          .from(reviews)
          .innerJoin(users, eq(reviews.userId, users.id))
          .where(eq(reviews.listingId, input.listingId))
          .orderBy(desc(reviews.createdAt));
        return result;
      }),

    create: protectedProcedure
      .input(
        z.object({
          listingId: z.number(),
          bookingId: z.number().int().positive(),
          rating: z.number().int().min(1).max(5),
          comment: z.string().trim().min(3).max(2000),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        const booking = await db
          .select({
            id: bookings.id,
            renterId: bookings.renterId,
            listingId: bookings.listingId,
            status: bookings.status,
            endDate: bookings.endDate,
          })
          .from(bookings)
          .where(eq(bookings.id, input.bookingId))
          .limit(1);
        const ownedCompletedBooking = booking[0]
          && booking[0].renterId === ctx.user!.id
          && booking[0].listingId === input.listingId
          && booking[0].status === "Confirmed"
          && booking[0].endDate.getTime() <= Date.now();
        if (!ownedCompletedBooking) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "لا يمكن إضافة تقييم إلا بعد انتهاء حجز مؤكد تملكه.",
          });
        }
        const existing = await db
          .select({ id: reviews.id })
          .from(reviews)
          .where(and(eq(reviews.bookingId, input.bookingId), eq(reviews.userId, ctx.user!.id)))
          .limit(1);
        if (existing[0]) {
          throw new TRPCError({ code: "CONFLICT", message: "تم تقييم هذا الحجز مسبقاً." });
        }
        await db.insert(reviews).values({
          userId: ctx.user!.id,
          listingId: input.listingId,
          bookingId: input.bookingId,
          rating: input.rating,
          comment: input.comment,
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
