import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { MOCK_CARS, CITIES, CAR_CATEGORIES, Car } from '@/data/cars';
import { Button } from '@/components/ui/button';
import { Filter, Star, ShieldCheck, Users, Car as CarIcon, ArrowUpDown } from 'lucide-react';

export default function Search() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);

  const [cityFilter, setCityFilter] = useState(searchParams.get('city') || 'all');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [transmissionFilter, setTransmissionFilter] = useState('all');
  const [maxPrice, setMaxPrice] = useState(2500);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rating'>('rating');

  const filteredCars = useMemo(() => {
    return MOCK_CARS.filter((car) => {
      if (cityFilter !== 'all' && car.city !== cityFilter) return false;
      if (categoryFilter !== 'all' && car.category !== categoryFilter) return false;
      if (transmissionFilter !== 'all' && car.transmission !== transmissionFilter) return false;
      if (car.pricePerDay > maxPrice) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.pricePerDay - b.pricePerDay;
      if (sortBy === 'price-desc') return b.pricePerDay - a.pricePerDay;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [cityFilter, categoryFilter, transmissionFilter, maxPrice, sortBy]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-extrabold text-white">أسطول سيارات B2-Rent</h1>
          <p className="text-slate-400 text-sm">استعرض مئات السيارات المتاحة فوراً في مختلف المدن المغربية بأفضل الأسعار</p>
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
                }}
                className="text-xs text-amber-400 hover:underline"
              >
                إعادة ضبط
              </button>
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
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                >
                  إعادة ضبط الفلاتر
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCars.map((car: Car) => (
                  <div
                    key={car.id}
                    className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-amber-500/40 transition-all duration-300 flex flex-col group"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={car.image}
                        alt={car.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-amber-400 font-bold px-3 py-1 rounded-xl text-xs border border-amber-500/30">
                        {car.cityName}
                      </div>
                      <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 font-semibold">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{car.rating}</span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="text-xs text-slate-400 font-medium">{car.agency.name}</div>
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
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm shadow-lg shadow-amber-500/20"
                        >
                          التفاصيل والحجز
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
