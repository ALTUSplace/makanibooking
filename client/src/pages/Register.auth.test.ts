import { describe, expect, it } from "vitest";
import { getAuthErrorMessage } from "./Register";

describe("getAuthErrorMessage", () => {
  it("translates invalid credentials", () => {
    expect(getAuthErrorMessage({ message: "Invalid login credentials" }, "ar")).toContain("البريد الإلكتروني");
    expect(getAuthErrorMessage({ message: "Invalid login credentials" }, "fr")).toContain("incorrect");
    expect(getAuthErrorMessage({ message: "Invalid login credentials" }, "en")).toContain("incorrect");
  });

  it("explains common account and rate-limit errors", () => {
    expect(getAuthErrorMessage({ message: "User already registered" }, "ar")).toContain("مسجل");
    expect(getAuthErrorMessage({ message: "Email not confirmed" }, "fr")).toContain("Confirmez");
    expect(getAuthErrorMessage({ message: "Too many requests", status: 429 }, "en")).toContain("Too many attempts");
  });

  it("falls back to a safe localized message", () => {
    expect(getAuthErrorMessage({ message: "unexpected provider error" }, "ar")).toContain("تعذر");
  });
});
