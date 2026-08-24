import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/HostingReadinessBanner.tsx"), "utf8");

describe("HostingReadinessBanner", () => {
  it("checks the safe health endpoint only on Vercel and links to the official site", () => {
    expect(source).toContain('hostname.endsWith(".vercel.app")');
    expect(source).toContain('fetch("/api/health"');
    expect(source).toContain("https://b2rentmorocc-muehrc85.manus.space");
  });

  it("keeps Arabic, French, and English preview guidance available", () => {
    expect(source).toContain("نسخة تجريبية");
    expect(source).toContain("Version de test");
    expect(source).toContain("Preview version");
  });
});
