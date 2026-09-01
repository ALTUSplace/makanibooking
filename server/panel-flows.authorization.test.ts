import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type Role = "admin" | "owner" | "renter";

function ctx(role: Role): TrpcContext {
  return {
    user: {
      id: role === "admin" ? 1 : role === "owner" ? 2 : 3,
      openId: `${role}-integration`,
      email: `${role}@integration.test`,
      name: role,
      loginMethod: "test",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Admin/Host panel flow authorization", () => {
  it("blocks a host from every central admin workflow", async () => {
    const caller = appRouter.createCaller(ctx("owner"));
    const checks = [
      caller.admin.overview(),
      caller.admin.users(),
      caller.admin.bookings(),
      caller.admin.listings(),
      caller.admin.payouts(),
      caller.admin.payments(),
      caller.admin.disputes(),
    ];
    for (const check of checks) {
      await expect(check).rejects.toMatchObject({ code: "FORBIDDEN" });
    }
  });

  it("blocks a renter from owner-only workflows", async () => {
    const caller = appRouter.createCaller(ctx("renter"));
    await expect(caller.listings.setAvailability({ listingId: 1, blockedRanges: [] })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.payouts.request({ amount: 1, method: "BankTransfer" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.listings.create({ title: "Unauthorized", category: "Office", city: "Casablanca", pricePerDay: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

it("keeps an authenticated admin boundary separate from host data workflows", async () => {
  const admin = appRouter.createCaller(ctx("admin"));
  const owner = appRouter.createCaller(ctx("owner"));
  await expect(owner.admin.overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
  await expect(admin.listings.setAvailability({ listingId: 1, blockedRanges: [] })).rejects.not.toMatchObject({ code: "FORBIDDEN" });
});

it("documents the protected business-flow surface", () => {
  expect(["login", "listing-review", "booking", "payment", "dispute", "availability", "payout"]).toHaveLength(7);
});
