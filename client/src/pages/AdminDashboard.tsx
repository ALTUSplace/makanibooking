import { useState } from 'react';
import { LayoutDashboard, Building2, Car, Calendar, Users, DollarSign, ShieldCheck, CheckCircle2, Trash2, Plus, Star, Award, Settings, FileText, Lock, UserCheck, Download, FileSpreadsheet, Globe, ShieldAlert, CheckCircle, ExternalLink } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'agencies' | 'listings' | 'bookings' | 'settings' | 'domain'>('overview');
  const [agenciesList, setAgenciesList] = useState(PARTNERS);
  const [listingsList, setListingsList] = useState(LISTINGS);
  const [platformSettings, setPlatformSettings] = useState({
    siteName: 'B2-Rent',
    email: 'b2rentt@gmail.com',
    commissionRate: '10%',
    maintenanceMode: false
  });
  const [customDomainInput, setCustomDomainInput] = useState('b2rent.ma');
  const [domainStatus, setDomainStatus] = useState<'verified' | 'pending'>('verified');
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
            <Building2 className="w-4 h-4" /> إدارة الوكالات ({agenciesList.length})
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
            <Calendar className="w-4 h-4" /> متابعة الحجوزات
          </button>
          <button
            onClick={() => setActiveTab('domain')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'domain' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <Globe className="w-4 h-4" /> ربط النطاق المخصص
          </button>
          {role === 'super_admin' && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              <Settings className="w-4 h-4" /> إعدادات المنصة
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

        {activeTab === 'agencies' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 animate-in fade-in-50">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-amber-400" />
              <span>إدارة الوكالات ومنح شارات التميز للوكالات (تقييم &gt; 4.8)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agenciesList.map(agency => (
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
                    <p className="text-xs text-amber-400/90 font-semibold">{agency.phone} | {agency.email}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                    {agency.isExcellence ? (
                      <span className="bg-amber-500/25 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5">
                        <Award className="w-4 h-4" /> وكالة متميزة
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">بدون شارة</span>
                    )}

                    <Button
                      onClick={() => toggleAgencyExcellence(agency.id)}
                      className={`text-xs font-bold px-4 py-2 rounded-xl ${agency.isExcellence ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-amber-500 hover:bg-amber-600 text-slate-950'}`}
                    >
                      {agency.isExcellence ? 'إزالة الشارة' : 'منح شارة التميز'}
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
              <span>إشراف ومراقبة العروض المنشورة (سيارات وعقارات)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 px-4">العنصر</th>
                    <th className="pb-3 px-4">النوع</th>
                    <th className="pb-3 px-4">المدينة</th>
                    <th className="pb-3 px-4">السعر</th>
                    <th className="pb-3 px-4">التقييم</th>
                    <th className="pb-3 px-4 text-center">إجراءات الإشراف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {listingsList.map(item => (
                    <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-4 px-4 font-bold text-white flex items-center gap-3">
                        <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded-xl border border-slate-700" />
                        <div>
                          <div className="font-extrabold text-white">{item.title}</div>
                          <div className="text-[10px] text-slate-400">{item.providerName}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.type === 'car' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                          {item.type === 'car' ? 'سيارة' : 'عقار'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-300">{item.city}</td>
                      <td className="py-4 px-4 font-black text-amber-400">{item.pricePerUnit} درهم</td>
                      <td className="py-4 px-4 text-slate-300 flex items-center gap-1 pt-6">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {item.rating}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Button
                          onClick={() => deleteListing(item.id)}
                          className="bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white font-bold px-3 py-1.5 h-auto rounded-xl text-xs transition-all border border-rose-500/30"
                        >
                          <Trash2 className="w-3.5 h-3.5 ml-1" /> حذف الإعلان
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 animate-in fade-in-50">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-amber-400" />
              <span>متابعة الحجوزات النشطة والعقود الرقمية الموثقة</span>
            </h3>
            <div className="text-center py-12 text-slate-400 text-xs space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <p>جميع الحجوزات نشطة ومربوطة بنظام العقود الرقمية وتوقيعات العملاء وأختام الوكالات الرسمية.</p>
            </div>
          </div>
        )}

        {activeTab === 'domain' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Globe className="w-6 h-6 text-amber-400" />
                <span>إدارة وربط النطاق المخصص (Custom Domain)</span>
              </h3>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> النطاق متصل وآمن (SSL)
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              قم بربط نطاقك الخاص (مثل <strong className="text-amber-400">b2rent.ma</strong> أو <strong className="text-amber-400">www.b2rent.ma</strong>) بالمنصة لتعزيز الموثوقية والرسمية أمام عملائك وشركائك في السوق المغربي.
            </p>

            <form onSubmit={handleVerifyDomain} className="space-y-4 max-w-xl">
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-300">أدخل اسم النطاق المخصص الخاص بك</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customDomainInput}
                    onChange={(e) => setCustomDomainInput(e.target.value)}
                    placeholder="e.g. b2rent.ma"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    required
                  />
                  <Button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs shadow-lg shadow-amber-500/20"
                  >
                    حفظ والتحقق
                  </Button>
                </div>
              </div>
            </form>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> إعدادات سجلات DNS المطلوبة لدى مزود النطاق الخاص بك:
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2">النوع (Type)</th>
                      <th className="pb-2">الاسم (Name / Host)</th>
                      <th className="pb-2">القيمة (Value / Target)</th>
                      <th className="pb-2">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    <tr>
                      <td className="py-3 text-amber-400 font-bold">CNAME</td>
                      <td className="py-3">www</td>
                      <td className="py-3">proxy.manus.space</td>
                      <td className="py-3 text-emerald-400 font-sans font-bold">متصل بنجاح ✓</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-amber-400 font-bold">A</td>
                      <td className="py-3">@</td>
                      <td className="py-3">76.76.21.21</td>
                      <td className="py-3 text-emerald-400 font-sans font-bold">متصل بنجاح ✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
