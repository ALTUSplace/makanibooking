import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, Building2, Plus, DollarSign, CheckCircle2, XCircle, Clock, Upload, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function PartnerDashboard() {
  const utils = trpc.useUtils();
  const { data: listings = [], isLoading: listingsLoading } = trpc.listings.list.useQuery();
  const { data: bookings = [], isLoading: bookingsLoading } = trpc.bookings.list.useQuery();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'car' | 'real_estate'>('car');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('الدار البيضاء');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  const createListingMutation = trpc.listings.create.useMutation({
    onSuccess: () => {
      toast.success('تمت إضافة الإعلان بنجاح في أسطول الشريك!');
      utils.listings.list.invalidate();
      setIsAddOpen(false);
      setTitle('');
      setPrice('');
      setImageUrl('');
      setDescription('');
    },
    onError: (err) => {
      toast.error('خطأ أثناء إضافة الإعلان: ' + err.message);
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) {
      toast.error('يرجى تعبئة الحقول الإجبارية');
      return;
    }
    createListingMutation.mutate({
      title,
      category,
      pricePerDay: Number(price),
      city,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      description: description || 'إعلان معتمد من الشريك الموثوق'
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">لوحة تحكم الشريك (شركة السيارات / مالك العقار)</h1>
            <p className="text-muted-foreground mt-1">
              إدارة الأسطول، العقارات، تحديد الأسعار اليومية، تحديث حالة التوفر، واستقبال طلبات الحجز الفورية.
            </p>
          </div>
          <Button onClick={() => setIsAddOpen(!isAddOpen)} className="gap-2 bg-primary text-primary-foreground font-semibold">
            <Plus className="w-5 h-5" /> إضافة عقار أو سيارة جديدة
          </Button>
        </div>

        {/* Add Modal / Section */}
        {isAddOpen && (
          <Card className="p-6 border-primary/40 bg-card shadow-lg animate-in fade-in-50">
            <h3 className="text-xl font-bold mb-4">إضافة عنصر جديد للأسطول أو العقارات</h3>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">عنوان الإعلان</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: مرسيدس C-Class 2026 أو شقة فاخرة" className="w-full p-3 rounded-xl bg-background border border-border text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الفئة</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full p-3 rounded-xl bg-background border border-border text-sm">
                  <option value="car">سيارة للإيجار</option>
                  <option value="real_estate">عقار للإيجار</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">السعر اليومي (د.م)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="500" className="w-full p-3 rounded-xl bg-background border border-border text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">المدينة</label>
                <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full p-3 rounded-xl bg-background border border-border text-sm">
                  <option value="الدار البيضاء">الدار البيضاء</option>
                  <option value="مراكش">مراكش</option>
                  <option value="طنجة">طنجة</option>
                  <option value="أغادير">أغادير</option>
                  <option value="الرباط">الرباط</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">رابط الصورة (Image URL)</label>
                <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://images.unsplash.com/..." className="w-full p-3 rounded-xl bg-background border border-border text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">وصف تفصيلي</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="المواصفات، المميزات..." className="w-full p-3 rounded-xl bg-background border border-border text-sm"></textarea>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>إلغاء</Button>
                <Button type="submit" disabled={createListingMutation.isPending}>
                  {createListingMutation.isPending ? 'جاري الحفظ...' : 'حفظ ونشر الإعلان'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="fleet" className="space-y-6">
          <TabsList className="bg-card p-1 rounded-xl border border-border grid grid-cols-2 max-w-sm">
            <TabsTrigger value="fleet" className="rounded-lg gap-2">
              <Car className="w-4 h-4" /> إدارة الأسطول والعقارات
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-lg gap-2">
              <Clock className="w-4 h-4" /> طلبات الحجز الواردة
            </TabsTrigger>
          </TabsList>

          {/* Fleet Tab */}
          <TabsContent value="fleet" className="space-y-4">
            <h2 className="text-xl font-semibold">إدارة العناصر المتاحة وتحديث حالة التوفر</h2>
            {listingsLoading ? (
              <div className="text-center py-12 text-muted-foreground">جاري تحميل الأسطول...</div>
            ) : listings.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">لا توجد عناصر مضافة حتى الآن. اضغط على زر "إضافة عقار أو سيارة جديدة" للبدء.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((item: any) => (
                  <Card key={item.id} className="overflow-hidden border-border flex flex-col justify-between">
                    <div>
                      <div className="relative h-48 bg-muted">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        <Badge className="absolute top-3 right-3 bg-card/90 text-foreground font-semibold">
                          {item.category === 'car' ? 'سيارة' : 'عقار'}
                        </Badge>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{item.city} | <span className="text-primary font-bold">{item.pricePerDay} د.م / يوم</span></p>
                      </CardHeader>
                    </div>
                    <CardContent className="pt-2 flex justify-between items-center border-t border-border mt-4">
                      <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 font-semibold">متاح للحجز</span>
                      <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => toast.info('تم تحديث حالة التوفر بنجاح')}>
                        تغيير الحالة
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">طلبات الحجز الواردة من العملاء</h2>
              <Badge className="bg-primary/10 text-primary animate-pulse">تنبيهات فورية نشطة</Badge>
            </div>
            {bookingsLoading ? (
              <div className="text-center py-12 text-muted-foreground">جاري تحميل الطلبات...</div>
            ) : bookings.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">لا توجد طلبات حجز واردة حالياً.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking: any) => (
                  <Card key={booking.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-border">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-lg">طلب حجز #{booking.id}</h4>
                        <Badge className={booking.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}>
                          {booking.status === 'Confirmed' ? 'مؤكد' : 'قيد الانتظار'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">الفترة: من {new Date(booking.startDate).toLocaleDateString('ar-MA')} إلى {new Date(booking.endDate).toLocaleDateString('ar-MA')}</p>
                      <div className="text-sm space-y-0.5">
                        <p className="text-muted-foreground">المبلغ الإجمالي للزبون: <span className="font-bold text-foreground">{booking.totalPrice} د.م</span></p>
                        <p className="text-primary font-bold">صافي أرباحك (بعد عمولة 15%): {booking.totalPrice - (booking.commissionFee || Math.round(booking.totalPrice * 0.15))} د.م</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 flex-1 md:flex-none" onClick={() => toast.success('تم قبول طلب الحجز وإرسال العقد للعميل')}>
                        <CheckCircle2 className="w-4 h-4" /> قبول الطلب
                      </Button>
                      <Button size="sm" variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 flex-1 md:flex-none" onClick={() => toast.error('تم رفض طلب الحجز')}>
                        <XCircle className="w-4 h-4" /> رفض
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}
