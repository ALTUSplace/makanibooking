import { useState } from 'react';
import { LayoutDashboard, Building2, Car, Calendar, Users, DollarSign, ShieldCheck, CheckCircle2, Trash2, Star, Award, Settings, Globe, UserCheck, FileSpreadsheet, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PARTNERS, LISTINGS } from '@/data/b2rent';
import { useRole } from '@/contexts/RoleContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { toast } from 'sonner';

const bookingData = [
  { name: 'يناير', الحجوزات: 12, الإيرادات: 24000 },
  { name: 'فبراير', الحجوزات: 18, الإيرادات: 36000 },
  { name: 'مارس', الحجوزات: 25, الإيرادات: 52000 },
  { name: 'أبريل', الحجوزات: 32, الإيرادات: 68000 },
  { name: 'ماي', الحجوزات: 41, الإيرادات: 89000 },
  { name: 'يونيو', الحجوزات: 48, الإيرادات: 105000 },
];

const agencyTypeData = [
  { name: 'وكالات كراء السيارات', value: 3 },
  { name: 'الوكالات العقارية', value: 2 },
];
const COLORS = ['#f59e0b', '#0B3C5D'];

export default function AdminDashboard() {
  const { role, setRole } = useRole();
  const [activeTab, setActiveTab] = useState<'overview' | 'agencies' | 'listings' | 'users' | 'bookings' | 'settings' | 'domain'>('overview');
  const [agenciesList, setAgenciesList] = useState(PARTNERS.map(p => ({ ...p, status: p.status || 'active' })));
  const [listingsList, setListingsList] = useState(LISTINGS);
  const [usersList, setUsersList] = useState([
    { id: 'u1', name: 'أحمد المدير', email: 'admin@b2rent.ma', role: 'super_admin', status: 'نشط', joined: '2026-01-10' },
    { id: 'u2', name: 'محمد الزبون', email: 'customer@gmail.com', role: 'customer', status: 'نشط', joined: '2026-02-15' },
    { id: 'u3', name: 'خالد العقاري', email: 'khaled_rent@gmail.com', role: 'vendor_property', status: 'نشط', joined: '2026-02-20' },
    { id: 'u4', name: 'وكالة الأناقة', email: 'luxury_cars@gmail.com', role: 'vendor_car', status: 'معلق', joined: '2026-03-01' },
  ]);
  const [platformSettings, setPlatformSettings] = useState({
    siteName: 'B2-Rent',
    email: 'support@b2rent.ma',
    commissionRate: '10%',
    maintenanceMode: false
  });
  const [customDomainInput, setCustomDomainInput] = useState('b2rent.ma');
  const [domainStatus, setDomainStatus] = useState<'verified' | 'pending'>('verified');
  const [authWarning, setAuthWarning] = useState<string | null>(null);
  const [agencyStatusFilter, setAgencyStatusFilter] = useState<'all' | 'active' | 'pending' | 'rejected'>('all');
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);

  const totalRevenue = listingsList.reduce((acc, item) => acc + (item.pricePerUnit * 3), 125000);

  const toggleAgencyStatus = (id: string, newStatus: 'active' | 'rejected') => {
    setAgenciesList(agenciesList.map(ag => ag.id === id ? { ...ag, status: newStatus } : ag));
    toast.success(newStatus === 'active' ? 'تمت الموافقة على الوكالة بنجاح' : 'تم رفض طلب الوكالة');
  };

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

  const handleVerifyDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDomainInput.trim()) {
      toast.error('يرجى إدخال اسم النطاق بشكل صحيح');
      return;
    }
    setDomainStatus('verified');
    toast.success(`تم ربط والتحقق من النطاق ${customDomainInput} بنجاح وتفعيل شهادة الحماية SSL!`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4" dir="rtl">
      <div className="container mx-auto max-w-7xl space-y-8">
        
        {/* Header Bar */}
        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <div>
              <span className="text-amber-500 text-xs font-extrabold uppercase tracking-widest">لوحة التحكم الإدارية المتقدمة</span>
              <h1 className="text-2xl md:text-3xl font-black text-white">إدارة المشرف العام والعمليات</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={exportReportsCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" /> تصدير التقارير (Excel)
            </Button>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
              <span className="text-xs text-slate-400 px-2 font-bold hidden sm:inline">الصلاحية:</span>
              <button
                onClick={() => { setRole('super_admin'); toast.info('تم التبديل إلى دور المشرف العام (Super Admin)'); }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${role === 'super_admin' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> المشرف العام
              </button>
              <button
                onClick={() => { setRole('agency_manager'); toast.info('تم التبديل إلى دور مدير الوكالة (Agency Manager)'); }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${role === 'agency_manager' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <UserCheck className="w-3.5 h-3.5" /> مدير الوكالة
              </button>
            </div>
          </div>
        </div>

        {authWarning && (
          <div className="bg-red-500/15 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold animate-in fade-in-50">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{authWarning}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 bg-slate-950 border border-slate-800 p-2 rounded-2xl">
          {[
            { id: 'overview', label: 'نظرة عامة والتحليلات', icon: LayoutDashboard },
            { id: 'agencies', label: `إدارة الوكالات (${agenciesList.length})`, icon: Building2 },
            { id: 'listings', label: `إشراف العروض (${listingsList.length})`, icon: Car },
            { id: 'users', label: `إدارة المستخدمين (${usersList.length})`, icon: Users },
            { id: 'bookings', label: 'متابعة الحجوزات', icon: Calendar },
            { id: 'domain', label: 'ربط النطاق المخصص', icon: Globe },
            ...(role === 'super_admin' ? [{ id: 'settings', label: 'إعدادات المنصة', icon: Settings }] : []),
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === tab.id ? 'bg-amber-500 text-slate-950 shadow-lg font-black' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* OVERVIEW TAB */}
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
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full">+24% نمو</span>
                </div>
                <div>
                  <div className="text-slate-400 text-xs">المستخدمون المسجلون</div>
                  <div className="text-3xl font-black text-white mt-1">{usersList.length} مستخدم</div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full">عمولة 10%</span>
                </div>
                <div>
                  <div className="text-slate-400 text-xs">إجمالي حجم المعاملات</div>
                  <div className="text-3xl font-black text-amber-400 mt-1">{totalRevenue.toLocaleString()} د.م</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    <span>تطور عدد الحجوزات والإيرادات الشهرية</span>
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
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {agencyTypeData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '1rem', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> السيارات</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> العقارات</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AGENCIES TAB */}
        {activeTab === 'agencies' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 animate-in fade-in-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-6 h-6 text-amber-400" />
                <span>إدارة الوكالات والشركاء</span>
              </h3>

              <div className="flex flex-wrap gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
                {[
                  { id: 'all', label: `الكل (${agenciesList.length})` },
                  { id: 'active', label: `المعتمدة (${agenciesList.filter(a => a.status === 'active').length})` },
                  { id: 'pending', label: `المعلقة (${agenciesList.filter(a => a.status === 'pending').length})` },
                  { id: 'rejected', label: `المرفوضة (${agenciesList.filter(a => a.status === 'rejected').length})` },
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setAgencyStatusFilter(filter.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${agencyStatusFilter === filter.id ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agenciesList
                .filter(agency => agencyStatusFilter === 'all' || agency.status === agencyStatusFilter)
                .map(agency => (
                <div key={agency.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-lg flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-bold">{agency.city}</span>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {agency.rating}
                      </div>
                    </div>
                    <h4 className="text-base font-extrabold text-white">{agency.name}</h4>
                    <p className="text-xs text-slate-400">المدينة الرئيسية: {agency.city}</p>
                    <p className="text-xs text-amber-400/90 font-semibold">{agency.email}</p>
                    <div className="pt-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        agency.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        agency.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {agency.status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                        {agency.status === 'active' ? 'معتمد' : agency.status === 'pending' ? 'معلق للمراجعة' : 'مرفوض'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => toggleAgencyStatus(agency.id, 'active')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl cursor-pointer"
                      >
                        قبول
                      </Button>
                      <Button
                        onClick={() => toggleAgencyStatus(agency.id, 'rejected')}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 rounded-xl cursor-pointer"
                      >
                        رفض
                      </Button>
                    </div>
                    <Button
                      onClick={() => toggleAgencyExcellence(agency.id)}
                      variant="outline"
                      className="w-full border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Award className={`w-4 h-4 ${agency.isExcellence ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>{agency.isExcellence ? 'إلغاء شارة التميز' : 'منح شارة التميز الذهبية'}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LISTINGS TAB */}
        {activeTab === 'listings' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 animate-in fade-in-50">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <Car className="w-6 h-6 text-amber-400" />
              <span>إشراف العروض والإعلانات ({listingsList.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listingsList.map(item => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between">
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-amber-500/10 text-amber-400 font-bold px-3 py-1 rounded-full">{item.city}</span>
                      <span className="text-sm font-black text-amber-400">{item.pricePerUnit} د.م / يوم</span>
                    </div>
                    <h4 className="text-base font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                  </div>

                  <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold">التقييم: ⭐ {item.rating}</span>
                    <Button
                      onClick={() => deleteListing(item.id)}
                      variant="destructive"
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> حذف الإعلان
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-amber-400" />
                <span>إدارة المستخدمين والصلاحيات ({usersList.length})</span>
              </h3>
              <span className="text-xs text-slate-400">سجل المشتركين والعملاء والشركاء</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4">المستخدم</th>
                    <th className="py-3 px-4">البريد الإلكتروني</th>
                    <th className="py-3 px-4">الدور / الصلاحية</th>
                    <th className="py-3 px-4">الحالة</th>
                    <th className="py-3 px-4">تاريخ الانضمام</th>
                    <th className="py-3 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {usersList.map(user => (
                    <tr key={user.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs">
                          {user.name.charAt(0)}
                        </div>
                        {user.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{user.email}</td>
                      <td className="py-3.5 px-4">
                        <span className="bg-slate-800 text-amber-400 px-2.5 py-1 rounded-lg font-bold">
                          {user.role === 'super_admin' ? 'المشرف العام' : user.role === 'customer' ? 'زبون' : 'مزود / شريك'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full">{user.status}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{user.joined}</td>
                      <td className="py-3.5 px-4 text-center">
                        <Button
                          onClick={() => {
                            setUsersList(usersList.filter(u => u.id !== user.id));
                            toast.success('تم حذف المستخدم بنجاح');
                          }}
                          variant="ghost"
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 w-8 p-0 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 animate-in fade-in-50">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <Calendar className="w-6 h-6 text-amber-400" />
              <span>متابعة الحجوزات والعقود الرقمية</span>
            </h3>

            <div className="space-y-4">
              {[
                { id: 'BK-9842', client: 'محمد الزبون', item: 'Range Rover Vogue 2024', dates: '2026-09-01 إلى 2026-09-05', total: '9,180 د.م', status: 'مؤكد ومدفوع' },
                { id: 'BK-9843', client: 'سارة العلمي', item: 'شقة فاخرة مطلة على البحر', dates: '2026-09-10 إلى 2026-09-15', total: '6,000 د.م', status: 'معلق' },
              ].map(booking => (
                <div key={booking.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-right w-full sm:w-auto">
                    <span className="text-xs bg-amber-500/10 text-amber-400 font-bold px-2.5 py-1 rounded-md">{booking.id}</span>
                    <h4 className="text-base font-bold text-white mt-1">{booking.item}</h4>
                    <p className="text-xs text-slate-400">العميل: <strong className="text-slate-200">{booking.client}</strong> | الفترة: {booking.dates}</p>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-left">
                      <div className="text-sm font-black text-amber-400">{booking.total}</div>
                      <span className="text-xs text-emerald-400 font-bold">{booking.status}</span>
                    </div>
                    <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer">
                      عرض العقد PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DOMAIN LINKING TAB */}
        {activeTab === 'domain' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 animate-in fade-in-50 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <Globe className="w-6 h-6 text-amber-400" />
              <span>ربط النطاق المخصص (Custom Domain)</span>
            </h3>

            <form onSubmit={handleVerifyDomain} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">اسم النطاق الخاص بك</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={customDomainInput}
                    onChange={(e) => setCustomDomainInput(e.target.value)}
                    placeholder="example.ma"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 rounded-xl cursor-pointer">
                    التحقق والربط
                  </Button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-400">حالة النطاق:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> {domainStatus === 'verified' ? 'متصل ومحمي (SSL Active)' : 'قيد الانتظار'}
                </span>
              </div>
            </form>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && role === 'super_admin' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 animate-in fade-in-50 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <Settings className="w-6 h-6 text-amber-400" />
              <span>إعدادات النظام والمنصة العامة</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">اسم المنصة</label>
                <input
                  type="text"
                  value={platformSettings.siteName}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, siteName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">البريد الإلكتروني للإدارة</label>
                <input
                  type="email"
                  value={platformSettings.email}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">نسبة عمولة المنصة (%)</label>
                <input
                  type="text"
                  value={platformSettings.commissionRate}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, commissionRate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h4 className="text-sm font-extrabold text-amber-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> نظام المصادقة والأمان المتقدم (Authentication & Security)
                </h4>
                
                <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-white">فرض المصادقة الثنائية (2FA) للمشرفين</div>
                    <div className="text-[11px] text-slate-400">إلزام جميع حسابات الإدارة والمشرفين بتفعيل رمز التحقق الثنائي عبر البريد أو التطبيق.</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-amber-500 cursor-pointer" />
                </div>

                <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-white">جلسات الآمنة المشفرة (JWT HttpOnly Cookies)</div>
                    <div className="text-[11px] text-slate-400">حماية الكوكيز ضد هجمات XSS وتأمين صلاحيات الجلسات بمدة صلاحية قصوى.</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-amber-500 cursor-pointer" />
                </div>

                <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-white">تسجيل محاولات الدخول الفاشلة والحظر التلقائي</div>
                    <div className="text-[11px] text-slate-400">حظر عنوان IP تلقائياً في حال تجاوز 5 محاولات دخول خاطئة لكلمات المرور.</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-amber-500 cursor-pointer" />
                </div>
              </div>

              <Button
                onClick={() => toast.success('تم حفظ إعدادات المنصة وتحديث بروتوكولات الأمان بنجاح')}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl cursor-pointer mt-4"
              >
                حفظ التغييرات وتطبيق بروتوكولات الأمان
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
