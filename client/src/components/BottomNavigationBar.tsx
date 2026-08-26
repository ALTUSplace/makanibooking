import { CalendarDays, Home, Search, UserRound } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function BottomNavigationBar() {
  const [location, setLocation] = useLocation();
  const { direction, t } = useLanguage();
  const currentPath = location.split("?")[0];
  const navItems = [
    { label: t("home"), path: "/", icon: Home },
    { label: t("search"), path: "/search", icon: Search },
    { label: t("myBookings"), path: "/my-bookings", icon: CalendarDays },
    { label: t("account"), path: "/profile", icon: UserRound },
  ];

  return (
    <nav className="mobile-bottom-nav md:hidden" aria-label={t("search")} dir={direction}>
      <div className="mobile-bottom-nav__inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === "/" ? currentPath === "/" : currentPath === item.path || currentPath.startsWith(`${item.path}/`);

          return (
            <button
              key={item.path}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => setLocation(item.path)}
              className={`mobile-bottom-nav__item ${isActive ? "is-active" : ""}`}
            >
              <span className="mobile-bottom-nav__icon" aria-hidden="true">
                <Icon className="h-[19px] w-[19px]" strokeWidth={isActive ? 2.5 : 1.9} />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
