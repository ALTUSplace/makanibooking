import { useState } from 'react';
import { useLocation } from 'wouter';
import { INITIAL_BOOKINGS, MOCK_CARS, Booking } from '@/data/cars';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Car, Calendar, DollarSign, PlusCircle, CheckCircle, Clock, ShieldCheck, Phone } from 'lucide-react';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [bookings] = useState<Booking[]>(INITIAL_BOOKINGS);

  const totalRevenue = bookings.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const activeBookingsCount = bookings.length;
  const totalCarsCount = MOCK_CARS.length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
      <div className="container mx-auto px-4 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">لوحة التحكم المركزية</span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">Atlas Luxury Cars Marrakech</h1>
            </div>
          </div>
          <Button
            onClick={() => setLocation('/add-car')}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>إضافة سيارة جديدة</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">إجمالي الأرباح</span>
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{totalRevenue.toLocaleString()} درهم</div>
            <p className="text-xs text-emerald-400 flex items-center gap-1">+12% مقارنة بالشهر الماضي</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">الحجوزات النشطة</span>
              <Calendar className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{activeBookingsCount}</div>
            <p className="text-xs text-slate-400">حجوزات مؤكدة وقيد التنفيذ</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">السيارات المعروضة</span>
              <Car className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{totalCarsCount} سيارات</div>
            <p className="text-xs text-amber-400">جميع السيارات متاحة للتأجير</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">تقييم الوكالة</span>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">4.9 / 5.0</div>
            <p className="text-xs text-slate-400">بناءً على 140+ تقييم</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl">
          <h2 className="text-xl font-bold text-white border-l-2 border-amber-500 pl-3">سجل الحجوزات الأخيرة</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="pb-4 pr-4">رقم الحجز</th>
                  <th className="pb-4">السيارة</th>
                  <th className="pb-4">العميل</th>
                  <th className="pb-4">الفترة</th>
                  <th className="pb-4">المبلغ</th>
                  <th className="pb-4">الحالة</th>
                  <th className="pb-4 pl-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-4 pr-4 font-bold text-amber-400">{booking.id}</td>
                    <td className="py-4 font-semibold text-white">{booking.carName}</td>
                    <td className="py-4">
                      <div>{booking.customerName}</div>
                      <div className="text-xs text-slate-400" dir="ltr">{booking.customerPhone}</div>
                    </td>
                    <td className="py-4 text-xs text-slate-300">
                      <div>{booking.startDate} إلى {booking.endDate}</div>
                      <div className="text-slate-500">({booking.days} أيام)</div>
                    </td>
                    <td className="py-4 font-bold text-white">{booking.totalPrice} درهم</td>
                    <td className="py-4">
                      {booking.status === 'confirmed' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" /> مؤكد
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold">
                          <Clock className="w-3.5 h-3.5" /> قيد الانتظار
                        </span>
                      )}
                    </td>
                    <td className="py-4 pl-4 text-left">
                      <a
                        href={`https://wa.me/212661234567?text=مرحباً، بخصوص حجزك ${booking.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-emerald-600/80 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" /> واتساب
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
