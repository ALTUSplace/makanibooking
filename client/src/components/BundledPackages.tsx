import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, Building2, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import { OptimizedImage } from '@/components/OptimizedImage';

export const BUNDLED_PACKAGES = [
  {
    id: 1,
    title: 'باقة الصيف الفاخرة (شقة مراكش + مرسيدس C-Class)',
    description: 'احجز شقة مفروشة بقلب جليز مراكش مع سيارة مرسيدس موديل السنة لمدة أسبوع واستفد من خصم حصري 20%.',
    originalPrice: 7000,
    bundledPrice: 5600,
    savings: 1400,
    imageCar: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
    imageRealEstate: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
    city: 'مراكش'
  },
  {
    id: 2,
    title: 'باقة الأعمال بالدار البيضاء (استوديو أنفا + رينو كليو)',
    description: 'إقامة مميزة لرجال الأعمال في الدار البيضاء مع سيارة اقتصادية للتنقل السريع في المدينة.',
    originalPrice: 4500,
    bundledPrice: 3800,
    savings: 700,
    imageCar: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80',
    imageRealEstate: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
    city: 'الدار البيضاء'
  },
  {
    id: 3,
    title: 'باقة العطلة الشاطئية (فيلا طنجة + دفع رباعي هيونداي)',
    description: 'استمتع بشواطئ طنجة الساحرة مع فيلا مطلة على البحر وسيارة دفع رباعي واسعة للعائلة.',
    originalPrice: 12000,
    bundledPrice: 9900,
    savings: 2100,
    imageCar: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    imageRealEstate: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
    city: 'طنجة'
  }
];

export default function BundledPackages() {
  return (
    <section className="py-12 bg-gradient-to-b from-muted/30 to-background rounded-3xl my-10 border border-border px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <Badge className="bg-primary/10 text-primary gap-1 px-3 py-1 text-sm font-semibold">
            <Sparkles className="w-4 h-4" /> عروض حصرية موفرة
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight">الباقات المدمجة (عقار + سيارة)</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            احجز إقامتك ووسيلة تنقلك معاً في معاملة واحدة واستمتع بتخفيضات فورية وعقود رقمية موحدة.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {BUNDLED_PACKAGES.map((pkg) => (
            <Card key={pkg.id} className="overflow-hidden border-border flex flex-col justify-between hover:shadow-xl transition-all duration-300">
              <div>
                <div className="grid grid-cols-2 h-40 relative">
                  <OptimizedImage src={pkg.imageRealEstate} alt="عقار ضمن الباقة" width={600} height={320} widthHint={600} sizes="(max-width: 1024px) 100vw, 33vw" className="w-full h-full object-cover" />
                  <OptimizedImage src={pkg.imageCar} alt="سيارة ضمن الباقة" width={600} height={320} widthHint={600} sizes="(max-width: 1024px) 100vw, 33vw" className="w-full h-full object-cover" />
                  <Badge className="absolute top-3 right-3 bg-rose-600 text-white font-bold shadow-md">
                    وفر {pkg.savings} د.م
                  </Badge>
                </div>
                <CardHeader className="space-y-2">
                  <div className="text-xs text-muted-foreground font-semibold">{pkg.city}</div>
                  <CardTitle className="text-xl leading-tight">{pkg.title}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">{pkg.description}</p>
                </CardHeader>
              </div>

              <CardContent className="space-y-4 pt-0">
                <div className="bg-muted/50 p-3 rounded-xl flex items-center justify-between text-sm">
                  <span className="text-muted-foreground line-through">{pkg.originalPrice} د.م</span>
                  <span className="text-xl font-extrabold text-primary">{pkg.bundledPrice} د.م <span className="text-xs font-normal text-muted-foreground">/ المدة كاملة</span></span>
                </div>
                <Button className="w-full font-semibold gap-2" onClick={() => toast.success(`تم اختيار "${pkg.title}" بنجاح! جاري التوجيه لعقد الحجز الموحد...`)}>
                  <Check className="w-4 h-4" /> احجز الباقة الآن
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
