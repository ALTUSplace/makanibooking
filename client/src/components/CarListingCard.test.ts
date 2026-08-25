import { describe, expect, it } from 'vitest';
import { getCarListingCardCopy } from './CarListingCard';

describe('getCarListingCardCopy', () => {
  it('يعرض تسميات الحجز العربية للبطاقة', () => {
    expect(getCarListingCardCopy('ar')).toMatchObject({
      listing: 'عرض سيارة',
      perDay: 'درهم/يوم',
      bookNow: 'احجز الآن',
    });
  });

  it('يعرض تسميات مستقلة بالفرنسية والإنجليزية', () => {
    expect(getCarListingCardCopy('fr').bookNow).toBe('Réserver');
    expect(getCarListingCardCopy('en').perDay).toBe('MAD / day');
  });
});
