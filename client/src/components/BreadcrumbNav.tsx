import { Link, useLocation } from "wouter";
import { ChevronLeft, Home } from "lucide-react";

const routeNames: Record<string, string> = {
  "/": "الرئيسية",
  "/search": "بحث الإعلانات",
  "/booking": "حجز موعد",
  "/checkout": "إتمام الدفع",
  "/success": "تأكيد الحجز",
  "/dashboard": "لوحة المالك",
  "/admin": "لوحة المشرف العام",
  "/profile": "الملف الشخصي",
  "/renter-dashboard": "حجوزاتي وفواتيري",
  "/add-car": "إضافة إعلان جديد",
  "/my-bookings": "إدارة الحجوزات",
  "/help": "الدعم والمساعدة",
  "/support-tickets": "تذاكر الدعم",
  "/dispute-resolution": "حل النزاعات",
  "/notifications": "الإشعارات",
  "/favorites": "المفضلة",
  "/privacy": "سياسة الخصوصية",
  "/terms": "شروط الاستخدام",
  "/host": "لوحة المالك",
  "/host-dashboard": "لوحة المالك",
  "/partner": "لوحة المالك",
  "/partner-dashboard": "لوحة المالك",
  "/blog": "المدونة",
  "/about": "من نحن",
};

export default function BreadcrumbNav() {
  const [location] = useLocation();

  if (location === "/") return null;

  const pathSegments = location.split("/").filter(Boolean);
  
  // Build breadcrumb items
  const items = [{ label: "الرئيسية", path: "/" }];
  let currentPath = "";

  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = routeNames[currentPath]
      || (currentPath.startsWith("/property/") ? "تفاصيل العقار"
        : currentPath.startsWith("/car/") ? "تفاصيل السيارة"
          : segment.startsWith("car_") ? "تفاصيل الإعلان" : "صفحة غير معنونة");
    items.push({ label, path: currentPath });
  });

  return (
    <nav aria-label="مسار التنقل" className="bg-muted/30 border-b border-border/50 py-2.5 px-4 md:px-8 mb-6" dir="rtl">
      <ol className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center space-x-2 space-x-reverse">
              {index > 0 && <ChevronLeft className="w-4 h-4 text-muted-foreground/60 mx-1" />}
              {isLast ? (
                <span className="font-semibold text-primary flex items-center gap-1">
                  {index === 0 && <Home className="w-3.5 h-3.5" />}
                  {item.label}
                </span>
              ) : (
                <Link href={item.path} className="hover:text-primary transition-colors flex items-center gap-1">
                  {index === 0 && <Home className="w-3.5 h-3.5" />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
