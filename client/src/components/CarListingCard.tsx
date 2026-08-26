import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { MapPin, ShieldCheck } from 'lucide-react';
import { OptimizedImage } from '@/components/OptimizedImage';
import { useLanguage, type Language } from '@/contexts/LanguageContext';

export type CarListingCardItem = {
  id: string;
  title: string;
  city: string;
  providerName: string;
  pricePerUnit: number;
  image: string;
};

type CardCopy = {
  listing: string;
  perDay: string;
  bookNow: string;
  viewDemo: string;
  missingImage: string;
};

export function getCarListingCardCopy(language: Language): CardCopy {
  if (language === 'fr') {
    return {
      listing: 'Annonce voiture',
      perDay: 'MAD / jour',
      bookNow: 'Réserver',
      viewDemo: 'Voir la démo',
      missingImage: 'Aucune image disponible',
    };
  }

  if (language === 'en') {
    return {
      listing: 'Car listing',
      perDay: 'MAD / day',
      bookNow: 'Book now',
      viewDemo: 'View demo',
      missingImage: 'No image available',
    };
  }

  return {
    listing: 'عرض سيارة',
    perDay: 'درهم/يوم',
    bookNow: 'احجز الآن',
    viewDemo: 'عرض التفاصيل التجريبية',
    missingImage: 'لا توجد صورة متاحة',
  };
}

function formatPrice(value: number, language: Language) {
  return new Intl.NumberFormat(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-MA' : 'en-MA', {
    maximumFractionDigits: 0,
  }).format(value);
}

type CarListingCardProps = {
  item: CarListingCardItem;
  detailsHref: string;
  isDemo?: boolean;
  imageActions?: ReactNode;
  className?: string;
};

/**
 * بطاقة سيارات مشتركة للواجهة العامة. لا تدّعي اعتماد وكالة لأن نموذج بيانات
 * الإعلان لا يتضمن حالة تحقق للوكالة؛ تعرض فقط حقول الإعلان المنشور فعلياً.
 */
export function CarListingCard({ item, detailsHref, isDemo = false, imageActions, className = '' }: CarListingCardProps) {
  const { language, direction } = useLanguage();
  const copy = getCarListingCardCopy(language);

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm transition-shadow duration-300 hover:shadow-xl ${className}`}
      dir={direction}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {item.image ? (
          <OptimizedImage
            src={item.image}
            srcSet={`${item.image} 800w`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            alt={item.title}
            loading="lazy"
            decoding="async"
            width={800}
            height={600}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-500">
            {copy.missingImage}
          </div>
        )}

        <span className="absolute end-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          {copy.listing}
        </span>
        {imageActions}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-slate-900">{item.title}</h3>
            <p className="mt-1 flex items-center gap-1 truncate text-sm text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--brand-orange)]" aria-hidden="true" />
              <span className="truncate">{item.city} · {item.providerName}</span>
            </p>
          </div>
          <p className="shrink-0 text-end text-2xl font-bold text-[var(--brand-orange)]">
            {formatPrice(item.pricePerUnit, language)}
            <span className="mt-0.5 block text-xs font-normal text-slate-500">{copy.perDay}</span>
          </p>
        </div>

        <Link
          href={detailsHref}
          className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--brand-navy)] px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[var(--brand-navy-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2"
        >
          {isDemo ? copy.viewDemo : copy.bookNow}
        </Link>
      </div>
    </article>
  );
}
