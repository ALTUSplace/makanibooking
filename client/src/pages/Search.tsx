import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { LISTINGS, ListingItem } from '@/data/b2rent';
import { Button } from '@/components/ui/button';
import { Filter, Star, ShieldCheck, Users, Car as CarIcon, ArrowUpDown, Award, MapPin, Scale, X, Eye, Home, Map } from 'lucide-react';
import { toast } from 'sonner';
import { MapView } from '@/components/Map';

const CITIES = [
  { id: 'all', name: 'جميع المدن' },
  { id: 'مراكش', name: 'مراكش' },
  { id: 'أغادير', name: 'أغادير' },
  { id: 'الدار البيضاء', name: 'الدار البيضاء' },
  { id: 'طنجة', name: 'طنجة' },
  { id: 'الرباط', name: 'الرباط' },
];

const cityMap: Record<string, string> = {
  agadir: 'أغادير',
  marrakech: 'مراكش',
  casablanca: 'الدار البيضاء',
  tangier: 'طنجة',
  rabat: 'الرباط',
};

export default function Search() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);

  const rawCity = searchParams.get('city') || 'all';
  const resolvedCity = cityMap[rawCity] || rawCity;

  const naturalQuery = searchParams.get('q') || '';
  const [cityFilter, setCityFilter] = useState(resolvedCity);
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');
  const [searchQuery, setSearchQuery] = useState(naturalQuery);
  const [maxPrice, setMaxPrice] = useState(4000);
  const [excellenceOnly, setExcellenceOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rating'>('rating');

  // ميزة العرض السريع (Quick View Modal)
  const [quickViewItem, setQuickViewItem] = useState<ListingItem | null>(null);

  // عرض الخريطة التفاعلية
  const [showMap, setShowMap] = useState(false);

  // ميزة المقارنة (Side-by-Side Comparison)
  const [compareList, setCompareList] = useState<ListingItem[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const toggleCompare = (item: ListingItem) => {
    if (compareList.find(c => c.id === item.id)) {
      setCompareList(compareList.filter(c => c.id !== item.id));
      toast.info('تمت إزالة العنصر من قائمة المقارنة');
    } else {
      if (compareList.length >= 2) {
        toast.error('يمكنك مقارنة عنصرين كحد أقصى في نفس الوقت');
        return;
      }
      setCompareList([...compareList, item]);
      toast.success('تمت إضافة العنصر إلى قائمة المقارنة');
    }
  };

  const filteredListings = useMemo(() => {
    return LISTINGS.filter((item) => {
      if (cityFilter !== 'all' && item.city !== cityFilter) return false;
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (item.pricePerUnit > maxPrice) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = item.title.toLowerCase().includes(q) ||
                        item.description.toLowerCase().includes(q) ||
                        item.city.toLowerCase().includes(q) ||
                        item.category.toLowerCase().includes(q) ||
                        item.features.some(f => f.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.pricePerUnit - b.pricePerUnit;
      if (sortBy === 'price-desc') return b.pricePerUnit - a.pricePerUnit;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [cityFilter, typeFilter, maxPrice, sortBy]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12" dir="rtl">
      <div className="container mx-auto px-4 space-y-8">
        
        {/* شريط عائم للمقارنة */}
        {compareList.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-950/95 backdrop-blur-xl border border-amber-500/50 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in-50">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold text-white">المقارنة ({compareList.length}/2):</span>
            </div>
            <div className="flex items-center gap-2">
              {compareList.map(c => (
                <span key={c.id} className="bg-slate-900 border border-slate-700 text-xs px-3 py-1 rounded-xl text-slate-200 flex items-center gap-2">
                  {c.title}
                  <button onClick={() => toggleCompare(c)} className="text-red-400 hover:text-red-300"><X className="w-3.5 h-3.5" /></button>
                </span>
              ))}
            </div>
            {compareList.length === 2 && (
              <Button
                onClick={() => setShowCompareModal(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-lg"
              >
                قارن الآن
              </Button>
            )}
          </div>
        )}

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-white">دليل السيارات والعقارات المتاحة</h1>
            <p className="text-slate-400 text-sm">استعرض أفضل العروض المعتمدة في المغرب مع خيارات المقارنة الفورية والعرض السريع والخريطة التفاعلية</p>
          </div>

          <Button
            onClick={() => setShowMap(!showMap)}
            className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 border border-amber-500/30 shadow-lg"
          >
            <Map className="w-4 h-4" /> {showMap ? 'إخفاء الخريطة التفاعلية' : 'عرض الخريطة التفاعلية'}
          </Button>
        </div>

        {/* الخريطة التفاعلية */}
        {showMap && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in-50">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" /> مواقع العروض على خريطة المغرب
              </h3>
              <span className="text-xs text-slate-400">انقر على الخريطة لاستكشاف المواقع</span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-800">
              <MapView initialCenter={{ lat: 31.7917, lng: -7.0926 }} initialZoom={6} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-6 h-fit sticky top-28 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-amber-400" />
                <span>تصفية متقدمة</span>
              </h2>
              <button
                onClick={() => {
                  setCityFilter('all');
                  setTypeFilter('all');
                  setMaxPrice(4000);
                  setExcellenceOnly(false);
                }}
                className="text-xs text-amber-400 hover:underline"
              >
                إعادة ضبط
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">بحث باللغة الطبيعية (ذكاء اصطناعي)</label>
              <input
                type="text"
                placeholder="ابحث عما ترغب به..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">القطاع</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="all">الكل (سيارات وعقارات)</option>
                <option value="car">السيارات فقط</option>
                <option value="property">العقارات فقط</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">المدينة</label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {CITIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">السعر الأقصى</span>
                <span className="text-amber-400 font-bold">{maxPrice} درهم</span>
              </div>
              <input
                type="range"
                min="200"
                max="5000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 cursor-pointer"
              />
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-300">
                تم العثور على <span className="text-amber-400 font-bold">{filteredListings.length}</span> عرض متاح
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <ArrowUpDown className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-400">الترتيب حسب:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="rating">الأعلى تقييماً</option>
                  <option value="price-asc">السعر: من الأرخص للأغلى</option>
                  <option value="price-desc">السعر: من الأغلى للأرخص</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredListings.map((item) => {
                const isCompared = compareList.some(c => c.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col group relative"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
                      
                      <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md text-amber-400 font-bold px-3 py-1 rounded-xl text-xs border border-amber-500/30">
                        {item.city}
                      </div>

                      <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 font-semibold">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{item.rating}</span>
                      </div>

                      {/* زر المقارنة */}
                      <button
                        onClick={() => toggleCompare(item)}
                        className={`absolute bottom-4 left-4 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg ${isCompared ? 'bg-amber-500 text-slate-950' : 'bg-slate-950/80 text-white hover:bg-slate-900 border border-slate-700'}`}
                      >
                        <Scale className="w-3.5 h-3.5" /> {isCompared ? 'مضاف للمقارنة' : 'مقارنة'}
                      </button>

                      {/* زر العرض السريع (Quick View) */}
                      <button
                        onClick={() => setQuickViewItem(item)}
                        className="absolute bottom-4 right-4 bg-slate-950/90 hover:bg-slate-900 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg"
                      >
                        <Eye className="w-3.5 h-3.5" /> عرض سريع
                      </button>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <span>{item.providerName}</span>
                          <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-amber-400">
                            {item.type === 'car' ? 'سيارة' : 'عقار'}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                          {item.title}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <div>
                          <span className="text-2xl font-extrabold text-white">{item.pricePerUnit}</span>
                          <span className="text-xs text-slate-400 mr-1">{item.unitLabel}</span>
                        </div>
                        <Button
                          onClick={() => setLocation(`/car/${item.id}`)}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-amber-500/20"
                        >
                          التفاصيل والحجز
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* نافذة العرض السريع المنبثقة (Quick View Modal) */}
      {quickViewItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setQuickViewItem(null)}
              className="absolute top-6 left-6 text-slate-400 hover:text-white bg-slate-900 p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-64 rounded-2xl overflow-hidden">
              <img src={quickViewItem.image} alt={quickViewItem.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 px-3 py-1 rounded-xl text-xs font-bold">
                {quickViewItem.city}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-400 font-bold">{quickViewItem.providerName}</span>
                  <h2 className="text-xl font-black text-white">{quickViewItem.title}</h2>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-black text-amber-400">{quickViewItem.pricePerUnit} {quickViewItem.unitLabel}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {quickViewItem.rating} ({quickViewItem.reviewsCount} تقييم)
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{quickViewItem.description}</p>

              <div className="flex flex-wrap gap-2">
                {quickViewItem.features.map((f, i) => (
                  <span key={i} className="text-[11px] bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1 rounded-xl">
                    ✓ {f}
                  </span>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  onClick={() => setQuickViewItem(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs"
                >
                  إغلاق
                </Button>
                <Button
                  onClick={() => setLocation(`/car/${quickViewItem.id}`)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20"
                >
                  الانتقال لصفحة الحجز الكاملة
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة المقارنة المنبثقة */}
      {showCompareModal && compareList.length === 2 && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl max-w-4xl w-full space-y-6 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setShowCompareModal(false)}
              className="absolute top-6 left-6 text-slate-400 hover:text-white bg-slate-900 p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-2">
              <span className="text-amber-500 text-xs font-bold uppercase tracking-widest">مقارنة تفصيلية</span>
              <h2 className="text-2xl font-black text-white">مقارنة جنباً إلى جنب (Side-by-Side)</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {compareList.map(c => (
                <div key={c.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <img src={c.image} alt={c.title} className="w-full h-40 object-cover rounded-xl" />
                  <h3 className="text-lg font-bold text-white text-center">{c.title}</h3>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">السعر:</span>
                      <span className="font-extrabold text-amber-400">{c.pricePerUnit} {c.unitLabel}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">المدينة:</span>
                      <span className="font-bold">{c.city}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">التقييم:</span>
                      <span className="font-bold text-amber-400">⭐ {c.rating}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">المزود:</span>
                      <span className="font-bold">{c.providerName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => setShowCompareModal(false)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 py-2.5 rounded-xl text-xs"
              >
                إنهاء المقارنة
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
