import { useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Wallet, Banknote, ShieldCheck, CheckCircle2, ArrowRight, FileText, Percent, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { LoadingAnimation } from '@/components/LoadingAnimation';

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);

  const listingId = Number(searchParams.get('listingId') || 1);
  const title = searchParams.get('title') || 'مركبة فاخرة / عقار مميز';
  const pricePerDay = Number(searchParams.get('pricePerDay') || 500);
  const days = Number(searchParams.get('days') || 3);
  const subtotal = pricePerDay * days;
  const commission = Math.round(subtotal * 0.10); // 10% platform commission as requested
  const netEarnings = subtotal - commission; // Partner net earnings
  const total = subtotal;
  const requestedContractType = searchParams.get('contractType');
  const contractType = requestedContractType === 'commercial' || requestedContractType === 'professional' ? requestedContractType : null;
  const premises = searchParams.get('premises') || title;
  const city = searchParams.get('city') || 'المغرب';
  const landlordName = searchParams.get('landlordName') || 'المالك / الشركة المؤجرة';

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'cod'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const createBookingMutation = trpc.bookings.create.useMutation({
    onSuccess: (data) => {
      toast.success('تمت عملية الدفع بنجاح وتأكيد الحجز. سيتم تجهيز عقد الكراء تلقائياً.');
      const params = new URLSearchParams({
        title,
        total: String(total),
        bookingId: String(data.bookingId),
        premises,
        city,
        landlordName,
        monthlyRent: String(total),
      });
      if (contractType) params.set('contractType', contractType);
      setLocation(`/success?${params.toString()}`);
    },
    onError: (err) => {
      toast.error(err.message || 'حدث خطأ أثناء معالجة الحجز والدفع.');
      setIsSubmitting(false);
    }
  });

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      toast.error('يرجى الموافقة على الشروط والأحكام وسياسة الضمان (Escrow) للمتابعة');
      return;
    }
    if (paymentMethod === 'card' && (!cardNumber || !cardHolder || !expiry || !cvv)) {
      toast.error('يرجى إدخال كافة بيانات بطاقة الائتمان بشكل صحيح');
      return;
    }

    setIsSubmitting(true);
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);

    setTimeout(() => {
      createBookingMutation.mutate({
        listingId,
        startDate: today.toISOString(),
        endDate: endDate.toISOString(),
        totalPrice: total,
      });
    }, 1200);
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingAnimation 
          text="جاري المعالجة الآمنة عبر بوابة CMI / Stripe..." 
          subtext="نقوم بتأكيد التواريخ، قفل التقويم، وتوليد عقد الإيجار الرقمي" 
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
            <h1 className="text-3xl font-extrabold tracking-tight">بوابة الدفع الآمن وعربون الضمان (Deposit)</h1>
            <p className="text-muted-foreground mt-1">ادفع بأمان عبر بطاقات الائتمان (Visa/Mastercard) أو بوابات CMI المغربية.</p>
          </div>
          <Button variant="ghost" onClick={() => window.history.back()} className="gap-2 cursor-pointer">
            <ArrowRight className="w-4 h-4" /> عودة
          </Button>
        </div>

        <form onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Payment Methods Section */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-border shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-500" /> طريـقة الدفع المفضلة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Credit Card */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'card' ? 'border-amber-500 bg-amber-500/5 shadow-sm' : 'border-border hover:border-amber-500/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">البطاقة الائتمانية (Visa / Mastercard / CMI)</h4>
                      <p className="text-xs text-muted-foreground">دفع آمن ومعتمد عبر مركز المعاملات البنكية</p>
                    </div>
                  </div>
                  <input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="accent-amber-500 w-5 h-5 cursor-pointer" />
                </div>

                {/* E-Wallets */}
                <div
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'wallet' ? 'border-amber-500 bg-amber-500/5 shadow-sm' : 'border-border hover:border-amber-500/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">المحافظ الرقمية والمحلية (WafaCash / Cash Plus / PayPal)</h4>
                      <p className="text-xs text-muted-foreground">تأكيد فوري عبر المحافظ المعتمدة في المغرب</p>
                    </div>
                  </div>
                  <input type="radio" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} className="accent-amber-500 w-5 h-5 cursor-pointer" />
                </div>

                {/* Cash on Handover */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'cod' ? 'border-amber-500 bg-amber-500/5 shadow-sm' : 'border-border hover:border-amber-500/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
                      <Banknote className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">الدفع عند الاستلام (عربون ضمان معتمد)</h4>
                      <p className="text-xs text-muted-foreground">دفع العربون الكترونياً والباقي عند استلام المفتاح</p>
                    </div>
                  </div>
                  <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-amber-500 w-5 h-5 cursor-pointer" />
                </div>

                {paymentMethod === 'card' && (
                  <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border space-y-4 animate-in fade-in">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">اسم حامل البطاقة</label>
                      <input 
                        type="text" 
                        placeholder="الاسم كما يظهر على البطاقة" 
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full p-3 rounded-xl bg-background border border-border text-sm" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">رقم البطاقة الائتمانية</label>
                      <input 
                        type="text" 
                        placeholder="4532 •••• •••• ••••" 
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        maxLength={19}
                        className="w-full p-3 rounded-xl bg-background border border-border text-sm font-mono" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">تاريخ الانتهاء</label>
                        <input 
                          type="text" 
                          placeholder="MM/YY" 
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          maxLength={5}
                          className="w-full p-3 rounded-xl bg-background border border-border text-sm" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">رمز الأمان (CVV)</label>
                        <input 
                          type="password" 
                          placeholder="123" 
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          maxLength={4}
                          className="w-full p-3 rounded-xl bg-background border border-border text-sm" 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Terms checkbox */}
            <div className="flex items-start gap-3 p-4 bg-muted/20 border border-border rounded-2xl">
              <input 
                type="checkbox" 
                id="checkout_terms" 
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="checkout_terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                أوافق على <a href="/terms" target="_blank" className="text-amber-500 underline font-bold">شروط الاستخدام وسياسة الضمان المالي (Escrow)</a> وقواعد عمولة الوساطة بنسبة 10%، وأقر بصحة البيانات المدرجة.
              </label>
            </div>
          </div>

          {/* Invoice Summary & Commission Details */}
          <div className="space-y-6">
            <Card className="border-border shadow-md h-fit">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" /> ملخص الفاتورة الشفافة
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
                    <span className="flex items-center gap-1"><Percent className="w-3.5 h-3.5" /> عمولة الوسيط (10%):</span>
                    <span>{commission} د.م</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground bg-amber-500/5 p-2 rounded-lg border border-amber-500/20">
                    <span>صافي أرباح الشريك:</span>
                    <span className="font-semibold text-amber-600">{netEarnings} د.م</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-between items-center text-lg font-extrabold">
                  <span>الإجمالي النهائي:</span>
                  <span className="text-amber-500">{total} د.م</span>
                </div>

                <Button
                  type="submit"
                  className="w-full py-6 text-base font-black bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xl gap-2 mt-4 cursor-pointer"
                >
                  تأكيد ودفع العربون الآن <CheckCircle2 className="w-5 h-5" />
                </Button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" /> معاملة مشفرة 256-bit ومضمونة بنسبة 100%
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
