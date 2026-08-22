import { useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Wallet, CheckCircle2, ArrowRight, FileText, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { LoadingAnimation } from '@/components/LoadingAnimation';

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);

  const listingId = Number(searchParams.get('listingId'));
  const title = searchParams.get('title') || '';
  const pricePerDay = Number(searchParams.get('pricePerDay'));
  const startDateParam = searchParams.get('startDate') || '';
  const endDateParam = searchParams.get('endDate') || '';
  const parsedStart = startDateParam ? new Date(`${startDateParam}T12:00:00`) : null;
  const parsedEnd = endDateParam ? new Date(`${endDateParam}T12:00:00`) : null;
  const hasValidDates = Boolean(parsedStart && parsedEnd && !Number.isNaN(parsedStart.getTime()) && !Number.isNaN(parsedEnd.getTime()) && parsedEnd > parsedStart);
  const requestedDays = Number(searchParams.get('days'));
  const daysFromDates = hasValidDates ? Math.ceil((parsedEnd!.getTime() - parsedStart!.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const days = daysFromDates || (Number.isFinite(requestedDays) && requestedDays > 0 ? Math.floor(requestedDays) : 0);
  const subtotal = Number.isFinite(pricePerDay) && pricePerDay > 0 && days > 0 ? pricePerDay * days : 0;
  const requestedContractType = searchParams.get('contractType');
  const contractType = requestedContractType === 'commercial' || requestedContractType === 'professional' ? requestedContractType : null;
  const premises = searchParams.get('premises') || title;
  const city = searchParams.get('city') || 'المغرب';
  const landlordName = searchParams.get('landlordName') || 'المالك / الشركة المؤجرة';

  const [paymentMethod, setPaymentMethod] = useState<'cmi_card' | 'bank_transfer'>('cmi_card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const createPaymentMutation = trpc.payments.create.useMutation();
  const createBookingMutation = trpc.bookings.create.useMutation({
    onSuccess: (data) => {
      createPaymentMutation.mutate({ bookingId: data.bookingId, method: paymentMethod }, {
        onSuccess: (paymentResult) => {
          const invoice = paymentResult.invoice;
          toast.success(paymentResult.payment.status === 'Succeeded'
            ? 'تمت محاكاة الدفع بنجاح وإصدار الفاتورة. سيصبح الحجز مؤكداً بعد موافقة المالك.'
            : 'تم تسجيل طلب التحويل البنكي وإنشاء فاتورة قيد المراجعة.');
          const params = new URLSearchParams({
            title,
            total: String(invoice.total),
            bookingId: String(data.bookingId),
            invoiceId: String(invoice.id),
            invoiceNumber: invoice.invoiceNumber,
            paymentStatus: paymentResult.payment.status,
            invoiceStatus: invoice.status,
            premises,
            city,
            landlordName,
            startDate: startDateParam,
            endDate: endDateParam,
            monthlyRent: String(invoice.subtotal),
            bookingStatus: 'Pending',
          });
          if (contractType) params.set('contractType', contractType);
          setLocation(`/success?${params.toString()}`);
        },
        onError: (err) => {
          toast.error(err.message || 'تم إنشاء الحجز لكن تعذر تسجيل الدفع. يمكنك إعادة المحاولة من صفحة حجوزاتك.');
          setIsSubmitting(false);
        },
      });
    },
    onError: (err) => {
      toast.error(err.message || 'حدث خطأ أثناء إنشاء الحجز.');
      setIsSubmitting(false);
    }
  });

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isInteger(listingId) || listingId <= 0 || !title || !hasValidDates || !Number.isFinite(pricePerDay) || pricePerDay <= 0) {
      toast.error('رابط الحجز غير مكتمل. عد إلى تفاصيل الإعلان واختر تواريخ صحيحة قبل المتابعة.');
      return;
    }
    if (!agreeTerms) {
      toast.error('يرجى الموافقة على الشروط والأحكام وسياسة الضمان (Escrow) للمتابعة');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      createBookingMutation.mutate({
        listingId,
        startDate: parsedStart!.toISOString(),
        endDate: parsedEnd!.toISOString(),
      });
    }, 1200);
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingAnimation 
          text="جاري تسجيل الحجز والدفع المحاكى عبر CMI..." 
          subtext="يُحفظ مبلغ الفاتورة من الخادم؛ سيُتاح العقد بعد موافقة المالك" 
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

        {!Number.isInteger(listingId) || listingId <= 0 || !hasValidDates || !Number.isFinite(pricePerDay) || pricePerDay <= 0 ? (
          <Card className="border-red-200 bg-red-50 text-red-900">
            <CardContent className="p-8 text-center">
              <p className="font-bold">لا يمكن فتح الدفع لأن بيانات الحجز ناقصة أو غير صحيحة.</p>
              <p className="mt-2 text-sm">عد إلى تفاصيل الإعلان واختر تاريخ البداية والنهاية قبل المتابعة.</p>
              <Button type="button" onClick={() => window.history.back()} className="mt-4 bg-[#0B3C5D] text-white">العودة إلى تفاصيل الإعلان</Button>
            </CardContent>
          </Card>
        ) : <form onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  onClick={() => setPaymentMethod('cmi_card')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'cmi_card' ? 'border-amber-500 bg-amber-500/5 shadow-sm' : 'border-border hover:border-amber-500/50'
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
                  <input type="radio" checked={paymentMethod === 'cmi_card'} onChange={() => setPaymentMethod('cmi_card')} className="accent-amber-500 w-5 h-5 cursor-pointer" />
                </div>

                {/* E-Wallets */}
                <div
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'bank_transfer' ? 'border-amber-500 bg-amber-500/5 shadow-sm' : 'border-border hover:border-amber-500/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">التحويل البنكي المباشر (RIB)</h4>
                      <p className="text-xs text-muted-foreground">تُنشأ الفاتورة بحالة قيد المراجعة إلى حين تأكيد التحويل</p>
                    </div>
                  </div>
                  <input type="radio" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} className="accent-amber-500 w-5 h-5 cursor-pointer" />
                </div>

                {paymentMethod === 'cmi_card' && (
                  <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-amber-500/20 space-y-2 text-sm">
                    <div className="flex items-center gap-2 font-bold"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> محاكاة CMI مفعّلة</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">لا تدخل رقم بطاقة أو رمز CVV حقيقياً. هذه نسخة محاكاة لا تتصل بمؤسسة CMI، وسيُحفظ فقط مرجع العملية وحالتها دون بيانات البطاقة.</p>
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
                  <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                    <span>المجموع الأولي من بيانات الإعلان:</span>
                    <span>{subtotal} د.م</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground bg-amber-500/5 p-2 rounded-lg border border-amber-500/20 leading-relaxed">سيحسب الخادم العمولة وTVA والإجمالي النهائي من الإعلان والإعدادات المحفوظة، وستظهر القيم المعتمدة في الفاتورة بعد التسجيل.</p>
                </div>

                <div className="pt-4 border-t border-border flex justify-between items-center text-lg font-extrabold">
                  <span>الإجمالي النهائي:</span>
                  <span className="text-amber-500">يحدده الخادم</span>
                </div>

                <Button
                  type="submit"
                  className="w-full py-6 text-base font-black bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xl gap-2 mt-4 cursor-pointer"
                >
                  تأكيد ودفع العربون الآن <CheckCircle2 className="w-5 h-5" />
                </Button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" /> لا تُحفظ بيانات البطاقة؛ الدفع المعروض محاكاة فقط
                </div>
              </CardContent>
            </Card>
          </div>
        </form>}
      </div>
    </div>
  );
}
