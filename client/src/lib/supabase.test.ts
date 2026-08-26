import { describe, expect, it } from "vitest";
import { isValidSupabaseUrl } from "./supabase";

describe("Supabase browser configuration", () => {
  it("accepts HTTP and HTTPS URLs", () => {
    expect(isValidSupabaseUrl("https://example.supabase.co")).toBe(true);
    expect(isValidSupabaseUrl("http://localhost:54321")).toBe(true);
  });

  it("rejects missing, malformed, or non-web URLs", () => {
    expect(isValidSupabaseUrl(undefined)).toBe(false);
    expect(isValidSupabaseUrl("project.supabase.co")).toBe(false);
    expect(isValidSupabaseUrl("not-a-url")).toBe(false);
    expect(isValidSupabaseUrl("ftp://example.supabase.co")).toBe(false);
  });
});
