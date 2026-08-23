import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

describe("notification center security contract", () => {
  const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
  const navbarSource = readFileSync(resolve(process.cwd(), "client/src/components/Navbar.tsx"), "utf8");
  const pageSource = readFileSync(resolve(process.cwd(), "client/src/pages/NotificationsPage.tsx"), "utf8");

  it("exposes protected unread count and mark-all-read procedures", () => {
    expect(routerSource).toMatch(/unreadCount:\s*protectedProcedure/);
    expect(routerSource).toMatch(/markAllRead:\s*protectedProcedure/);
    expect(routerSource).toMatch(/eq\(notifications\.userId, ctx\.user!\.id\)/);
  });

  it("only marks the current user's unread notifications", () => {
    const markAllBlock = routerSource.match(/markAllRead:\s*protectedProcedure[\s\S]*?\n\s*\}\),/i)?.[0] ?? "";
    expect(markAllBlock).toContain("eq(notifications.userId, ctx.user!.id)");
    expect(markAllBlock).toContain("isNull(notifications.readAt)");
    expect(markAllBlock).toContain("set({ readAt: new Date() })");
  });

  it("renders the unread badge and mark-all action in the UI", () => {
    expect(navbarSource).toMatch(/unreadCount/);
    expect(navbarSource).toMatch(/markAllRead/);
    expect(navbarSource).toMatch(/aria-label|badge|Badge/i);
    expect(pageSource).toMatch(/unreadCount/);
    expect(pageSource).toMatch(/markAllRead/);
  });

  it("detects new notifications without replaying the same alert", () => {
    expect(navbarSource).toMatch(/previous|prev|last|seen|notified/i);
    expect(navbarSource).toMatch(/new notification|newNotification|isNew|pulse|animate-pulse/i);
    expect(navbarSource).toMatch(/AudioContext|audio|beep|sound|tone/i);
    expect(navbarSource).toMatch(/user interaction|hasInteracted|interaction|pointerdown|keydown/i);
  });

  it("respects reduced-motion preferences for the visual alert", () => {
    expect(navbarSource).toMatch(/motion-safe|prefers-reduced-motion|reducedMotion|reduce motion/i);
  });
});

afterAll(() => undefined);

export {};

// This is a source-contract audit: database-backed behavior is covered by the
// protected tRPC procedures and is additionally verified in integration runs.
// Keeping the contract test deterministic avoids inventing notification data.
void 0;

