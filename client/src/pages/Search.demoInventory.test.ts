import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('search demo inventory fallback', () => {
  it('uses the same fallback catalog as the homepage when operational results are empty', async () => {
    const source = await readFile(new URL('./Search.tsx', import.meta.url), 'utf8');

    expect(source).toContain("import { LISTINGS, ListingItem } from '@/data/b2rent'");
    expect(source).toContain('const catalogListings = useMemo');
    expect(source).toContain('serverListings.length > 0 ? serverListings : LISTINGS');
    expect(source).toContain('const isDemoInventory = serverListings.length === 0');
  });

  it('labels fallback results as view-only and keeps their detail links type-safe', async () => {
    const source = await readFile(new URL('./Search.tsx', import.meta.url), 'utf8');

    expect(source).toContain('هذه العروض متاحة للمعاينة فقط');
    expect(source).toContain('isDemo={isDemoInventory}');
    expect(source).toContain("isDemoInventory ? 'عرض التفاصيل التجريبية' : 'التفاصيل والحجز'");
    expect(source).toContain("const listingRoute = (item: ListingItem) => item.type === 'car' ? `/car/${item.id}` : `/property/${item.id}`");
  });
});
