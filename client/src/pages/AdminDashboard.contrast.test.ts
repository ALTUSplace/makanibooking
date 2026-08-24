import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("admin dashboard light-theme contrast", () => {
  it("keeps tab controls and summary labels readable on white cards", async () => {
    const source = await readFile(new URL("./AdminDashboard.tsx", import.meta.url), "utf8");

    expect(source).toContain('text-slate-950');
    expect(source).toContain('border-slate-200 bg-white');
    expect(source).toContain('font-bold text-[#0B3C5D] hover:bg-slate-100');
    expect(source).toContain('text-slate-700');
  });
});
