import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const componentsRoot = path.resolve(import.meta.dirname);

describe("علامة B2-Rent القابلة للنشر", () => {
  it("لا تعتمد على مسار تخزين الاستضافة المتكاملة في شريطي التنقل والتذييل", () => {
    const navbar = fs.readFileSync(path.join(componentsRoot, "Navbar.tsx"), "utf8");
    const footer = fs.readFileSync(path.join(componentsRoot, "Footer.tsx"), "utf8");

    expect(navbar).not.toContain("/manus-storage/");
    expect(footer).not.toContain("/manus-storage/");
    expect(navbar).toContain("B2");
    expect(footer).toContain("RENT");
  });
});
