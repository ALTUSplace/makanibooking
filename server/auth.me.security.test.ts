import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("auth.me security contract", () => {
  it("does not expose passwordHash or session secrets from the auth.me procedure", () => {
    const routers = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    const authBlock = routers.match(/auth:\s*router\(\{([\s\S]*?)\}\),\s*health:/)?.[1] ?? routers;

    expect(authBlock).not.toMatch(/passwordHash/);
    expect(authBlock).not.toMatch(/JWT_SECRET/);
    expect(authBlock).toMatch(/me:\s*publicProcedure/);
  });
});
