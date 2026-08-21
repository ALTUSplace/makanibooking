import { useState } from 'react';
import { Bell, CheckCircle2, ShieldCheck, Smartphone, Mail, MessageSquare, Trash2, Settings, Sparkles, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'booking' | 'payment' | 'security' | 'promo';
  time: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'تأكيد الحجز المدمج بنجاح',
      message: 'تم تأكيد حجزك لشقة عين الذياب وسيارة Range Rover في الدار البيضاء مع خصم الباقة المدمجة 15%.',
      category: 'booking',
      time: 'منذ 10 دقائق',
      read: false,
    },
    {
      id: 'n2',
      title: 'نجاح الدفع الآمن عبر CMI',
      message: 'تم خصم مبلغ 9,180 درهم مغربي بنجاح وإرسال الفاتورة وعقد الإيجار الرقمي برقم التوقيع #B2R-9821.',
      category: 'payment',
      time: 'منذ ساعة',
      read: false,
    },
    {
      id: 'n3',
      title: 'تنبيه أمني - 2FA',
      message: 'تم التحقق من هوية تسجيل الدخول عبر المصادقة الثنائية بنجاح.',
      category: 'security',
      time: 'منذ 3 ساعات',
      read: true,
    },
    {
      id: 'n4',
      title: 'عرض خاص على ولاء B2-Rent',
      message: 'لقد اكتسبت 450 نقطة ولاء جديدة من حجزك الأخير! يمكنك استبدالها بخصم في حجزك القادم.',
      category: 'promo',
      time: 'منذ يوم',
      read: true,
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('تم تحديث جميع الإشعارات كمقروءة');
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast.success('تم حذف الإشعار بنجاح');
  };

  const savePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('تم حفظ تفضيلات الإشعارات بنجاح!');
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4" dir="rtl">
      <div className="container mx-auto max-w-5xl space-y-8">
        
        {/* Header */}
        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
              <Bell className="w-8 h-8" />
            </div>
            <div>
              <span className="text-amber-500 text-xs font-extrabold uppercase tracking-widest">مركز التنبيهات الفورية</span>
              <h1 className="text-2xl md:text-3xl font-black text-white">إدارة الإشعارات وتفضيلات التوصيل</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={markAllAsRead}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-900 text-xs px-4 py-2.5 rounded-xl"
            >
              تعليم الكل كمقروء
            </Button>
          </div>
        </div>

        {/* Preferences Box */}
        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            <Settings className="w-5 h-5 text-amber-400" />
            <span>تفضيلات وقنوات إرسال الإشعارات المخصصة</span>
          </h3>

          <form onSubmit={savePreferences} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">إشعارات الواتساب</h4>
                  <p className="text-[11px] text-slate-400">عقود، تأكيدات وتنبيهات فورية</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={whatsappEnabled}
                onChange={(e) => setWhatsappEnabled(e.target.checked)}
                className="w-5 h-5 accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">البريد الإلكتروني</h4>
                  <p className="text-[11px] text-slate-400">فواتير PDF وشهادات الشركاء</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailEnabled}
                onChange={(e) => setEmailEnabled(e.target.checked)}
                className="w-5 h-5 accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">الرسائل القصيرة SMS</h4>
                  <p className="text-[11px] text-slate-400">رموز التحقق السريع 2FA</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={smsEnabled}
                onChange={(e) => setSmsEnabled(e.target.checked)}
                className="w-5 h-5 accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl shadow-lg">
                حفظ تفضيلات التنبيهات
              </Button>
            </div>
          </form>
        </div>

        {/* Notifications List */}
        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <span>سجل الإشعارات والتنبيهات المخصصة ({notifications.length})</span>
            </h3>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'unread' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
              >
                غير المقروءة ({notifications.filter(n => !n.read).length})
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">لا توجد إشعارات في هذا التصنيف.</div>
            ) : (
              filteredNotifications.map(item => (
                <div key={item.id} className={`bg-slate-900 border ${!item.read ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-800'} p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-lg`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-950 border border-slate-800 text-amber-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-white">{item.title}</h4>
                        {!item.read && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.message}</p>
                      <span className="text-[10px] text-slate-500 block pt-1">{item.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    {!item.read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNotifications(notifications.map(n => n.id === item.id ? { ...n, read: true } : n));
                          toast.success('تم تعليم الإشعار كمقروء');
                        }}
                        className="border-slate-700 text-slate-300 hover:bg-slate-800 text-[11px] h-8 px-3 rounded-xl"
                      >
                        قراءة
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteNotification(item.id)}
                      className="border-rose-500/30 text-rose-400 hover:bg-rose-500/15 text-[11px] h-8 px-3 rounded-xl"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
