import { useState } from 'react';
import { LayoutDashboard, Building2, Car, Calendar, Users, DollarSign, ShieldCheck, CheckCircle2, Trash2, Plus, Star, Award, Settings, FileText, Lock, UserCheck, Bell } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4" dir="rtl">
      <div className="container mx-auto max-w-7xl space-y-8">
        
        {/* رأس لوحة الإدارة مع محدد الصلاحيات */}
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

          {/* محدد الصلاحيات بين المشرف العام ومدير الوكالة */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
            <span className="text-xs text-slate-400 px-2 font-bold">صلاحيات الحساب:</span>
            <button
              onClick={() => { setRole('super_admin'); toast.info('تم التبديل إلى دور المشرف العام (Super Admin)'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${role === 'super_admin' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <ShieldCheck className="w-4 h-4" /> المشرف العام
            </button>
            <button
              onClick={() => { setRole('agency_manager'); toast.info('تم التبديل إلى دور مدير الوكالة (Agency Manager)'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${role === 'agency_manager' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <UserCheck className="w-4 h-4" /> مدير الوكالة
            </button>
          </div>
        </div>

        {/* تنبيه الصلاحيات إن وجد */}
        {authWarning && (
          <div className="bg-red-500/15 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold animate-in fade-in-50">
            <Lock className="w-5 h-5 flex-shrink-0" />
            <span>{authWarning}</span>
          </div>
        )}

        {/* أزرار التنقل بين أقسام الإدارة */}
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

        {/* محتوى الأقسام */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            {/* بطاقات الإحصائيات */}
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

            {/* قسم الرسوم البيانية التفاعلية (Recharts) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* رسم بياني لتطور الحجوزات */}
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

              {/* رسم بياني لتوزيع الوكالات */}
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

            {/* نشاط المنصة الأخير */}
            <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>أحدث العمليات والحجوزات المسجلة في المنصة</span>
              </h3>

              <div className="space-y-3">
                {[
                  { id: 'b1', client: 'عمر التازي', service: 'داسيا داستر - أغادير', date: 'منذ 15 دقيقة', amount: '1,350 درهم', status: 'مؤكد ومعتمد' },
                  { id: 'b2', client: 'يوسف المنصوري', service: 'شقة مفروشة - مراكش', date: 'منذ ساعة', amount: '2,850 درهم', status: 'مؤكد ومعتمد' },
                  { id: 'b3', client: 'سارة الإدريسي', service: 'رينو كليو 5 - الدار البيضاء', date: 'منذ 3 ساعات', amount: '960 درهم', status: 'مؤكد ومعتمد' },
                ].map(b => (
                  <div key={b.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-bold">
                        {b.client[0]}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{b.client}</div>
                        <div className="text-slate-400">{b.service} • {b.date}</div>
                      </div>
                    </div>
                    <div className="text-left space-y-1">
                      <div className="font-extrabold text-amber-400">{b.amount}</div>
                      <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold">{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agencies' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 animate-in fade-in-50 duration-300">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">إدارة الوكالات والشركات المستقلة</h3>
                <p className="text-xs text-slate-400">
                  {role === 'super_admin' ? 'صلاحيات كاملة للمشرف العام لمنح شارات التميز وإدارة الشبكة' : 'صلاحية مدير الوكالة: استعراض الوكالات الشريكة'}
                </p>
              </div>
              {role === 'super_admin' && (
                <Button onClick={() => toast.success('تم فتح نافذة إضافة وكالة شريكة جديدة')} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5">
                  <Plus className="w-4 h-4" /> إضافة وكالة جديدة
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {agenciesList.map(agency => (
                <div key={agency.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={agency.logo} alt={agency.name} className="w-12 h-12 rounded-xl object-cover border border-slate-800" />
                      <div>
                        <h4 className="text-sm font-bold text-white">{agency.name}</h4>
                        <div className="text-xs text-slate-400">{agency.city} • {agency.type === 'car_rental' ? 'وكالة كراء سيارات' : 'وكالة عقارية'}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAgencyExcellence(agency.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${agency.isExcellence ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                      title={role !== 'super_admin' ? 'مخصص للمشرف العام فقط' : ''}
                    >
                      <Award className="w-3.5 h-3.5" /> {agency.isExcellence ? 'متميز ⭐' : 'منح التميز'}
                    </button>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                    <div>اتصال: <span className="text-white font-bold">{agency.phone}</span></div>
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {agency.rating} ({agency.reviewsCount} تقييم)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 animate-in fade-in-50 duration-300">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">إشراف ومراقبة عروض السيارات والعقارات</h3>
                <p className="text-xs text-slate-400">إدارة الإعلانات والأسعار والتحكم بالمنصة</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {listingsList.map(item => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="relative h-44">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 bg-slate-950/80 text-amber-400 font-bold px-2.5 py-1 rounded-xl text-xs">
                        {item.pricePerUnit} {item.unitLabel}
                      </div>
                    </div>
                    <div className="p-4 space-y-1">
                      <div className="text-[10px] text-amber-400 font-bold">{item.providerName}</div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400">{item.city} • {item.category}</p>
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-semibold">معتمد ونشط</span>
                    <Button
                      onClick={() => deleteListing(item.id)}
                      variant="outline"
                      className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs px-3 py-1.5 h-auto rounded-xl"
                      title={role !== 'super_admin' ? 'مخصص للمشرف العام فقط' : ''}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> حذف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 animate-in fade-in-50 duration-300">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-900 pb-4">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>سجل الحجوزات وعقود الإيجار الرقمية</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 px-4">رقم المرجع</th>
                    <th className="pb-3 px-4">الخدمة / العنصر</th>
                    <th className="pb-3 px-4">المزود</th>
                    <th className="pb-3 px-4">العميل</th>
                    <th className="pb-3 px-4">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-4 px-4 font-bold text-amber-400">B2R-9901</td>
                    <td className="py-4 px-4 font-semibold text-white">داسيا داستر 2024</td>
                    <td className="py-4 px-4">أغادير كار برستيج</td>
                    <td className="py-4 px-4">عمر التازي (0754382654)</td>
                    <td className="py-4 px-4"><span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-bold">مؤكد وعقد موثق</span></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-bold text-amber-400">B2R-9902</td>
                    <td className="py-4 px-4 font-semibold text-white">شقة عصرية في جليز</td>
                    <td className="py-4 px-4">مراكش القصر العقاري</td>
                    <td className="py-4 px-4">يوسف المنصوري (0754382654)</td>
                    <td className="py-4 px-4"><span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-bold">مؤكد وعقد موثق</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && role === 'super_admin' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 animate-in fade-in-50 duration-300">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-900 pb-4">
              <Settings className="w-5 h-5 text-amber-400" />
              <span>إعدادات المنصة وقنوات الاتصال الرسمية</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold">اسم المنصة الرسمي</label>
                <input
                  type="text"
                  value={platformSettings.siteName}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, siteName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-semibold">رقم الدعم الرسمي المعتمد</label>
                <input
                  type="text"
                  value={platformSettings.phone}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-semibold">البريد الإلكتروني للدعم (b2rentt@gmail.com)</label>
                <input
                  type="email"
                  value={platformSettings.email}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-semibold">نسبة عمولة الوساطة</label>
                <input
                  type="text"
                  value={platformSettings.commissionRate}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, commissionRate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-900 flex justify-end">
              <Button onClick={() => toast.success('تم حفظ إعدادات المنصة بنجاح')} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8">
                حفظ التغييرات
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
