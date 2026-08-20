import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, PlusCircle, LayoutDashboard, ShieldAlert, BookmarkCheck, HelpCircle, Phone, Mail, Sun, Moon, ShieldCheck, UserCheck, Bell, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useRole } from '@/contexts/RoleContext';
import { toast } from 'sonner';

export default function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'تأكيد الحجز', desc: 'تم تأكيد حجز السيارة B2R-8841 بنجاح.', time: 'منذ 10 دقائق', unread: true },
    { id: '2', title: 'رسالة الدعم الفني', desc: 'تم الرد على استفسارك من طرف فريق b2rentt@gmail.com', time: 'منذ ساعة', unread: true },
    { id: '3', title: 'طلب حجز جديد', desc: 'استلمت وكالتك طلب حجز جديد بانتظار الاعتماد.', time: 'منذ 3 ساعات', unread: false },
  ]);

  const { theme, toggleTheme } = useTheme();
  const { role } = useRole();

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    toast.success('تم تحديد جميع الإشعارات كمقروءة');
  };

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/search', label: 'تصفح السيارات' },
    { href: '/admin', label: 'لوحة الإدارة الشاملة', icon: ShieldAlert },
    { href: '/dashboard', label: 'لوحة الوكالة', icon: LayoutDashboard },
    { href: '/add-car', label: 'إضافة سيارة', icon: PlusCircle },
    { href: '/my-bookings', label: 'حجوزاتي', icon: BookmarkCheck },
    { href: '/help', label: 'الدعم والمساعدة', icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border text-foreground shadow-lg transition-colors duration-300" dir="rtl">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* الشعار وحده في العنوان */}
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

        <div className="hidden md:flex items-center gap-3">
          {/* شارة دور المستخدم الحالي في الترويسة */}
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl text-[11px] font-bold text-amber-400 shadow-sm">
            {role === 'super_admin' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>المشرف العام</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>مدير الوكالة</span>
              </>
            )}
          </div>

          {/* نظام الإشعارات المنبثقة (Notification Bell) */}
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
              <div className="absolute left-0 mt-3 w-80 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-4 animate-in fade-in-50">
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

          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-muted/80 hover:bg-muted text-foreground transition-colors border border-border flex items-center justify-center shadow-sm"
              title="تبديل وضع المظهر"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          )}

          <div className="flex items-center gap-2 bg-muted/50 border border-border px-3 py-2 rounded-xl text-xs">
            <a href="tel:0754382654" className="flex items-center gap-1.5 text-foreground hover:text-amber-500 font-bold">
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              <span>0754382654</span>
            </a>
            <span className="text-border">|</span>
            <a href="mailto:b2rentt@gmail.com" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              <Mail className="w-3.5 h-3.5 text-amber-500" />
              <span>b2rentt@gmail.com</span>
            </a>
          </div>

          <Link href="/add-car">
            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20">
              أضف سيارتك
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-muted text-foreground border border-border"
              title="تبديل وضع المظهر"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-muted text-foreground focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-background border-b border-border px-4 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          {/* شارة الدور للجوال */}
          <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs font-bold text-amber-400">
            <span>دور المستخدم الحالي:</span>
            <span className="flex items-center gap-1">
              {role === 'super_admin' ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              {role === 'super_admin' ? 'المشرف العام' : 'مدير الوكالة'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 text-xs font-bold p-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-amber-500" />}
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border flex flex-col gap-3 text-xs">
            <div className="bg-muted p-3 rounded-xl space-y-2">
              <a href="tel:0754382654" className="flex items-center gap-2 font-bold text-foreground">
                <Phone className="w-4 h-4 text-amber-500" /> 0754382654
              </a>
              <a href="mailto:b2rentt@gmail.com" className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 text-amber-500" /> b2rentt@gmail.com
              </a>
            </div>
            <Link href="/add-car" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 text-xs">
                أضف سيارتك للوكالة
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
