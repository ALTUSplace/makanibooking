import { describe, expect, it } from "vitest";
import { getRuntimeReadiness } from "./_core/runtimeReadiness";

const configuredRuntime = {
  runtimeTarget: "manus",
  databaseUrl: "mysql://example",
  cookieSecret: "test-secret",
  appId: "app-id",
  oAuthServerUrl: "https://auth.example.test",
  forgeApiUrl: "https://forge.example.test",
  forgeApiKey: "forge-key",
  supabaseUrl: "",
  supabaseDbUrl: "",
  supabaseServiceRoleKey: "",
  authRedirectUri: "",
  emailProviderApiKey: "",
  emailFromAddress: "",
  visionProviderApiKey: "",
  cronSecret: "",
  vercelAdaptersReady: false,
};

describe("runtime readiness", () => {
  it("reports ready without exposing configured values", () => {
    expect(getRuntimeReadiness(configuredRuntime)).toEqual({ ready: true, target: "manus", missing: [] });
  });

  it("reports only missing configuration key names", () => {
    const readiness = getRuntimeReadiness({ ...configuredRuntime, databaseUrl: "", forgeApiKey: "" });

    expect(readiness).toEqual({
      ready: false,
      target: "manus",
      missing: ["DATABASE_URL", "BUILT_IN_FORGE_API_KEY"],
    });
    expect(JSON.stringify(readiness)).not.toContain("test-secret");
    expect(JSON.stringify(readiness)).not.toContain("forge-key");
  });

  it("requires independent Vercel services and a completed adapter gate", () => {
    const readiness = getRuntimeReadiness({ ...configuredRuntime, runtimeTarget: "vercel" });

    expect(readiness).toEqual({
      ready: false,
      target: "vercel",
      missing: [
        "SUPABASE_URL",
        "SUPABASE_DB_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
        "AUTH_REDIRECT_URI",
        "EMAIL_PROVIDER_API_KEY",
        "EMAIL_FROM_ADDRESS",
        "VISION_PROVIDER_API_KEY",
        "CRON_SECRET",
        "B2RENT_VERCEL_ADAPTERS_READY",
      ],
    });
    expect(JSON.stringify(readiness)).not.toContain("test-secret");
  });
});
