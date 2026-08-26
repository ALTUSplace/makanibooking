import { describe, expect, it } from "vitest";

describe("Supabase Auth environment contract", () => {
  it("accepts the configured public Supabase Auth credentials", async () => {
    const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_KEY;

    expect(url, "VITE_SUPABASE_URL or SUPABASE_URL must be configured").toBeTruthy();
    expect(anonKey, "VITE_SUPABASE_ANON_KEY or SUPABASE_KEY must be configured").toBeTruthy();

    const response = await fetch(`${url!.replace(/\/+$/, "")}/auth/v1/settings`, {
      headers: {
        apikey: anonKey!,
        Authorization: `Bearer ${anonKey}`,
      },
    });

    expect(response.ok, `Supabase Auth settings request failed with ${response.status}`).toBe(true);
  }, 15_000);
});
