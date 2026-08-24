import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("desktop navigation contrast", () => {
  it("uses an explicit readable light-theme color for inactive desktop links", async () => {
    const source = await readFile(new URL("./Navbar.tsx", import.meta.url), "utf8");

    expect(source).toContain("text-[#35566d]");
    expect(source).toContain("hover:text-[#082c45]");
  });
});
