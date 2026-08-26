import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("home search and service balance", () => {
  it("keeps cars and real estate equally present in the localized hero", async () => {
    const source = await readFile(new URL("./Home.tsx", import.meta.url), "utf8");

    expect(source).toContain("const heroCopy = language === 'fr'");
    expect(source).toContain("Trouvez une voiture ou un bien au Maroc, rapidement.");
    expect(source).toContain("ابحث عن سيارة أو عقار في المغرب، بسرعة.");
    expect(source).toContain("{heroCopy.cars}");
    expect(source).toContain("{heroCopy.properties}");
    expect(source).toContain("dir={direction}");
  });

  it("starts the hero directly with the prominent title without introductory badges", async () => {
    const source = await readFile(new URL("./Home.tsx", import.meta.url), "utf8");

    expect(source).toContain("{heroCopy.title}");
    expect(source).not.toContain("heroCopy.trust");
    expect(source).not.toContain("heroCopy.mobile");
  });

  it("keeps search icons interactive and preserves a high-contrast primary action", async () => {
    const source = await readFile(new URL("./Home.tsx", import.meta.url), "utf8");

    expect(source).toContain("openDatePicker(pickupDateRef.current)");
    expect(source).toContain("openDatePicker(dropoffDateRef.current)");
    expect(source).toContain("openSelect(carCityRef.current)");
    expect(source).toContain("openSelect(propertyLocationRef.current)");
    expect(source).toContain("text-[var(--brand-navy-deep)]");
  });

  it("binds the visible search form labels and action to the active language", async () => {
    const source = await readFile(new URL("./Home.tsx", import.meta.url), "utf8");

    expect(source).toContain("searchTypeLabel: 'Type de recherche'");
    expect(source).toContain("searchTypeLabel: 'Search type'");
    expect(source).toContain("searchTypeLabel: 'نوع البحث'");
    expect(source).toContain("{heroCopy.carCityLabel}");
    expect(source).toContain("{heroCopy.searchSubmit}");
    expect(source).toContain("aria-label={heroCopy.searchTypeLabel}");
  });

  it("presents real-estate category cards alongside featured vehicle brands", async () => {
    const source = await readFile(new URL("./Home.tsx", import.meta.url), "utf8");

    expect(source).toContain("ماركات السيارات");
    expect(source).toContain("أنواع العقارات");
    expect(source).toContain('title: "شقق"');
    expect(source).toContain('title: "فيلات"');
    expect(source).toContain('title: "مكاتب"');
  });

  it("derives destination counters from active listings and sends cards to supported searches", async () => {
    const source = await readFile(new URL("./Home.tsx", import.meta.url), "utf8");

    expect(source).toContain("const destinationInventory = quickDestinations.map");
    expect(source).toContain("carCount: listingsInCity.filter");
    expect(source).toContain("propertyCount: listingsInCity.filter");
    expect(source).toContain("const selectHeroDestination");
    expect(source).toContain("/locations/mohammed-v-airport-car-rental");
    expect(source).toContain("setLocation(`/search?city=${encodeURIComponent(destination.city)}`)");
    expect(source).toContain("onClick={() => selectHeroDestination(destination)}");
  });

  it("uses only search parameters understood by the results page", async () => {
    const source = await readFile(new URL("./Home.tsx", import.meta.url), "utf8");

    expect(source).not.toContain("propType=");
    expect(source).toContain("category=${encodeURIComponent(propertyCategoryQuery[propType])}");
    expect(source).toContain("maxPrice=${encodeURIComponent(maxPrice)}");
    expect(source).toContain("startDate=${encodeURIComponent(pickupDate)}");
    expect(source).toContain("endDate=${encodeURIComponent(dropoffDate)}");
  });

  it("routes all fallback inventory to valid demo detail paths instead of booking actions", async () => {
    const source = await readFile(new URL("./Home.tsx", import.meta.url), "utf8");

    expect(source).toContain("function getListingPath(item");
    expect(source).toContain("item.type === 'car' ? `/car/${item.id}` : `/property/${item.id}`");
    expect(source).toContain("isDemo");
    expect(source).toContain("عرض التفاصيل التجريبية");
    expect(source).toContain("ضمن هذه النسخة التجريبية");
  });
});
