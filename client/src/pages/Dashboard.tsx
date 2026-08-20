import { useState } from 'react';
import { AGENCIES, MOCK_CARS, INITIAL_BOOKINGS, Car, Booking } from '@/data/cars';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Car as CarIcon, BookmarkCheck, DollarSign, Star, Plus, Phone, ShieldCheck, CheckCircle, XCircle, Clock, Edit3, MapPin, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { MapView } from '@/components/Map';

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

  // Map Filter states
  const [mapFilterCategory, setMapFilterCategory] = useState<string>('all');
  const [mapFilterStatus, setMapFilterStatus] = useState<'all' | 'available' | 'booked'>('all');

  // Edit car state
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  const currentAgency = AGENCIES.find((a) => a.id === selectedAgencyId) || AGENCIES[0];

  const agencyCars = cars.filter((c) => {
    const matchesAgency = c.agencyId === selectedAgencyId;
    if (!matchesAgency) return false;
    if (mapFilterCategory !== 'all' && c.category !== mapFilterCategory) return false;
    if (mapFilterStatus === 'available' && c.available === false) return false;
    if (mapFilterStatus === 'booked' && c.available === true) return false;
    return true;
  });

  const agencyAllCars = cars.filter((c) => c.agencyId === selectedAgencyId);
  const agencyCarIds = agencyAllCars.map((c) => c.id);
  const agencyBookings = bookings.filter((b) => agencyCarIds.includes(b.carId));

  const totalRevenue = agencyBookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

  const handleStatusChange = (bookingId: string, newStatus: 'confirmed' | 'rejected' | 'completed') => {
    const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b));
    setBookings(updated);
    localStorage.setItem('b2_rent_bookings', JSON.stringify(updated));
    if (newStatus === 'confirmed') {
      toast.success('تم قبول وتأكيد الحجز بنجاح! تم إشعار العميل.');
    } else if (newStatus === 'rejected') {
      toast.error('تم رفض طلب الحجز وإشعار العميل.');
    } else {
      toast.info('تم تحديث حالة الحجز إلى مكتمل.');
    }
  };

  const handleSaveCarEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCar) return;
    const updated = cars.map((c) => (c.id === editingCar.id ? editingCar : c));
    setCars(updated);
    localStorage.setItem('b2_rent_cars', JSON.stringify(updated));
    setEditingCar(null);
    toast.success('تم تحديث بيانات السيارة والسعر والصورة بنجاح!');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12" dir="rtl">
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
            <p className="text-xs text-slate-400">العنوان: {currentAgency.address} | الهاتف: {currentAgency.phone} | البريد: {currentAgency.email}</p>
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
              <span className="text-xs text-slate-400 font-semibold">سيارات وعقارات الأسطول</span>
              <CarIcon className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white">{agencyAllCars.length} <span className="text-xs text-slate-400">عنصر</span></div>
            <p className="text-[10px] text-amber-400">جاهزة للحجز الفوري</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">طلبات الحجز الواردة</span>
              <BookmarkCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-white">{agencyBookings.length} <span className="text-xs text-slate-400">حجز</span></div>
            <p className="text-[10px] text-blue-400">تحكم بالقبول والرفض الفوري</p>
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

        {/* Interactive Fleet Map Section with Advanced Filters */}
        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <span>خريطة أسطول الوكالة الجغرافية التفاعلية ({currentAgency.city})</span>
              </h2>
              <span className="text-xs text-slate-400">استعراض مواقع المركبات والعقارات ومطابقتها مع فلاتر الفرز الحية</span>
            </div>

            {/* Map Advanced Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-bold text-slate-300">الفئة:</span>
                <select
                  value={mapFilterCategory}
                  onChange={(e) => setMapFilterCategory(e.target.value)}
                  className="bg-transparent text-amber-400 text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="all">جميع الفئات</option>
                  <option value="suv">دفع رباعي (SUV)</option>
                  <option value="luxury">سيارات فاخرة</option>
                  <option value="sedan">عائلية (Sedan)</option>
                  <option value="economic">اقتصادية</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl">
                <span className="text-[10px] font-bold text-slate-300">التوفر:</span>
                <select
                  value={mapFilterStatus}
                  onChange={(e) => setMapFilterStatus(e.target.value as any)}
                  className="bg-transparent text-emerald-400 text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="available">متاح للحجز</option>
                  <option value="booked">محجوز حالياً</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-80 w-full rounded-2xl overflow-hidden border border-slate-800">
            <MapView
              onMapReady={(map: any) => {
                const maps = (window as any).google?.maps;
                if (maps) {
                  const geocoder = new maps.Geocoder();
                  geocoder.geocode({ address: `${currentAgency.city}, المغرب` }, (results: any, status: any) => {
                    if (status === 'OK' && results && results[0]) {
                      const loc = results[0].geometry.location;
                      map.setCenter(loc);
                      map.setZoom(12);

                      // Add marker for agency
                      new maps.Marker({
                        position: loc,
                        map,
                        title: currentAgency.name,
                      });

                      // Add markers for filtered cars
                      agencyCars.forEach((car, index) => {
                        const offsetLat = loc.lat() + (Math.sin(index) * 0.02);
                        const offsetLng = loc.lng() + (Math.cos(index) * 0.02);
                        new maps.Marker({
                          position: { lat: offsetLat, lng: offsetLng },
                          map,
                          title: `${car.name} - ${car.pricePerDay} درهم/يوم`,
                        });
                      });
                    }
                  });
                }
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>عدد العناصر المطابقة للفلتر على الخريطة: <strong className="text-amber-400">{agencyCars.length}</strong> عنصر</span>
            <span>📍 يتم تحديث علامات الخريطة تلقائياً حسب الفلاتر المحددة</span>
          </div>
        </div>

        {/* Bookings Table Section with Accept/Reject */}
        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-amber-400" />
              <span>إدارة وقبول/رفض حجوزات الوكالة</span>
            </h2>
            <span className="text-xs text-slate-400">يتم إرسال إشعارات فورية للزبون عند القبول أو الرفض</span>
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
                    <th className="pb-3 px-4">العنصر المحجوز</th>
                    <th className="pb-3 px-4">المستأجر</th>
                    <th className="pb-3 px-4">الفترة</th>
                    <th className="pb-3 px-4">المبلغ</th>
                    <th className="pb-3 px-4">الحالة</th>
                    <th className="pb-3 px-4 text-center">إجراءات القبول والرفض</th>
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
                            <CheckCircle className="w-3 h-3" /> مؤكد ومقبول
                          </span>
                        ) : b.status === 'rejected' ? (
                          <span className="bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-[10px] font-bold border border-rose-500/30 flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" /> مرفوض
                          </span>
                        ) : b.status === 'completed' ? (
                          <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold border border-blue-500/30 w-fit">
                            مكتمل
                          </span>
                        ) : (
                          <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-[10px] font-bold border border-amber-500/30 flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" /> قيد الانتظار
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {b.status === 'pending' && (
                            <>
                              <Button
                                onClick={() => handleStatusChange(b.id, 'confirmed')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 h-auto rounded-xl"
                              >
                                قبول الحجز
                              </Button>
                              <Button
                                onClick={() => handleStatusChange(b.id, 'rejected')}
                                className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-3 py-1.5 h-auto rounded-xl"
                              >
                                رفض
                              </Button>
                            </>
                          )}
                          {b.status === 'confirmed' && (
                            <Button
                              onClick={() => handleStatusChange(b.id, 'completed')}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1.5 h-auto rounded-xl"
                            >
                              إنهاء الإيجار
                            </Button>
                          )}
                          <a
                            href={`tel:${b.customerPhone}`}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-xl"
                            title="اتصال بالعميل"
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

        {/* Agency Fleet & Property Management (Images, Pricing, Info) */}
        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CarIcon className="w-5 h-5 text-amber-400" />
              <span>إدارة الأسطول والأسعار والصور (تحديث فوري)</span>
            </h2>
            <Button
              onClick={() => window.location.href = '/add-car'}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" /> إضافة عنصر جديد للأسطول
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {agencyAllCars.map((car) => (
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
                    <p className="text-xs text-slate-400">{car.cityName} | {car.transmission || 'عقار'} | {car.fuel || 'مفروش'}</p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-slate-800/80 mt-2">
                  <Button
                    onClick={() => setEditingCar(car)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> تعديل السعر / التفاصيل
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Car Modal */}
        {editingCar && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl" dir="rtl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">تعديل بيانات المركبة / العقار</h3>
                <button onClick={() => setEditingCar(null)} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveCarEdit} className="space-y-4">
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-300">اسم العنصر</label>
                  <input
                    type="text"
                    value={editingCar.name}
                    onChange={(e) => setEditingCar({ ...editingCar, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-300">السعر اليومي (درهم)</label>
                  <input
                    type="number"
                    value={editingCar.pricePerDay}
                    onChange={(e) => setEditingCar({ ...editingCar, pricePerDay: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-300">رابط الصورة (URL)</label>
                  <input
                    type="text"
                    value={editingCar.image}
                    onChange={(e) => setEditingCar({ ...editingCar, image: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setEditingCar(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-5 py-2 rounded-xl text-xs"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-2 rounded-xl text-xs"
                  >
                    حفظ التعديلات
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
