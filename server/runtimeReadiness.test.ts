import { describe, expect, it } from "vitest";
import { getRuntimeReadiness } from "./_core/runtimeReadiness";

const configuredRuntime = {
  databaseUrl: "mysql://example",
  cookieSecret: "test-secret",
  appId: "app-id",
  oAuthServerUrl: "https://auth.example.test",
  forgeApiUrl: "https://forge.example.test",
  forgeApiKey: "forge-key",
};

describe("runtime readiness", () => {
  it("reports ready without exposing configured values", () => {
    expect(getRuntimeReadiness(configuredRuntime)).toEqual({ ready: true, missing: [] });
  });

  it("reports only missing configuration key names", () => {
    const readiness = getRuntimeReadiness({ ...configuredRuntime, databaseUrl: "", forgeApiKey: "" });

    expect(readiness).toEqual({
      ready: false,
      missing: ["DATABASE_URL", "BUILT_IN_FORGE_API_KEY"],
    });
    expect(JSON.stringify(readiness)).not.toContain("test-secret");
    expect(JSON.stringify(readiness)).not.toContain("forge-key");
  });
});
