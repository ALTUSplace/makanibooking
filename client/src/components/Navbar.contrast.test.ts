import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("desktop navigation contrast", () => {
  it("uses an explicit readable light-theme color for inactive desktop links", async () => {
    const source = await readFile(new URL("./Navbar.tsx", import.meta.url), "utf8");

    expect(source).toContain("text-[#35566d]");
    expect(source).toContain("hover:text-[#082c45]");
  });

  it("keeps customer links focused and moves partner links behind an account control", async () => {
    const source = await readFile(new URL("./Navbar.tsx", import.meta.url), "utf8");

    expect(source).toContain("const primaryNavLinks");
    expect(source).toContain("const partnerNavLinks");
    expect(source).toContain("renderNavLinks(primaryNavLinks)");
    expect(source).toContain("renderNavLinks(partnerNavLinks, \"dropdown\")");
    expect(source).toContain("b2-header-account");
    expect(source).toContain("<Coins");
    expect(source).toContain("<Globe");
  });

  it("uses the hosted brand image in the mobile drawer instead of the retired text lockup", async () => {
    const source = await readFile(new URL("./Navbar.tsx", import.meta.url), "utf8");

    expect(source).toContain('/manus-storage/b2-rent-morocco-logo-transparent_088c06ab.png');
    expect(source).toContain('renderNavLinks(navLinks, "mobile")');
    expect(source).not.toContain("بي تو رينت");
  });
});
