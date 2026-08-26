import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('B2-Rent SEO footer', () => {
  it('uses the approved hosted identity and verified contact channels', async () => {
    const source = await readFile(new URL('./Footer.tsx', import.meta.url), 'utf8');

    expect(source).toContain('/manus-storage/b2-rent-morocco-logo-pixel-alpha_35db21e6.png');
    expect(source).toContain('bg-transparent p-0');
    expect(source).toContain("const supportPhoneDisplay = '+212 754 382 654'");
    expect(source).toContain("tel:+212754382654");
    expect(source).toContain('b2rentt@gmail.com');
    expect(source).toContain('https://www.facebook.com/share/1D3rxRiw25/');
    expect(source).toContain('https://www.tiktok.com/@b2rent8?_r=1&_t=ZS-99BeDi0sIiK');
  });

  it('keeps internal destination and property links connected to supported search filters', async () => {
    const source = await readFile(new URL('./Footer.tsx', import.meta.url), 'utf8');

    expect(source).toContain('/search?type=car&city=${encodeURIComponent(city)}');
    expect(source).toContain('/search?type=property&category=${encodeURIComponent(query)}');
    expect(source).toContain("query: 'شقة'");
    expect(source).toContain("query: 'فيلا'");
    expect(source).toContain("query: 'مكتب'");
  });

  it('provides multilingual content, trust methods, legal links, and a usable language control', async () => {
    const source = await readFile(new URL('./Footer.tsx', import.meta.url), 'utf8');

    expect(source).toContain('const copy: Record<Language, FooterCopy>');
    expect(source).toContain('Visa');
    expect(source).toContain('Mastercard');
    expect(source).toContain('<FileSignature');
    expect(source).toContain('href="/privacy"');
    expect(source).toContain('href="/terms"');
    expect(source).toContain('href="/partner"');
    expect(source).toContain('aria-pressed={language === code}');
    expect(source).toContain('setLanguage(code)');
  });
});
