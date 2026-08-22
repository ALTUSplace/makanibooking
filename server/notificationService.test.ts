import { afterEach, describe, expect, it, vi } from "vitest";
import { buildEmailContent, sendTransactionalEmail } from "./notificationService";

describe("notificationService", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("escapes user-controlled content in the bilingual email template", () => {
    const content = buildEmailContent("<حجز>", "رسالة & تفاصيل\nLigne française", "https://b2rentmorocc-muehrc85.manus.space/my-bookings");

    expect(content.html).toContain("&lt;حجز&gt;");
    expect(content.html).toContain("رسالة &amp; تفاصيل");
    expect(content.html).toContain("https://b2rentmorocc-muehrc85.manus.space/my-bookings");
    expect(content.text).toContain("Ligne française");
  });

  it("does not attempt external delivery until the provider is configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("RESEND_FROM_EMAIL", "");

    const result = await sendTransactionalEmail({
      to: "tenant@example.com",
      subject: "Test",
      html: "<p>Test</p>",
      text: "Test",
    });

    expect(result).toEqual({ status: "skipped", reason: "email_provider_not_configured" });
  });

  it("rejects invalid sender configuration before making a network request", async () => {
    vi.stubEnv("RESEND_API_KEY", "resend_test_key");
    vi.stubEnv("RESEND_FROM_EMAIL", "not-an-email");
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const result = await sendTransactionalEmail({
      to: "tenant@example.com",
      subject: "Test",
      html: "<p>Test</p>",
      text: "Test",
    });

    expect(result).toEqual({ status: "failed", reason: "invalid_email_configuration" });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
