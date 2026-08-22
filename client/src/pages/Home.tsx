import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Building2, Car, ShieldCheck, Star, ArrowRight, CheckCircle2, Award, Sparkles, Clock, Bot, Send, Mic, Bookmark, Check, Calendar, DollarSign, Filter, Phone } from 'lucide-react';
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

  // Database listings formatted as unified items
  const { data: dbListings = [] } = trpc.listings.list.useQuery();
  const activeListings = dbListings.length > 0 ? dbListings.map(item => ({
    id: String(item.id),
    title: item.title,
    category: item.category === 'property' ? 'عقار' : 'سيارة',
    type: item.category,
    pricePerUnit: item.pricePerDay,
    rating: 4.9,
    reviewsCount: 12,
    image: item.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
    city: item.city || 'الدار البيضاء',
    providerName: 'وكالة الأندلس المعتمدة',
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
      
      {/* Hero Section with Deep Navy Background (#0B3C5D) and Warm Amber CTA (#E57C23) */}
      <section className="relative pt-12 pb-24 px-4 overflow-hidden bg-[#0B3C5D] text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#E57C23_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none"></div>
        
        <div className="container mx-auto max-w-6xl text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#E57C23]/20 border border-[#E57C23]/40 px-4 py-1.5 rounded-full text-[#E57C23] text-xs font-bold tracking-wide">
            <ShieldCheck className="w-4 h-4 text-[#E57C23]" />
            <span>منصة الوساطة الأولى المعتمدة بين المزودين والزبائن في المغرب</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            بوابتك الموثوقة لحجز <span className="text-[#E57C23]">السيارات</span> و<span className="text-amber-400">العقارات</span> بكل أمان
          </h1>

          <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            B2-Rent منصة وسيطة ذكية تربطك بأرقى شركات كراء السيارات والوكالات العقارية المستقلة عبر المدن المغربية، مع عقود رقمية وتوقيع إلكتروني فوري.
          </p>

          {/* Tabbed Search Bar (Cars vs Properties) */}
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 p-4 md:p-6 rounded-3xl shadow-2xl text-right">
            {/* Tabs Header */}
            <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
              <button
                type="button"
                onClick={() => setActiveTab('cars')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm transition-all ${
                  activeTab === 'cars'
                    ? 'bg-[#E57C23] text-white shadow-lg shadow-[#E57C23]/30'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <Car className="w-5 h-5" />
                <span>بحث عن السيارات</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('properties')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm transition-all ${
                  activeTab === 'properties'
                    ? 'bg-[#E57C23] text-white shadow-lg shadow-[#E57C23]/30'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>بحث عن العقارات</span>
              </button>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              {activeTab === 'cars' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">المدينة أو الوكالة</label>
                    <div className="relative">
                      <MapPin className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-400" />
                      <select
                        value={carCity}
                        onChange={(e) => setCarCity(e.target.value)}
                        className="w-full bg-slate-900/90 text-white border border-white/20 rounded-xl py-3 pr-11 pl-4 text-sm focus:outline-none focus:border-[#E57C23]"
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
                      <Calendar className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full bg-slate-900/90 text-white border border-white/20 rounded-xl py-3 pr-11 pl-4 text-sm focus:outline-none focus:border-[#E57C23]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">تاريخ التسليم</label>
                    <div className="relative">
                      <Calendar className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        type="date"
                        value={dropoffDate}
                        onChange={(e) => setDropoffDate(e.target.value)}
                        className="w-full bg-slate-900/90 text-white border border-white/20 rounded-xl py-3 pr-11 pl-4 text-sm focus:outline-none focus:border-[#E57C23]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">المنطقة / المدينة</label>
                    <div className="relative">
                      <MapPin className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-400" />
                      <select
                        value={propLocation}
                        onChange={(e) => setPropLocation(e.target.value)}
                        className="w-full bg-slate-900/90 text-white border border-white/20 rounded-xl py-3 pr-11 pl-4 text-sm focus:outline-none focus:border-[#E57C23]"
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
                        className="w-full bg-slate-900/90 text-white border border-white/20 rounded-xl py-3 pr-11 pl-4 text-sm focus:outline-none focus:border-[#E57C23]"
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
                        className="w-full bg-slate-900/90 text-white border border-white/20 rounded-xl py-3 pr-11 pl-4 text-sm focus:outline-none focus:border-[#E57C23]"
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

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-[#E57C23] hover:bg-[#d46b1d] text-white font-black py-4 rounded-2xl text-base shadow-xl shadow-[#E57C23]/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Search className="w-5 h-5" />
                  <span>بحث متقدم وعرض النتائج الفورية</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Car Brands Marquee Section (OneClickDrive Morocco Style) */}
      <section className="py-10 bg-slate-50 border-y border-slate-200 overflow-hidden">
        <div className="container mx-auto max-w-6xl px-4 text-center mb-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">أشهر ماركات السيارات العالمية المتوفرة في المنصة</p>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-6 px-4 py-2 justify-center items-center flex-wrap max-w-6xl mx-auto">
          {[
            { name: "Mercedes-Benz", icon: "⭐", count: "45+ سيارة" },
            { name: "Range Rover", icon: "🚙", count: "30+ سيارة" },
            { name: "BMW", icon: "🏎️", count: "40+ سيارة" },
            { name: "Audi", icon: "🚘", count: "25+ سيارة" },
            { name: "Dacia", icon: "🚗", count: "80+ سيارة" },
            { name: "Renault", icon: "🚙", count: "60+ سيارة" },
            { name: "Hyundai", icon: "🚗", count: "50+ سيارة" },
            { name: "Volkswagen", icon: "🚘", count: "35+ سيارة" }
          ].map((brand, idx) => (
            <Link key={idx} href={`/search?type=car&brand=${brand.name}`}>
              <div className="bg-white hover:bg-[#0B3C5D] hover:text-white text-[#0B3C5D] border border-slate-200 hover:border-[#0B3C5D] px-6 py-4 rounded-2xl shadow-sm transition-all duration-300 flex items-center gap-3 cursor-pointer group min-w-[160px] justify-center">
                <span className="text-2xl group-hover:scale-110 transition-transform">{brand.icon}</span>
                <div className="text-right">
                  <h4 className="font-black text-sm">{brand.name}</h4>
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-200">{brand.count}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Real Estate Types Marquee Section */}
      <section className="py-8 bg-white border-b border-slate-200 overflow-hidden">
        <div className="container mx-auto max-w-6xl px-4 text-center mb-6">
          <p className="text-xs font-bold text-[#0B3C5D] uppercase tracking-widest">أنواع العقارات والفلل والشقق المتاحة للإيجار</p>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-6 px-4 py-2 justify-center items-center flex-wrap max-w-6xl mx-auto">
          {[
            { name: "فلل فاخرة بمسبح", icon: "🏡", count: "25+ عقار" },
            { name: "شقق مودرن", icon: "🏢", count: "90+ عقار" },
            { name: "بنتهاوس كورنيش", icon: "🏙️", count: "15+ عقار" },
            { name: "استوديوهات رجال الأعمال", icon: "🏨", count: "40+ عقار" },
            { name: "إقامات محروسة", icon: "🏘️", count: "30+ عقار" }
          ].map((type, idx) => (
            <Link key={idx} href={`/search?type=property&category=${type.name}`}>
              <div className="bg-slate-50 hover:bg-[#E57C23] hover:text-white text-[#0B3C5D] border border-slate-200 hover:border-[#E57C23] px-6 py-3.5 rounded-2xl shadow-sm transition-all duration-300 flex items-center gap-3 cursor-pointer group min-w-[170px] justify-center">
                <span className="text-2xl group-hover:scale-110 transition-transform">{type.icon}</span>
                <div className="text-right">
                  <h4 className="font-black text-sm">{type.name}</h4>
                  <span className="text-[10px] text-slate-500 group-hover:text-slate-100">{type.count}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bento Grid Section (Separating Cars and Properties cleanly) */}
      <section className="py-16 px-4 container mx-auto max-w-6xl">
        <div className="text-center space-y-3 mb-12">
          <span className="text-[#E57C23] font-bold text-xs uppercase tracking-widest bg-[#E57C23]/10 px-3 py-1 rounded-full border border-[#E57C23]/30">
            تصميم هندسي متطور
          </span>
          <h2 className="text-3xl font-black text-[#0B3C5D]">استكشف الأقسام الرئيسية (Bento Grid)</h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            اختر ما بين أسطول السيارات الفاخرة أو العقارات الحصرية مع ضمانات حماية كاملة.
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Cars Bento Box (Large 2 cols on md) */}
          <div className="md:col-span-2 bg-gradient-to-br from-[#0B3C5D] to-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between group">
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
              <img 
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800" 
                alt="Cars Fleet" 
                className="rounded-2xl shadow-2xl object-cover h-48 w-full group-hover:scale-105 transition-transform duration-500 border border-white/10"
              />
            </div>
          </div>

          {/* Card 2: Real Estate Bento Box */}
          <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl flex flex-col justify-between group">
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
              <img
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=70&w=800"
                srcSet="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=65&w=480 480w, https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=70&w=800 800w"
                sizes="(max-width: 768px) 100vw, 50vw"
                alt="Properties"
                loading="lazy"
                decoding="async"
                width={800}
                height={320}
                className="rounded-2xl shadow-lg object-cover h-40 w-full group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listing Cards Section */}
      <section className="py-16 px-4 container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-[#E57C23] font-bold text-xs uppercase tracking-widest bg-[#E57C23]/10 px-3 py-1 rounded-full border border-[#E57C23]/30">
              عروض مميزة وحصرية
            </span>
            <h2 className="text-3xl font-black text-[#0B3C5D] mt-2">الأكثر طلباً هذا الأسبوع</h2>
          </div>
          <Link href="/search">
            <Button variant="outline" className="border-[#0B3C5D] text-[#0B3C5D] hover:bg-[#0B3C5D] hover:text-white font-bold rounded-xl text-xs">
              عرض كافة الإعلانات ({activeListings.length})
            </Button>
          </Link>
        </div>

        {/* Listing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {activeListings.slice(0, 6).map((item) => (
            <article key={item.id} className="b2-card b2-touch-card shadow-md hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 flex flex-col group">
              <div className="relative h-56 overflow-hidden">
                <img
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
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md text-[#0B3C5D] text-xs font-extrabold px-3 py-1 rounded-full shadow flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{item.rating} ({item.reviewsCount})</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
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
      <section className="py-16 bg-slate-100 mt-12 border-y border-slate-200">
        <div className="container mx-auto max-w-6xl px-4 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <span className="text-[#E57C23] font-bold text-xs uppercase tracking-widest bg-[#E57C23]/10 px-3 py-1 rounded-full">مدونة المنصة</span>
              <h2 className="text-2xl md:text-3xl font-black text-[#0B3C5D] mt-2">أحدث المقالات والنصائح العقارية والسياحية</h2>
            </div>
            <Link href="/blog">
              <Button variant="outline" className="border-[#0B3C5D] text-[#0B3C5D] hover:bg-[#0B3C5D] hover:text-white rounded-xl text-xs font-bold gap-2">
                <span>تصفح جميع المقالات</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:-translate-y-2 hover:shadow-xl hover:border-[#E57C23]/40 transition-all duration-300 flex flex-col group">
              <div className="h-48 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800" alt="Car rental" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <span className="text-xs font-bold text-[#E57C23]">دليل السفر</span>
                <h3 className="font-black text-[#0B3C5D] text-base group-hover:text-[#E57C23] transition-colors">دليلك الشامل لكراء السيارات في الدار البيضاء ومراكش 2026</h3>
                <p className="text-xs text-slate-600 line-clamp-2">تعرف على أهم النصائح القانونية والتقنية لتأجير السيارات بكل أمان في المدن الكبرى بالمغرب.</p>
                <Link href="/blog">
                  <span className="text-xs font-bold text-[#0B3C5D] flex items-center gap-1 pt-2 hover:underline">اقرأ المزيد <ArrowRight className="w-3 h-3" /></span>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:-translate-y-2 hover:shadow-xl hover:border-[#E57C23]/40 transition-all duration-300 flex flex-col group">
              <div className="h-48 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800" alt="Real Estate" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <span className="text-xs font-bold text-[#E57C23]">استثمار عقاري</span>
                <h3 className="font-black text-[#0B3C5D] text-base group-hover:text-[#E57C23] transition-colors">أفضل المناطق الاستثمارية العقارية في طنجة وأغادير</h3>
                <p className="text-xs text-slate-600 line-clamp-2">استعراض لأهم الأحياء المطلة على البحر والتي تشهد إقبالاً كبيراً من السياح والمستثمرين.</p>
                <Link href="/blog">
                  <span className="text-xs font-bold text-[#0B3C5D] flex items-center gap-1 pt-2 hover:underline">اقرأ المزيد <ArrowRight className="w-3 h-3" /></span>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:-translate-y-2 hover:shadow-xl hover:border-[#E57C23]/40 transition-all duration-300 flex flex-col group">
              <div className="h-48 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800" alt="Driving" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
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
      <section className="py-16 bg-[#0B3C5D] text-white mt-0">
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-3">
            <div className="w-14 h-14 bg-[#E57C23] text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-lg">حماية ودفع آمن 100%</h4>
            <p className="text-xs text-slate-300">بوابات دفع معتمدة وعقود رقمية مختومة قانونياً.</p>
          </div>
          <div className="space-y-3">
            <div className="w-14 h-14 bg-[#E57C23] text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Award className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-lg">وكالات معتمدة وموثوقة</h4>
            <p className="text-xs text-slate-300">مراجعة وتدقيق دوري لجميع شركائنا في المغرب.</p>
          </div>
          <div className="space-y-3">
            <div className="w-14 h-14 bg-[#E57C23] text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Clock className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-lg">دعم فني على مدار الساعة</h4>
            <p className="text-xs text-slate-300">فريق خدمة عملاء متواجد دائماً لمساعدتك.</p>
          </div>
          <div className="space-y-3">
            <div className="w-14 h-14 bg-[#E57C23] text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Sparkles className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-lg">خصومات الباقات المدمجة</h4>
            <p className="text-xs text-slate-300">وفر 15% عند حجز سيارة وعقار معاً في نفس الرحلة.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
