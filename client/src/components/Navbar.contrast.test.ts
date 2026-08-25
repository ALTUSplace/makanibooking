import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("desktop navigation contrast", () => {
  it("uses an explicit readable light-theme color for inactive desktop links", async () => {
    const source = await readFile(new URL("./Navbar.tsx", import.meta.url), "utf8");

    expect(source).toContain("text-[#35566d]");
    expect(source).toContain("hover:text-[#082c45]");
  });

  it("keeps desktop navigation focused and moves secondary services behind a utility control", async () => {
    const source = await readFile(new URL("./Navbar.tsx", import.meta.url), "utf8");

    expect(source).toContain("const primaryNavLinks");
    expect(source).toContain("renderNavLinks(primaryNavLinks)");
    expect(source).toContain("setUtilitiesOpen");
    expect(source).toContain("Settings2");
  });

  it("uses the hosted brand image in the mobile drawer instead of the retired text lockup", async () => {
    const source = await readFile(new URL("./Navbar.tsx", import.meta.url), "utf8");

    expect(source).toContain('/manus-storage/b2-rent-morocco-logo_ee8a6cb0.jpg');
    expect(source).toContain("renderNavLinks(navLinks, true)");
    expect(source).not.toContain("بي تو رينت");
  });
});
