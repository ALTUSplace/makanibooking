import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("home search and service balance", () => {
  it("keeps cars and real estate equally present in the hero and removes the stale year", async () => {
    const source = await readFile(new URL("./Home.tsx", import.meta.url), "utf8");

    expect(source).toContain("سيارات موثوقة");
    expect(source).toContain("عقارات مختارة");
    expect(source).toContain("عرض مراجعة الأعمال</span>");
    expect(source).not.toContain("عرض مراجعة الأعمال 2025");
  });

  it("keeps search icons interactive and preserves a high-contrast primary action", async () => {
    const source = await readFile(new URL("./Home.tsx", import.meta.url), "utf8");

    expect(source).toContain("openDatePicker(pickupDateRef.current)");
    expect(source).toContain("openDatePicker(dropoffDateRef.current)");
    expect(source).toContain("openSelect(carCityRef.current)");
    expect(source).toContain("openSelect(propertyLocationRef.current)");
    expect(source).toContain("text-[var(--brand-navy-deep)]");
  });

  it("presents real-estate category cards alongside featured vehicle brands", async () => {
    const source = await readFile(new URL("./Home.tsx", import.meta.url), "utf8");

    expect(source).toContain("ماركات السيارات");
    expect(source).toContain("أنواع العقارات");
    expect(source).toContain('title: "شقق"');
    expect(source).toContain('title: "فيلات"');
    expect(source).toContain('title: "مكاتب"');
  });
});
