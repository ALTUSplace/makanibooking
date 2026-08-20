import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { listings, bookings, reviews, users } from "../drizzle/schema";
import { eq, and, lte, gte, desc } from "drizzle-orm";
import { z } from "zod";

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
        const allListings = await db.select().from(listings).orderBy(desc(listings.createdAt));

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
        const result = await db.select().from(listings).where(eq(listings.id, input.id)).limit(1);
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

    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          category: z.string(),
          pricePerDay: z.number(),
          imageUrl: z.string().optional(),
          city: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db.insert(listings).values({
          ownerId: ctx.user.id,
          title: input.title,
          description: input.description,
          category: input.category,
          pricePerDay: input.pricePerDay,
          imageUrl: input.imageUrl,
          city: input.city,
          status: "Available",
        });
        return { success: true };
      }),
  }),

  reviews: router({
    list: publicProcedure
      .input(z.object({ listingId: z.number().optional() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        if (input.listingId) {
          return await db.select().from(reviews).where(eq(reviews.listingId, input.listingId)).orderBy(desc(reviews.createdAt));
        }
        return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
      }),

    create: protectedProcedure
      .input(
        z.object({
          bookingId: z.number(),
          listingId: z.number(),
          rating: z.number().min(1).max(5),
          comment: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db.insert(reviews).values({
          bookingId: input.bookingId,
          listingId: input.listingId,
          userId: ctx.user.id,
          rating: input.rating,
          comment: input.comment,
        });
        return { success: true };
      }),
  }),

  bookings: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      if (ctx.user.role === 'admin') {
        return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
      }
      return await db.select().from(bookings).where(eq(bookings.renterId, ctx.user.id));
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
          renterId: ctx.user.id,
          listingId: input.listingId,
          startDate: start,
          endDate: end,
          totalPrice: input.totalPrice,
          commissionFee,
          netProfit,
          status: "Confirmed", // Automatically confirmed upon mock payment gateway success
        });

        return { success: true, bookingId: inserted.insertId };
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
        if (ctx.user.role !== 'admin') {
          throw new Error("عذراً، هذه العملية مخصصة لمدير المنصة والمشرفين فقط.");
        }
        await db
          .update(bookings)
          .set({ status: input.status })
          .where(eq(bookings.id, input.bookingId));
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
