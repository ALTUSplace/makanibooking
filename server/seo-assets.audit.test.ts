import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const indexHtml = readFileSync(
  new URL("../client/index.html", import.meta.url),
  "utf8",
);
const sitemap = readFileSync(
  new URL("../client/public/sitemap.xml", import.meta.url),
  "utf8",
);

describe("B2-Rent static SEO assets", () => {
  it("provides descriptive, canonical, and share metadata for the official site", () => {
    expect(indexHtml).toContain('name="description"');
    expect(indexHtml).toContain('rel="canonical" href="https://b2rentmorocc-muehrc85.manus.space/"');
    expect(indexHtml).toContain('property="og:site_name" content="B2-Rent Morocco"');
    expect(indexHtml).toContain('name="twitter:card" content="summary"');
    expect(indexHtml).toContain('"@type": "WebSite"');
  });

  it("keeps crawlable public routes in the sitemap with current modification dates", () => {
    expect(sitemap).toContain("https://b2rentmorocc-muehrc85.manus.space/search");
    expect(sitemap).toContain("/locations/marrakech-car-rental");
    expect(sitemap).toContain("<lastmod>2026-08-24</lastmod>");
  });
});
