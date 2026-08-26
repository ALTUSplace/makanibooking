import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/OptimizedImage';
import { CarListingCard } from '@/components/CarListingCard';
import { Search, MapPin, Building2, Car, ShieldCheck, ArrowRight, CheckCircle2, Award, Clock, Bot, Send, Mic, Bookmark, Check, Calendar, DollarSign, Filter, Phone, BriefcaseBusiness, House, Plane } from 'lucide-react';
import { PARTNERS, LISTINGS, ListingItem } from '@/data/b2rent';
import { SmartRecommendations } from '@/components/SmartRecommendations';
import { FAQSection } from '@/components/FAQSection';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

function getListingPath(item: { id: string; type: string }) {
  return item.type === 'car' ? `/car/${item.id}` : `/property/${item.id}`;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { language, direction, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'cars' | 'properties'>('cars');

  const heroCopy = language === 'fr'
    ? {
      cars: 'Location de voitures',
      properties: 'Immobilier',
      title: 'Trouvez une voiture ou un bien au Maroc, rapidement.',
      subtitle: 'Comparez les offres publiées et consultez leurs détails dans cette version de démonstration.',
      destinations: 'Disponibilités par destination',
      activeListings: 'Calculé à partir des annonces actives',
      destinationHint: 'Choisissez une destination pour consulter les offres',
      availability: 'Annonces actives',
      explore: 'Explorer les offres',
      brands: 'Marques et catégories à découvrir',
      swipe: 'Faites glisser pour explorer',
      carsCount: 'voiture(s)',
      propertyCount: 'bien(s) / espace(s)',
      searchTypeLabel: 'Type de recherche',
      carCityLabel: 'Ville ou agence',
      pickupDateLabel: 'Date de prise en charge',
      dropoffDateLabel: 'Date de restitution',
      propertyCityLabel: 'Zone / ville',
      propertyTypeLabel: 'Type de bien',
      maxPriceLabel: 'Budget maximum (MAD / nuit)',
      openCities: 'Ouvrir la liste des villes',
      openPickup: 'Ouvrir le calendrier de prise en charge',
      openDropoff: 'Ouvrir le calendrier de restitution',
      searchSubmit: 'Rechercher et afficher les offres',
    }
    : language === 'en'
      ? {
        cars: 'Car rentals',
        properties: 'Real estate',
        title: 'Find a car or property in Morocco, fast.',
        subtitle: 'Compare published listings and explore their details in this demonstration version.',
        destinations: 'Availability by destination',
        activeListings: 'Calculated from active listings',
        destinationHint: 'Choose a destination to view listings',
        availability: 'Active listings',
        explore: 'Explore listings',
        brands: 'Brands and property categories to explore',
        swipe: 'Swipe to explore',
        carsCount: 'car(s)',
        propertyCount: 'property / space(s)',
        searchTypeLabel: 'Search type',
        carCityLabel: 'City or agency',
        pickupDateLabel: 'Pickup date',
        dropoffDateLabel: 'Return date',
        propertyCityLabel: 'Area / city',
        propertyTypeLabel: 'Property type',
        maxPriceLabel: 'Maximum budget (MAD / night)',
        openCities: 'Open the city list',
        openPickup: 'Open the pickup date picker',
        openDropoff: 'Open the return date picker',
        searchSubmit: 'Search and display listings',
      }
      : {
        cars: 'كراء السيارات',
        properties: 'العقارات',
        title: 'ابحث عن سيارة أو عقار في المغرب، بسرعة.',
        subtitle: 'قارن العروض المنشورة، واستكشف تفاصيلها ضمن هذه النسخة التجريبية.',
        destinations: 'التوفر حسب الوجهة',
        activeListings: 'محسوب من الإعلانات النشطة',
        destinationHint: 'اضغط على الوجهة لعرض العروض',
        availability: 'إعلانات نشطة',
        explore: 'اكتشف العروض',
        brands: 'علامات وفئات جاهزة للاكتشاف',
        swipe: 'اسحب للتصفح',
        carsCount: 'سيارة',
        propertyCount: 'عقار/مساحة',
        searchTypeLabel: 'نوع البحث',
        carCityLabel: 'المدينة أو الوكالة',
        pickupDateLabel: 'تاريخ الاستلام',
        dropoffDateLabel: 'تاريخ التسليم',
        propertyCityLabel: 'المنطقة / المدينة',
        propertyTypeLabel: 'نوع العقار',
        maxPriceLabel: 'الحد الأقصى للسعر (درهم/ليلة)',
        openCities: 'فتح قائمة المدن',
        openPickup: 'فتح تقويم تاريخ الاستلام',
        openDropoff: 'فتح تقويم تاريخ التسليم',
        searchSubmit: 'بحث متقدم وعرض النتائج الفورية',
      };

  // Search states for Cars
  const [carCity, setCarCity] = useState('الدار البيضاء');
  const [pickupDate, setPickupDate] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');

  // Search states for Properties
  const [propLocation, setPropLocation] = useState('مراكش');
  const [propType, setPropType] = useState('apartment');
  const [maxPrice, setMaxPrice] = useState('2000');
  const carCityRef = useRef<HTMLSelectElement>(null);
  const pickupDateRef = useRef<HTMLInputElement>(null);
  const dropoffDateRef = useRef<HTMLInputElement>(null);
  const propertyLocationRef = useRef<HTMLSelectElement>(null);

  const openSelect = (select: HTMLSelectElement | null) => {
    if (!select) return;
    select.focus();
    select.click();
  };

  const openDatePicker = (input: HTMLInputElement | null) => {
    if (!input) return;
    input.focus();
    try {
      input.showPicker?.();
    } catch {
      input.click();
    }
  };

  // Database listings formatted as unified items
  const { data: dbListings = [] } = trpc.listings.list.useQuery();
  const activeListings = dbListings.length > 0 ? dbListings.map(item => ({
    id: String(item.id),
    title: item.title,
    category: item.category === 'property' ? 'عقار' : 'سيارة',
    type: item.category,
    pricePerUnit: item.pricePerDay,
    image: item.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
    city: item.city || 'الدار البيضاء',
    providerName: 'بيانات الإعلان من B2-Rent',
    specs: {
      transmission: 'أوتوماتيك',
      fuel: 'ديزل / بنزين',
      seats: '5'
    }
  })) : LISTINGS;

  const quickDestinations = [
    { id: 'casablanca', city: 'الدار البيضاء', label: t('cityCasablanca'), helper: t('cityCasablancaHelper'), icon: MapPin },
    { id: 'marrakech', city: 'مراكش', label: t('cityMarrakech'), helper: t('cityMarrakechHelper'), icon: MapPin },
    { id: 'tangier', city: 'طنجة', label: t('cityTangier'), helper: t('cityTangierHelper'), icon: MapPin },
    { id: 'agadir', city: 'أغادير', label: t('cityAgadir'), helper: t('cityAgadirHelper'), icon: MapPin },
    { id: 'cmn', city: 'الدار البيضاء', label: t('airportMohammedV'), helper: t('airportMohammedVHelper'), icon: Plane },
  ] as const;

  const destinationInventory = quickDestinations.map((destination) => {
    const listingsInCity = activeListings.filter((listing) => listing.city === destination.city);
    return {
      ...destination,
      carCount: listingsInCity.filter((listing) => listing.type === 'car').length,
      propertyCount: listingsInCity.filter((listing) => listing.type !== 'car').length,
    };
  });

  const availableBrands = ['Dacia', 'Renault'].filter((brand) =>
    activeListings.some((listing) => listing.type === 'car' && listing.title.toLowerCase().includes(brand.toLowerCase())),
  );

  const browseRailItems = [
    ...availableBrands.map((brand) => ({ label: brand, href: `/search?type=car&brand=${encodeURIComponent(brand)}`, kind: 'car' as const })),
    { label: t('apartments'), href: `/search?type=property&category=${encodeURIComponent('شقة')}`, kind: 'property' as const },
    { label: t('villas'), href: `/search?type=property&category=${encodeURIComponent('فيلا')}`, kind: 'property' as const },
    { label: t('offices'), href: '/search?type=office', kind: 'property' as const },
  ];

  const propertyCategoryQuery: Record<string, string> = {
    apartment: 'شقة',
    villa: 'فيلا',
    studio: 'استوديو',
  };

  const selectHeroDestination = (destination: typeof quickDestinations[number]) => {
    if (destination.id === 'cmn') {
      setLocation('/locations/mohammed-v-airport-car-rental');
      return;
    }
    setLocation(`/search?city=${encodeURIComponent(destination.city)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'cars') {
      setLocation(`/search?type=car&city=${encodeURIComponent(carCity)}&startDate=${encodeURIComponent(pickupDate)}&endDate=${encodeURIComponent(dropoffDate)}`);
    } else {
      setLocation(`/search?type=property&city=${encodeURIComponent(propLocation)}&category=${encodeURIComponent(propertyCategoryQuery[propType])}&maxPrice=${encodeURIComponent(maxPrice)}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col" dir={direction}>

      {/* Hero: a balanced visual entry point for vehicles and real estate. */}
      <section className="relative isolate overflow-hidden bg-[var(--brand-navy)] px-4 pb-10 pt-7 text-white md:pb-16 md:pt-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--brand-orange)_1px,transparent_1px)] opacity-15 [background-size:28px_28px]"></div>
        <div className="pointer-events-none absolute -right-24 top-14 h-56 w-56 rounded-full bg-[var(--brand-orange)]/20 blur-3xl md:h-80 md:w-80"></div>
        <div className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-[var(--brand-coral)]/20 blur-3xl md:h-72 md:w-72"></div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--brand-navy-deep)]/70 to-transparent"></div>

        <div className="container relative z-10 mx-auto max-w-6xl space-y-5 text-center md:space-y-7">
          <h1 className="mx-auto max-w-4xl text-3xl font-black leading-[1.25] tracking-tight sm:text-4xl md:text-6xl md:leading-tight">
            {heroCopy.title}
          </h1>

          <p className="mx-auto max-w-2xl text-xs leading-relaxed text-slate-200 sm:text-sm md:text-base">
            {heroCopy.subtitle}
          </p>

          {/* Tabbed Search Bar (Cars vs Properties) */}
          <div className="mx-auto max-w-4xl rounded-2xl border border-white/20 bg-white/10 p-3 text-right shadow-2xl backdrop-blur-2xl md:rounded-3xl md:p-6">
            {/* Tabs Header */}
            <div className="mb-4 flex gap-2 border-b border-white/10 pb-3 md:mb-6 md:pb-4" role="tablist" aria-label={heroCopy.searchTypeLabel}>
              <button
                type="button"
                onClick={() => setActiveTab('cars')}
                role="tab"
                aria-selected={activeTab === 'cars'}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-full border px-2 py-2.5 text-xs font-extrabold transition-all sm:px-4 sm:text-sm ${
                  activeTab === 'cars'
                    ? 'border-[var(--brand-amber)] bg-[var(--brand-amber)] text-[var(--brand-navy-deep)] shadow-lg shadow-[var(--brand-orange)]/30'
                    : 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
                }`}
              >
                <Car className="h-5 w-5 stroke-[1.9]" aria-hidden="true" />
                <span>{heroCopy.cars}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('properties')}
                role="tab"
                aria-selected={activeTab === 'properties'}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-full border px-2 py-2.5 text-xs font-extrabold transition-all sm:px-4 sm:text-sm ${
                  activeTab === 'properties'
                    ? 'border-[var(--brand-amber)] bg-[var(--brand-amber)] text-[var(--brand-navy-deep)] shadow-lg shadow-[var(--brand-orange)]/30'
                    : 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
                }`}
              >
                <Building2 className="h-5 w-5 stroke-[1.9]" aria-hidden="true" />
                <span>{heroCopy.properties}</span>
              </button>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="space-y-3 md:space-y-4">
              {activeTab === 'cars' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">{heroCopy.carCityLabel}</label>
                    <div className="relative">
                      <button type="button" onClick={() => openSelect(carCityRef.current)} className="absolute end-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]" aria-label={heroCopy.openCities}>
                        <MapPin className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <select
                        ref={carCityRef}
                        value={carCity}
                        onChange={(e) => setCarCity(e.target.value)}
                        className="w-full bg-slate-900/90 text-white border border-white/20 rounded-xl py-3 pr-11 pl-4 text-sm focus:outline-none focus:border-[#E57C23] min-h-12"
                      >
                        <option value="الدار البيضاء">الدار البيضاء</option>
                        <option value="مراكش">مراكش</option>
                        <option value="أغادير">أغادير</option>
                        <option value="طنجة">طنجة</option>
                        <option value="الرباط">الرباط</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">{heroCopy.pickupDateLabel}</label>
                    <div className="relative">
                      <button type="button" onClick={() => openDatePicker(pickupDateRef.current)} className="absolute end-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]" aria-label={heroCopy.openPickup}>
                        <Calendar className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <input
                        ref={pickupDateRef}
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full bg-slate-900/90 text-white border border-white/20 rounded-xl py-3 pr-11 pl-4 text-sm focus:outline-none focus:border-[#E57C23] min-h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">{heroCopy.dropoffDateLabel}</label>
                    <div className="relative">
                      <button type="button" onClick={() => openDatePicker(dropoffDateRef.current)} className="absolute end-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]" aria-label={heroCopy.openDropoff}>
                        <Calendar className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <input
                        ref={dropoffDateRef}
                        type="date"
                        value={dropoffDate}
                        onChange={(e) => setDropoffDate(e.target.value)}
                        className="w-full bg-slate-900/90 text-white border border-white/20 rounded-xl py-3 pr-11 pl-4 text-sm focus:outline-none focus:border-[#E57C23] min-h-12"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">{heroCopy.propertyCityLabel}</label>
                    <div className="relative">
                      <button type="button" onClick={() => openSelect(propertyLocationRef.current)} className="absolute end-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]" aria-label={heroCopy.openCities}>
                        <MapPin className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <select
                        ref={propertyLocationRef}
                        value={propLocation}
                        onChange={(e) => setPropLocation(e.target.value)}
                        className="w-full bg-slate-900/90 text-white border border-white/20 rounded-xl py-3 pr-11 pl-4 text-sm focus:outline-none focus:border-[#E57C23] min-h-12"
                      >
                        <option value="مراكش">مراكش (جيليز، النخيل)</option>
                        <option value="الدار البيضاء">الدار البيضاء (أنفا، المعاريف)</option>
                        <option value="طنجة">طنجة (كورنيش، مالاباطا)</option>
                        <option value="الرباط">الرباط (أكدال، السويسي)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">{heroCopy.propertyTypeLabel}</label>
                    <div className="relative">
                      <Building2 className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-400" />
                      <select
                        value={propType}
                        onChange={(e) => setPropType(e.target.value)}
                        className="w-full bg-slate-900/90 text-white border border-white/20 rounded-xl py-3 pr-11 pl-4 text-sm focus:outline-none focus:border-[#E57C23] min-h-12"
                      >
                        <option value="apartment">شقة فاخرة</option>
                        <option value="villa">فيلا بمسبح</option>
                        <option value="studio">استوديو مودرن</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">{heroCopy.maxPriceLabel}</label>
                    <div className="relative">
                      <DollarSign className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-400" />
                      <select
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full bg-slate-900/90 text-white border border-white/20 rounded-xl py-3 pr-11 pl-4 text-sm focus:outline-none focus:border-[#E57C23] min-h-12"
                      >
                        <option value="1000">أقل من 1000 درهم</option>
                        <option value="2500">أقل من 2500 درهم</option>
                        <option value="5000">أقل من 5000 درهم</option>
                        <option value="10000">أكثر من 5000 درهم</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-1 md:pt-2">
                <Button
                  type="submit"
                  className="w-full bg-[var(--brand-amber)] hover:bg-[var(--brand-amber-dark)] text-[var(--brand-navy-deep)] font-black py-3.5 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base shadow-xl shadow-[var(--brand-orange)]/35 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Search className="w-5 h-5" />
                  <span>{heroCopy.searchSubmit}</span>
                </Button>
              </div>
            </form>
          </div>

          <div className="mx-auto max-w-5xl pt-1 text-right">
            <div className="mb-3 flex items-end justify-between gap-3 px-1">
              <div>
                <p className="text-xs font-bold tracking-wide text-[var(--brand-amber)]">{heroCopy.destinations}</p>
                <h2 className="mt-1 text-sm font-extrabold text-white sm:text-base">{heroCopy.activeListings}</h2>
              </div>
              <span className="hidden text-[11px] text-slate-300 sm:block">{heroCopy.destinationHint}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {destinationInventory.map((destination) => {
                const DestinationIcon = destination.icon;
                return (
                  <button
                    key={destination.id}
                    type="button"
                    onClick={() => selectHeroDestination(destination)}
                    className="group min-h-28 rounded-2xl border border-white/15 bg-white/10 p-3 text-right backdrop-blur-sm transition-colors hover:border-[var(--brand-amber)] hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-amber)]"
                    aria-label={`${heroCopy.explore}: ${destination.label}`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <DestinationIcon className="h-4 w-4 text-[var(--brand-amber)] stroke-[1.9]" aria-hidden="true" />
                      <span className="text-[10px] font-bold text-slate-300">{heroCopy.availability}</span>
                    </div>
                    <p className="line-clamp-1 text-xs font-extrabold text-white sm:text-sm">{destination.label}</p>
                    <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-300">{destination.helper}</p>
                    <p className="mt-2 text-[10px] font-bold text-[var(--brand-amber)]">{destination.carCount} {heroCopy.carsCount} · {destination.propertyCount} {heroCopy.propertyCount}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mx-auto max-w-5xl pt-1 text-right">
            <div className="mb-2 flex items-center justify-between gap-3 px-1">
              <p className="text-xs font-bold tracking-wide text-slate-200">{heroCopy.brands}</p>
              <span className="text-[11px] text-[var(--brand-amber)]">{heroCopy.swipe}</span>
            </div>
            <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]" aria-label={t('browseRailAria')}>
              {browseRailItems.map((item) => (
                <Link
                  key={`${item.kind}-${item.label}`}
                  href={item.href}
                  className={`flex min-h-12 shrink-0 snap-start items-center gap-2 rounded-xl border px-3 text-xs font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-amber)] ${
                    item.kind === 'car'
                      ? 'border-white/20 bg-white/10 text-white hover:border-[var(--brand-amber)] hover:bg-white/15'
                      : 'border-[var(--brand-amber)]/35 bg-[var(--brand-amber)]/10 text-[var(--brand-amber)] hover:bg-[var(--brand-amber)] hover:text-[var(--brand-navy-deep)]'
                  }`}
                >
                  {item.kind === 'car' ? <Car className="h-4 w-4 stroke-[1.9]" aria-hidden="true" /> : <Building2 className="h-4 w-4 stroke-[1.9]" aria-hidden="true" />}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Balanced service categories */}
      <section className="border-y border-slate-200 bg-slate-50 py-8 md:py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-6 text-center md:mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--brand-orange-dark)]">{t('browseByNeed')}</p>
            <h2 className="mt-2 text-xl font-black text-[var(--brand-navy)] md:text-2xl">{t('balancedSearchTitle')}</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-[var(--brand-border)] bg-white p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[var(--brand-navy)]"><Car className="h-5 w-5" aria-hidden="true" /><h3 className="font-black">{t('carBrands')}</h3></div>
                <Link href="/search?type=car" className="text-xs font-bold text-[var(--brand-orange-dark)] hover:underline">{t('allCars')}</Link>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {["Dacia", "Audi", "BMW", "Mercedes-Benz"].map((brand) => (
                  <Link key={brand} href={`/search?type=car&brand=${brand}`} className="group flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2 text-center text-sm font-extrabold text-[var(--brand-navy)] transition-colors hover:border-[var(--brand-navy)] hover:bg-[var(--brand-navy)] hover:text-white">
                    <Car className="h-5 w-5 stroke-[1.75]" aria-hidden="true" />
                    <span>{brand}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--brand-border)] bg-white p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[var(--brand-navy)]"><Building2 className="h-5 w-5" aria-hidden="true" /><h3 className="font-black">{t('propertyTypes')}</h3></div>
                <Link href="/search?type=property" className="text-xs font-bold text-[var(--brand-orange-dark)] hover:underline">{t('allProperties')}</Link>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { title: t('apartments'), href: `/search?type=property&category=${encodeURIComponent('شقة')}`, icon: Building2 },
                  { title: t('villas'), href: `/search?type=property&category=${encodeURIComponent('فيلا')}`, icon: House },
                  { title: t('offices'), href: '/search?type=office', icon: BriefcaseBusiness },
                  { title: t('studios'), href: `/search?type=property&category=${encodeURIComponent('استوديو')}`, icon: House },
                ].map((category) => {
                  const CategoryIcon = category.icon;
                  return <Link key={category.title} href={category.href} className="group flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border border-[var(--brand-orange)]/25 bg-[var(--brand-amber-soft)] px-2 text-center text-sm font-extrabold text-[var(--brand-navy)] transition-colors hover:border-[var(--brand-orange)] hover:bg-[var(--brand-amber)]">
                    <CategoryIcon className="h-5 w-5 stroke-[1.75]" aria-hidden="true" />
                    <span>{category.title}</span>
                  </Link>;
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Section (Separating Cars and Properties cleanly) */}
      <section className="py-10 md:py-16 px-4 container mx-auto max-w-6xl">
        <div className="text-center space-y-3 mb-8 md:mb-12">
          <span className="text-[#E57C23] font-bold text-xs uppercase tracking-widest bg-[#E57C23]/10 px-3 py-1 rounded-full border border-[#E57C23]/30">
            {t('advancedDesign')}
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-[#0B3C5D]">{t('exploreMainSections')}</h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            {t('bentoSubtitle')}
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Cars Bento Box (Large 2 cols on md) */}
          <div className="md:col-span-2 bg-gradient-to-br from-[#0B3C5D] to-slate-900 text-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-[#E57C23]/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 space-y-4 max-w-md">
              <div className="w-12 h-12 bg-[#E57C23] rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black">{t('carFleetTitle')}</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {t('carFleetDescription')}
              </p>
              <div>
                <Link href="/search?type=car">
                  <Button className="bg-[#E57C23] hover:bg-[#d46b1d] text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-[#E57C23]/40 cursor-pointer">
                    <span>{t('browseCars')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-8 relative z-10">
              <OptimizedImage
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"
                alt="Cars Fleet"
                className="rounded-xl md:rounded-2xl shadow-2xl object-cover h-36 sm:h-48 w-full group-hover:scale-105 transition-transform duration-500 border border-white/10"
              />
            </div>
          </div>

          {/* Card 2: Real Estate Bento Box */}
          <div className="bg-white border border-slate-200 p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-xl flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#0B3C5D] rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Building2 className="w-6 h-6 text-[#E57C23]" />
              </div>
              <h3 className="text-xl font-black text-[#0B3C5D]">{t('propertyTitle')}</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {t('propertyDescription')}
              </p>
              <div>
                <Link href="/search?type=property">
                  <Button className="bg-[#0B3C5D] hover:bg-[#062940] text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer">
                    <span>{t('browseProperties')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-6">
              <OptimizedImage
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=70&w=800"
                srcSet="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=65&w=480 480w, https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=70&w=800 800w"
                sizes="(max-width: 768px) 100vw, 50vw"
                alt="Properties"
                loading="lazy"
                decoding="async"
                width={800}
                height={320}
                className="rounded-xl md:rounded-2xl shadow-lg object-cover h-32 sm:h-40 w-full group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listing Cards Section */}
      <section className="py-10 md:py-16 px-4 container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-7 md:mb-10 gap-4">
          <div>
            <span className="text-[#E57C23] font-bold text-xs uppercase tracking-widest bg-[#E57C23]/10 px-3 py-1 rounded-full border border-[#E57C23]/30">
              {t('availableListingsEyebrow')}
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-[#0B3C5D] mt-2">{t('featuredListings')}</h2>
          </div>
          <Link href="/search">
            <Button variant="outline" className="w-full md:w-auto border-[#0B3C5D] text-[#0B3C5D] hover:bg-[#0B3C5D] hover:text-white font-bold rounded-xl text-xs">
              {t('viewAllListings')} ({activeListings.length})
            </Button>
          </Link>
        </div>

        {/* Listing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {activeListings.slice(0, 6).map((item) => item.type === 'car' ? (
            <CarListingCard
              key={item.id}
              item={item}
              detailsHref={getListingPath(item)}
              isDemo
              className="b2-touch-card"
            />
          ) : (
            <article key={item.id} className="b2-card b2-touch-card shadow-md hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 flex flex-col group">
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <OptimizedImage
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={448}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  srcSet={`${item.image} 800w`}
                  className="b2-responsive-media group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-[#0B3C5D]/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  {item.category}
                </div>
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-slate-500 text-xs gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#E57C23]" />
                    <span>{item.city}</span>
                  </div>
                  <h3 className="text-base font-black text-[#0B3C5D] line-clamp-1">{item.title}</h3>
                  <div className="text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-xl inline-block">
                    {item.providerName}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">{t('dailyPrice')}</span>
                    <span className="text-lg font-black text-[#E57C23]">{item.pricePerUnit} درهم</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={getListingPath(item)}>
                      <Button className="b2-card-action bg-[#0B3C5D] hover:bg-[#062940] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md cursor-pointer">
                        {t('demoDetails')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* WordPress-Style Featured Blog Section */}
      <section className="py-10 md:py-16 bg-slate-100 mt-6 md:mt-12 border-y border-slate-200">
        <div className="container mx-auto max-w-6xl px-4 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <span className="text-[#E57C23] font-bold text-xs uppercase tracking-widest bg-[#E57C23]/10 px-3 py-1 rounded-full">{t('blogEyebrow')}</span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#0B3C5D] mt-2">{t('latestArticles')}</h2>
            </div>
            <Link href="/blog">
              <Button variant="outline" className="border-[#0B3C5D] text-[#0B3C5D] hover:bg-[#0B3C5D] hover:text-white rounded-xl text-xs font-bold gap-2">
                <span>{t('browseAllArticles')}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:-translate-y-2 hover:shadow-xl hover:border-[#E57C23]/40 transition-all duration-300 flex flex-col group">
              <div className="h-40 sm:h-48 overflow-hidden">
                <OptimizedImage src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800" alt={t('carRentalAlt')} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                <span className="text-xs font-bold text-[#E57C23]">{t('travelGuide')}</span>
                <h3 className="font-black text-[#0B3C5D] text-base group-hover:text-[#E57C23] transition-colors">{t('travelGuideTitle')}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{t('travelGuideDescription')}</p>
                <Link href="/blog">
                  <span className="text-xs font-bold text-[#0B3C5D] flex items-center gap-1 pt-2 hover:underline">{t('readMore')} <ArrowRight className="w-3 h-3" /></span>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:-translate-y-2 hover:shadow-xl hover:border-[#E57C23]/40 transition-all duration-300 flex flex-col group">
              <div className="h-40 sm:h-48 overflow-hidden">
                <OptimizedImage src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800" alt={t('realEstateAlt')} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                <span className="text-xs font-bold text-[#E57C23]">{t('realEstateInvestment')}</span>
                <h3 className="font-black text-[#0B3C5D] text-base group-hover:text-[#E57C23] transition-colors">{t('realEstateInvestmentTitle')}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{t('realEstateInvestmentDescription')}</p>
                <Link href="/blog">
                  <span className="text-xs font-bold text-[#0B3C5D] flex items-center gap-1 pt-2 hover:underline">{t('readMore')} <ArrowRight className="w-3 h-3" /></span>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:-translate-y-2 hover:shadow-xl hover:border-[#E57C23]/40 transition-all duration-300 flex flex-col group">
              <div className="h-40 sm:h-48 overflow-hidden">
                <OptimizedImage src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800" alt={t('drivingAlt')} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                <span className="text-xs font-bold text-[#E57C23]">{t('drivingTips')}</span>
                <h3 className="font-black text-[#0B3C5D] text-base group-hover:text-[#E57C23] transition-colors">{t('drivingTipsTitle')}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{t('drivingTipsDescription')}</p>
                <Link href="/blog">
                  <span className="text-xs font-bold text-[#0B3C5D] flex items-center gap-1 pt-2 hover:underline">{t('readMore')} <ArrowRight className="w-3 h-3" /></span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Trust & Features Banner */}
      <section className="py-10 md:py-16 bg-[#0B3C5D] text-white mt-0">
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center">
          <div className="space-y-3">
            <div className="w-14 h-14 bg-[#E57C23] text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-base md:text-lg">{t('securePaymentTitle')}</h4>
            <p className="text-xs text-slate-300">{t('securePaymentDescription')}</p>
          </div>
          <div className="space-y-3">
            <div className="w-14 h-14 bg-[#E57C23] text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Award className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-base md:text-lg">{t('trustedAgenciesTitle')}</h4>
            <p className="text-xs text-slate-300">{t('trustedAgenciesDescription')}</p>
          </div>
          <div className="space-y-3">
            <div className="w-14 h-14 bg-[#E57C23] text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Clock className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-base md:text-lg">{t('supportTitle')}</h4>
            <p className="text-xs text-slate-300">{t('supportDescription')}</p>
          </div>
        </div>
      </section>

    </div>
  );
}
