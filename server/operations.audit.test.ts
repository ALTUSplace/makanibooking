import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type User = NonNullable<TrpcContext["user"]>;

function contextFor(user: Partial<User> = {}): TrpcContext {
  const now = new Date();
  return {
    user: {
      id: 42,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
      ...user,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("operations router", () => {
  it("exposes message, refund, and admin audit procedures", () => {
    const caller = appRouter.createCaller(contextFor());
    expect(caller.messages).toBeDefined();
    expect(caller.refunds).toBeDefined();
    expect(caller.admin).toBeDefined();
  });

  it("rejects empty booking messages before any database work", async () => {
    const caller = appRouter.createCaller(contextFor());
    await expect(caller.messages.send({ bookingId: 1, body: "   " })).rejects.toThrow();
  });

  it("rejects invalid refund amounts at the input boundary", async () => {
    const caller = appRouter.createCaller(contextFor());
    await expect(caller.refunds.request({ bookingId: 1, amount: 0, reason: "سبب واضح" })).rejects.toThrow();
  });

  it("blocks non-admin users from reading the audit log", async () => {
    const caller = appRouter.createCaller(contextFor({ role: "user" }));
    await expect(caller.admin.auditLogs()).rejects.toThrow(/permission|صلاحية/i);
  });
});
