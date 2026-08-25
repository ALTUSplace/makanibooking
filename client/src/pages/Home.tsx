import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/OptimizedImage';
import { CarListingCard } from '@/components/CarListingCard';
import { Search, MapPin, Building2, Car, ShieldCheck, ArrowRight, CheckCircle2, Award, Clock, Bot, Send, Mic, Bookmark, Check, Calendar, DollarSign, Filter, Phone, BriefcaseBusiness, House } from 'lucide-react';
import { PARTNERS, LISTINGS, ListingItem } from '@/data/b2rent';
import { SmartRecommendations } from '@/components/SmartRecommendations';
import { FAQSection } from '@/components/FAQSection';
import { toast } from 'sonner';

function getListingPath(item: { id: string; type: string }) {
  return item.type === 'property' ? `/property/${item.id}` : `/car/${item.id}`;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'cars' | 'properties'>('cars');

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'cars') {
      setLocation(`/search?type=car&city=${encodeURIComponent(carCity)}&pickup=${pickupDate}`);
    } else {
      setLocation(`/search?type=property&city=${encodeURIComponent(propLocation)}&propType=${propType}&maxPrice=${maxPrice}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col" dir="rtl">

      {/* Hero palette follows the B2-Rent Morocco logo: navy, coral, and orange. */}
      <section className="relative overflow-hidden bg-[var(--brand-navy)] px-4 pb-12 pt-8 text-white md:pb-24 md:pt-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--brand-orange)_1px,transparent_1px)] opacity-15 [background-size:28px_28px]"></div>

        <div className="container mx-auto max-w-6xl text-center space-y-5 md:space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-orange)]/40 bg-[var(--brand-orange)]/20 px-4 py-1.5 text-xs font-bold tracking-wide text-[var(--brand-orange)]">
            <ShieldCheck className="h-4 w-4 text-[var(--brand-orange)]" />
            <span>منصة الوساطة الأولى المعتمدة بين المزودين والزبائن في المغرب</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight leading-[1.25] md:leading-tight">
            سيارات موثوقة و<span className="text-[var(--brand-orange)]">عقارات مختارة</span>، في منصة واحدة
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            اعثر على سيارة تناسب رحلتك أو عقار يلائم إقامتك أو عملك، وتواصل بثقة مع شركاء B2-Rent في المدن المغربية عبر تجربة بحث وحجز موحّدة.
          </p>

          <div className="flex justify-center gap-4 mt-6">
            <Button
              onClick={() => window.open('/slides_project/cover_slide.html', '_blank')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>عرض مراجعة الأعمال</span>
            </Button>
          </div>

          {/* Tabbed Search Bar (Cars vs Properties) */}
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl text-right">
            {/* Tabs Header */}
            <div className="flex gap-2 mb-4 md:mb-6 border-b border-white/10 pb-3 md:pb-4">
              <button
                type="button"
                onClick={() => setActiveTab('cars')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 sm:px-4 rounded-xl md:rounded-2xl font-bold text-xs sm:text-sm transition-all ${
                  activeTab === 'cars'
                    ? 'bg-[var(--brand-orange)] text-white shadow-lg shadow-[var(--brand-orange)]/30'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <Car className="w-5 h-5" />
                <span>بحث عن السيارات</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('properties')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 sm:px-4 rounded-xl md:rounded-2xl font-bold text-xs sm:text-sm transition-all ${
                  activeTab === 'properties'
                    ? 'bg-[var(--brand-coral)] text-white shadow-lg shadow-[var(--brand-coral)]/30'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>بحث عن العقارات</span>
              </button>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="space-y-3 md:space-y-4">
              {activeTab === 'cars' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">المدينة أو الوكالة</label>
                    <div className="relative">
                      <button type="button" onClick={() => openSelect(carCityRef.current)} className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]" aria-label="فتح قائمة المدن">
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
                    <label className="text-xs font-semibold text-slate-300">تاريخ الاستلام</label>
                    <div className="relative">
                      <button type="button" onClick={() => openDatePicker(pickupDateRef.current)} className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]" aria-label="فتح تقويم تاريخ الاستلام">
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
                    <label className="text-xs font-semibold text-slate-300">تاريخ التسليم</label>
                    <div className="relative">
                      <button type="button" onClick={() => openDatePicker(dropoffDateRef.current)} className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]" aria-label="فتح تقويم تاريخ التسليم">
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
                    <label className="text-xs font-semibold text-slate-300">المنطقة / المدينة</label>
                    <div className="relative">
                      <button type="button" onClick={() => openSelect(propertyLocationRef.current)} className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]" aria-label="فتح قائمة المدن">
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
                    <label className="text-xs font-semibold text-slate-300">نوع العقار</label>
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
                    <label className="text-xs font-semibold text-slate-300">الحد الأقصى للسعر (درهم/ليلة)</label>
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
                  <span>بحث متقدم وعرض النتائج الفورية</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Balanced service categories */}
      <section className="border-y border-slate-200 bg-slate-50 py-8 md:py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-6 text-center md:mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--brand-orange-dark)]">تصفح حسب احتياجك</p>
            <h2 className="mt-2 text-xl font-black text-[var(--brand-navy)] md:text-2xl">سيارات وعقارات، بتجربة بحث متوازنة</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-[var(--brand-border)] bg-white p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[var(--brand-navy)]"><Car className="h-5 w-5" aria-hidden="true" /><h3 className="font-black">ماركات السيارات</h3></div>
                <Link href="/search?type=car" className="text-xs font-bold text-[var(--brand-orange-dark)] hover:underline">كل السيارات</Link>
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
                <div className="flex items-center gap-2 text-[var(--brand-navy)]"><Building2 className="h-5 w-5" aria-hidden="true" /><h3 className="font-black">أنواع العقارات</h3></div>
                <Link href="/search?type=property" className="text-xs font-bold text-[var(--brand-orange-dark)] hover:underline">كل العقارات</Link>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { title: "شقق", type: "apartment", icon: Building2 },
                  { title: "فيلات", type: "villa", icon: House },
                  { title: "مكاتب", type: "office", icon: BriefcaseBusiness },
                  { title: "استوديوهات", type: "studio", icon: House },
                ].map((category) => {
                  const CategoryIcon = category.icon;
                  return <Link key={category.type} href={`/search?type=property&propType=${category.type}`} className="group flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border border-[var(--brand-orange)]/25 bg-[var(--brand-amber-soft)] px-2 text-center text-sm font-extrabold text-[var(--brand-navy)] transition-colors hover:border-[var(--brand-orange)] hover:bg-[var(--brand-amber)]">
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
            تصميم هندسي متطور
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-[#0B3C5D]">استكشف الأقسام الرئيسية (Bento Grid)</h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            اختر ما بين أسطول السيارات الفاخرة أو العقارات الحصرية مع ضمانات حماية كاملة.
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
              <h3 className="text-2xl font-black">أسطول السيارات الفاخرة والاقتصادية</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                أحدث موديلات سيارات الدفع الرباعي، السيارات العائلية، والسيارات الرياضية في الدار البيضاء، مراكش، طنجة وأغادير مع توصيل مجاني.
              </p>
              <div>
                <Link href="/search?type=car">
                  <Button className="bg-[#E57C23] hover:bg-[#d46b1d] text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-[#E57C23]/40 cursor-pointer">
                    <span>تصفح السيارات المتاحة</span>
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
              <h3 className="text-xl font-black text-[#0B3C5D]">العقارات والشقق الفاخرة</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                شقق مودرن مطلة على الكورنيش وفيلات خاصة بمسبح في أرقى الأحياء السكنية.
              </p>
              <div>
                <Link href="/search?type=property">
                  <Button className="bg-[#0B3C5D] hover:bg-[#062940] text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer">
                    <span>تصفح العقارات</span>
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
              إعلانات متاحة للتصفح
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-[#0B3C5D] mt-2">إعلانات مختارة من المنصة</h2>
          </div>
          <Link href="/search">
            <Button variant="outline" className="w-full md:w-auto border-[#0B3C5D] text-[#0B3C5D] hover:bg-[#0B3C5D] hover:text-white font-bold rounded-xl text-xs">
              عرض كافة الإعلانات ({activeListings.length})
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
                    <span className="text-xs text-slate-400 block">السعر اليومي</span>
                    <span className="text-lg font-black text-[#E57C23]">{item.pricePerUnit} درهم</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={getListingPath(item)}>
                      <Button className="b2-card-action bg-[#0B3C5D] hover:bg-[#062940] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md cursor-pointer">
                        احجز الآن
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
              <span className="text-[#E57C23] font-bold text-xs uppercase tracking-widest bg-[#E57C23]/10 px-3 py-1 rounded-full">مدونة المنصة</span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#0B3C5D] mt-2">أحدث المقالات والنصائح العقارية والسياحية</h2>
            </div>
            <Link href="/blog">
              <Button variant="outline" className="border-[#0B3C5D] text-[#0B3C5D] hover:bg-[#0B3C5D] hover:text-white rounded-xl text-xs font-bold gap-2">
                <span>تصفح جميع المقالات</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:-translate-y-2 hover:shadow-xl hover:border-[#E57C23]/40 transition-all duration-300 flex flex-col group">
              <div className="h-40 sm:h-48 overflow-hidden">
                <OptimizedImage src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800" alt="Car rental" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                <span className="text-xs font-bold text-[#E57C23]">دليل السفر</span>
                <h3 className="font-black text-[#0B3C5D] text-base group-hover:text-[#E57C23] transition-colors">دليلك الشامل لكراء السيارات في الدار البيضاء ومراكش 2026</h3>
                <p className="text-xs text-slate-600 line-clamp-2">تعرف على أهم النصائح القانونية والتقنية لتأجير السيارات بكل أمان في المدن الكبرى بالمغرب.</p>
                <Link href="/blog">
                  <span className="text-xs font-bold text-[#0B3C5D] flex items-center gap-1 pt-2 hover:underline">اقرأ المزيد <ArrowRight className="w-3 h-3" /></span>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:-translate-y-2 hover:shadow-xl hover:border-[#E57C23]/40 transition-all duration-300 flex flex-col group">
              <div className="h-40 sm:h-48 overflow-hidden">
                <OptimizedImage src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800" alt="Real Estate" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                <span className="text-xs font-bold text-[#E57C23]">استثمار عقاري</span>
                <h3 className="font-black text-[#0B3C5D] text-base group-hover:text-[#E57C23] transition-colors">أفضل المناطق الاستثمارية العقارية في طنجة وأغادير</h3>
                <p className="text-xs text-slate-600 line-clamp-2">استعراض لأهم الأحياء المطلة على البحر والتي تشهد إقبالاً كبيراً من السياح والمستثمرين.</p>
                <Link href="/blog">
                  <span className="text-xs font-bold text-[#0B3C5D] flex items-center gap-1 pt-2 hover:underline">اقرأ المزيد <ArrowRight className="w-3 h-3" /></span>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:-translate-y-2 hover:shadow-xl hover:border-[#E57C23]/40 transition-all duration-300 flex flex-col group">
              <div className="h-40 sm:h-48 overflow-hidden">
                <OptimizedImage src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800" alt="Driving" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                <span className="text-xs font-bold text-[#E57C23]">نصائح قيادة</span>
                <h3 className="font-black text-[#0B3C5D] text-base group-hover:text-[#E57C23] transition-colors">كيف تختار السيارة المناسبة لرحلتك العائلية عبر الطرق السيارة؟</h3>
                <p className="text-xs text-slate-600 line-clamp-2">مقارنة شاملة بين سيارات الـ SUV والاقتصادية والفاخرة لضمان أقصى درجات الراحة والأمان.</p>
                <Link href="/blog">
                  <span className="text-xs font-bold text-[#0B3C5D] flex items-center gap-1 pt-2 hover:underline">اقرأ المزيد <ArrowRight className="w-3 h-3" /></span>
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
            <h4 className="font-bold text-base md:text-lg">حماية ودفع آمن 100%</h4>
            <p className="text-xs text-slate-300">بوابات دفع معتمدة وعقود رقمية مختومة قانونياً.</p>
          </div>
          <div className="space-y-3">
            <div className="w-14 h-14 bg-[#E57C23] text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Award className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-base md:text-lg">وكالات معتمدة وموثوقة</h4>
            <p className="text-xs text-slate-300">مراجعة وتدقيق دوري لجميع شركائنا في المغرب.</p>
          </div>
          <div className="space-y-3">
            <div className="w-14 h-14 bg-[#E57C23] text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Clock className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-base md:text-lg">دعم فني على مدار الساعة</h4>
            <p className="text-xs text-slate-300">فريق خدمة عملاء متواجد دائماً لمساعدتك.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
