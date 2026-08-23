import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("agency dashboard authorization", () => {
  it("keeps analytics and listing controls owner-only", async () => {
    const ctx: TrpcContext = {
      user: {
        id: 44,
        openId: "renter-dashboard-test",
        email: "renter-dashboard@example.com",
        name: "Renter",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    await expect(caller.agency.overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.agency.listings()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.listings.toggleAvailability({ listingId: 1, available: false })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.listings.remove({ id: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
