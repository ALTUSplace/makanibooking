import { useState } from 'react';
import { LayoutDashboard, Building2, Car, Calendar, Users, DollarSign, ShieldCheck, CheckCircle2, Trash2, Plus, Star, Award, Settings, FileText, Lock, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PARTNERS, LISTINGS } from '@/data/b2rent';

export default function AdminDashboard() {
  const [role, setRole] = useState<'super_admin' | 'agency_manager'>('super_admin');
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
      return;
    }
    setAgenciesList(agenciesList.map(ag => ag.id === id ? { ...ag, isExcellence: !ag.isExcellence } : ag));
  };

  const deleteListing = (id: string) => {
    if (role !== 'super_admin') {
      setAuthWarning('عذراً، حذف الإعلانات من لوحة الإدارة الشاملة مخصص للمشرف العام فقط.');
      setTimeout(() => setAuthWarning(null), 4000);
      return;
    }
    setListingsList(listingsList.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4">
      <div className="container mx-auto max-w-7xl space-y-8">
        
        {/* رأس لوحة الإدارة مع محدد الصلاحيات */}
        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <div>
              <span className="text-amber-500 text-xs font-extrabold uppercase tracking-widest">نظام الصلاحيات المتقدم (RBAC)</span>
              <h1 className="text-2xl md:text-3xl font-black text-white">لوحة الإدارة المركزية</h1>
            </div>
          </div>

          {/* محدد الصلاحيات بين المشرف العام ومدير الوكالة */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
            <span className="text-xs text-slate-400 px-2 font-bold">صلاحيات الحساب:</span>
            <button
              onClick={() => setRole('super_admin')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${role === 'super_admin' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <ShieldCheck className="w-4 h-4" /> المشرف العام (Super Admin)
            </button>
            <button
              onClick={() => setRole('agency_manager')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${role === 'agency_manager' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <UserCheck className="w-4 h-4" /> مدير الوكالة (Agency Manager)
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
                <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5">
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
                    <div>الهاتف: <span className="text-amber-400 font-bold">{agency.phone}</span></div>
                    <div>التقييم: <span className="text-amber-400 font-bold">⭐ {agency.rating}</span> ({agency.reviewsCount} تقييم)</div>
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
                <h3 className="text-lg font-bold text-white">إشراف ومتابعة العروض (السيارات والعقارات)</h3>
                <p className="text-xs text-slate-400">مراجعة المحتوى والأسعار والإعلانات النشطة</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listingsList.map(item => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden space-y-3 flex flex-col justify-between">
                  <div className="relative h-40">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-slate-950/90 text-amber-400 px-2.5 py-0.5 rounded-lg text-[10px] font-bold">
                      {item.category}
                    </div>
                  </div>

                  <div className="p-4 space-y-2 flex-grow">
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>{item.providerName}</span>
                      <span className="text-amber-400 font-bold">{item.city}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{item.title}</h4>
                    <div className="text-sm font-extrabold text-amber-400">{item.pricePerUnit} {item.unitLabel}</div>
                  </div>

                  <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-800/80">
                    <span className="text-xs text-emerald-400 font-bold">نشط ومعتمد</span>
                    <button
                      onClick={() => deleteListing(item.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                      title={role !== 'super_admin' ? 'حذف الإعلانات مخصص للمشرف العام فقط' : 'حذف الإعلان'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 animate-in fade-in-50 duration-300">
            <div className="border-b border-slate-900 pb-4">
              <h3 className="text-lg font-bold text-white">سجل الحجوزات وعقود الإيجار الرقمية</h3>
              <p className="text-xs text-slate-400">متابعة كافة العقود الصادرة والتوقيعات الإلكترونية المعتمدة</p>
            </div>

            <div className="space-y-3">
              {[
                { ref: 'B2R-849201', client: 'عمر التازي', provider: 'أغادير كار برستيج', service: 'داسيا داستر', amount: '1,350 درهم', date: '2026-08-20', status: 'مكتمل وموقع' },
                { ref: 'B2R-773104', client: 'يوسف المنصوري', provider: 'مراكش القصر العقاري', service: 'شقة مفروشة جليز', amount: '2,850 درهم', date: '2026-08-19', status: 'مكتمل وموقع' },
                { ref: 'B2R-554209', client: 'سارة الإدريسي', provider: 'الدار البيضاء الدولية للسيارات', service: 'رينو كليو 5', amount: '960 درهم', date: '2026-08-18', status: 'مكتمل وموقع' },
              ].map((contract, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">مرجع العقد: {contract.ref}</div>
                      <div className="text-slate-400">الزبون: {contract.client} • المزود: {contract.provider} • الخدمة: {contract.service}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <div className="font-extrabold text-amber-400">{contract.amount}</div>
                      <span className="text-[10px] text-emerald-400 font-bold">{contract.status}</span>
                    </div>
                    <Button className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 px-3 rounded-xl font-bold">
                      عرض العقد PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && role === 'super_admin' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 animate-in fade-in-50 duration-300 max-w-2xl mx-auto">
            <div className="border-b border-slate-900 pb-4">
              <h3 className="text-lg font-bold text-white">إعدادات المنصة وقنوات الاتصال</h3>
              <p className="text-xs text-slate-400">التحكم في بيانات الدعم الفني والبريد الإلكتروني المعتمد (حصرية للمشرف العام)</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-300">اسم المنصة الرسمي</label>
                <input
                  type="text"
                  value={platformSettings.siteName}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, siteName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-300">رقم الهاتف الرسمي للدعم</label>
                <input
                  type="text"
                  value={platformSettings.phone}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-300">البريد الإلكتروني المعتمد للدعم (b2rentt@gmail.com)</label>
                <input
                  type="email"
                  value={platformSettings.email}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-300">نسبة عمولة المنصة الوسيطة</label>
                <input
                  type="text"
                  value={platformSettings.commissionRate}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, commissionRate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-xs shadow-lg">
                  حفظ وتطبيق التحديثات
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
