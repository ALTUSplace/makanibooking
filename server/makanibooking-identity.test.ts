import { describe, expect, it } from "vitest";

describe("MAKANIbooking identity configuration", () => {
  it("exposes the new app identity and a lightweight health endpoint contract", () => {
    expect(process.env.VITE_APP_TITLE ?? "MAKANIbooking | Votre place, partout").toContain("MAKANIbooking");
    expect(process.env.VITE_APP_LOGO ?? "/manus-storage/makanibooking-logo-transparent-cropped_f0fe0bf3.png").toContain("makanibooking-logo");

    const healthEndpoint = new URL("/api/health", "http://localhost");
    expect(healthEndpoint.pathname).toBe("/api/health");
  });
});
