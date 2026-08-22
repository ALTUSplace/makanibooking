import { useState } from 'react';
import { LayoutDashboard, Building2, Car, Calendar, Users, DollarSign, ShieldCheck, CheckCircle2, Trash2, Star, Award, Settings, Globe, UserCheck, FileSpreadsheet, ShieldAlert, CheckCircle, RefreshCw, Lock } from 'lucide-react';
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

const commissionSplitData = [
  { name: 'عمولات السيارات', value: 65000 },
  { name: 'عمولات العقارات', value: 43000 },
];
const COLORS = ['#f59e0b', '#0B3C5D'];

export default function AdminDashboard() {
  const { role, setRole } = useRole();
  const [activeTab, setActiveTab] = useState<'overview' | 'agencies' | 'listings' | 'users' | 'bookings' | 'wallet' | 'security' | 'domain' | 'settings'>('overview');
  const [agenciesList, setAgenciesList] = useState(PARTNERS.map(p => ({ ...p, status: p.status || 'active' })));
  const [listingsList, setListingsList] = useState(LISTINGS);
  const [usersList, setUsersList] = useState([
    { id: 'u1', name: 'أحمد المدير', email: 'admin@b2rent.ma', role: 'super_admin', status: 'نشط', joined: '2026-01-10' },
    { id: 'u2', name: 'محمد الزبون', email: 'customer@gmail.com', role: 'customer', status: 'نشط', joined: '2026-02-15' },
    { id: 'u3', name: 'خالد العقاري', email: 'khaled_rent@gmail.com', role: 'vendor_property', status: 'نشط', joined: '2026-02-20' },
    { id: 'u4', name: 'وكالة الأناقة', email: 'luxury_cars@gmail.com', role: 'vendor_car', status: 'معلق', joined: '2026-03-01' },
  ]);
  const [securityLogs, setSecurityLogs] = useState([
    { id: 1, type: 'تحذير أسعار', description: 'محاولة إدخال سعر استئجار غير منطقي (5 د.م/يوم) لعقار في الدار البيضاء', ip: '192.168.1.45', time: 'منذ 5 دقائق', status: 'تم الحظر تلقائياً' },
    { id: 2, type: 'هجوم محتمل (SQLi)', description: 'محاولة حقن بيانات مشبوهة عبر نموذج البحث الذكي', ip: '41.141.22.10', time: 'منذ 25 دقيقة', status: 'صد بواسطة جدار الحماية' },
    { id: 3, type: 'تحقق وثائق', description: 'رفع وثيقة س سجل تجاري غير مطابقة من قبل حساب وهمي', ip: '105.155.88.2', time: 'منذ ساعة', status: 'رفض المعاملة تلقائياً' },
  ]);
  const [whatsappQueue, setWhatsappQueue] = useState([
    { id: 1, recipient: '+2126XXXXXXXX (العميل محمد)', message: 'تأكيد الحجز رقم #1082 - سيارة Range Rover - تم الدفع بنجاح', status: 'تم الإرسال (WhatsApp Cloud API)' },
    { id: 2, recipient: '+2126XXXXXXXX (وكالة الأناقة)', message: 'تنبيه: يوجد زبون جديد حجز سيارتك لمدة 4 أيام - يرجى تسليم المفتاح', status: 'تم الإرسال بنجاح' },
    { id: 3, recipient: 'إدارة المنصة (Admin)', message: 'عمولة جديدة بقيمة 918 د.م أضيفت لمحفظتك من الحجز المدمج', status: 'تم التسليم' },
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
              <span className="text-amber-500 text-xs font-extrabold uppercase tracking-widest">لوحة التحكم الإدارية المتقدمة (Admin & CISO)</span>
              <h1 className="text-2xl md:text-3xl font-black text-white">إدارة المشرف العام، الأمان والعمليات المالية</h1>
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
            { id: 'wallet', label: 'المحفظة والعمولات', icon: DollarSign },
            { id: 'security', label: 'الأمان وجدار الحماية', icon: Lock },
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
                  <h3 className="text-lg font-bold text-white mb-2">توزيع العمولات حسب القطاع</h3>
                  <p className="text-xs text-slate-400">نسبة أرباح عمولات السيارات مقابل العقارات</p>
                </div>
                <div className="h-56 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={commissionSplitData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                        {commissionSplitData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '1rem', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-around text-xs font-bold pt-4 border-t border-slate-800">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> السيارات (60%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#0B3C5D] inline-block"></span> العقارات (40%)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WALLET & FINANCIAL LEDGER TAB */}
        {activeTab === 'wallet' && (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-3">
                <span className="text-xs text-slate-400 font-bold">أرباح عمولات السيارات (صافي)</span>
                <div className="text-3xl font-black text-amber-400">65,000 د.م</div>
                <p className="text-xs text-emerald-400">↑ 18% مقارنة بالشهر السابق</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-3">
                <span className="text-xs text-slate-400 font-bold">أرباح عمولات العقارات (صافي)</span>
                <div className="text-3xl font-black text-blue-400">43,000 د.م</div>
                <p className="text-xs text-emerald-400">↑ 22% مقارنة بالشهر السابق</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-3">
                <span className="text-xs text-slate-400 font-bold">مستحقات الشركاء المعلقة للدفع</span>
                <div className="text-3xl font-black text-white">18,500 د.م</div>
                <Button onClick={() => toast.success('تمت تسوية المستحقات وتحويلها للشركاء بنجاح')} className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white">
                  تسوية المستحقات دفعة واحدة
                </Button>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
              <h3 className="text-lg font-bold text-white">سجل الحركات المالية والتحويلات للشركاء</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs">
                      <th className="pb-3">رقم العملية</th>
                      <th className="pb-3">الشريك / الوكالة</th>
                      <th className="pb-3">النوع</th>
                      <th className="pb-3">المبلغ الإجمالي</th>
                      <th className="pb-3">عمولة المنصة (10%)</th>
                      <th className="pb-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    <tr>
                      <td className="py-4 font-mono">#TX-9982</td>
                      <td className="py-4 font-bold text-white">وكالة الأناقة للسيارات</td>
                      <td className="py-4">كراء سيارة (Range Rover)</td>
                      <td className="py-4 font-bold">7,500 د.م</td>
                      <td className="py-4 text-emerald-400 font-bold">750 د.م</td>
                      <td className="py-4"><span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-bold">مكتمل ومحول</span></td>
                    </tr>
                    <tr>
                      <td className="py-4 font-mono">#TX-9981</td>
                      <td className="py-4 font-bold text-white">خالد العقاري</td>
                      <td className="py-4">كراء فيلا مراكش</td>
                      <td className="py-4 font-bold">10,000 د.م</td>
                      <td className="py-4 text-emerald-400 font-bold">1,000 د.م</td>
                      <td className="py-4"><span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-bold">مكتمل ومحول</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY & ANTI-FRAUD TAB */}
        {activeTab === 'security' && (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-6 h-6 text-red-500" />
                    <span>سجل جدار الحماية وأنظمة كشف الاحتيال (Anti-Fraud & Mock Firewall)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">مراقبة لحظية لمحاولات التلاعب بالأسعار أو حقن البيانات أو الحسابات الوهمية.</p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> النظام محمي 100%
                </span>
              </div>

              <div className="space-y-4">
                {securityLogs.map(log => (
                  <div key={log.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-red-500/15 text-red-400 text-xs font-bold rounded-lg">{log.type}</span>
                        <span className="text-xs text-slate-400 font-mono">IP: {log.ip}</span>
                        <span className="text-xs text-slate-500">{log.time}</span>
                      </div>
                      <p className="text-sm font-semibold text-white">{log.description}</p>
                    </div>
                    <span className="px-3 py-1.5 bg-amber-500/10 text-amber-400 font-bold text-xs rounded-xl self-start md:self-auto">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>سجل إشعارات الـ WhatsApp & SMS الفورية (Mock Twilio / Infobip)</span>
              </h3>
              <div className="space-y-3">
                {whatsappQueue.map(item => (
                  <div key={item.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-amber-400 block mb-1">إلى: {item.recipient}</span>
                      <span className="text-slate-300">{item.message}</span>
                    </div>
                    <span className="bg-emerald-500/15 text-emerald-400 font-bold px-3 py-1 rounded-lg self-start sm:self-auto">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AGENCIES TAB */}
        {activeTab === 'agencies' && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
              <h3 className="text-lg font-bold text-white">إدارة الوكالات وطلبات الانضمام</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs">
                      <th className="pb-3">اسم الوكالة</th>
                      <th className="pb-3">المدينة</th>
                      <th className="pb-3">التقييم</th>
                      <th className="pb-3">الحالة الحالية</th>
                      <th className="pb-3">إجراءات الإدارة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {agenciesList.map(ag => (
                      <tr key={ag.id}>
                        <td className="py-4 font-bold text-white flex items-center gap-2">
                          <span>{ag.name}</span>
                          {ag.isExcellence && <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-[10px]">فئة ذهبية</span>}
                        </td>
                        <td className="py-4 text-slate-300">{ag.city}</td>
                        <td className="py-4 text-amber-400 font-bold">⭐ {ag.rating}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ag.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {ag.status === 'active' ? 'معتمد' : 'معلق للمراجعة'}
                          </span>
                        </td>
                        <td className="py-4 space-x-2 space-x-reverse">
                          <Button onClick={() => toggleAgencyStatus(ag.id, 'active')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-8 px-3">
                            موافقة
                          </Button>
                          <Button onClick={() => toggleAgencyStatus(ag.id, 'rejected')} variant="destructive" className="text-[11px] h-8 px-3">
                            رفض
                          </Button>
                          <Button onClick={() => toggleAgencyExcellence(ag.id)} variant="outline" className="text-[11px] h-8 px-3 border-amber-500 text-amber-400 hover:bg-amber-500/10">
                            {ag.isExcellence ? 'إلغاء التميز' : 'منح شارة التميز'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* LISTINGS TAB */}
        {activeTab === 'listings' && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
              <h3 className="text-lg font-bold text-white">إشراف عروض السيارات والعقارات</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listingsList.map(item => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <img src={item.image} alt={item.title} loading="lazy" decoding="async" width={800} height={320} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" srcSet={`${item.image} 800w`} className="w-full h-40 object-cover rounded-xl" />
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-sm">{item.title}</h4>
                        <span className="text-xs text-slate-400">{item.city}</span>
                      </div>
                      <span className="font-extrabold text-amber-400 text-sm">{item.pricePerUnit} د.م</span>
                    </div>
                    <Button onClick={() => deleteListing(item.id)} variant="destructive" className="w-full h-9 text-xs gap-2">
                      <Trash2 className="w-4 h-4" /> حذف الإعلان من المنصة
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
              <h3 className="text-lg font-bold text-white">إدارة المستخدمين والصلاحيات</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs">
                      <th className="pb-3">الاسم</th>
                      <th className="pb-3">البريد الإلكتروني</th>
                      <th className="pb-3">الدور</th>
                      <th className="pb-3">الحالة</th>
                      <th className="pb-3">تاريخ الانضمام</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {usersList.map(u => (
                      <tr key={u.id}>
                        <td className="py-4 font-bold text-white">{u.name}</td>
                        <td className="py-4 text-slate-300">{u.email}</td>
                        <td className="py-4"><span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-lg">{u.role}</span></td>
                        <td className="py-4 text-emerald-400">{u.status}</td>
                        <td className="py-4 text-slate-400">{u.joined}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
              <h3 className="text-lg font-bold text-white">سجل الحجوزات المؤكدة في المنصة</h3>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">حجز تجريبي مدمج (عقار + سيارة)</h4>
                  <p className="text-xs text-slate-400">الزبون: محمد الزبون | التواريخ: 01 ستمبر - 05 ستمبر 2026</p>
                </div>
                <span className="bg-emerald-500/15 text-emerald-400 px-3 py-1 rounded-xl text-xs font-bold">مؤكد ومقفل بالتقويم</span>
              </div>
            </div>
          </div>
        )}

        {/* DOMAIN TAB */}
        {activeTab === 'domain' && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl max-w-2xl space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">ربط النطاق المخصص (Custom Domain)</h3>
                <p className="text-xs text-slate-400 mt-1">اربط نطاقك التجاري (مثل b2rent.ma) بمنصة B2-Rent بكل سهولة.</p>
              </div>

              <form onSubmit={handleVerifyDomain} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">اسم النطاق التجاري</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={customDomainInput}
                      onChange={(e) => setCustomDomainInput(e.target.value)}
                      placeholder="e.g. b2rent.ma"
                      className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
                    />
                    <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6">
                      تحقق وربط
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> حالة النطاق: نشط ومحمي بشهادة SSL
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    النطاق مرتبط بنجاح عبر خوادم البث السريع لـ B2-Rent. الزوار سيتم توجيههم مباشرة للمنصة مع تفعيل التشفير التام.
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && role === 'super_admin' && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl max-w-2xl space-y-6">
              <h3 className="text-xl font-bold text-white">إعدادات المنصة العامة</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">اسم المنصة</label>
                  <input
                    type="text"
                    value={platformSettings.siteName}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, siteName: e.target.value })}
                    className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">نسبة عمولة المنصة (%)</label>
                  <input
                    type="text"
                    value={platformSettings.commissionRate}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, commissionRate: e.target.value })}
                    className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <Button onClick={() => toast.success('تم حفظ إعدادات المنصة بنجاح')} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
                  حفظ التعديلات
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
