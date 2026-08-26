import { describe, expect, it } from "vitest";

describe("MAKANIbooking logo secret", () => {
  it("serves the configured cropped transparent PNG through the storage endpoint", async () => {
    const logoPath = process.env.VITE_APP_LOGO;
    expect(logoPath).toBeTruthy();
    expect(logoPath).toMatch(/makanibooking-logo-transparent-cropped_f0fe0bf3\.png$/);

    const baseUrl = process.env.TEST_BASE_URL ?? "http://localhost:3000";
    const response = await fetch(new URL(logoPath!, baseUrl));

    expect(response.ok).toBe(true);
    expect(response.headers.get("content-type")).toMatch(/^image\/png/i);
  }, 15_000);
});
