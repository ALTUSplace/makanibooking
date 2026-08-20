import { Home, Search, Calendar, User } from 'lucide-react';
import { useLocation } from 'wouter';

export default function BottomNavigationBar() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { label: 'الرئيسية', path: '/', icon: Home },
    { label: 'البحث', path: '/search', icon: Search },
    { label: 'الحجوزات', path: '/renter-dashboard', icon: Calendar },
    { label: 'الحساب', path: '/dashboard', icon: User },
  ];

  return (
    <nav aria-label="التنقل السريع للهواتف" className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50 px-4 py-2 flex items-center justify-around shadow-lg" dir="rtl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.path;
        return (
          <button
            key={item.path}
            onClick={() => setLocation(item.path)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-primary font-bold scale-105' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className={`w-5 h-5 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            <span className="text-[11px] leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
