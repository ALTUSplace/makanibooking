import { describe, expect, it } from "vitest";

const projectUrl = process.env.VITE_SUPABASE_URL?.trim();
const anonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim();

describe("Supabase Auth production configuration", () => {
  it("accepts the configured public credentials with a lightweight read-only request", async () => {
    expect(projectUrl).toMatch(/^https:\/\/[^/]+\.supabase\.co$/);
    expect(anonKey).toBeTruthy();

    const response = await fetch(`${projectUrl}/auth/v1/settings`, {
      headers: {
        apikey: anonKey!,
      },
    });

    expect(response.status).toBeLessThan(500);
    expect(response.headers.get("content-type") ?? "").toContain("application/json");
  });
});
