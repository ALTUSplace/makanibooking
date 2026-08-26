import { Link, useLocation } from "wouter";
import { ChevronLeft, Home } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const routeKeys: Record<string, string> = {
  "/": "home",
  "/search": "search",
  "/booking": "bookNow",
  "/checkout": "checkout",
  "/success": "success",
  "/dashboard": "dashboard",
  "/admin": "admin",
  "/profile": "profile",
  "/renter-dashboard": "myBookings",
  "/add-car": "addCar",
  "/my-bookings": "myBookings",
  "/help": "help",
  "/support-tickets": "help",
  "/dispute-resolution": "disputeResolution",
  "/notifications": "notifications",
  "/favorites": "favorites",
  "/privacy": "privacyPolicy",
  "/terms": "termsOfService",
  "/host": "dashboard",
  "/host-dashboard": "dashboard",
  "/partner": "dashboard",
  "/partner-dashboard": "dashboard",
  "/blog": "blog",
  "/about": "about",
};

function dynamicLabel(path: string, segment: string, t: (key: string) => string) {
  if (path.startsWith("/property/")) return t("propertyDetails");
  if (path.startsWith("/car/")) return t("carDetails");
  if (/^\d+$/.test(segment)) return t("listingNumber").replace("{id}", segment);
  if (segment.startsWith("car_")) return t("listingDetails");
  return t("listingPage");
}

export default function BreadcrumbNav() {
  const [location] = useLocation();
  const { direction, t } = useLanguage();
  if (location === "/") return null;

  const pathSegments = location.split("?")[0].split("/").filter(Boolean);
  const items = [{ label: t("home"), path: "/" }];
  let currentPath = "";

  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    items.push({
      label: routeKeys[currentPath] ? t(routeKeys[currentPath]) : dynamicLabel(currentPath, segment, t),
      path: currentPath,
    });
  });

  return (
    <nav aria-label={t("breadcrumb")} className="mb-6 border-b border-border/50 bg-muted/30 px-4 py-2.5 md:px-8" dir={direction}>
      <ol className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center space-x-2 space-x-reverse">
              {index > 0 && <ChevronLeft className="mx-1 h-4 w-4 text-muted-foreground/60" aria-hidden="true" />}
              {isLast ? (
                <span className="flex items-center gap-1 font-semibold text-primary">
                  {index === 0 && <Home className="h-3.5 w-3.5" aria-hidden="true" />}
                  {item.label}
                </span>
              ) : (
                <Link href={item.path} className="flex items-center gap-1 transition-colors hover:text-primary">
                  {index === 0 && <Home className="h-3.5 w-3.5" aria-hidden="true" />}
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
