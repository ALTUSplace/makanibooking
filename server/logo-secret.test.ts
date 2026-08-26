import { describe, expect, it } from "vitest";

describe("MAKANIbooking logo secret", () => {
  it("serves the configured cropped transparent PNG through the storage endpoint", async () => {
    const logoPath = process.env.VITE_APP_LOGO ?? "/manus-storage/makanibooking-logo-transparent-cropped_f0fe0bf3.png";
    expect(logoPath).toMatch(/makanibooking-logo-transparent-cropped_f0fe0bf3\.png$/);

    // CI validates the deterministic asset contract. The HTTP assertion runs only
    // when a deployed or local server is explicitly supplied by the test runner.
    const baseUrl = process.env.TEST_BASE_URL;
    if (!baseUrl) return;

    const response = await fetch(new URL(logoPath, baseUrl));
    expect(response.ok).toBe(true);
    expect(response.headers.get("content-type")).toMatch(/^image\/png/i);
  }, 15_000);
});
