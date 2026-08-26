import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildWhatsappBookingMessage } from "../client/src/lib/whatsappMessage";

const successSource = readFileSync(
  new URL("../client/src/pages/Success.tsx", import.meta.url),
  "utf8",
);

describe("dynamic WhatsApp booking message", () => {
  it("includes the booking reference, listing, dates, and total in Arabic", () => {
    const message = buildWhatsappBookingMessage({
      language: "ar",
      bookingRef: "B2R-42",
      listingTitle: "Dacia Duster",
      startDate: "2026-09-02",
      endDate: "2026-09-05",
      total: 1350,
    });

    expect(message).toContain("B2R-42");
    expect(message).toContain("Dacia Duster");
    expect(message).toContain("2026-09-02");
    expect(message).toContain("2026-09-05");
    expect(message).toContain(`${new Intl.NumberFormat("ar-MA", { maximumFractionDigits: 2 }).format(1350)} MAD`);
  });

  it("keeps the selected language and uses a safe fallback for a missing total", () => {
    expect(buildWhatsappBookingMessage({
      language: "fr",
      bookingRef: "B2R-8",
      listingTitle: "Appartement centre-ville",
      startDate: "2026-10-10",
      endDate: "2026-10-12",
      total: null,
    })).toContain("Prix total : Non déterminé");

    expect(buildWhatsappBookingMessage({
      language: "en",
      bookingRef: "B2R-9",
      listingTitle: "City apartment",
      startDate: "2026-11-01",
      endDate: "2026-11-03",
      total: 900,
    })).toContain("Total price: 900 MAD");
  });

  it("URL-encodes the complete message before opening WhatsApp", () => {
    expect(successSource).toContain("encodeURIComponent(message)");
    expect(successSource).toContain("startDate: start");
    expect(successSource).toContain("endDate: end");
    expect(successSource).toContain("total: totalAmount");
    expect(successSource).toContain("currency,");
    expect(successSource).toContain("bookingStatus === 'Confirmed'");
  });
});
