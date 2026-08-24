import { describe, expect, it } from "vitest";

const requiredEnvironmentKeys = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const hasPooledDatabaseUrl = /^postgres(?:ql)?:\/\//.test(
  process.env.SUPABASE_DB_URL ?? ""
);
const hasServiceCredentials = requiredEnvironmentKeys.every(key => Boolean(process.env[key]));

(hasServiceCredentials ? describe : describe.skip)("Supabase production credentials", () => {
  it("connects to health and REST metadata endpoints using server-only configuration", async () => {
    for (const key of requiredEnvironmentKeys) {
      expect(process.env[key], `${key} must be configured`).toBeTruthy();
    }

    const projectUrl = process.env.SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    expect(projectUrl).toMatch(/^https:\/\/[^/]+\.supabase\.co$/);

    const headers = {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    };

    const [healthResponse, restResponse] = await Promise.all([
      fetch(`${projectUrl}/auth/v1/health`, { headers }),
      fetch(`${projectUrl}/rest/v1/`, { headers }),
    ]);

    expect(healthResponse.status).toBe(200);
    expect(restResponse.status).toBe(200);
  });

  (hasPooledDatabaseUrl ? it : it.skip)(
    "has a pooled PostgreSQL URL ready for Drizzle and Vercel",
    () => {
      expect(process.env.SUPABASE_DB_URL).toMatch(/^postgres(?:ql)?:\/\//);
    }
  );
});
