import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Building2, Car, ShieldCheck, Star, ArrowRight, CheckCircle2, Award, Sparkles, Clock } from 'lucide-react';
import { PARTNERS, LISTINGS, ListingItem } from '@/data/b2rent';

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedTab, setSelectedTab] = useState<'all' | 'car' | 'property'>('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentViewed, setRecentViewed] = useState<ListingItem[]>([]);

  useEffect(() => {
    // محاكاة أو قراءة السيارات/العقارات المشوهدة مؤخراً من التخزين المحلي
    const mockRecent = LISTINGS.slice(0, 3);
    setRecentViewed(mockRecent);
  }, []);

  // الإكمال التلقائي لاقتراحات البحث مع الصور المصغرة والأسعار
  const suggestions = searchQuery.trim()
    ? LISTINGS.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const filteredListings = LISTINGS.filter(item => {
    if (selectedTab !== 'all' && item.type !== selectedTab) return false;
    if (selectedCity !== 'all' && item.city !== selectedCity) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && !item.city.toLowerCase().includes(searchQuery.toLowerCase()) && !item.category.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // العروض الأعلى تقييماً (Top Rated Showcase)
  const topRatedListings = [...LISTINGS].sort((a, b) => b.rating - a.rating).slice(0, 4);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation(`/search?type=${selectedTab}&city=${selectedCity}&q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" dir="rtl">
      
      {/* القسم الرئيسي البانر */}
      <section className="relative py-24 px-4 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-border">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
        
        <div className="container mx-auto max-w-5xl text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full text-amber-400 text-xs font-bold tracking-wide">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>منصة الوساطة الأولى المعتمدة بين المزودين والزبائن في المغرب</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
            بوابتك الموثوقة لحجز <span className="text-amber-500">السيارات</span> و<span className="text-amber-400">العقارات</span> بكل أمان
          </h1>

          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            B2-Rent منصة وسيطة ذكية تربطك بأرقى شركات كراء السيارات والوكالات العقارية المستقلة عبر المدن المغربية، مع عقود رقمية وتوقيع إلكتروني فوري.
          </p>

          {/* محرك البحث الوسيط مع الإكمال التلقائي المحسن بالصور والأسعار */}
          <div className="relative max-w-4xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="bg-slate-900/95 backdrop-blur-xl border border-border p-4 rounded-3xl shadow-2xl grid grid-cols-1 md:grid-cols-4 gap-3">
              
              <div className="flex flex-col text-right">
                <label className="text-[11px] font-bold text-slate-400 mb-1 px-1">نوع الخدمة</label>
                <select
                  value={selectedTab}
                  onChange={(e) => setSelectedTab(e.target.value as 'all' | 'car' | 'property')}
                  className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="all">الكل (سيارات وعقارات)</option>
                  <option value="car">كراء السيارات</option>
                  <option value="property">العقارات والشقاق المفروشة</option>
                </select>
              </div>

              <div className="flex flex-col text-right">
                <label className="text-[11px] font-bold text-slate-400 mb-1 px-1">المدينة المغربية</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="all">جميع المدن المغربية</option>
                  <option value="أغادير">أغادير</option>
                  <option value="مراكش">مراكش</option>
                  <option value="الدار البيضاء">الدار البيضاء</option>
                  <option value="طنجة">طنجة</option>
                </select>
              </div>

              <div className="flex flex-col text-right relative">
                <label className="text-[11px] font-bold text-slate-400 mb-1 px-1">بحث متقدم بالإكمال التلقائي</label>
                <input
                  type="text"
                  placeholder="مثال: داسيا، شقة جليز، فيلا..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500"
                />

                {/* قائمة الإكمال التلقائي المقترحة مع الصور المصغرة والأسعار */}
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-900 text-right">
                    {suggestions.map(sug => (
                      <div
                        key={sug.id}
                        onClick={() => {
                          setSearchQuery(sug.title);
                          setLocation(`/car/${sug.id}`);
                        }}
                        className="p-3 hover:bg-slate-900 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img src={sug.image} alt={sug.title} className="w-10 h-10 rounded-xl object-cover border border-slate-800" />
                          <div>
                            <div className="font-bold text-white">{sug.title}</div>
                            <div className="text-[10px] text-slate-400">{sug.city} - {sug.category}</div>
                          </div>
                        </div>
                        <span className="text-amber-400 font-extrabold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">{sug.pricePerUnit} {sug.unitLabel}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold py-3.5 px-6 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>ابحث الآن</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 1. قسم السيارات والعقارات الأعلى تقييماً */}
      <section className="py-16 bg-slate-950 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-amber-500 text-xs font-extrabold uppercase tracking-widest">
                <Sparkles className="w-4 h-4" /> الأعلى تقييماً وثقة
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">العروض المتميزة بناءً على آراء العملاء</h2>
            </div>
            <Link href="/search" className="text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1">
              تصفح كافة العروض <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topRatedListings.map(item => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-amber-500/60 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col group">
                <div className="relative h-48 overflow-hidden bg-slate-950">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 shadow-lg">
                    <Award className="w-3.5 h-3.5" /> تقييم ممتاز ⭐ {item.rating}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-extrabold border border-slate-800">
                    {item.pricePerUnit} {item.unitLabel}
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-500" /> {item.city}</span>
                      <span className="text-amber-400 font-bold">{item.providerName}</span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">{item.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">
                      {item.reviewsCount} مراجعة مؤكدة
                    </span>
                    <Link href={`/car/${item.id}`}>
                      <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow">
                        عرض التفاصيل
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. قسم شوهد مؤخراً (Recently Viewed) لمساعدة المستخدمين على العودة بسهولة */}
      {recentViewed.length > 0 && (
        <section className="py-12 bg-slate-900/40 border-b border-border">
          <div className="container mx-auto px-4 space-y-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-extrabold text-white">شوهدت مؤخراً</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recentViewed.map(item => (
                <Link key={item.id} href={`/car/${item.id}`}>
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 hover:border-amber-500/50 transition-all cursor-pointer group">
                    <img src={item.image} alt={item.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div className="space-y-1 min-w-0">
                      <div className="text-[10px] text-amber-400 font-bold">{item.city}</div>
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition-colors">{item.title}</h4>
                      <div className="text-xs font-black text-slate-300">{item.pricePerUnit} {item.unitLabel}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* قسم شرفاء الوكالات وشركات الوساطة */}
      <section className="py-16 bg-slate-900/50 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
            <div>
              <span className="text-amber-500 text-xs font-extrabold uppercase tracking-widest">شبكة معتمدة</span>
              <h2 className="text-2xl font-extrabold text-white">أبرز الوكالات والشركات الشريكة</h2>
            </div>
            <Link href="/search" className="text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1">
              عرض كافة الشركاء <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PARTNERS.map(partner => (
              <div key={partner.id} className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-amber-500/50 transition-all group">
                <div className="flex items-center gap-4">
                  <img src={partner.logo} alt={partner.name} className="w-12 h-12 rounded-xl object-cover border border-slate-800" />
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">{partner.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="w-3 h-3 text-amber-500" /> {partner.city}
                      <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-amber-300 font-semibold">
                        {partner.type === 'car_rental' ? 'سيارات' : 'عقارات'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{partner.rating}</span>
                    <span className="text-slate-500">({partner.reviewsCount} تقييم)</span>
                  </div>
                  {partner.isExcellence && (
                    <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold">
                      وكالة متميزة ⭐
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* قسم العروض المتاحة (سيارات وعقارات) */}
      <section className="py-20 container mx-auto px-4 flex-grow">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
          <div>
            <span className="text-amber-500 text-xs font-extrabold uppercase tracking-widest">تحديثات فورية</span>
            <h2 className="text-3xl font-black text-white">العروض المتاحة حالياً للكراء</h2>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${selectedTab === 'all' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              الكل
            </button>
            <button
              onClick={() => setSelectedTab('car')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${selectedTab === 'car' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              السيارات
            </button>
            <button
              onClick={() => setSelectedTab('property')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${selectedTab === 'property' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              العقارات
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredListings.map(item => (
            <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-amber-500/50 transition-all flex flex-col group">
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-slate-800">
                  {item.category}
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-extrabold border border-slate-800">
                  {item.pricePerUnit} {item.unitLabel}
                </div>
              </div>

              <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-500" /> {item.city}</span>
                    <span className="text-amber-400 font-bold">{item.providerName}</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">{item.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{item.rating}</span>
                  </div>
                  <Link href={`/car/${item.id}`}>
                    <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow">
                      عرض التفاصيل والحجز
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
