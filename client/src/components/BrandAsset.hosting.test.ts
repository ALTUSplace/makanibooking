import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const componentsRoot = path.resolve(import.meta.dirname);

describe("علامة MAKANIbooking القابلة للنشر", () => {
  it("تستخدم أصل الشعار الثابت المعتمد في شريطي التنقل والتذييل", () => {
    const navbar = fs.readFileSync(path.join(componentsRoot, "Navbar.tsx"), "utf8");
    const footer = fs.readFileSync(path.join(componentsRoot, "Footer.tsx"), "utf8");
    const hostedLogo = "/manus-storage/makanibooking-logo_3354849c.png";

    expect(navbar).toContain(hostedLogo);
    expect(footer).toContain(hostedLogo);
  });
});
