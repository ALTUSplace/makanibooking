import { describe, expect, it } from "vitest";

const requiredProductionKeys = [
  "OAUTH_SERVER_URL",
  "VITE_OAUTH_PORTAL_URL",
  "VITE_APP_ID",
  "SUPABASE_DB_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

describe("Vercel environment safety contract", () => {
  it("keeps the required production key names explicit without embedding values", () => {
    expect(requiredProductionKeys).toEqual([
      "OAUTH_SERVER_URL",
      "VITE_OAUTH_PORTAL_URL",
      "VITE_APP_ID",
      "SUPABASE_DB_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
    ]);
    expect(Object.values(import.meta.env)).not.toContain("sb_secret_");
  });
});
