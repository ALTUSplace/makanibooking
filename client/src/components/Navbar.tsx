import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, PlusCircle, LayoutDashboard, BookmarkCheck, HelpCircle, Phone, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export default function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/search', label: 'تصفح السيارات' },
    { href: '/dashboard', label: 'لوحة الوكالة المستقلة', icon: LayoutDashboard },
    { href: '/add-car', label: 'إضافة سيارة', icon: PlusCircle },
    { href: '/my-bookings', label: 'حجوزاتي', icon: BookmarkCheck },
    { href: '/help', label: 'المساعدة', icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border text-foreground shadow-lg transition-colors duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* الشعار وحده في العنوان بدون نصوص مكررة */}
        <Link href="/" className="flex items-center group">
          <div className="h-14 w-36 overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
            <img src="/manus-storage/35942_9a6ce071.png" alt="B2-Rent Logo" className="h-full w-full object-contain" />
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-3">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 text-xs font-bold transition-all py-2 px-3 rounded-xl ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                {Icon && <Icon className="w-4 h-4 text-amber-500" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
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

          <a
            href="https://wa.me/212661234567"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-900/20 transition-all hover:scale-[1.02]"
          >
            <Phone className="w-4 h-4" />
            <span>واتساب مباشر</span>
          </a>

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

          <div className="pt-4 border-t border-border flex flex-col gap-3">
            <a
              href="https://wa.me/212661234567"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl text-xs font-bold shadow-md"
            >
              <Phone className="w-4 h-4" />
              <span>تواصل عبر الواتساب الفوري</span>
            </a>
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
