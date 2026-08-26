import { describe, expect, it } from "vitest";
import { getSafeNextPath } from "./const";

describe("Supabase auth return path", () => {
  it("keeps an internal path with its query string", () => {
    expect(getSafeNextPath("/my-bookings?tab=history")).toBe("/my-bookings?tab=history");
  });

  it("rejects external and protocol-relative paths", () => {
    expect(getSafeNextPath("https://evil.example/login")).toBe("/");
    expect(getSafeNextPath("//evil.example/login")).toBe("/");
  });

  it("does not loop back to the register page", () => {
    expect(getSafeNextPath("/register")).toBe("/");
    expect(getSafeNextPath()).toBe("/");
  });
});
