import { useEffect, useMemo, useState } from "react";
import { Sparkles, MapPin, ArrowRight, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { OptimizedImage } from "@/components/OptimizedImage";

type LocalSignals = {
  favorites: string[];
  recentCities: string[];
};

const readSignals = (): LocalSignals => {
  if (typeof window === "undefined") return { favorites: [], recentCities: [] };
  try {
    const favoritesRaw = window.localStorage.getItem("b2rent_favorites");
    const recentRaw = window.localStorage.getItem("b2rent_recent_viewed");
    const favorites = favoritesRaw ? JSON.parse(favoritesRaw) : [];
    const recent = recentRaw ? JSON.parse(recentRaw) : [];
    return {
      favorites: Array.isArray(favorites) ? favorites.map(String) : [],
      recentCities: Array.isArray(recent)
        ? recent.filter((entry) => entry && typeof entry.city === "string").map((entry) => entry.city)
        : [],
    };
  } catch {
    return { favorites: [], recentCities: [] };
  }
};

export function SmartRecommendations() {
  const [, setLocation] = useLocation();
  const { data: listings, isLoading } = trpc.listings.list.useQuery({});
  const [signals, setSignals] = useState<LocalSignals>({ favorites: [], recentCities: [] });

  useEffect(() => {
    setSignals(readSignals());
  }, []);

  const recommendations = useMemo(() => {
    if (!listings) return [];
    return listings
      .map((item) => {
        const id = String(item.id);
        const favorite = signals.favorites.includes(id);
        const sameCity = signals.recentCities.includes(item.city);
        const score = (favorite ? 2 : 0) + (sameCity ? 1 : 0);
        const reason = favorite
          ? "مشابه لما حفظته في المفضلة"
          : sameCity
            ? `في المدينة التي تصفحتها: ${item.city}`
            : "من الإعلانات المنشورة المتاحة";
        return { item, score, reason };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [listings, signals]);

  if (isLoading || recommendations.length === 0) return null;

  return (
    <section className="border-t border-border/40 bg-gradient-to-b from-background to-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-amber-500">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">اقتراحات مخصصة</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              عروض منشورة قد تناسب اهتمامك
            </h2>
          </div>
          <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            <Zap className="ml-1.5 inline h-3.5 w-3.5" /> مبنية على سجل التصفح المحلي
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {recommendations.map(({ item, reason }) => {
            const isCar = item.category.toLowerCase().includes("car") || item.category.includes("سيارة");
            const isOffice = Boolean(item.officeType) || item.category.toLowerCase().includes("office") || item.category.includes("مكتب");
            const route = isCar ? `/car/${item.id}` : `/property/${item.id}`;
            const unit = isOffice ? (item.rentalPeriod === "monthly" ? "درهم / شهر" : item.rentalPeriod === "yearly" ? "درهم / سنة" : "درهم / يوم") : isCar ? "درهم / يوم" : "درهم / ليلة";
            return (
              <Card key={item.id} className="group overflow-hidden border border-border/60 bg-card transition-all duration-300 hover:border-amber-500/50 hover:shadow-xl">
                <div className="relative h-48 overflow-hidden bg-muted">
                  {item.imageUrl ? (
                    <OptimizedImage src={item.imageUrl} alt={item.title} width={640} height={360} widthHint={640} sizes="(max-width: 768px) 100vw, 33vw" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">لا توجد صورة</div>
                  )}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur-md">
                    <MapPin className="h-3 w-3 text-amber-400" /> {item.city}
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="mb-3 inline-block rounded-sm bg-muted/60 px-2 py-1 text-xs text-muted-foreground">{reason}</div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="line-clamp-1 text-lg font-bold text-foreground group-hover:text-amber-600">{item.title}</h3>
                    <span className="shrink-0 text-xs text-muted-foreground">لا توجد تقييمات موثقة</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-4">
                    <div>
                      <span className="block text-xs text-muted-foreground">السعر المنشور</span>
                      <span className="text-base font-extrabold text-foreground">{item.dynamicPricePerDay ?? item.pricePerDay} {unit}</span>
                    </div>
                    <Button size="sm" onClick={() => setLocation(route)} className="cursor-pointer gap-1 bg-amber-500 font-semibold text-black hover:bg-amber-600">
                      عرض التفاصيل <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
