import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(fileURLToPath(new URL('./CarDetails.tsx', import.meta.url)), 'utf8');

describe('CarDetails demo listing guard', () => {
  it('يستبدل تدفق الحجز في العرض التجريبي برسالة معاينة صريحة', () => {
    expect(source).toContain('isFallbackListing ? (');
    expect(source).toContain('لا يتوفر تقويم مباشر أو طلب حجز أو دفع لهذا العرض حالياً.');
    expect(source).toContain('استعراض عروض السيارات');
  });

  it('لا يبقي رسالة تقويم العرض التجريبي القديمة بجانب تدفق الحجز', () => {
    expect(source).not.toContain('تقويم التوفر غير متصل لهذا العرض التجريبي.');
  });
});
