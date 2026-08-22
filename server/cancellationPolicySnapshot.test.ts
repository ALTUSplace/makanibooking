import { describe, expect, it } from "vitest";
import {
  CANCELLATION_POLICY_FINGERPRINT,
  CANCELLATION_POLICY_TEXT,
  CANCELLATION_POLICY_VERSION,
  getCancellationPolicyFingerprint,
  getCancellationPolicyPlainText,
  getCancellationPolicySnapshotText,
} from "@shared/cancellationPolicySnapshot";

describe("cancellation policy snapshots", () => {
  it("keeps a stable bilingual snapshot and fingerprint", () => {
    const snapshot = getCancellationPolicySnapshotText();

    expect(snapshot).toBe(CANCELLATION_POLICY_TEXT);
    expect(snapshot).toContain("AR");
    expect(snapshot).toContain("FR");
    expect(snapshot).toContain("سياسة الإلغاء والاسترداد");
    expect(snapshot).toContain("Politique d'annulation et de remboursement");
    expect(getCancellationPolicyFingerprint()).toBe(CANCELLATION_POLICY_FINGERPRINT);
    expect(CANCELLATION_POLICY_VERSION).toBe("cancellation-refund-v1");
  });

  it("exposes language-specific text for invoice and audit displays", () => {
    expect(getCancellationPolicyPlainText("ar")).toContain("رسوماً للخدمة التقنية");
    expect(getCancellationPolicyPlainText("fr")).toContain("service technique");
    expect(getCancellationPolicyPlainText("ar")).not.toContain("Politique d'annulation");
  });
});
