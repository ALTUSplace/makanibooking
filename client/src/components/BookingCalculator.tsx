import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, ShieldCheck, Calendar, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function BookingCalculator({ basePricePerDay = 450, itemName = 'مرسيدس C-Class 2026' }: { basePricePerDay?: number; itemName?: string }) {
  const [days, setDays] = useState(3);
  const [includeInsurance, setIncludeInsurance] = useState(true);
  const [includeDriver, setIncludeDriver] = useState(false);

  const insuranceFeePerDay = includeInsurance ? 70 : 0;
  const driverFeePerDay = includeDriver ? 250 : 0;
  const dailyTotal = basePricePerDay + insuranceFeePerDay + driverFeePerDay;
  const subtotal = dailyTotal * days;
  const commissionFee = Math.round(subtotal * 0.05); // 5% منصة شفافة
  const grandTotal = subtotal + commissionFee;

  return (
    <Card className="border-border shadow-lg p-6 bg-card">
      <CardHeader className="px-0 pt-0 pb-4 border-b border-border">
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Calculator className="w-5 h-5 text-primary" /> حاسبة الحجز التفاعلية الشفافة
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">احسب التكلفة الإجمالية لـ {itemName} بناءً على عدد الأيام والإضافات المختارة.</p>
      </CardHeader>

      <CardContent className="px-0 pt-6 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">عدد أيام الحجز: <span className="font-bold text-primary">{days} أيام</span></label>
          <input 
            type="range" 
            min="1" 
            max="30" 
            value={days} 
            onChange={(e) => setDays(Number(e.target.value))} 
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        <div className="space-y-3 pt-2 border-t border-border">
          <label className="flex items-center justify-between text-sm cursor-pointer">
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600" /> تأمين شامل مميز (+70 د.م / يوم)</span>
            <input type="checkbox" checked={includeInsurance} onChange={(e) => setIncludeInsurance(e.target.checked)} className="rounded accent-primary w-4 h-4" />
          </label>
          <label className="flex items-center justify-between text-sm cursor-pointer">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> خدمة سائق خاص (+250 د.م / يوم)</span>
            <input type="checkbox" checked={includeDriver} onChange={(e) => setIncludeDriver(e.target.checked)} className="rounded accent-primary w-4 h-4" />
          </label>
        </div>

        <div className="bg-muted/50 p-4 rounded-xl space-y-2 text-sm border border-border">
          <div className="flex justify-between">
            <span className="text-muted-foreground">سعر الأساس ({days} أيام):</span>
            <span className="font-semibold">{basePricePerDay * days} د.م</span>
          </div>
          {includeInsurance && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">التأمين الشامل:</span>
              <span className="font-semibold">{70 * days} د.م</span>
            </div>
          )}
          {includeDriver && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">السائق الخاص:</span>
              <span className="font-semibold">{250 * days} د.م</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-border text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Info className="w-3.5 h-3.5" /> عمولة الوساطة للمنصة (5% شفافة):</span>
            <span className="font-semibold">{commissionFee} د.م</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-border text-lg font-bold text-primary">
            <span>الإجمالي النهائي:</span>
            <span>{grandTotal} د.م</span>
          </div>
        </div>

        <Button className="w-full py-6 font-bold text-base shadow-md" onClick={() => toast.success(`تمت إضافة الحجز برقم إجمالي ${grandTotal} د.م بنجاح!`)}>
          تأكيد الحجز بهذه التكلفة
        </Button>
      </CardContent>
    </Card>
  );
}
