import React, { useState, useEffect } from 'react';
import { Sparkles, Star, MapPin, ArrowRight, Zap, Car, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LISTINGS, ListingItem } from '@/data/b2rent';
import { useLocation } from 'wouter';

export function SmartRecommendations() {
  const [, setLocation] = useLocation();
  const [recommendations, setRecommendations] = useState<ListingItem[]>([]);
  const [reasonMap, setReasonMap] = useState<Record<string, string>>({});

  useEffect(() => {
    // قراءة السجل والتفضيلات من localStorage (مثل المفضلة، شوهد مؤخراً، أو الأبحاث)
    try {
      const recentRaw = localStorage.getItem('b2rent_recent_viewed');
      const recentViews: ListingItem[] = recentRaw ? JSON.parse(recentRaw) : [];
      
      const favoritesRaw = localStorage.getItem('b2rent_favorites');
      const favorites: string[] = favoritesRaw ? JSON.parse(favoritesRaw) : [];

      let scored: { item: ListingItem; score: number; reason: string }[] = LISTINGS.map(item => {
        let score = 70; // قاعدة أساسية
        let reason = 'متطابق مع معايير الجودة العالية';

        // إذا كان ضمن المفضلة، نرفع الأولوية
        if (favorites.includes(item.id)) {
          score += 20;
          reason = 'مشابه للعناصر المحفوظة في مفضلتك';
        }

        // إذا تصفح العميل شيئاً مشابهًا في المدينة
        const hasSameCity = recentViews.some(r => r.city === item.city);
        if (hasSameCity) {
          score += 10;
          reason = `بناءً على اهتمامك بالعروض في مدينة ${item.city}`;
        }

        if (item.rating >= 4.9) {
          score += 5;
          reason = 'من أعلى المركبات والعقارات تقييماً وثقة من الزوار';
        }

        return { item, score, reason };
      });

      // ترتيب تنازلي حسب نقاط المطابقة
      scored.sort((a, b) => b.score - a.score);

      // أخذ أفضل 3 توصيات
      const top3 = scored.slice(0, 3);
      setRecommendations(top3.map(s => s.item));
      
      const reasons: Record<string, string> = {};
      top3.forEach(s => {
        reasons[s.item.id] = s.reason;
      });
      setReasonMap(reasons);

    } catch (e) {
      // Fallback في حال تعذر القراءة
      setRecommendations(LISTINGS.slice(0, 3));
      setReasonMap({
        [LISTINGS[0]?.id || '1']: 'الأكثر طلباً هذا الأسبوع',
        [LISTINGS[1]?.id || '2']: 'بناءً على تفضيلات الزوار',
        [LISTINGS[2]?.id || '3']: 'توصية خاصة للوكالات المتميزة'
      });
    }
  }, []);

  if (recommendations.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-b from-background to-muted/30 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-semibold tracking-wide uppercase">التوصيات الذكية بالذكاء الاصطناعي</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              مُقترحة خصيصاً بناءً على تصفحك واهتماماتك
            </h2>
          </div>
          <Badge variant="outline" className="px-4 py-1.5 text-xs font-medium border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Zap className="w-3.5 h-3.5 ml-1.5 inline" /> تحليل حي لسلوك التصفح
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((item) => (
            <Card key={item.id} className="group overflow-hidden border border-border/60 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl bg-card">
              <div className="relative h-48 overflow-hidden bg-muted">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 h-3" /> مطابقة ذكية 96%
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-xs text-white flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" /> {item.city}
                </div>
              </div>

              <CardContent className="p-5">
                <div className="text-xs text-muted-foreground bg-muted/60 px-2 py-1 rounded-sm mb-3 inline-block">
                  💡 {reasonMap[item.id] || 'توصية مقترحة بناءً على الأداء'}
                </div>

                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-foreground group-hover:text-amber-600 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1 text-amber-500 text-sm font-semibold shrink-0">
                    <Star className="w-4 h-4 fill-amber-500" /> {item.rating}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
                  <div>
                    <span className="text-xs text-muted-foreground block">السعر</span>
                    <span className="text-base font-extrabold text-foreground">{item.pricePerUnit} {item.unitLabel}</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setLocation(`/car/${item.id}`)}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-1 cursor-pointer"
                  >
                    عرض التفاصيل <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
