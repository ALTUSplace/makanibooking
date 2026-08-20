import { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { MOCK_CARS, Car } from '@/data/cars';
import { Button } from '@/components/ui/button';
import { Car as CarIcon, Star, ShieldCheck, Users, Calendar, CheckCircle2, Phone, ArrowRight, Fuel, Briefcase } from 'lucide-react';

export default function CarDetails() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/car/:id');
  const carId = params?.id || 'car-1';

  const car = MOCK_CARS.find((c) => c.id === carId) || MOCK_CARS[0];

  const [startDate, setStartDate] = useState('2026-08-15');
  const [endDate, setEndDate] = useState('2026-08-20');
  const [includeInsurance, setIncludeInsurance] = useState(true);
  const [includeBabySeat, setIncludeBabySeat] = useState(false);

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  const insurancePrice = includeInsurance ? 100 * diffDays : 0;
  const babySeatPrice = includeBabySeat ? 50 * diffDays : 0;
  const carTotal = car.pricePerDay * diffDays;
  const grandTotal = carTotal + insurancePrice + babySeatPrice;

  const handleProceedToBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
      carId: car.id,
      startDate,
      endDate,
      days: diffDays.toString(),
      total: grandTotal.toString(),
      insurance: includeInsurance.toString(),
      babySeat: includeBabySeat.toString(),
    });
    setLocation(`/booking?${query.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
      <div className="container mx-auto px-4">
        <button
          onClick={() => setLocation('/search')}
          className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 mb-8 font-medium transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى قائمة السيارات</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl h-96">
              <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md text-amber-400 font-bold px-4 py-1.5 rounded-2xl text-sm border border-amber-500/30">
                {car.cityName}
              </div>
              <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl text-sm flex items-center gap-1.5 font-semibold">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{car.rating} ({car.reviewsCount} تقييم)</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">{car.brand}</span>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">{car.name}</h1>
                </div>
                <div className="text-left">
                  <span className="text-3xl font-extrabold text-white">{car.pricePerDay}</span>
                  <span className="text-sm text-slate-400 mr-1">درهم / يوم</span>
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">{car.description}</p>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                    {car.agency.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm flex items-center gap-1.5">
                      <span>{car.agency.name}</span>
                      {car.agency.verified && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                    </h4>
                    <p className="text-xs text-slate-400">وكالة معتمدة لدى B2-Rent</p>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${car.agency.whatsapp}?text=السلام عليكم، مهتم بتأجير سيارة ${car.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>مراسلة الوكالة</span>
                </a>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-xl">
              <h2 className="text-lg font-bold text-white border-l-2 border-amber-500 pl-3">مواصفات السيارة</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <CarIcon className="w-5 h-5 text-amber-400 mb-2" />
                  <div className="text-xs text-slate-400">ناقل الحركة</div>
                  <div className="text-sm font-bold text-white">{car.transmission}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <Fuel className="w-5 h-5 text-amber-400 mb-2" />
                  <div className="text-xs text-slate-400">نوع الوقود</div>
                  <div className="text-sm font-bold text-white">{car.fuel}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <Users className="w-5 h-5 text-amber-400 mb-2" />
                  <div className="text-xs text-slate-400">عدد المقاعد</div>
                  <div className="text-sm font-bold text-white">{car.seats} مقاعد</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <Briefcase className="w-5 h-5 text-amber-400 mb-2" />
                  <div className="text-xs text-slate-400">حقائب السفر</div>
                  <div className="text-sm font-bold text-white">{car.bags} حقائب</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-xl">
              <h2 className="text-lg font-bold text-white border-l-2 border-amber-500 pl-3">الميزات والخصائص</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {car.features.map((feat, index) => (
                  <div key={index} className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                    <span className="text-sm text-slate-200">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-6 sticky top-28 shadow-2xl">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-2xl font-extrabold text-white">{car.pricePerDay}</span>
                <span className="text-xs text-slate-400 mr-1">درهم / يوم</span>
              </div>

              <form onSubmit={handleProceedToBooking} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>تاريخ الاستلام</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>تاريخ التسليم</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <span className="text-xs font-semibold text-amber-400">الإضافات الاختيارية</span>
                  <label className="flex items-center justify-between text-xs bg-slate-900 p-3 rounded-xl border border-slate-800 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeInsurance}
                        onChange={(e) => setIncludeInsurance(e.target.checked)}
                        className="accent-amber-500 rounded"
                      />
                      <span>تأمين شامل ممتاز</span>
                    </div>
                    <span className="text-slate-400">+100 درهم/يوم</span>
                  </label>

                  <label className="flex items-center justify-between text-xs bg-slate-900 p-3 rounded-xl border border-slate-800 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeBabySeat}
                        onChange={(e) => setIncludeBabySeat(e.target.checked)}
                        className="accent-amber-500 rounded"
                      />
                      <span>مقعد أطفال آمن</span>
                    </div>
                    <span className="text-slate-400">+50 درهم/يوم</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>مدة الإيجار:</span>
                    <span>{diffDays} أيام</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>سعر السيارة الأساسي:</span>
                    <span>{carTotal} درهم</span>
                  </div>
                  {includeInsurance && (
                    <div className="flex justify-between text-slate-400">
                      <span>التأمين الشامل:</span>
                      <span>{insurancePrice} درهم</span>
                    </div>
                  )}
                  {includeBabySeat && (
                    <div className="flex justify-between text-slate-400">
                      <span>مقعد الأطفال:</span>
                      <span>{babySeatPrice} درهم</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-white text-base pt-3 border-t border-slate-800">
                    <span>المجموع الكلي:</span>
                    <span className="text-amber-400">{grandTotal} درهم</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/25 mt-4"
                >
                  متابعة إلى تأكيد الحجز
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
