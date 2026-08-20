import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Car, Menu, X, PlusCircle, LayoutDashboard, BookmarkCheck, HelpCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/search', label: 'تصفح السيارات' },
    { href: '/dashboard', label: 'لوحة الوكالة', icon: LayoutDashboard },
    { href: '/add-car', label: 'إضافة سيارة', icon: PlusCircle },
    { href: '/my-bookings', label: 'حجوزاتي', icon: BookmarkCheck },
    { href: '/help', label: 'المساعدة', icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md shadow-amber-900/30 group-hover:scale-105 transition-transform">
            <Car className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-wider flex items-center gap-1.5">
              <span>B2</span>
              <span className="text-amber-400">-</span>
              <span>RENT</span>
            </div>
            <p className="text-xs text-amber-300/80 font-medium tracking-wide">الرفاهية والموثوقية في المغرب</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors py-2 px-3 rounded-lg ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {Icon && <Icon className="w-4 h-4 text-amber-400" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <a
            href="https://wa.me/212661234567"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-emerald-600/90 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-emerald-900/20 transition-all hover:scale-[1.02]"
          >
            <Phone className="w-4 h-4" />
            <span>واتساب مباشر</span>
          </a>
          <Link href="/add-car">
            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold shadow-lg shadow-amber-500/20">
              أضف سيارتك
            </Button>
          </Link>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 text-sm font-medium p-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-amber-400" />}
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            <a
              href="https://wa.me/212661234567"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-medium shadow-md"
            >
              <Phone className="w-5 h-5" />
              <span>تواصل عبر الواتساب الفوري</span>
            </a>
            <Link href="/add-car" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3">
                أضف سيارتك للوكالة
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
