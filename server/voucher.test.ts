import { describe, expect, it } from "vitest";
import { buildVoucherOwnerMessage, buildVoucherRenterMessage, createMapsSearchUrl, createVoucherCode } from "../shared/voucher";

describe("voucher helpers", () => {
  it("creates a unique booking-scoped code", () => {
    const first = createVoucherCode(42);
    const second = createVoucherCode(42);
    expect(first).toMatch(/^B2V-42-[A-Z0-9]{10}$/);
    expect(second).toMatch(/^B2V-42-[A-Z0-9]{10}$/);
    expect(first).not.toBe(second);
  });

  it("creates an encoded Google Maps search URL", () => {
    const url = createMapsSearchUrl("مكتب النخيل", "الدار البيضاء");
    expect(url).toContain("https://www.google.com/maps/search/?api=1&query=");
    expect(url).toContain("%D9");
  });

  it("keeps the renter and owner messages tied to the same booking", () => {
    const start = new Date("2026-09-01T12:00:00.000Z");
    const end = new Date("2026-09-03T12:00:00.000Z");
    expect(buildVoucherRenterMessage(7, "Car Casablanca", "B2V-7-ABC1234567", "https://example.com/voucher/B2V-7-ABC1234567")).toContain("#7");
    expect(buildVoucherOwnerMessage(7, "Car Casablanca", start, end)).toContain("#7");
    expect(buildVoucherOwnerMessage(7, "Car Casablanca", start, end)).toContain(start.toISOString());
  });
});
