import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Building2, Car, ShieldCheck, Star, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PARTNERS, LISTINGS } from '@/data/b2rent';

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedTab, setSelectedTab] = useState<'all' | 'car' | 'property'>('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredListings = LISTINGS.filter(item => {
    if (selectedTab !== 'all' && item.type !== selectedTab) return false;
    if (selectedCity !== 'all' && item.city !== selectedCity) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && !item.city.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation(`/search?type=${selectedTab}&city=${selectedCity}&q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      
      {/* القسم الرئيسي البانر */}
      <section className="relative py-24 px-4 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-border">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
        
        <div className="container mx-auto max-w-5xl text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full text-amber-400 text-xs font-bold tracking-wide">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>منصة الوساطة الأولى المعتمدة بين المزودين والزبائن في المغرب</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
            بوابةك الموثوقة لحجز <span className="text-amber-500">السيارات</span> و<span className="text-amber-400">العقارات</span> بكل أمان
          </h1>

          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            B2-Rent منصة وسيطة ذكية تربطك بأرقى شركات كراء السيارات والوكالات العقارية المستقلة عبر المدن المغربية، مع عقود رقمية وتوقيع إلكتروني فوري.
          </p>

          {/* محرك البحث الوسيط */}
          <form onSubmit={handleSearchSubmit} className="bg-slate-900/90 backdrop-blur-xl border border-border p-4 rounded-3xl shadow-2xl max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-3">
            
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

            <div className="flex flex-col text-right">
              <label className="text-[11px] font-bold text-slate-400 mb-1 px-1">بحث بالاسم أو الميزات</label>
              <input
                type="text"
                placeholder="مثال: داسيا، شقة جليز..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500"
              />
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
      </section>

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
                    <span className="text-amber-400 font-bold">بواسطة: {item.providerName}</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">{item.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{item.rating}</span>
                    <span className="text-slate-500 font-normal">({item.reviewsCount})</span>
                  </div>
                  <Link href={`/car/${item.id}`}>
                    <Button className="bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors border border-amber-500/30">
                      احجز الآن
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ميزات منصة الوسيط B2-Rent */}
      <section className="py-20 bg-slate-950 border-t border-border">
        <div className="container mx-auto px-4 max-w-6xl text-center space-y-12">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-amber-500 text-xs font-extrabold uppercase tracking-widest">لماذا B2-Rent؟</span>
            <h2 className="text-3xl font-black text-white">منصة الوساطة الأكثر أماناً في المغرب</h2>
            <p className="text-slate-400 text-xs md:text-sm">نحن نضمن حقوق الطرفين ( المزود والزبون ) عبر عقود رقمية معتمدة وتوثيق دقيق.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-right">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-4">
              <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">موثوقية الشركات والوكالات</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                جميع شركات كراء السيارات والعقارات المنضمة للمنصة تخضع لتحقق صارم وتتوفر على تراخيص قانونية سارية المفعول.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-4">
              <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-center text-amber-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">عقود رقمية وتوقيع إلكتروني</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                إصدار فوري لعقد الإيجار الرسمي بصيغة PDF مع إمكانية التوقيع الإلكتروني وإدراج الختم الرسمي للشركة الوسيطة والمزود.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-4">
              <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-center text-amber-400">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">استقلالية تامة للوكلاء</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                لكل شركة ووكالة لوحة تحكم مستقلة خاصة بها تدير من خلالها أسطولها، عقاراتها، وأرباحها بكل سهولة واستقلالية.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
