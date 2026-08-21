import { useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Wallet, Banknote, ShieldCheck, CheckCircle2, ArrowRight, FileText, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { LoadingAnimation } from '@/components/LoadingAnimation';

export default function CheckoutPage() {
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);

  const listingId = Number(searchParams.get('listingId') || 1);
  const title = searchParams.get('title') || 'مركبة فاخرة / عقار مميز';
  const pricePerDay = Number(searchParams.get('pricePerDay') || 500);
  const days = Number(searchParams.get('days') || 3);
  const subtotal = pricePerDay * days;
  const commission = Math.round(subtotal * 0.15); // 15% platform commission
  const netEarnings = subtotal - commission; // Partner net earnings
  const total = subtotal;

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'cod'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createBookingMutation = trpc.bookings.create.useMutation({
    onSuccess: () => {
      toast.success('تم تأكيد الحجز وإتمام الدفع بنجاح!');
      setLocation(`/success?title=${encodeURIComponent(title)}&total=${total}`);
    },
    onError: (err) => {
      toast.error(err.message || 'حدث خطأ أثناء معالجة الحجز والدفع.');
      setIsSubmitting(false);
    }
  });

  const handleCheckout = () => {
    setIsSubmitting(true);
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);

    createBookingMutation.mutate({
      listingId,
      startDate: today.toISOString(),
      endDate: endDate.toISOString(),
      totalPrice: total,
    });
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingAnimation 
          text="جاري معالجة الدفع وتأكيد الحجز..." 
          subtext="نقوم بتأكيد التواريخ وقفل التقويم وتوليد العقد الرقمي الآمن" 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">إتمام الدفع وتأكيد الحجز</h1>
            <p className="text-muted-foreground mt-1">اختر طريقة الدفع المناسبة واستعرض تفاصيل الفاتورة بكل شفافية.</p>
          </div>
          <Button variant="ghost" onClick={() => window.history.back()} className="gap-2">
            <ArrowRight className="w-4 h-4" /> عودة
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Payment Methods Section */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-border shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" /> طريـقة الدفع المفضلة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Credit Card */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'card' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">البطاقة الائتمانية (Credit Card / CMI)</h4>
                      <p className="text-xs text-muted-foreground">دفع آمن ومباشر عبر بوابات الدفع المشفرة</p>
                    </div>
                  </div>
                  <input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="accent-primary w-5 h-5" />
                </div>

                {/* E-Wallets */}
                <div
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'wallet' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">المحافظ الإلكترونية (Apple Pay / PayPal / M-Wallet)</h4>
                      <p className="text-xs text-muted-foreground">دفع سريع وفوري بضغطة زر واحدة</p>
                    </div>
                  </div>
                  <input type="radio" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} className="accent-primary w-5 h-5" />
                </div>

                {/* Cash on Delivery / Handover */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'cod' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600">
                      <Banknote className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">الدفع عند الاستلام / التسليم (Cash on Handover)</h4>
                      <p className="text-xs text-muted-foreground">ادفع نقداً عند استلام مفتاح السيارة أو العقار</p>
                    </div>
                  </div>
                  <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-primary w-5 h-5" />
                </div>

                {paymentMethod === 'card' && (
                  <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border space-y-4 animate-in fade-in">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">رقم البطاقة</label>
                      <input type="text" placeholder="4242 •••• •••• 4242" className="w-full p-3 rounded-xl bg-background border border-border text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">تاريخ الانتهاء</label>
                        <input type="text" placeholder="MM/YY" className="w-full p-3 rounded-xl bg-background border border-border text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">رمز الأمان (CVV)</label>
                        <input type="password" placeholder="123" className="w-full p-3 rounded-xl bg-background border border-border text-sm" />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Invoice Summary & Commission Details */}
          <div className="space-y-6">
            <Card className="border-border shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> ملخص الفاتورة الشفافة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/40 rounded-xl">
                  <span className="text-xs text-muted-foreground block">العنصر المحجوز</span>
                  <span className="font-bold text-sm">{title}</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">مدة الحجز:</span>
                    <span className="font-semibold">{days} أيام</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">سعر الكراء اليومي:</span>
                    <span className="font-semibold">{pricePerDay} د.م / يوم</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المجموع الفرعي:</span>
                    <span className="font-semibold">{subtotal} د.م</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-medium pt-2 border-t border-border">
                    <span className="flex items-center gap-1"><Percent className="w-3.5 h-3.5" /> عمولة المنصة (15%):</span>
                    <span>{commission} د.م</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground bg-primary/5 p-2 rounded-lg">
                    <span>صافي أرباح الشريك (للمتابعة الداخلية):</span>
                    <span className="font-semibold text-primary">{netEarnings} د.م</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-between items-center text-lg font-extrabold">
                  <span>الإجمالي النهائي:</span>
                  <span className="text-primary">{total} د.م</span>
                </div>

                <Button
                  className="w-full py-6 text-base font-bold shadow-lg gap-2 mt-4"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'جاري المعالجة...' : 'تأكيد ودفع المبلغ'} <CheckCircle2 className="w-5 h-5" />
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> معاملة مشفرة ومضمونة بنسبة 100%
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
