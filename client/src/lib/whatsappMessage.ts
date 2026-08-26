export type WhatsappMessageLanguage = "ar" | "fr" | "en";

export type WhatsappBookingMessageInput = {
  language: WhatsappMessageLanguage;
  bookingRef: string;
  listingTitle: string;
  startDate: string;
  endDate: string;
  total: number | string | null | undefined;
  currency?: string;
};

function formatTotal(
  total: WhatsappBookingMessageInput["total"],
  language: WhatsappMessageLanguage,
  currency: string,
) {
  if (total === null || total === undefined || total === "") {
    return language === "ar" ? "غير محدد" : language === "fr" ? "Non déterminé" : "Not available";
  }

  const numericTotal = typeof total === "number" ? total : Number(total);
  if (!Number.isFinite(numericTotal)) {
    return language === "ar" ? "غير محدد" : language === "fr" ? "Non déterminé" : "Not available";
  }

  const locale = language === "ar" ? "ar-MA" : language === "fr" ? "fr-MA" : "en-MA";
  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(numericTotal)} ${currency}`;
}

export function buildWhatsappBookingMessage({
  language,
  bookingRef,
  listingTitle,
  startDate,
  endDate,
  total,
  currency = "MAD",
}: WhatsappBookingMessageInput) {
  const formattedTotal = formatTotal(total, language, currency);

  if (language === "ar") {
    return `مرحباً، أرغب في التواصل بخصوص الحجز ${bookingRef} للعرض «${listingTitle}».\nمن: ${startDate}\nإلى: ${endDate}\nالسعر الإجمالي: ${formattedTotal}.`;
  }

  if (language === "en") {
    return `Hello, I would like to discuss booking ${bookingRef} for “${listingTitle}”.\nFrom: ${startDate}\nTo: ${endDate}\nTotal price: ${formattedTotal}.`;
  }

  return `Bonjour, je souhaite échanger au sujet de la réservation ${bookingRef} pour « ${listingTitle} ».\nDu : ${startDate}\nAu : ${endDate}\nPrix total : ${formattedTotal}.`;
}
