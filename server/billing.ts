import { randomUUID } from "node:crypto";

/**
 * Morocco's standard VAT rate used by this prototype invoice calculator.
 * The rate is stored as basis points so persisted invoices remain auditable.
 */
export const MOROCCO_VAT_RATE_BASIS_POINTS = 2_000;
export const PLATFORM_COMMISSION_RATE_BASIS_POINTS = 1_000;

export function calculateInvoiceTotals(subtotal: number, commissionFee = Math.round(subtotal * PLATFORM_COMMISSION_RATE_BASIS_POINTS / 10_000)) {
  if (!Number.isFinite(subtotal) || subtotal < 0) {
    throw new Error("Subtotal must be a non-negative finite number");
  }

  const vatAmount = Math.round(subtotal * MOROCCO_VAT_RATE_BASIS_POINTS / 10_000);
  return {
    subtotal,
    commissionFee,
    vatRateBasisPoints: MOROCCO_VAT_RATE_BASIS_POINTS,
    vatAmount,
    total: subtotal + vatAmount,
    netPartnerAmount: subtotal - commissionFee,
    currency: "MAD" as const,
  };
}

export function createInvoiceNumber(bookingId: number, now = new Date()) {
  const year = now.getUTCFullYear();
  const suffix = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `B2R-${year}-${bookingId}-${suffix}`;
}

export function getSimulatedPaymentStatus(method: "cmi_card" | "bank_transfer") {
  return method === "cmi_card" ? "Succeeded" as const : "Pending" as const;
}

export function getSimulatedBookingStatus(method: "cmi_card" | "bank_transfer") {
  return method === "cmi_card" ? "Confirmed" as const : "Pending" as const;
}
