import { useState } from 'react';
import { AGENCIES, MOCK_CARS, INITIAL_BOOKINGS, Car, Booking } from '@/data/cars';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Car as CarIcon, BookmarkCheck, DollarSign, Star, Plus, Phone, ShieldCheck, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>(AGENCIES[0].id);
  const [cars, setCars] = useState<Car[]>(() => {
    const saved = localStorage.getItem('b2_rent_cars');
    return saved ? JSON.parse(saved) : MOCK_CARS;
  });
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('b2_rent_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const currentAgency = AGENCIES.find((a) => a.id === selectedAgencyId) || AGENCIES[0];

  const agencyCars = cars.filter((c) => c.agencyId === selectedAgencyId);
  const agencyCarIds = agencyCars.map((c) => c.id);
  const agencyBookings = bookings.filter((b) => agencyCarIds.includes(b.carId));

  const totalRevenue = agencyBookings.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

  const handleStatusChange = (bookingId: string, newStatus: 'confirmed' | 'completed') => {
    const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b));
    setBookings(updated);
    localStorage.setItem('b2_rent_bookings', JSON.stringify(updated));
    toast.success('تم تحديث حالة الحجز بنجاح وإشعار العميل');
  };

  const handleToggleCarAvailability = (carId: string) => {
    const updated = cars.map((c) => (c.id === carId ? { ...c, available: !c.available } : c));
    setCars(updated);
    localStorage.setItem('b2_rent_cars', JSON.stringify(updated));
    toast.success('تم تحديث حالة توفر السيارة في أسطول الوكالة');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
      <div className="container mx-auto px-4 space-y-8">
        
        {/* Agency Selector Bar */}
        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">لوحة تحكم الوكالة المستقلة</span>
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-4 h-4" /> نظام آلي متكامل
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">{currentAgency.name}</h1>
            <p className="text-xs text-slate-400">العنوان: {currentAgency.address} | الهاتف: {currentAgency.phone}</p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-300">اختر الوكالة:</label>
            <select
              value={selectedAgencyId}
              onChange={(e) => setSelectedAgencyId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {AGENCIES.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name} ({ag.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">إجمالي أرباح الوكالة</span>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">{totalRevenue.toLocaleString()} <span className="text-xs text-slate-400">درهم</span></div>
            <p className="text-[10px] text-emerald-400">محدث تلقائياً مع كل حجز مؤكد</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">سيارات الأسطول النشطة</span>
              <CarIcon className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white">{agencyCars.length} <span className="text-xs text-slate-400">سيارة</span></div>
            <p className="text-[10px] text-amber-400">جاهزة للحجز الفوري</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">طلبات الحجز الواردة</span>
              <BookmarkCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-white">{agencyBookings.length} <span className="text-xs text-slate-400">حجز</span></div>
            <p className="text-[10px] text-blue-400">عبر المنصة والواتساب الآلي</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">تقييم العملاء العام</span>
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div className="text-3xl font-black text-white">{currentAgency.rating} <span className="text-xs text-slate-400">/ 5.0</span></div>
            <p className="text-[10px] text-amber-400">بناءً على {currentAgency.reviewsCount} تقييم حقيقي</p>
          </div>
        </div>

        {/* Bookings Table Section */}
        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-amber-400" />
              <span>إدارة حجوزات هذه الوكالة</span>
            </h2>
            <span className="text-xs text-slate-400">يتم إرسال إشعارات الحجز تلقائياً لواتساب الوكالة</span>
          </div>

          {agencyBookings.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              لا توجد حجوزات مسجلة لهذه الوكالة حالياً.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 px-4">رقم الحجز</th>
                    <th className="pb-3 px-4">السيارة المحجوزة</th>
                    <th className="pb-3 px-4">المستأجر</th>
                    <th className="pb-3 px-4">الفترة</th>
                    <th className="pb-3 px-4">المبلغ الإجمالي</th>
                    <th className="pb-3 px-4">الحالة</th>
                    <th className="pb-3 px-4 text-center">إجراءات التحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {agencyBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-900/55 transition-colors">
                      <td className="py-4 px-4 font-bold text-amber-400">{b.id}</td>
                      <td className="py-4 px-4 font-semibold text-white flex items-center gap-2">
                        <img src={b.carImage} alt={b.carName} className="w-10 h-10 object-cover rounded-xl border border-slate-700" />
                        <span>{b.carName}</span>
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        <div className="font-bold text-white">{b.customerName}</div>
                        <div className="text-[10px] text-slate-400">{b.customerPhone}</div>
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        <div>من: {b.startDate}</div>
                        <div>إلى: {b.endDate} ({b.days} أيام)</div>
                      </td>
                      <td className="py-4 px-4 font-extrabold text-white">{b.totalPrice} درهم</td>
                      <td className="py-4 px-4">
                        {b.status === 'confirmed' ? (
                          <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3" /> مؤكد
                          </span>
                        ) : b.status === 'completed' ? (
                          <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold border border-blue-500/30 w-fit">
                            منتهي
                          </span>
                        ) : (
                          <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-[10px] font-bold border border-amber-500/30 flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" /> قيد المراجعة
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {b.status === 'pending' && (
                            <Button
                              onClick={() => handleStatusChange(b.id, 'confirmed')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 h-auto rounded-xl"
                            >
                              تأكيد الحجز
                            </Button>
                          )}
                          <a
                            href={`https://wa.me/${currentAgency.whatsapp}?text=${encodeURIComponent(`مرحباً، بخصوص الحجز رقم ${b.id} للسيارة ${b.carName} للمستأجر ${b.customerName}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-700 hover:bg-emerald-600 text-white p-2 rounded-xl"
                            title="تواصل مع العميل عبر واتساب"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Agency Cars Fleet */}
        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CarIcon className="w-5 h-5 text-amber-400" />
              <span>أسطول سيارات الوكالة</span>
            </h2>
            <Button
              onClick={() => window.location.href = '/add-car'}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" /> إضافة سيارة جديدة للوكالة
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {agencyCars.map((car) => (
              <div key={car.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between">
                <div>
                  <div className="relative h-44 overflow-hidden">
                    <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 bg-slate-950/80 text-amber-400 font-bold px-2.5 py-1 rounded-xl text-xs border border-amber-500/30">
                      {car.pricePerDay} درهم / يوم
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-bold text-white">{car.name}</h3>
                    <p className="text-xs text-slate-400">{car.cityName} | {car.transmission} | {car.fuel}</p>
                  </div>
                </div>
                <div className="p-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-semibold">متاحة للحجز التلقائي</span>
                  <Button
                    onClick={() => handleToggleCarAvailability(car.id)}
                    variant="outline"
                    className="border-slate-700 text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
                  >
                    تعديل الحالة
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
