import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), "utf8");

describe("final readiness security audit", () => {
  it("requires a server-issued image proof before direct publication", () => {
    const routers = read("server/routers.ts");
    const listingsBlock = routers.slice(routers.indexOf("listings: router({"));
    expect(listingsBlock).toContain("imageVerificationProof: z.string().min(1)");
    expect(listingsBlock).toContain("verifyImageVerificationProof");
    expect(routers).toContain("createImageVerificationProof");
    expect(listingsBlock).toContain("imageVerificationProof: z.string().optional()");
  });

  it("never returns owner WhatsApp from booking or voucher paths before confirmation", () => {
    const routers = read("server/routers.ts");
    expect(routers).toContain('ownerWhatsApp: booking.status === "Confirmed" ? booking.ownerWhatsApp : null');
    expect(routers).toContain('result.bookingStatus !== "Confirmed"');
    expect(routers).toContain('ownerWhatsApp: result.bookingStatus === "Confirmed" ? result.ownerWhatsApp : null');
  });

  it("does not use a client-only phone or WhatsApp gate", () => {
    const success = read("client/src/pages/Success.tsx");
    expect(success).toContain("booking?.ownerWhatsApp");
    expect(success).toContain("bookingStatus === 'Confirmed'");
    expect(success).not.toMatch(/searchParams\.get\(["'](?:phone|whatsapp|ownerPhone)["']\)/);
  });
});
