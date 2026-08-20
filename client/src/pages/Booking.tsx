import { useState } from 'react';
import { useLocation } from 'wouter';
import { MOCK_CARS } from '@/data/cars';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Calendar, MapPin, Phone, User, Mail, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Booking() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);

  const carId = searchParams.get('carId') || 'car-1';
  const startDate = searchParams.get('startDate') || '2026-08-15';
  const endDate = searchParams.get('endDate') || '2026-08-20';
  const days = searchParams.get('days') || '5';
  const total = searchParams.get('total') || '9000';

  const car = MOCK_CARS.find((c) => c.id === carId) || MOCK_CARS[0];

  const [fullName, setFullName] = useState('يوسف العلوي');
  const [phone, setPhone] = useState('+212 661 112 233');
  const [email, setEmail] = useState('youssef@example.ma');
  const [deliveryLocation, setDeliveryLocation] = useState('مطار المنارة الدولي، مراكش');
  const [paymentMethod, setPaymentMethod] = useState('agency');

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
      carId: car.id,
      name: fullName,
      phone,
      total,
      days,
      start: startDate,
      end: endDate,
    });
    setLocation(`/success?${query.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => setLocation(`/car/${car.id}`)}
          className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 mb-8 font-medium transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لصفحة السيارة</span>
        </button>

        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-white">تأكيد حجز السيارة</h1>
            <p className="text-slate-400 text-sm">أدخل بياناتك الشخصية لتثبيت الحجز وإرسال التفاصيل مباشرة للوكالة عبر واتساب</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl">
              <form onSubmit={handleSubmitBooking} className="space-y-6">
                <h2 className="text-lg font-bold text-white border-l-2 border-amber-500 pl-3">معلومات المستأجر</h2>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-amber-400" />
                    <span>الاسم الكامل</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-amber-400" />
                      <span>رقم الهاتف (واتساب)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-amber-400" />
                      <span>البريد الإلكتروني</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>مكان الاستلام المطلوب (المطار، الفندق، المدينة)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <h3 className="text-sm font-bold text-white">طريقة الدفع</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${paymentMethod === 'agency' ? 'bg-amber-500/10 border-amber-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'agency'}
                        onChange={() => setPaymentMethod('agency')}
                        className="mt-1 accent-amber-500"
                      />
                      <div className="space-y-1">
                        <div className="font-bold text-sm text-white">الدفع عند الاستلام للوكالة</div>
                        <div className="text-xs">الدفع نقداً أو بالبطاقة عند استلام السيارة في المطار أو الوكالة</div>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${paymentMethod === 'card' ? 'bg-amber-500/10 border-amber-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="mt-1 accent-amber-500"
                      />
                      <div className="space-y-1">
                        <div className="font-bold text-sm text-white">الدفع الإلكتروني الآمن</div>
                        <div className="text-xs">تأكيد الحجز فورياً عبر بطاقة البانك المغربية أو الدولية</div>
                      </div>
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-4 rounded-xl shadow-lg shadow-amber-500/25 text-base"
                >
                  تأكيد الحجز وإرسال التفاصيل عبر واتساب 🚀
                </Button>
              </form>
            </div>

            <div className="md:col-span-1">
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl sticky top-28">
                <h3 className="font-bold text-white border-l-2 border-amber-500 pl-3">ملخص الحجز</h3>

                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden h-36 border border-slate-800">
                    <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-xs text-amber-400 font-semibold">{car.brand}</div>
                    <div className="text-base font-bold text-white">{car.name}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-800 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">تاريخ الاستلام:</span>
                    <span className="font-semibold">{startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">تاريخ التسليم:</span>
                    <span className="font-semibold">{endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">المدة:</span>
                    <span className="font-semibold">{days} أيام</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-white">المجموع الكلي:</span>
                  <span className="text-2xl font-extrabold text-amber-400">{total} درهم</span>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-2xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-300 leading-relaxed">
                    حجز مضمون 100%. لن يتم اقتطاع أي مبلغ إلا بعد تواصل الوكالة معك.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
