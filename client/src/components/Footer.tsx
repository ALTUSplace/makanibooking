import { Link } from 'wouter';
import {
  Banknote,
  Building2,
  CarFront,
  ChevronLeft,
  CreditCard,
  Facebook,
  FileSignature,
  Globe2,
  Instagram,
  Landmark,
  Linkedin,
  Mail,
  MapPin,
  Music2,
  Phone,
  Plane,
  ShieldCheck,
} from 'lucide-react';
import { type Language, useLanguage } from '@/contexts/LanguageContext';

const logoUrl = "/manus-storage/b2-rent-morocco-logo-pixel-alpha_35db21e6.png";
const supportPhoneDisplay = '+212 754 382 654';
const supportPhoneHref = 'tel:+212754382654';
const supportEmail = 'b2rentt@gmail.com';
const facebookUrl = 'https://www.facebook.com/share/1D3rxRiw25/';
const tiktokUrl = 'https://www.tiktok.com/@b2rent8?_r=1&_t=ZS-99BeDi0sIiK';

type FooterCopy = {
  summary: string;
  serviceArea: string;
  contact: string;
  cars: string;
  realEstate: string;
  trust: string;
  legal: string;
  partner: string;
  paymentSecurity: string;
  language: string;
  follow: string;
  rights: string;
  serviceAreaLabel: string;
  emailLabel: string;
  phoneLabel: string;
  carLinks: Array<{ label: string; city: string; airport?: boolean }>;
  propertyLinks: Array<{ label: string; type: 'apartment' | 'villa' | 'office'; query: string }>;
};

const copy: Record<Language, FooterCopy> = {
  ar: {
    summary: 'منصة B2-Rent تجمع كراء السيارات والعقارات في المغرب في تجربة واحدة، مع حجوزات شفافة وعقود رقمية وتوقيع إلكتروني.',
    serviceArea: 'منطقة الخدمة: قرب مطار محمد الخامس، الدار البيضاء / الدروة',
    contact: 'التواصل والدعم',
    cars: 'وجهات كراء السيارات',
    realEstate: 'عقارات للإيجار',
    trust: 'الدفع والأمان',
    legal: 'روابط قانونية',
    partner: 'مساحة الشركاء',
    paymentSecurity: 'طرق دفع واضحة وحجز موثّق',
    language: 'اللغة',
    follow: 'تابع B2-Rent',
    rights: '© 2026 B2-Rent. جميع الحقوق محفوظة.',
    serviceAreaLabel: 'نطاق الخدمة',
    emailLabel: 'البريد الإلكتروني',
    phoneLabel: 'الدعم المباشر',
    carLinks: [
      { label: 'كراء السيارات في الدار البيضاء', city: 'الدار البيضاء' },
      { label: 'كراء السيارات في مطار محمد الخامس', city: 'مطار محمد الخامس', airport: true },
      { label: 'كراء السيارات في مراكش', city: 'مراكش' },
      { label: 'كراء السيارات في طنجة', city: 'طنجة' },
    ],
    propertyLinks: [
      { label: 'شقق للكراء في الدار البيضاء', type: 'apartment', query: 'شقة' },
      { label: 'فيلات للكراء في المغرب', type: 'villa', query: 'فيلا' },
      { label: 'مكاتب للاكتراء', type: 'office', query: 'مكتب' },
    ],
  },
  fr: {
    summary: 'B2-Rent réunit la location de voitures et l’immobilier au Maroc, avec réservations transparentes, contrats numériques et signature électronique.',
    serviceArea: 'Zone de service : près de l’aéroport Mohammed V, Casablanca / Deroua',
    contact: 'Contact et assistance',
    cars: 'Destinations voiture',
    realEstate: 'Immobilier à louer',
    trust: 'Paiement et sécurité',
    legal: 'Liens juridiques',
    partner: 'Espace partenaires',
    paymentSecurity: 'Paiement clair et réservation documentée',
    language: 'Langue',
    follow: 'Suivre B2-Rent',
    rights: '© 2026 B2-Rent. Tous droits réservés.',
    serviceAreaLabel: 'Zone de service',
    emailLabel: 'E-mail',
    phoneLabel: 'Support direct',
    carLinks: [
      { label: 'Location voiture Casablanca', city: 'الدار البيضاء' },
      { label: 'Location voiture Aéroport Mohammed V', city: 'مطار محمد الخامس', airport: true },
      { label: 'Location voiture Marrakech', city: 'مراكش' },
      { label: 'Location voiture Tanger', city: 'طنجة' },
    ],
    propertyLinks: [
      { label: 'Appartements à louer à Casablanca', type: 'apartment', query: 'شقة' },
      { label: 'Villas à louer au Maroc', type: 'villa', query: 'فيلا' },
      { label: 'Bureaux à louer', type: 'office', query: 'مكتب' },
    ],
  },
  en: {
    summary: 'B2-Rent brings car rentals and real estate in Morocco together, with transparent bookings, digital contracts, and electronic signatures.',
    serviceArea: 'Service area: near Mohammed V Airport, Casablanca / Deroua',
    contact: 'Contact and support',
    cars: 'Car rental destinations',
    realEstate: 'Properties for rent',
    trust: 'Payment and security',
    legal: 'Legal links',
    partner: 'Partner area',
    paymentSecurity: 'Clear payment and documented booking',
    language: 'Language',
    follow: 'Follow B2-Rent',
    rights: '© 2026 B2-Rent. All rights reserved.',
    serviceAreaLabel: 'Service area',
    emailLabel: 'Email',
    phoneLabel: 'Direct support',
    carLinks: [
      { label: 'Car rental in Casablanca', city: 'الدار البيضاء' },
      { label: 'Car rental at Mohammed V Airport', city: 'مطار محمد الخامس', airport: true },
      { label: 'Car rental in Marrakech', city: 'مراكش' },
      { label: 'Car rental in Tangier', city: 'طنجة' },
    ],
    propertyLinks: [
      { label: 'Apartments for rent in Casablanca', type: 'apartment', query: 'شقة' },
      { label: 'Villas for rent in Morocco', type: 'villa', query: 'فيلا' },
      { label: 'Offices for rent', type: 'office', query: 'مكتب' },
    ],
  },
};

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

function FooterLink({ href, icon, children }: { href: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={scrollToTop} className="group flex items-start gap-2 py-1.5 text-sm leading-6 text-slate-300 transition-colors hover:text-[var(--brand-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-navy-deep)]">
      <span className="mt-1 shrink-0 text-[var(--brand-gold)]">{icon ?? <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />}</span>
      <span>{children}</span>
    </Link>
  );
}

function FooterTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 text-sm font-black tracking-wide text-white">{children}</h2>;
}

export default function Footer() {
  const { direction, language, setLanguage } = useLanguage();
  const content = copy[language];

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[var(--brand-navy-deep)] text-slate-200" dir={direction}>
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--brand-gold)]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-[var(--brand-coral)]/10 blur-3xl" />

      <div className="container relative z-10 py-14 sm:py-16">
        <div className="grid gap-x-10 gap-y-12 xl:grid-cols-[1.45fr_1fr_1fr_1fr]">
          <section className="max-w-md" aria-label="B2-Rent">
            <Link href="/" onClick={scrollToTop} className="inline-flex rounded-xl bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-navy-deep)]">
              <img src={logoUrl} alt="B2-Rent Morocco" width={1647} height={668} className="h-14 w-36 bg-transparent object-contain sm:h-16 sm:w-40" />
            </Link>
            <p className="mt-5 text-sm leading-7 text-slate-300">{content.summary}</p>

            <div className="mt-6 space-y-3" aria-label={content.contact}>
              <div className="flex items-start gap-3 text-sm text-slate-200">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-[var(--brand-gold)]"><MapPin className="h-4 w-4" aria-hidden="true" /></span>
                <span className="pt-1 leading-5"><span className="block text-xs font-bold text-slate-400">{content.serviceAreaLabel}</span>{content.serviceArea}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-[var(--brand-gold)]"><Phone className="h-4 w-4" aria-hidden="true" /></span>
                <a className="font-semibold hover:text-[var(--brand-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)]" href={supportPhoneHref}><span className="sr-only">{content.phoneLabel}: </span>{supportPhoneDisplay}</a>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-[var(--brand-gold)]"><Mail className="h-4 w-4" aria-hidden="true" /></span>
                <a className="font-semibold hover:text-[var(--brand-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)]" href={`mailto:${supportEmail}`}><span className="sr-only">{content.emailLabel}: </span>{supportEmail}</a>
              </div>
            </div>
          </section>

          <nav aria-label={content.cars}>
            <FooterTitle>{content.cars}</FooterTitle>
            <ul>
              {content.carLinks.map(({ label, city, airport }) => (
                <li key={label}>
                  <FooterLink href={`/search?type=car&city=${encodeURIComponent(city)}`} icon={airport ? <Plane className="h-3.5 w-3.5" aria-hidden="true" /> : <CarFront className="h-3.5 w-3.5" aria-hidden="true" />}>{label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={content.realEstate}>
            <FooterTitle>{content.realEstate}</FooterTitle>
            <ul>
              {content.propertyLinks.map(({ label, type, query }) => (
                <li key={type}><FooterLink href={`/search?type=property&category=${encodeURIComponent(query)}`} icon={<Building2 className="h-3.5 w-3.5" aria-hidden="true" />}>{label}</FooterLink></li>
              ))}
            </ul>
          </nav>

          <section aria-label={content.trust}>
            <FooterTitle>{content.trust}</FooterTitle>
            <p className="mb-4 text-sm leading-6 text-slate-300">{content.paymentSecurity}</p>
            <div className="grid grid-cols-2 gap-2" aria-label={content.paymentSecurity}>
              <div className="flex min-h-12 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-bold text-white"><CreditCard className="h-4 w-4 text-[var(--brand-gold)]" aria-hidden="true" /><span>Visa</span></div>
              <div className="flex min-h-12 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-bold text-white"><CreditCard className="h-4 w-4 text-[var(--brand-gold)]" aria-hidden="true" /><span>Mastercard</span></div>
              <div className="flex min-h-12 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-bold text-white"><Banknote className="h-4 w-4 text-[var(--brand-gold)]" aria-hidden="true" /><span>{language === 'ar' ? 'الدفع عند الاستلام' : language === 'fr' ? 'Paiement à la remise' : 'Pay at pickup'}</span></div>
              <div className="flex min-h-12 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-bold text-white"><FileSignature className="h-4 w-4 text-[var(--brand-gold)]" aria-hidden="true" /><span>{language === 'ar' ? 'عقد رقمي' : language === 'fr' ? 'Contrat numérique' : 'Digital contract'}</span></div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-300"><ShieldCheck className="h-4 w-4 text-[var(--brand-gold)]" aria-hidden="true" /><span>{language === 'ar' ? 'الحجز موثق قبل التأكيد' : language === 'fr' ? 'Réservation documentée avant confirmation' : 'Booking documented before confirmation'}</span></div>
          </section>
        </div>

        <div className="mt-12 grid gap-8 border-t border-white/10 pt-10 md:grid-cols-[1fr_auto] md:items-start">
          <div className="grid gap-8 sm:grid-cols-2">
            <nav aria-label={content.legal}>
              <FooterTitle>{content.legal}</FooterTitle>
              <div className="grid sm:grid-cols-2 sm:gap-x-6">
                <FooterLink href="/privacy">{language === 'ar' ? 'سياسة الخصوصية' : language === 'fr' ? 'Politique de confidentialité' : 'Privacy policy'}</FooterLink>
                <FooterLink href="/terms">{language === 'ar' ? 'شروط الاستخدام' : language === 'fr' ? 'Conditions d’utilisation' : 'Terms of service'}</FooterLink>
                <FooterLink href="/terms">{language === 'ar' ? 'الإشعارات القانونية' : language === 'fr' ? 'Mentions légales' : 'Legal notices'}</FooterLink>
                <FooterLink href="/partner">{language === 'ar' ? 'دخول الشركاء' : language === 'fr' ? 'Connexion partenaires' : 'Partner login'}</FooterLink>
              </div>
            </nav>
            <section aria-label={content.follow}>
              <FooterTitle>{content.follow}</FooterTitle>
              <div className="flex items-center gap-2">
                <a href={facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook B2-Rent" className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-100 transition-colors hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)]"><Facebook className="h-4 w-4" aria-hidden="true" /></a>
                <a href={tiktokUrl} target="_blank" rel="noreferrer" aria-label="TikTok B2-Rent" className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-100 transition-colors hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)]"><Music2 className="h-4 w-4" aria-hidden="true" /></a>
                <span title="Instagram — رابط رسمي قريباً" aria-label="Instagram link pending" className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-500"><Instagram className="h-4 w-4" aria-hidden="true" /></span>
                <span title="LinkedIn — رابط رسمي قريباً" aria-label="LinkedIn link pending" className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-500"><Linkedin className="h-4 w-4" aria-hidden="true" /></span>
              </div>
            </section>
          </div>

          <section aria-label={content.language} className="md:text-end">
            <FooterTitle>{content.language}</FooterTitle>
            <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1" role="group" aria-label={content.language}>
              {([{ code: 'ar', label: 'عربي' }, { code: 'fr', label: 'Français' }, { code: 'en', label: 'English' }] as const).map(({ code, label }) => (
                <button type="button" key={code} onClick={() => setLanguage(code)} aria-pressed={language === code} className={`rounded-md px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)] ${language === code ? 'bg-[var(--brand-gold)] text-[var(--brand-navy-deep)]' : 'text-slate-300 hover:text-white'}`}>{label}</button>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>{content.rights}</p>
          <span className="inline-flex items-center gap-2"><Landmark className="h-3.5 w-3.5 text-[var(--brand-gold)]" aria-hidden="true" />{language === 'ar' ? 'منصة مغربية للسيارات والعقارات' : language === 'fr' ? 'Plateforme marocaine auto & immobilier' : 'Moroccan cars & real-estate platform'}</span>
        </div>
      </div>
    </footer>
  );
}
