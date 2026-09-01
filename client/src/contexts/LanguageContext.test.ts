import { describe, expect, it } from "vitest";
import {
  getDirectionForLanguage,
  getLocaleForLanguage,
  getTranslation,
  SUPPORTED_LANGUAGES,
} from "./LanguageContext";

describe("LanguageContext i18n helpers", () => {
  it("supports Arabic, French, and English without a page reload", () => {
    expect(SUPPORTED_LANGUAGES).toEqual(["ar", "fr", "en"]);
    expect(getDirectionForLanguage("ar")).toBe("rtl");
    expect(getDirectionForLanguage("fr")).toBe("ltr");
    expect(getDirectionForLanguage("en")).toBe("ltr");
  });

  it("maps languages to Moroccan-friendly locales", () => {
    expect(getLocaleForLanguage("ar")).toBe("ar-MA");
    expect(getLocaleForLanguage("fr")).toBe("fr-MA");
    expect(getLocaleForLanguage("en")).toBe("en-GB");
  });

  it("falls back to English, then Arabic, then the key", () => {
    expect(getTranslation("en", "heroTitle")).toBe("Your trusted gateway to car and property rentals in Morocco");
    expect(getTranslation("en", "missing.key")).toBe("missing.key");
  });
});
