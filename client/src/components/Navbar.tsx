import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, PlusCircle, LayoutDashboard, ShieldAlert, BookmarkCheck, HelpCircle, Phone, Mail, Sun, Moon, ShieldCheck, UserCheck, Bell, Globe, CreditCard, MessageSquare, Shield, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useRole } from '@/contexts/RoleContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency, Currency } from '@/contexts/CurrencyContext';
import { CMIPaymentModal } from './CMIPaymentModal';
import { WhatsAppNotificationModal } from './WhatsAppNotificationModal';
import { TwoFactorAuthModal } from './TwoFactorAuthModal';
import { toast } from 'sonner';

export default function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [cmiModalOpen, setCmiModalOpen] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [twoFaModalOpen, setTwoFaModalOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'الأمان وحماية 2FA', desc: 'تم تفعيل المصادقة الثنائية لحسابك الإداري بنجاح.', time: 'منذ دقيقتين', unread: true },
    { id: '2', title: 'تأكيد الحجز CMI', desc: 'تم سداد مبلغ الحجز بنجاح عبر بوابة CMI المغربية.', time: 'منذ ساعة', unread: true },
    { id: '3', title: 'إشعار واتساب آلي', desc: 'تم إرسال تفاصيل العقد ورقم الحجز إلى الواتساب.', time: 'منذ 3 ساعات', unread: false },
  ]);

  const { theme, toggleTheme } = useTheme();
  const { role } = useRole();
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    toast.success('تم تحديد جميع الإشعارات كمقروءة');
  };

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/search', label: t('search') },
    { href: '/admin', label: t('admin'), icon: ShieldAlert },
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/add-car', label: t('addCar'), icon: PlusCircle },
    { href: '/my-bookings', label: t('myBookings'), icon: BookmarkCheck },
    { href: '/help', label: t('help'), icon: HelpCircle },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border text-foreground shadow-lg transition-colors duration-500" dir="rtl">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          
          {/* الشعار */}
          <Link href="/" className="flex items-center group">
            <div className="h-14 w-36 overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
              <img src="/manus-storage/35942_9a6ce071.png" alt="B2-Rent Logo" className="h-full w-full object-contain" />
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1 text-xs font-bold transition-all py-2 px-2.5 rounded-xl ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 text-amber-500" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-2.5">
            
            {/* اختيار العملة */}
            <div className="flex items-center bg-muted/80 border border-border rounded-xl p-1 text-xs font-bold">
              <Coins className="w-3.5 h-3.5 text-amber-500 mx-1.5" />
              {(['MAD', 'EUR', 'USD'] as Currency[]).map((curr) => (
                <button
                  key={curr}
                  onClick={() => {
                    setCurrency(curr);
                    toast.success(`تم تبديل العملة إلى ${curr}`);
                  }}
                  className={`px-2 py-1 rounded-lg uppercase transition-all ${
                    currency === curr
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            {/* اختيار اللغة */}
            <div className="flex items-center bg-muted/80 border border-border rounded-xl p-1 text-xs font-bold">
              <Globe className="w-3.5 h-3.5 text-amber-500 mx-1.5" />
              {(['ar', 'fr', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    toast.success(lang === 'ar' ? 'تم التبديل إلى العربية' : lang === 'fr' ? 'Passé au Français' : 'Switched to English');
                  }}
                  className={`px-2 py-1 rounded-lg uppercase transition-all ${
                    language === lang
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* شارة الدور */}
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-amber-500 dark:text-amber-400">
              {role === 'super_admin' ? <ShieldCheck className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
              <span>{role === 'super_admin' ? 'مشرف عام' : 'مدير وكالة'}</span>
            </div>

            {/* زر تفعيل المصادقة الثنائية 2FA */}
            <button
              onClick={() => setTwoFaModalOpen(true)}
              className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors border border-amber-500/30 flex items-center justify-center shadow-sm"
              title="إدارة الأمان والمصادقة الثنائية (2FA)"
            >
              <Shield className="w-4 h-4" />
            </button>

            {/* زر محاكاة دفع CMI */}
            <button
              onClick={() => setCmiModalOpen(true)}
              className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors border border-amber-500/30 flex items-center justify-center shadow-sm"
              title="بوابة الدفع CMI"
            >
              <CreditCard className="w-4 h-4" />
            </button>

            {/* زر إشعار واتساب */}
            <button
              onClick={() => setWhatsappModalOpen(true)}
              className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors border border-emerald-500/30 flex items-center justify-center shadow-sm"
              title="إشعار WhatsApp / SMS"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            {/* إشعارات */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2.5 rounded-xl bg-muted/80 hover:bg-muted text-foreground transition-colors border border-border flex items-center justify-center shadow-sm"
                title="الإشعارات والتنبيهات"
              >
                <Bell className="w-4 h-4 text-amber-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute left-0 mt-3 w-80 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-4 animate-in fade-in-50 text-right">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-amber-400" /> الإشعارات والتحديثات
                    </h4>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-[10px] text-amber-400 hover:underline">
                        تحديد الكل كمقروء
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5 max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl border text-xs space-y-1 transition-colors ${
                          n.unread ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900 border-slate-800/80 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-white">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-300">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* الوضع الليلي */}
            {toggleTheme && (
              <button
                onClick={() => {
                  toggleTheme();
                  toast.success(theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي');
                }}
                className="p-2.5 rounded-xl bg-muted/80 hover:bg-muted text-foreground transition-all border border-border flex items-center justify-center shadow-sm"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>
            )}

            <Link href="/add-car">
              <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20">
                {t('addCar')}
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30 transition-all shadow-sm"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <CMIPaymentModal
        isOpen={cmiModalOpen}
        onClose={() => setCmiModalOpen(false)}
        onSuccess={() => setCmiModalOpen(false)}
        amount={1500}
      />

      <WhatsAppNotificationModal
        isOpen={whatsappModalOpen}
        onClose={() => setWhatsappModalOpen(false)}
        bookingDetails={{
          id: 'B2R-9942',
          carName: 'Dacia Duster 2026',
          customerName: 'محمد العلوي',
          customerPhone: '0661234567',
          totalPrice: 1500,
        }}
      />

      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-20 right-0 left-0 bg-slate-950/98 backdrop-blur-2xl border-b border-amber-500/30 p-6 shadow-2xl z-[9999] animate-in slide-in-from-top-4 duration-300 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 text-sm font-bold py-3 px-4 rounded-xl transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs text-slate-400 font-medium">الدور الحالي:</span>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                  {role === 'super_admin' ? 'مشرف عام' : 'مدير وكالة'}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => { setTwoFaModalOpen(true); setMobileMenuOpen(false); }}
                  className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold rounded-xl border border-slate-800 flex items-center justify-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5" /> 2FA أمان
                </button>
                <button
                  onClick={() => { setCmiModalOpen(true); setMobileMenuOpen(false); }}
                  className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold rounded-xl border border-slate-800 flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-3.5 h-3.5" /> CMI دفع
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <TwoFactorAuthModal
        isOpen={twoFaModalOpen}
        onClose={() => setTwoFaModalOpen(false)}
        onSuccess={() => setTwoFaModalOpen(false)}
      />
    </>
  );
}
