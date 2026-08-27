import { describe, expect, it } from "vitest";
import pg from "pg";

const { Client } = pg;

describe("Supabase PostgreSQL connection secret", () => {
  it("authenticates with a read-only SELECT 1 probe", async () => {
    const connectionString = process.env.SUPABASE_DB_URL;
    expect(connectionString, "SUPABASE_DB_URL must be configured").toMatch(/^postgres(?:ql)?:\/\//);

    const client = new Client({
      connectionString,
      connectionTimeoutMillis: 10_000,
      ssl: { rejectUnauthorized: false },
    });
    try {
      await client.connect();
      const result = await client.query("SELECT 1 AS ok");
      expect(result.rows[0]?.ok).toBe(1);
    } finally {
      await client.end().catch(() => {});
    }
  }, 20_000);
});
