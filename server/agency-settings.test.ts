import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("agency settings access", () => {
  it("rejects non-owner accounts before reading agency data", async () => {
    const ctx: TrpcContext = {
      user: {
        id: 22,
        openId: "renter-test",
        email: "renter@example.com",
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
    await expect(caller.agency.settings()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.storage.uploadAgencyLogo({
      fileName: "logo.png",
      mimeType: "image/png",
      contentBase64: "aGVsbG8=",
    })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
