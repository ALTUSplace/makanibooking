import { describe, expect, it } from "vitest";
import { getOAuthErrorMessage } from "./Register";

describe("getOAuthErrorMessage", () => {
  it("localizes disabled provider errors", () => {
    expect(getOAuthErrorMessage({ message: "Unsupported provider" }, "ar")).toContain("غير مفعّل");
    expect(getOAuthErrorMessage({ message: "Provider is not enabled" }, "fr")).toContain("pas encore activé");
    expect(getOAuthErrorMessage({ message: "provider disabled" }, "en")).toContain("not enabled");
  });

  it("localizes network errors", () => {
    expect(getOAuthErrorMessage({ message: "Failed to fetch" }, "ar")).toContain("تعذر الاتصال");
    expect(getOAuthErrorMessage({ message: "Invalid URL" }, "en")).toContain("couldn't reach");
  });

  it("falls back to a safe generic message", () => {
    expect(getOAuthErrorMessage({ message: "unknown error" }, "en")).toContain("could not be started");
  });
});
