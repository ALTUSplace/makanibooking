import { useState } from 'react';
import { useLocation } from 'wouter';
import { INITIAL_BOOKINGS, Booking } from '@/data/cars';
import { Button } from '@/components/ui/button';
import { BookmarkCheck, Calendar, Car, ShieldCheck, Phone, CheckCircle, Clock, ArrowRight } from 'lucide-react';

export default function MyBookings() {
  const [, setLocation] = useLocation();
  const [bookings] = useState<Booking[]>(INITIAL_BOOKINGS);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
              <BookmarkCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">سجل المستأجر</span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">حجوزاتي السابقة والحالية</h1>
            </div>
          </div>
          <Button
            onClick={() => setLocation('/search')}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20"
          >
            حجز سيارة جديدة
          </Button>
        </div>

        <div className="space-y-6">
          {bookings.map((booking: Booking) => (
            <div key={booking.id} className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden border border-slate-800 shrink-0">
                <img src={booking.carImage} alt={booking.carName} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 space-y-2 text-right w-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">{booking.id}</span>
                  {booking.status === 'confirmed' ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> مؤكد
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5" /> قيد التأكيد
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white">{booking.carName}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <div>المدينة: <span className="font-semibold text-white">{booking.city}</span></div>
                  <div>الفترة: <span className="font-semibold text-white">{booking.startDate} إلى {booking.endDate}</span></div>
                  <div>المجموع: <span className="font-semibold text-amber-400">{booking.totalPrice} درهم</span></div>
                </div>
              </div>

              <div className="w-full md:w-auto flex md:flex-col gap-2 shrink-0">
                <a
                  href={`https://wa.me/212661234567?text=مرحباً، أريد الاستفسار عن حجزي رقم ${booking.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>تواصل مع الوكالة</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
