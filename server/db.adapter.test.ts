import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { shouldUsePostgresAdapter } from "./db";

describe("database adapter contract", () => {
  it("keeps MySQL as the default when the feature flag is absent", () => {
    expect(shouldUsePostgresAdapter({ SUPABASE_DB_URL: "postgresql://db.example.test/app" })).toBe(false);
    expect(shouldUsePostgresAdapter({ B2RENT_VERCEL_ADAPTERS_READY: "false", SUPABASE_DB_URL: "postgresql://db.example.test/app" })).toBe(false);
    expect(shouldUsePostgresAdapter({ B2RENT_VERCEL_ADAPTERS_READY: "true", SUPABASE_DB_URL: "" })).toBe(false);
  });

  it("enables PostgreSQL only with both explicit prerequisites", () => {
    expect(shouldUsePostgresAdapter({
      B2RENT_VERCEL_ADAPTERS_READY: "true",
      SUPABASE_DB_URL: "postgresql://db.example.test/app",
    })).toBe(true);
  });

  it("keeps the generated Supabase schema free of the broken pgEnum pattern", () => {
    const schema = readFileSync(resolve(process.cwd(), "drizzle/pg-schema.ts"), "utf8");
    expect(schema).not.toContain("pgEnum");
    expect(schema).not.toContain("mysqlEnum");
    expect(schema).toContain('pgTable("users"');
    expect(schema).toContain('pgTable("listings"');
    expect(schema).not.toContain('pgSchema("b2rent")');
    expect(schema).toContain('varchar("open_id"');
    expect(schema).toContain('timestamp("created_at"');
  });
});
