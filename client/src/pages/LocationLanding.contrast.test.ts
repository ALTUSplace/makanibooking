import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("LocationLanding card contrast", () => {
  it("uses explicit dark text on its intentionally white trust cards", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/LocationLanding.tsx"), "utf8");

    expect(source).toContain('className="font-bold text-slate-950"');
    expect(source).toContain('className="mt-2 text-sm leading-6 text-slate-700"');
    expect(source).not.toContain('leading-6 text-muted-foreground');
  });
});
