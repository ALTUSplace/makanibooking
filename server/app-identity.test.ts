import { describe, expect, it } from "vitest";

const logoUrl = process.env.VITE_APP_LOGO;

(logoUrl ? describe : describe.skip)("MAKANIbooking app identity", () => {
  it("uses a valid configured application logo reference", async () => {
    expect(logoUrl).toMatch(/^(https:\/\/|\/manus-storage\/).+/);

    if (logoUrl?.startsWith("/")) return;

    const response = await fetch(logoUrl!, { method: "HEAD" });
    expect(response.ok).toBe(true);
    expect(response.headers.get("content-type") ?? "").toMatch(/^image\//);
  }, 15_000);
});
