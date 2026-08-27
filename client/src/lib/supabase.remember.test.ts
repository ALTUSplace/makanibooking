import { describe, expect, it } from "vitest";
import { getRememberMePreference, prepareRememberedLogin, setRememberMePreference } from "./supabase";

describe("remember-me session preference", () => {
  it("defaults to a persistent session when browser storage is unavailable", () => {
    expect(getRememberMePreference()).toBe(true);
  });

  it("is safe to update outside a browser and never receives a password", () => {
    expect(() => setRememberMePreference(false)).not.toThrow();
    expect(() => prepareRememberedLogin(false)).not.toThrow();
  });
});
