import { useState, useRef } from 'react';
import { AGENCIES, MOCK_CARS, INITIAL_BOOKINGS, Car, Booking } from '@/data/cars';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Car as CarIcon, BookmarkCheck, DollarSign, Star, Plus, Phone, ShieldCheck, CheckCircle, XCircle, Clock, Edit3, MapPin, Filter, Download, FileSpreadsheet, Calendar, TrendingUp } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { MapView } from '@/components/Map';
import { jsPDF } from 'jspdf';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const utils = trpc.useUtils();
  const { data: dbListings = [] } = trpc.listings.list.useQuery();
  const { data: dbBookings = [] } = trpc.bookings.list.useQuery();

  const createListingMutation = trpc.listings.create.useMutation({
    onSuccess: () => {
      toast.success('تمت إضافة الإعلان بنجاح إلى قاعدة البيانات!');
      utils.listings.list.invalidate();
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewPrice('');
      setNewCity('الدار البيضاء');
    },
    onError: (err) => {
      toast.error('حدث خطأ أثناء إضافة الإعلان: ' + err.message);
    }
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('car');
  const [newPrice, setNewPrice] = useState('');
  const [newCity, setNewCity] = useState('الدار البيضاء');
  const [newImageUrl, setNewImageUrl] = useState('');

  const [selectedAgencyId, setSelectedAgencyId] = useState<string>(AGENCIES[0].id);
  const [cars, setCars] = useState<Car[]>(() => {
    const saved = localStorage.getItem('b2_rent_cars');
    return saved ? JSON.parse(saved) : MOCK_CARS;
  });
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('b2_rent_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  // Report Date Range filter state
  const [reportTimeRange, setReportTimeRange] = useState<'all' | 'week' | 'month'>('all');

  // Map Filter states
  const [mapFilterCategory, setMapFilterCategory] = useState<string>('all');
  const [mapFilterStatus, setMapFilterStatus] = useState<'all' | 'available' | 'booked'>('all');

  // Edit car state
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  // WhatsApp Custom Reminder Modal state
  const [whatsappBooking, setWhatsappBooking] = useState<Booking | null>(null);
  const [customWhatsappMsg, setCustomWhatsappMsg] = useState<string>('');

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

  // Filter bookings for export based on time range
  const getFilteredBookingsForExport = () => {
    if (reportTimeRange === 'week') {
      return agencyBookings.slice(0, Math.min(agencyBookings.length, 3));
    } else if (reportTimeRange === 'month') {
      return agencyBookings.slice(0, Math.min(agencyBookings.length, 6));
    }
    return agencyBookings;
  };

  const exportBookings = getFilteredBookingsForExport();

  const totalRevenue = exportBookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

  // Dynamic Chart Data based on time range
  const getChartData = () => {
    if (reportTimeRange === 'week') {
      return [
        { name: 'الإثنين', revenue: 1200, bookings: 1 },
        { name: 'الثلاثاء', revenue: 2400, bookings: 2 },
        { name: 'الأربعاء', revenue: 1800, bookings: 1 },
        { name: 'الخميس', revenue: 3600, bookings: 3 },
        { name: 'الجمعة', revenue: 4800, bookings: 4 },
        { name: 'السبت', revenue: 5200, bookings: 5 },
        { name: 'الأحد', revenue: 3900, bookings: 3 },
      ];
    } else if (reportTimeRange === 'month') {
      return [
        { name: 'الأسبوع 1', revenue: 8500, bookings: 7 },
        { name: 'الأسبوع 2', revenue: 12400, bookings: 11 },
        { name: 'الأسبوع 3', revenue: 15600, bookings: 14 },
        { name: 'الأسبوع 4', revenue: 19200, bookings: 18 },
      ];
    }
    return [
      { name: 'يناير', revenue: 22000, bookings: 18 },
      { name: 'فبراير', revenue: 28000, bookings: 24 },
      { name: 'مارس', revenue: 34000, bookings: 30 },
      { name: 'أبريل', revenue: 41000, bookings: 36 },
      { name: 'مايو', revenue: 49000, bookings: 42 },
      { name: 'يونيو', revenue: 58000, bookings: 50 },
    ];
  };

  const chartData = getChartData();

  const mapRef = useRef<google.maps.Map | null>(null);

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

  const exportAgencyExcel = () => {
    const rangeLabel = reportTimeRange === 'week' ? 'Weekly' : reportTimeRange === 'month' ? 'Monthly' : 'AllTime';
    const csvHeader = 'BookingID,ItemName,CustomerName,Phone,Period,TotalMAD,Status\n';
    const csvRows = exportBookings.map(b => `${b.id},"${b.carName}","${b.customerName}","${b.customerPhone}","${b.startDate} to ${b.endDate}",${b.totalPrice},${b.status}`).join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvHeader + csvRows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `B2Rent_Agency_${currentAgency.name}_${rangeLabel}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`تم تصدير تقرير الوكالة (${rangeLabel}) بصيغة Excel/CSV بنجاح!`);
  };

  const exportAgencyPDF = () => {
    try {
      const rangeLabel = reportTimeRange === 'week' ? 'أسبوعي' : reportTimeRange === 'month' ? 'شهري' : 'شامل الكل';
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text(`B2-RENT - Agency Report (${rangeLabel})`, 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Agency: ${currentAgency.name} (${currentAgency.city})`, 20, 35);
      doc.text(`Period Filter: ${rangeLabel}`, 20, 43);
      doc.text(`Total Revenue: ${totalRevenue} MAD`, 20, 51);
      doc.text(`Filtered Bookings Count: ${exportBookings.length}`, 20, 59);

      doc.line(20, 66, 190, 66);
      doc.setFont("helvetica", "bold");
      doc.text("Bookings Summary:", 20, 76);

      let y = 86;
      exportBookings.forEach((b, idx) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`${idx + 1}. [${b.id}] ${b.carName} - ${b.customerName} (${b.totalPrice} MAD) - ${b.status}`, 20, y);
        y += 8;
      });

      doc.save(`B2Rent_Agency_${currentAgency.name}_Report.pdf`);
      toast.success(`تم تصدير تقرير الوكالة (${rangeLabel}) بصيغة PDF بنجاح!`);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء تصدير ملف الـ PDF');
    }
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

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
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

            {/* Time Range Filter for Export & Saved Templates */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <select
                  value={reportTimeRange}
                  onChange={(e) => setReportTimeRange(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="all">كل التقارير (شامل)</option>
                  <option value="week">تقرير أسبوعي</option>
                  <option value="month">تقرير شهري</option>
                </select>
              </div>

              {/* Saved Templates Button */}
              <button
                onClick={() => {
                  localStorage.setItem(`b2rent_template_${selectedAgencyId}`, reportTimeRange);
                  toast.success(`تم حفظ قالب التقرير الحالي (${reportTimeRange === 'week' ? 'أسبوعي' : reportTimeRange === 'month' ? 'شهري' : 'شامل'}) بنجاح للوكالة!`);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1 shadow-sm"
                title="حفظ إعدادات الفلتر الحالي كقالب افتراضي"
              >
                💾 حفظ القالب
              </button>

              <button
                onClick={() => {
                  const savedTemplate = localStorage.getItem(`b2rent_template_${selectedAgencyId}`);
                  if (savedTemplate && (savedTemplate === 'all' || savedTemplate === 'week' || savedTemplate === 'month')) {
                    setReportTimeRange(savedTemplate);
                    toast.success(`تم تطبيق القالب المحفوظ بنجاح: (${savedTemplate === 'week' ? 'أسبوعي' : savedTemplate === 'month' ? 'شهري' : 'شامل'})`);
                  } else {
                    toast.error('لا يوجد قالب محفوظ لهذه الوكالة بعد.');
                  }
                }}
                className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1 shadow-sm"
                title="استدعاء القالب المحفوظ"
              >
                📂 تطبيق القالب
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={exportAgencyExcel}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
              >
                <FileSpreadsheet className="w-4 h-4" /> Excel ({exportBookings.length})
              </Button>
              <Button
                onClick={exportAgencyPDF}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-4 h-4" /> PDF ({exportBookings.length})
              </Button>
            </div>
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
            <p className="text-[10px] text-emerald-400">محدث تلقائياً حسب النطاق الزمني</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">سيارات وعقارات الأسطول</span>
              <CarIcon className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white">{agencyAllCars.length} <span className="text-xs text-slate-400">عنصر</span></div>
            <p className="text-[10px] text-amber-400">إدارة الأسعار والصور بمرونة</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">طلبات الحجوزات</span>
              <BookmarkCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-white">{agencyBookings.length} <span className="text-xs text-slate-400">حجز</span></div>
            <p className="text-[10px] text-blue-400">قبول أو رفض فوري للحجوزات</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">متوسط التقييم</span>
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div className="text-3xl font-black text-white">{currentAgency.rating} <span className="text-xs text-slate-400">/ 5.0</span></div>
            <p className="text-[10px] text-amber-400">وكالة معتمدة وموثوقة</p>
          </div>
        </div>

        {/* Interactive Analytics Chart Section */}
        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span>الإحصائيات المالية ونمو الحجوزات (حسب النطاق الزمني المحدد)</span>
            </h2>
            <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              {reportTimeRange === 'week' ? 'تقرير أسبوعي تفاعلي' : reportTimeRange === 'month' ? 'تقرير شهري تفاعلي' : 'تقرير سنوي شامل'}
            </span>
          </div>

          <div className="h-[320px] w-full pt-4" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '1rem', color: '#f8fafc' }}
                  itemStyle={{ color: '#fbbf24' }}
                />
                <Area type="monotone" dataKey="revenue" name="الأرباح (درهم)" stroke="#f59e0b" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interactive Map Section */}
        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              <span>خريطة الأسطول الجغرافية الحية للوكالة</span>
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                <select
                  value={mapFilterCategory}
                  onChange={(e) => setMapFilterCategory(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-200 focus:outline-none"
                >
                  <option value="all">جميع الفئات</option>
                  <option value="دفع رباعي">دفع رباعي</option>
                  <option value="فاخرة">فاخرة</option>
                  <option value="اقتصادية">اقتصادية</option>
                  <option value="عائلية">عائلية</option>
                  <option value="شقة">شقة</option>
                  <option value="فيلا">فيلا</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={mapFilterStatus}
                  onChange={(e) => setMapFilterStatus(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-200 focus:outline-none"
                >
                  <option value="all">حالة التوفر (الكل)</option>
                  <option value="available">متاح للحجز</option>
                  <option value="booked">محجوز حالياً</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-[420px] rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
            <MapView
              initialCenter={{ lat: 33.5731, lng: -7.5898 }}
              initialZoom={6}
              onMapReady={(map) => {
                mapRef.current = map;
                agencyCars.forEach((_car) => {
                  if (window.google && window.google.maps && window.google.maps.marker) {
                    new google.maps.marker.AdvancedMarkerElement({
                      map,
                      position: { lat: 33.5731 + (Math.random() - 0.5) * 2, lng: -7.5898 + (Math.random() - 0.5) * 2 },
                      title: _car.name,
                    });
                  }
                });
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
            <span>عدد العناصر المطابقة للفلتر على الخريطة: <strong className="text-amber-400">{agencyCars.length}</strong> عنصر</span>
            <span>📍 انقر على أي دبوس في الخريطة لعرض تفاصيل العنصر وسعره السريع</span>
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
                            <>
                              <Button
                                onClick={() => handleStatusChange(b.id, 'completed')}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2.5 py-1.5 h-auto rounded-xl"
                              >
                                إنهاء الإيجار
                              </Button>
                              <button
                                onClick={() => {
                                  setWhatsappBooking(b);
                                  setCustomWhatsappMsg(`مرحباً ${b.customerName}، نذكركم بموعد استلام/تسليم حجزكم (${b.carName}) رقم ${b.id} المقرر في الفترة من ${b.startDate} إلى ${b.endDate}. شكراً لاختياركم B2-Rent.`);
                                }}
                                className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow"
                                title="تخصيص وإرسال تذكير واتساب"
                              >
                                💬 تذكير واتساب
                              </button>
                            </>
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
                <h3 className="text-base font-extrabold text-white">تعديل بيانات العنصر والأسعار</h3>
                <button onClick={() => setEditingCar(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveCarEdit} className="space-y-4">
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-300">اسم العنصر (سيارة / عقار)</label>
                  <input
                    type="text"
                    value={editingCar.name}
                    onChange={(e) => setEditingCar({ ...editingCar, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-right">
                    <label className="text-xs font-bold text-slate-300">السعر اليومي (درهم)</label>
                    <input
                      type="number"
                      value={editingCar.pricePerDay}
                      onChange={(e) => setEditingCar({ ...editingCar, pricePerDay: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5 text-right">
                    <label className="text-xs font-bold text-slate-300">المدينة</label>
                    <input
                      type="text"
                      value={editingCar.cityName}
                      onChange={(e) => setEditingCar({ ...editingCar, cityName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-300">رابط الصورة (URL)</label>
                  <input
                    type="text"
                    value={editingCar.image}
                    onChange={(e) => setEditingCar({ ...editingCar, image: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <Button
                    type="button"
                    onClick={() => setEditingCar(null)}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold px-5 py-2.5 rounded-xl text-xs"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20"
                  >
                    حفظ التغييرات
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Custom WhatsApp Reminder Modal */}
        {whatsappBooking && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl" dir="rtl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>💬 تخصيص رسالة تذكير الواتساب</span>
                </h3>
                <button onClick={() => setWhatsappBooking(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>العميل: <strong className="text-white">{whatsappBooking.customerName}</strong></span>
                    <span>الهاتف: <strong className="text-amber-400">{whatsappBooking.customerPhone}</strong></span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>العنصر: <strong className="text-white">{whatsappBooking.carName}</strong></span>
                    <span>رقم الحجز: <strong className="text-amber-400">{whatsappBooking.id}</strong></span>
                  </div>
                </div>

                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-300">نص الرسالة المراد إرسالها:</label>
                  <textarea
                    rows={4}
                    value={customWhatsappMsg}
                    onChange={(e) => setCustomWhatsappMsg(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400">يمكنك تعديل أي تفاصيل في النص قبل إرسال التذكير الرسمي للعميل.</p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <Button
                    type="button"
                    onClick={() => setWhatsappBooking(null)}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold px-5 py-2.5 rounded-xl text-xs"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      toast.success(`تم إرسال رسالة الواتساب المخصصة بنجاح إلى العميل ${whatsappBooking.customerName} (${whatsappBooking.customerPhone})!`);
                      setWhatsappBooking(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
                  >
                    <span>إرسال عبر الواتساب 💬</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
