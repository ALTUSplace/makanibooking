import { randomUUID } from "node:crypto";

export function createVoucherCode(bookingId: number) {
  return `B2V-${bookingId}-${randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
}

export function createMapsSearchUrl(title: string, city: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${title}, ${city}, Morocco`)}`;
}

export function buildVoucherRenterMessage(bookingId: number, title: string, code: string, url: string) {
  return `تم إصدار تذكرة الوصول الذكي للحجز #${bookingId} والإعلان «${title}». الكود: ${code}. افتح التذكرة: ${url}`;
}

export function buildVoucherOwnerMessage(bookingId: number, title: string, startDate: Date, endDate: Date) {
  return `تم تأكيد دفع الحجز #${bookingId} للإعلان «${title}». التواريخ: ${startDate.toISOString()} إلى ${endDate.toISOString()}. يرجى تجهيز الخدمة للزبون.`;
}
