import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectFile = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8');

describe('هوية B2-Rent Morocco', () => {
  const logoPath = '/manus-storage/b2-rent-morocco-logo_ee8a6cb0.jpg';

  it('يستخدم الشعار المرفوع في موضعي الهوية العامين', () => {
    expect(projectFile('client/src/components/Navbar.tsx')).toContain(logoPath);
    expect(projectFile('client/src/components/Footer.tsx')).toContain(logoPath);
  });

  it('يحافظ على لوحة الشعار: الكحلي والمرجاني والبرتقالي', () => {
    const styles = projectFile('client/src/index.css');

    expect(styles).toContain('--brand-navy: #003f70;');
    expect(styles).toContain('--brand-coral: #ff6b61;');
    expect(styles).toContain('--brand-orange: #ff9208;');
  });
});
