import { describe, expect, it } from "vitest";
import { escapeIcal, parseIcalEvents, toIcalDate, validateIcalImportUrl } from "../shared/ical";

describe("iCal helpers", () => {
  it("parses unfolded events and ignores malformed ranges", () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "BEGIN:VEVENT",
      "UID:one@example.com",
      "DTSTART;VALUE=DATE:20260825",
      "DTEND;VALUE=DATE:20260828",
      "SUMMARY:Maison\\, Casablanca",
      "END:VEVENT",
      "BEGIN:VEVENT",
      "DTSTART:20260830T120000Z",
      "DTEND:20260830T110000Z",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    expect(parseIcalEvents(ics)).toEqual([{ start: "2026-08-25", end: "2026-08-28", source: "ical", uid: "one@example.com", summary: "Maison, Casablanca" }]);
  });

  it("rejects unsafe import URLs and accepts HTTPS feeds", () => {
    expect(() => validateIcalImportUrl("http://calendar.example.com/a.ics")).toThrow();
    expect(() => validateIcalImportUrl("https://localhost/a.ics")).toThrow();
    expect(validateIcalImportUrl("https://calendar.example.com/a.ics")).toBe("https://calendar.example.com/a.ics");
  });

  it("escapes calendar text and formats UTC dates", () => {
    expect(escapeIcal("A, B; C\\D\nE")).toBe("A\\, B\\; C\\\\D\\nE");
    expect(toIcalDate(new Date("2026-08-22T12:34:56.000Z"))).toBe("20260822T123456Z");
  });
});
