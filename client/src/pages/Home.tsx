import { useState } from 'react';
import { useLocation } from 'wouter';
import { MOCK_CARS, CITIES, CAR_CATEGORIES, Car } from '@/data/cars';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Calendar, ShieldCheck, Car as CarIcon, Star, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [, setLocation] = useLocation();

  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [startDate, setStartDate] = useState('2026-08-15');
  const [endDate, setEndDate] = useState('2026-08-20');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
      city: selectedCity,
      category: selectedCategory,
      start: startDate,
      end: endDate,
    });
    setLocation(`/search?${query.toString()}`);
  };

  const featuredCars = MOCK_CARS.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 border-b border-slate-800">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>المنصة الأولى لتأجير السيارات في المغرب</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              استأجر سيارتك المفضلة في <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">المغرب</span> بكل سهولة وأمان
            </h1>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed">
              نوفر لك أسطولاً من أرقى السيارات الفاخرة والدفع الرباعي والاقتصادية في أغادير، مراكش، الدار البيضاء، وطنجة مع توصيل مجاني للمطارات.
            </p>
          </div>

          {/* Quick Search Widget */}
          <div className="max-w-4xl mx-auto bg-slate-950/90 backdrop-blur-xl border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>المدينة أو المطار</span>
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  {CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <CarIcon className="w-4 h-4 text-amber-400" />
                  <span>فئة السيارة</span>
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  {CAR_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>فترة الإيجار</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 text-base"
              >
                <Search className="w-5 h-5" />
                <span>بحث عن السيارات</span>
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">اختر وجهتك في المغرب</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">خدماتنا متوفرة في أهم المدن والمطارات</h2>
            </div>
            <Button
              onClick={() => setLocation('/search')}
              variant="outline"
              className="border-slate-700 text-amber-400 hover:bg-slate-800"
            >
              عرض كافة السيارات <ArrowRight className="w-4 h-4 mr-2" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'مراكش', img: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80', count: '45 سيارة' },
              { name: 'أغادير', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', count: '38 سيارة' },
              { name: 'الدار البيضاء', img: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80', count: '60 سيارة' },
              { name: 'طنجة', img: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80', count: '32 سيارة' },
            ].map((city, idx) => (
              <div
                key={idx}
                onClick={() => setLocation(`/search?city=${city.name === 'مراكش' ? 'marrakech' : city.name === 'أغادير' ? 'agadir' : city.name === 'الدار البيضاء' ? 'casablanca' : 'tangier'}`)}
                className="relative h-64 rounded-3xl overflow-hidden group cursor-pointer border border-slate-800 shadow-xl"
              >
                <img src={city.img} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-6 right-6 left-6 space-y-1">
                  <h3 className="text-xl font-extrabold text-white">{city.name}</h3>
                  <p className="text-xs text-amber-400 font-semibold">{city.count} متاحة الآن</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="container mx-auto px-4 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">أبرز سيارات الأسطول</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">السيارات الأكثر طلباً لهذا الموسم</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">سيارات فخمة ومجهزة بالكامل لتضمن لك رحلة مريحة وآمنة في مختلف المدن المغربية.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCars.map((car: Car) => (
              <div
                key={car.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-amber-500/40 transition-all flex flex-col group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={car.image} alt={car.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-amber-400 font-bold px-2.5 py-1 rounded-xl text-xs border border-amber-500/30">
                    {car.cityName}
                  </div>
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-white px-2 py-1 rounded-xl text-xs flex items-center gap-1 font-semibold">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{car.rating}</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-medium">{car.brand}</span>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">{car.name}</h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-xl font-extrabold text-white">{car.pricePerDay}</span>
                      <span className="text-xs text-slate-400 mr-1">درهم / يوم</span>
                    </div>
                    <Button
                      onClick={() => setLocation(`/car/${car.id}`)}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs shadow-lg shadow-amber-500/20"
                    >
                      احجز الآن
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Button
              onClick={() => setLocation('/search')}
              className="bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-2xl text-base shadow-xl"
            >
              استعراض كافة سيارات الأسطول (8+ موديلات) <ArrowRight className="w-5 h-5 mr-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">لماذا يختارنا الآلاف؟</span>
            <h2 className="text-3xl font-extrabold text-white">مميزات منصة B2-Rent لتأجير السيارات</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl space-y-4 shadow-xl">
              <div className="w-14 h-14 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">حجز مضمون وشفاف</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                لا رسوم مخفية، أسعار واضحة تماماً تشمل الضرائب والتأمين الأساسي مع إمكانية الدفع عند الاستلام.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl space-y-4 shadow-xl">
              <div className="w-14 h-14 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
                <CarIcon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">توصيل مجاني للمطارات</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                مندوب وكالتنا سيكون في انتظارك عند بوابة الوصول في مطار مراكش، أغادير، الدار البيضاء، أو طنجة.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl space-y-4 shadow-xl">
              <div className="w-14 h-14 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
                <Phone className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">دعم عبر واتساب 24/7</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                خدمة عملاء فائقة السرعة ومتواجدة طوال اليوم لمساعدتك في اختيار السيارة وتأكيد حجزك فوراً.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
