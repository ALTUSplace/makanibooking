import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { MOCK_CARS, CITIES, CAR_CATEGORIES, Car } from '@/data/cars';
import { Button } from '@/components/ui/button';
import { Filter, Star, ShieldCheck, Users, Car as CarIcon, ArrowUpDown, Award, Fuel, CheckCircle2, Sparkles, Scale, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Search() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);

  const [cityFilter, setCityFilter] = useState(searchParams.get('city') || 'all');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [transmissionFilter, setTransmissionFilter] = useState('all');
  const [maxPrice, setMaxPrice] = useState(2500);
  const [excellenceOnly, setExcellenceOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rating'>('rating');

  // ميزة المقارنة (Side-by-Side Comparison)
  const [compareList, setCompareList] = useState<Car[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const toggleCompare = (car: Car) => {
    if (compareList.find(c => c.id === car.id)) {
      setCompareList(compareList.filter(c => c.id !== car.id));
      toast.info('تمت إزالة السيارة من قائمة المقارنة');
    } else {
      if (compareList.length >= 2) {
        toast.error('يمكنك مقارنة سيارتين كحد أقصى في نفس الوقت');
        return;
      }
      setCompareList([...compareList, car]);
      toast.success('تمت إضافة السيارة إلى قائمة المقارنة');
    }
  };

  const filteredCars = useMemo(() => {
    return MOCK_CARS.filter((car) => {
      if (cityFilter !== 'all' && car.city !== cityFilter) return false;
      if (categoryFilter !== 'all' && car.category !== categoryFilter) return false;
      if (transmissionFilter !== 'all' && car.transmission !== transmissionFilter) return false;
      if (car.pricePerDay > maxPrice) return false;
      if (excellenceOnly && car.agency.rating < 4.8) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.pricePerDay - b.pricePerDay;
      if (sortBy === 'price-desc') return b.pricePerDay - a.pricePerDay;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [cityFilter, categoryFilter, transmissionFilter, maxPrice, excellenceOnly, sortBy]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12" dir="rtl">
      <div className="container mx-auto px-4">
        
        {/* شريط عائم للمقارنة إذا تم اختيار سيارات */}
        {compareList.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-950/95 backdrop-blur-xl border border-amber-500/50 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in-50">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold text-white">المقارنة ({compareList.length}/2):</span>
            </div>
            <div className="flex items-center gap-2">
              {compareList.map(c => (
                <span key={c.id} className="bg-slate-900 border border-slate-700 text-xs px-3 py-1 rounded-xl text-slate-200 flex items-center gap-2">
                  {c.name}
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

        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-white">أسطول سيارات وعقارات B2-Rent</h1>
            <p className="text-slate-400 text-sm">استعرض مئات العروض المتاحة فوراً في مختلف المدن المغربية مع ميزة المقارنة المتقدمة</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-6 h-fit sticky top-28 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-amber-400" />
                <span>تصفية النتائج</span>
              </h2>
              <button
                onClick={() => {
                  setCityFilter('all');
                  setCategoryFilter('all');
                  setTransmissionFilter('all');
                  setMaxPrice(2500);
                  setExcellenceOnly(false);
                }}
                className="text-xs text-amber-400 hover:underline"
              >
                إعادة ضبط
              </button>
            </div>

            {/* Excellence Filter Toggle */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-white">الوكالات المتميزة فقط</div>
                    <div className="text-[10px] text-slate-400">تقييم 4.8 فأكثر ⭐</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={excellenceOnly}
                  onChange={(e) => setExcellenceOnly(e.target.checked)}
                  className="accent-amber-500 rounded w-4 h-4"
                />
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">المدينة</label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">فئة السيارة</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {CAR_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">ناقل الحركة</label>
              <select
                value={transmissionFilter}
                onChange={(e) => setTransmissionFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="all">الكل (أوتوماتيك وعادي)</option>
                <option value="أوتوماتيك">أوتوماتيك</option>
                <option value="عادي">عادي</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">السعر الأقصى اليومي</span>
                <span className="text-amber-400 font-bold">{maxPrice} درهم</span>
              </div>
              <input
                type="range"
                min="200"
                max="3000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 cursor-pointer"
              />
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-300">
                تم العثور على <span className="text-amber-400 font-bold">{filteredCars.length}</span> سيارة متاحة
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

            {filteredCars.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-16 text-center space-y-4">
                <CarIcon className="w-16 h-16 text-slate-600 mx-auto" />
                <h3 className="text-xl font-bold text-white">لم يتم العثور على سيارات تطابق بحثك</h3>
                <Button
                  onClick={() => {
                    setCityFilter('all');
                    setCategoryFilter('all');
                    setTransmissionFilter('all');
                    setMaxPrice(2500);
                    setExcellenceOnly(false);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                >
                  إعادة ضبط الفلاتر
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCars.map((car: Car) => {
                  const isExcellence = car.agency.rating >= 4.8;
                  const isCompared = compareList.some(c => c.id === car.id);
                  return (
                    <div
                      key={car.id}
                      className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col group relative transform hover:-translate-y-1.5"
                    >
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={car.image}
                          alt={car.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                        
                        <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md text-amber-400 font-bold px-3 py-1 rounded-xl text-xs border border-amber-500/30 shadow-lg">
                          {car.cityName}
                        </div>
                        <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 font-semibold shadow-lg">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span>{car.rating}</span>
                        </div>
                        {isExcellence && (
                          <div className="absolute bottom-4 right-4 bg-amber-500 text-slate-950 font-bold px-3 py-1 rounded-xl text-[11px] flex items-center gap-1.5 shadow-lg">
                            <Award className="w-3.5 h-3.5" /> وكالة متميزة
                          </div>
                        )}

                        {/* زر المقارنة السريع */}
                        <button
                          onClick={() => toggleCompare(car)}
                          className={`absolute bottom-4 left-4 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg ${isCompared ? 'bg-amber-500 text-slate-950' : 'bg-slate-950/80 text-white hover:bg-slate-900 border border-slate-700'}`}
                        >
                          <Scale className="w-3.5 h-3.5" /> {isCompared ? 'مضاف للمقارنة' : 'مقارنة'}
                        </button>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <span>{car.agency.name}</span>
                            {isExcellence && <Award className="w-3.5 h-3.5 text-amber-400" />}
                          </div>
                          <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                            {car.name}
                          </h3>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800 text-xs text-slate-300">
                          <div className="flex items-center gap-1.5 justify-center bg-slate-900 py-1.5 rounded-lg">
                            <CarIcon className="w-3.5 h-3.5 text-amber-400" />
                            <span>{car.transmission}</span>
                          </div>
                          <div className="flex items-center gap-1.5 justify-center bg-slate-900 py-1.5 rounded-lg">
                            <Users className="w-3.5 h-3.5 text-amber-400" />
                            <span>{car.seats} مقاعد</span>
                          </div>
                          <div className="flex items-center gap-1.5 justify-center bg-slate-900 py-1.5 rounded-lg">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                            <span>{car.fuel}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <span className="text-2xl font-extrabold text-white">{car.pricePerDay}</span>
                            <span className="text-xs text-slate-400 mr-1">درهم / يوم</span>
                          </div>
                          <Button
                            onClick={() => setLocation(`/car/${car.id}`)}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform"
                          >
                            التفاصيل والحجز
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* نافذة المقارنة المنبثقة (Side-by-Side Modal) */}
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
                  <img src={c.image} alt={c.name} className="w-full h-40 object-cover rounded-xl" />
                  <h3 className="text-lg font-bold text-white text-center">{c.name}</h3>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">السعر اليومي:</span>
                      <span className="font-extrabold text-amber-400">{c.pricePerDay} درهم</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">المدينة:</span>
                      <span className="font-bold">{c.cityName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">التقييم:</span>
                      <span className="font-bold text-amber-400">⭐ {c.rating}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">ناقل الحركة:</span>
                      <span className="font-bold">{c.transmission}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">عدد المقاعد:</span>
                      <span className="font-bold">{c.seats} مقاعد</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">نوع الوقود:</span>
                      <span className="font-bold">{c.fuel}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => { setShowCompareModal(false); setLocation(`/car/${c.id}`); }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2.5 rounded-xl"
                  >
                    حجز هذه السيارة
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
