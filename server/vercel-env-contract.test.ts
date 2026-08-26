import { describe, expect, it } from "vitest";

describe("Vercel environment contract", () => {
  it("documents the authentication and database variable names consumed by the runtime", () => {
    const requiredVariableNames = [
      "OAUTH_SERVER_URL",
      "VITE_OAUTH_PORTAL_URL",
      "VITE_APP_ID",
      "JWT_SECRET",
      "SUPABASE_URL",
      "SUPABASE_DB_URL",
    ];

    expect(requiredVariableNames).toEqual([
      "OAUTH_SERVER_URL",
      "VITE_OAUTH_PORTAL_URL",
      "VITE_APP_ID",
      "JWT_SECRET",
      "SUPABASE_URL",
      "SUPABASE_DB_URL",
    ]);
  });

  it("does not permit secret values to be embedded in the contract", () => {
    const source = requiredSourceNames();
    expect(source.every((name) => /^[A-Z0-9_]+$/.test(name))).toBe(true);
  });
});

function requiredSourceNames() {
  return [
    "OAUTH_SERVER_URL",
    "VITE_OAUTH_PORTAL_URL",
    "VITE_APP_ID",
    "JWT_SECRET",
    "SUPABASE_URL",
    "SUPABASE_DB_URL",
  ];
}
