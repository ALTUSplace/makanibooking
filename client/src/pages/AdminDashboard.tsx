import { useState } from 'react';
import { LayoutDashboard, Building2, Car, Calendar, Users, DollarSign, ShieldCheck, CheckCircle2, Trash2, Plus, Star, Award, Settings, FileText, Lock, UserCheck, Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PARTNERS, LISTINGS } from '@/data/b2rent';
import { useRole } from '@/contexts/RoleContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { toast } from 'sonner';

const bookingData = [
  { name: 'يناير', الحجوزات: 12 },
  { name: 'فبراير', الحجوزات: 18 },
  { name: 'مارس', الحجوزات: 25 },
  { name: 'أبريل', الحجوزات: 32 },
  { name: 'ماي', الحجوزات: 41 },
  { name: 'يونيو', الحجوزات: 48 },
];

const agencyTypeData = [
  { name: 'وكالات كراء السيارات', value: 3 },
  { name: 'الوكالات العقارية', value: 2 },
];
const COLORS = ['#f59e0b', '#3b82f6'];

export default function AdminDashboard() {
  const { role, setRole } = useRole();
  const [activeTab, setActiveTab] = useState<'overview' | 'agencies' | 'listings' | 'bookings' | 'settings'>('overview');
  const [agenciesList, setAgenciesList] = useState(PARTNERS);
  const [listingsList, setListingsList] = useState(LISTINGS);
  const [platformSettings, setPlatformSettings] = useState({
    siteName: 'B2-Rent',
    phone: '0754382654',
    email: 'b2rentt@gmail.com',
    commissionRate: '10%',
    maintenanceMode: false
  });
  const [authWarning, setAuthWarning] = useState<string | null>(null);

  const totalRevenue = listingsList.reduce((acc, item) => acc + (item.pricePerUnit * 3), 12500);

  const toggleAgencyExcellence = (id: string) => {
    if (role !== 'super_admin') {
      setAuthWarning('عذراً، منح شارات التميز مخصص حصرياً للمشرف العام (Super Admin).');
      setTimeout(() => setAuthWarning(null), 4000);
      toast.error('صلاحية مرفوضة: تتطلب صلاحيات المشرف العام');
      return;
    }
    setAgenciesList(agenciesList.map(ag => ag.id === id ? { ...ag, isExcellence: !ag.isExcellence } : ag));
    toast.success('تم تحديث شارة التميز للوكالة بنجاح وإشعار النظام');
  };

  const deleteListing = (id: string) => {
    if (role !== 'super_admin') {
      setAuthWarning('عذراً، حذف الإعلانات من لوحة الإدارة الشاملة مخصص للمشرف العام فقط.');
      setTimeout(() => setAuthWarning(null), 4000);
      toast.error('صلاحية مرفوضة: تتطلب صلاحيات المشرف العام');
      return;
    }
    setListingsList(listingsList.filter(item => item.id !== id));
    toast.success('تم حذف الإعلان بنجاح');
  };

  const exportReportsCSV = () => {
    const csvHeader = 'ID,Title,Type,City,PricePerUnit,Rating\n';
    const csvRows = listingsList.map(item => `${item.id},"${item.title}",${item.type},${item.city},${item.pricePerUnit},${item.rating}`).join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvHeader + csvRows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `B2_Rent_Platform_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('تم تصدير تقارير الإحصائيات والحجوزات بنجاح بصيغة Excel/CSV');
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4" dir="rtl">
      <div className="container mx-auto max-w-7xl space-y-8">
        
        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <div>
              <span className="text-amber-500 text-xs font-extrabold uppercase tracking-widest">نظام الصلاحيات المتقدم (RBAC)</span>
              <h1 className="text-2xl md:text-3xl font-black text-white">لوحة الإدارة المركزية والرسوم البيانية</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={exportReportsCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg"
            >
              <FileSpreadsheet className="w-4 h-4" /> تصدير التقارير (Excel/CSV)
            </Button>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
              <span className="text-xs text-slate-400 px-2 font-bold hidden sm:inline">الصلاحية:</span>
              <button
                onClick={() => { setRole('super_admin'); toast.info('تم التبديل إلى دور المشرف العام (Super Admin)'); }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${role === 'super_admin' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> المشرف العام
              </button>
              <button
                onClick={() => { setRole('agency_manager'); toast.info('تم التبديل إلى دور مدير الوكالة (Agency Manager)'); }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${role === 'agency_manager' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <UserCheck className="w-3.5 h-3.5" /> مدير الوكالة
              </button>
            </div>
          </div>
        </div>

        {authWarning && (
          <div className="bg-red-500/15 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold animate-in fade-in-50">
            <Lock className="w-5 h-5 flex-shrink-0" />
            <span>{authWarning}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 bg-slate-950 border border-slate-800 p-2 rounded-2xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> نظرة عامة والإحصائيات
          </button>
          <button
            onClick={() => setActiveTab('agencies')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'agencies' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <Building2 className="w-4 h-4" /> إدارة الوكالات والشركات ({agenciesList.length})
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'listings' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <Car className="w-4 h-4" /> إشراف العروض ({listingsList.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'bookings' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <Calendar className="w-4 h-4" /> متابعة الحجوزات والعقود
          </button>
          {role === 'super_admin' && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              <Settings className="w-4 h-4" /> إعدادات المنصة وقنوات الاتصال
            </button>
          )}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full">معتمد</span>
                </div>
                <div>
                  <div className="text-slate-400 text-xs">الوكالات والشركات الشريكة</div>
                  <div className="text-3xl font-black text-white mt-1">{agenciesList.length} وكالات</div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
                    <Car className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full">نشط</span>
                </div>
                <div>
                  <div className="text-slate-400 text-xs">إجمالي العروض (سيارات وعقارات)</div>
                  <div className="text-3xl font-black text-white mt-1">{listingsList.length} عرض</div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full">+18% نمو</span>
                </div>
                <div>
                  <div className="text-slate-400 text-xs">الحجوزات المؤكدة والعقود</div>
                  <div className="text-3xl font-black text-white mt-1">48 حجزاً</div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full">العمولة</span>
                </div>
                <div>
                  <div className="text-slate-400 text-xs">إجمالي حجم المعاملات المقدر</div>
                  <div className="text-3xl font-black text-amber-400 mt-1">{totalRevenue.toLocaleString()} درهم</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    <span>تطور عدد الحجوزات خلال الأشهر الماضية</span>
                  </h3>
                  <span className="text-xs text-slate-400">محدث تلقائياً</span>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bookingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '1rem', color: '#fff' }} />
                      <Bar dataKey="الحجوزات" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    <span>توزيع المزودين والوكالات</span>
                  </h3>
                  <p className="text-xs text-slate-400">نسبة وكالات السيارات مقارنة بالوكالات العقارية</p>
                </div>
                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={agencyTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {agencyTypeData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '1rem', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-around text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> وكالات السيارات (60%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> العقارات (40%)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agencies' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 animate-in fade-in-50">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-amber-400" />
              <span>قائمة الوكالات والشركات الشريكة المعتمدة</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agenciesList.map(agency => (
                <div key={agency.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-white text-base">{agency.name}</div>
                    <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
                      ⭐ {agency.rating}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <div>📍 المدينة: {agency.city}</div>
                    <div>📞 الهاتف: {agency.phone}</div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <span className="text-xs text-slate-300">
                      {agency.isExcellence ? '✨ وكالة متميزة' : 'وكالة عادية'}
                    </span>
                    <Button
                      onClick={() => toggleAgencyExcellence(agency.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl ${agency.isExcellence ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                    >
                      {agency.isExcellence ? 'إلغاء التميز' : 'منح شارة التميز'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 animate-in fade-in-50">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Car className="w-6 h-6 text-amber-400" />
              <span>إشراف العروض النشطة (سيارات وعقارات)</span>
            </h3>
            <div className="space-y-4">
              {listingsList.map(item => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.title} className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.title}</h4>
                      <div className="text-xs text-slate-400">{item.city} | {item.pricePerUnit} درهم / {item.type === 'car' ? 'يوم' : 'ليلة'}</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => deleteListing(item.id)}
                    className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> حذف الإعلان
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 animate-in fade-in-50">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-amber-400" />
              <span>متابعة الحجوزات وعقود الإيجار الرقمية</span>
            </h3>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-white text-base">جميع الحجوزات نشطة وموثقة بعقود رقمية PDF</h4>
              <p className="text-xs text-slate-400">يمكن للوكلاء والعملاء تحميل عقود الإيجار المذيلة بالتوقيعات والأختام الرقمية في أي وقت.</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && role === 'super_admin' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 animate-in fade-in-50">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-amber-400" />
              <span>إعدادات المنصة وقنوات الاتصال الرسمية</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-slate-300">رقم الدعم الرسمي</label>
                <input
                  type="text"
                  value={platformSettings.phone}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-300">البريد الإلكتروني المعتمد</label>
                <input
                  type="email"
                  value={platformSettings.email}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>
            <Button
              onClick={() => toast.success('تم حفظ إعدادات المنصة بنجاح')}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl"
            >
              حفظ التغييرات
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
