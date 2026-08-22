export type CalendarRange = {
  start: string;
  end: string;
  source: "ical" | "manual" | "booking";
  uid?: string;
  summary?: string;
};

const DATE_ONLY = /^\d{8}$/;
const DATE_TIME = /^(\d{8})T(\d{6})(Z)?$/;

function unfoldIcs(input: string) {
  return input.replace(/\r?\n[ \t]/g, "").split(/\r?\n/).map(line => line.trim()).filter(Boolean);
}

function parseIcsDate(value: string) {
  const normalized = value.split(";").pop()?.trim() ?? "";
  if (DATE_ONLY.test(normalized)) {
    return `${normalized.slice(0, 4)}-${normalized.slice(4, 6)}-${normalized.slice(6, 8)}`;
  }
  const match = normalized.match(DATE_TIME);
  if (!match) return null;
  const [, date, time, utc] = match;
  const iso = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4, 6)}${utc ? "Z" : ""}`;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

function unescapeIcs(value: string) {
  return value.replace(/\\n/gi, " ").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\").trim();
}

export function parseIcalEvents(input: string, maxEvents = 200): CalendarRange[] {
  if (typeof input !== "string" || input.length > 1_000_000) throw new Error("ملف iCal غير صالح أو يتجاوز الحجم المسموح.");
  const lines = unfoldIcs(input);
  const ranges: CalendarRange[] = [];
  let event: Record<string, string> | null = null;
  for (const line of lines) {
    if (line.toUpperCase() === "BEGIN:VEVENT") { event = {}; continue; }
    if (line.toUpperCase() === "END:VEVENT") {
      if (event) {
        const start = event.DTSTART ? parseIcsDate(event.DTSTART) : null;
        const end = event.DTEND ? parseIcsDate(event.DTEND) : start;
        if (start && end && start < end) ranges.push({ start, end, source: "ical", uid: event.UID, summary: event.SUMMARY ? unescapeIcs(event.SUMMARY) : undefined });
      }
      event = null;
      if (ranges.length >= maxEvents) break;
      continue;
    }
    if (!event) continue;
    const separator = line.indexOf(":");
    if (separator < 1) continue;
    const key = line.slice(0, separator).split(";")[0].toUpperCase();
    if (["DTSTART", "DTEND", "UID", "SUMMARY"].includes(key)) event[key] = line.slice(separator + 1);
  }
  return ranges;
}

export function validateIcalImportUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("رابط iCal يجب أن يستخدم HTTPS.");
  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname.endsWith(".local") || hostname.startsWith("10.") || hostname.startsWith("192.168.") || hostname.startsWith("172.16.")) {
    throw new Error("رابط iCal داخلي أو غير آمن.");
  }
  return url.toString();
}

export function toIcalDate(date: Date) {
  const iso = date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return iso;
}

export function escapeIcal(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}
