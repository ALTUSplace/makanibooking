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
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(listings).orderBy(desc(listings.createdAt));
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

        const commission = Math.round(input.totalPrice * 0.15); // 15% platform commission

        await db.insert(bookings).values({
          renterId: ctx.user.id,
          listingId: input.listingId,
          startDate: start,
          endDate: end,
          totalPrice: input.totalPrice,
          commissionFee: commission,
          status: "Pending",
        });

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
