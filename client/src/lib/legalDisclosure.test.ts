import { describe, expect, it } from "vitest";
import { LEGAL_CONSENT_VERSION, getLegalDisclosurePlainText, legalDisclosure } from "./legalDisclosure";

describe("platform legal disclosure", () => {
  it("contains the four protection topics in Arabic and French", () => {
    for (const language of ["ar", "fr"] as const) {
      const text = getLegalDisclosurePlainText(language);
      expect(text).toContain(legalDisclosure[language].title);
      expect(text).toContain(legalDisclosure[language].sections[0].title);
      expect(text).toContain(legalDisclosure[language].sections[1].title);
      expect(text).toContain(legalDisclosure[language].sections[2].title);
      expect(text).toContain(legalDisclosure[language].sections[3].title);
    }
  });

  it("uses a versioned consent marker", () => {
    expect(LEGAL_CONSENT_VERSION).toBe("platform-protection-v1");
    expect(getLegalDisclosurePlainText("ar")).toContain("منصة B2-Rent هي وسيط تقني وإعلاني");
    expect(getLegalDisclosurePlainText("fr")).toContain("plateforme publicitaire et un intermédiaire technologique");
  });
});
