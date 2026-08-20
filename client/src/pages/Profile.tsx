import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, MapPin, ShieldCheck, Heart, Calendar, Settings, CheckCircle2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { LISTINGS } from '@/data/b2rent';
import { Link } from 'wouter';

export default function Profile() {
  const [name, setName] = useState('يوسف المنصوري');
  const [email, setEmail] = useState('youssef.mansouri@gmail.com');
  const [phone, setPhone] = useState('+212 6 12 34 56 78');
  const [city, setCity] = useState('مراكش');
  const [activeTab, setActiveTab] = useState<'info' | 'bookings' | 'favorites'>('info');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('تم حفظ التعديلات وتحديث الملف الشخصي بنجاح!');
  };

  const userBookings = [
    { id: 'BK-8942', title: 'داسيا لوغان موديل 2024', city: 'مراكش', dates: '10 سبتمبر - 15 سبتمبر 2026', status: 'مؤكد', price: '1,500 درهم' },
    { id: 'BK-5521', title: 'شقة فاخرة في جليز', city: 'مراكش', dates: '01 أكتوبر - 07 أكتوبر 2026', status: 'قيد المراجعة', price: '4,200 درهم' }
  ];

  const userFavorites = LISTINGS.slice(0, 2);

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-5xl space-y-8">
        
        {/* رأس الملف الشخصي */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-3xl shadow-lg border-2 border-amber-400/30">
              YM
            </div>
            <div className="space-y-1 text-right">
              <div className="inline-flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-400 font-bold px-3 py-1 rounded-full border border-amber-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> مستخدم معتمد وموثق
              </div>
              <h1 className="text-2xl font-black text-white">{name}</h1>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-500" /> {email} | <Phone className="w-3.5 h-3.5 text-amber-500" /> {phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'info' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              البيانات الشخصية
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'bookings' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              حجوزاتي ({userBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'favorites' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              المفضلة ({userFavorites.length})
            </button>
          </div>
        </div>

        {/* محتوى التبويبات */}
        <div className="space-y-6">
          {activeTab === 'info' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
              <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" /> تعديل بيانات الملف الشخصي
              </h2>

              <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 text-right">
                  <label className="text-xs font-bold text-slate-300">الاسم الكامل</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-xs font-bold text-slate-300">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-xs font-bold text-slate-300">رقم الهاتف</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-xs font-bold text-slate-300">المدينة المفضلة</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="مراكش">مراكش</option>
                    <option value="أغادير">أغادير</option>
                    <option value="الدار البيضاء">الدار البيضاء</option>
                    <option value="طنجة">طنجة</option>
                  </select>
                </div>

                <div className="md:col-span-2 pt-4 flex justify-end">
                  <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20">
                    <Save className="w-4 h-4" /> حفظ التغييرات
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" /> سجل الحجوزات السابقة والحالية
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {userBookings.map(booking => (
                  <div key={booking.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                    <div className="space-y-1 text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-amber-400">{booking.id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${booking.status === 'مؤكد' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {booking.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">{booking.title}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" /> {booking.city} | التواريخ: {booking.dates}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <div className="text-[10px] text-slate-400">إجمالي السعر</div>
                        <div className="text-base font-black text-amber-400">{booking.price}</div>
                      </div>
                      <Link href="/my-bookings">
                        <Button className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs">
                          التفاصيل
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-amber-500" /> المفضلة المحفوظة ({userFavorites.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userFavorites.map(item => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col">
                    <div className="relative h-48 bg-slate-950">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 px-3 py-1 rounded-full text-xs font-extrabold shadow">
                        {item.pricePerUnit} {item.unitLabel}
                      </div>
                    </div>
                    <div className="p-6 space-y-3 flex-grow flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-500" /> {item.city}
                        </div>
                        <h3 className="text-base font-bold text-white">{item.title}</h3>
                      </div>
                      <Link href={`/car/${item.id}`}>
                        <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 rounded-xl text-xs">
                          عرض العرض والحجز
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
