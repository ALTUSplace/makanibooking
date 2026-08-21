import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, Sun, Snowflake, Info, Check } from 'lucide-react';

interface SeasonalPricingProps {
  basePricePerDay: number;
  itemName: string;
}

export const SeasonalPricingCalculator: React.FC<SeasonalPricingProps> = ({ basePricePerDay, itemName }) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [durationDays, setDurationDays] = useState<number>(5);

  // Seasonal pricing logic: Summer months (June, July, August, December) have +30% surge
  const isPeakSeason = [6, 7, 8, 12].includes(selectedMonth);
  const isLowSeason = [1, 2, 11].includes(selectedMonth);

  const seasonalMultiplier = isPeakSeason ? 1.3 : isLowSeason ? 0.9 : 1.0;
  const adjustedDailyPrice = Math.round(basePricePerDay * seasonalMultiplier);
  const subtotal = adjustedDailyPrice * durationDays;
  const platformCommission = Math.round(subtotal * 0.10);

  const months = [
    { id: 1, name: 'يناير (شتاء)' },
    { id: 2, name: 'فبراير (شتاء)' },
    { id: 3, name: 'مارس (عادي)' },
    { id: 4, name: 'أبريل (عادي)' },
    { id: 5, name: 'ماي (عادي)' },
    { id: 6, name: 'يونيو (صيف / ذروة)' },
    { id: 7, name: 'يوليوز (صيف / ذروة)' },
    { id: 8, name: 'غشت (صيف / ذروة)' },
    { id: 9, name: 'شتنبر (عادي)' },
    { id: 10, name: 'أكتوبر (عادي)' },
    { id: 11, name: 'نونبر (خريف)' },
    { id: 12, name: 'دجنبر (عطلة / ذروة)' },
  ];

  return (
    <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
      <CardHeader className="border-b border-slate-800 pb-4">
        <CardTitle className="flex items-center justify-between text-base font-bold text-amber-400">
          <span className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            حاسبة التسعير الموسمي والديناميكي
          </span>
          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full">
            {isPeakSeason ? '🔥 موسم ذروة (+30%)' : isLowSeason ? '❄️ موسم منخفض (-10%)' : '⚡ سعر قياسي عادي'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Month Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">اختر شهر الحجز في الرزنامة:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
          >
            {months.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Duration Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span>مدة الإيجار:</span>
            <span className="text-amber-400 font-bold">{durationDays} أيام</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Breakdown */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-sm">
          <div className="flex justify-between text-slate-400">
            <span>السعر الأساسي اليومي:</span>
            <span>{basePricePerDay.toLocaleString()} درهم</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>معامل التسعير الموسمي:</span>
            <span className={isPeakSeason ? 'text-amber-400 font-bold' : 'text-slate-200'}>
              {isPeakSeason ? '+30% (موسم ذروة)' : isLowSeason ? '-10% (موسم منخفض)' : 'قياسي (1x)'}
            </span>
          </div>
          <div className="flex justify-between text-slate-200 font-medium border-t border-slate-800 pt-2">
            <span>السعر المعدل اليومي:</span>
            <span className="text-amber-400 font-bold">{adjustedDailyPrice.toLocaleString()} درهم / يوم</span>
          </div>
          <div className="flex justify-between text-slate-200 font-bold border-t border-slate-800 pt-2 text-base">
            <span>الإجمالي التقديري ({durationDays} أيام):</span>
            <span className="text-amber-400">{subtotal.toLocaleString()} درهم</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>عمولة المنصة المضمنة (10%):</span>
            <span>{platformCommission.toLocaleString()} درهم</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p>يتيح محرك التسعير التلقائي للشركاء وأصحاب العقارات تعديل الأسعار حسب الطلب الموسمي في المغرب لضمان أعلى عائد استثماري.</p>
        </div>
      </CardContent>
    </Card>
  );
};
