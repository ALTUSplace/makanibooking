import { COOKIE_NAME } from "@shared/const";
import { parse as parseCookie } from "cookie";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, ownerProcedure, publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { listings, bookings, reviews, users, commercialLeaseContracts, notifications } from "../drizzle/schema";
import { eq, and, lte, gte, desc, count, isNull, inArray } from "drizzle-orm";
import { safeNotifyUser, buildEmailContent } from "./notificationService";
import { z } from "zod";
import { storageGet, storagePut } from "./storage";
import { generateServerCommercialLeasePdf } from "./commercialLeasePdf";
import { createHeartbeatJob } from "./_core/heartbeat";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
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

  admin: router({
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
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database unavailable');
        await db.update(bookings).set({ status: 'Cancelled' }).where(eq(bookings.id, input.bookingId));
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
        const allListings = await db.select().from(listings).where(inArray(listings.status, ['Approved', 'Available'])).orderBy(desc(listings.createdAt));

        // Dynamic Pricing Engine calculation
        return allListings.map(item => {
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
        const res = await db
          .select({
            start: bookings.startDate,
            end: bookings.endDate,
          })
          .from(bookings)
          .where(
            and(
              eq(bookings.listingId, input.listingId),
              eq(bookings.status, "Confirmed")
            )
          );
        return res.map(b => ({
          start: new Date(b.start).toISOString().split('T')[0],
          end: new Date(b.end).toISOString().split('T')[0],
        }));
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

    create: protectedProcedure
      .input(
        z.object({
          listingId: z.number(),
          startDate: z.string(),
          endDate: z.string(),
          totalPrice: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        const start = new Date(input.startDate);
        const end = new Date(input.endDate);
        const listing = await db.select().from(listings).where(eq(listings.id, input.listingId)).limit(1);
        if (!listing[0]) throw new Error("الإعلان غير موجود.");
        const owner = await db.select({ id: users.id, name: users.name, email: users.email })
          .from(users).where(eq(users.id, listing[0].ownerId)).limit(1);

        // Check availability conflict
        const conflicts = await db
          .select()
          .from(bookings)
          .where(
            and(
              eq(bookings.listingId, input.listingId),
              eq(bookings.status, "Confirmed"),
              lte(bookings.startDate, end),
              gte(bookings.endDate, start)
            )
          );

        if (conflicts.length > 0) {
          throw new Error("عذراً، المركبة أو العقار محجوز بالكامل في هذا النطاق الزمني.");
        }

        const commissionFee = Math.round(input.totalPrice * 0.10); // 10% platform commission
        const netProfit = input.totalPrice - commissionFee;

        const [inserted] = await db.insert(bookings).values({
          renterId: ctx.user!.id,
          listingId: input.listingId,
          startDate: start,
          endDate: end,
          totalPrice: input.totalPrice,
          commissionFee,
          netProfit,
          status: "Pending", // Owner approval is required before the booking becomes confirmed
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

        const acceptedTitle = "تم تأكيد الحجز / Réservation confirmée";
        const acceptedMessage = `تم تأكيد حجزك لـ «${listing[0].title}» من ${dateLabel}.\nVotre réservation pour «${listing[0].title}» est confirmée.`;
        await safeNotifyUser({
          userId: ctx.user!.id,
          type: "booking_accepted",
          title: acceptedTitle,
          message: acceptedMessage,
          href: "/my-bookings",
          entityType: "booking",
          entityId: bookingId,
          email: ctx.user!.email ? { to: ctx.user!.email, subject: acceptedTitle, ...buildEmailContent(acceptedTitle, acceptedMessage, "/my-bookings") } : undefined,
        });

        return { success: true, bookingId };
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
          startDate: bookings.startDate,
          endDate: bookings.endDate,
          listingTitle: listings.title,
          renterEmail: users.email,
        }).from(bookings)
          .innerJoin(listings, eq(bookings.listingId, listings.id))
          .leftJoin(users, eq(bookings.renterId, users.id))
          .where(eq(bookings.id, input.bookingId)).limit(1);
        if (!bookingDetails[0]) throw new Error("الحجز غير موجود.");
        await db.update(bookings).set({ status: input.status }).where(eq(bookings.id, input.bookingId));

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

  commercialLeaseContracts: router({
    create: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        leaseType: z.enum(["commercial", "professional"]),
        landlordName: z.string().min(2),
        tenantName: z.string().min(2),
        premises: z.string().min(3),
        city: z.string().min(2),
        startDate: z.string(),
        endDate: z.string(),
        monthlyRent: z.number().int().nonnegative(),
        deposit: z.number().int().nonnegative().default(0),
        language: z.enum(["ar", "fr"]).default("fr"),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        const booking = await db.select().from(bookings).where(eq(bookings.id, input.bookingId)).limit(1);
        if (!booking[0] || booking[0].renterId !== ctx.user!.id) {
          throw new Error("لا يمكن إنشاء عقد لهذا الحجز.");
        }
        const existing = await db.select().from(commercialLeaseContracts).where(eq(commercialLeaseContracts.bookingId, input.bookingId)).limit(1);
        if (existing[0]) {
          const stored = existing[0].pdfKey ? await storageGet(existing[0].pdfKey) : null;
          return { success: true, contractId: existing[0].id, reference: existing[0].reference, pdfUrl: stored?.url || null };
        }
        const listing = await db.select().from(listings).where(eq(listings.id, booking[0].listingId)).limit(1);
        if (!listing[0]) throw new Error("الإعلان المرتبط بالحجز غير موجود.");
        const reference = `B2R-LEASE-${input.bookingId}-${Date.now().toString(36).toUpperCase()}`;
        const legalNotice = input.language === "ar"
          ? "تنبيه قانوني: هذا نموذج تقني عام، ويجب مراجعته واعتماده من طرف محامٍ أو موثق مغربي قبل التوقيع أو الاستعمال الفعلي."
          : "Avertissement légal : ce modèle technique doit être validé par un avocat ou un notaire au Maroc avant toute signature ou utilisation réelle.";
        const pdfBuffer = generateServerCommercialLeasePdf({
          reference,
          landlordName: input.landlordName,
          tenantName: input.tenantName,
          premises: input.premises,
          city: input.city,
          startDate: input.startDate,
          endDate: input.endDate,
          monthlyRent: input.monthlyRent,
          deposit: input.deposit,
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
          landlordName: input.landlordName,
          tenantName: input.tenantName,
          premises: input.premises,
          city: input.city,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          monthlyRent: input.monthlyRent,
          deposit: input.deposit,
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
          bookingId: z.number().optional().default(1),
          rating: z.number().min(1).max(5),
          comment: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
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
