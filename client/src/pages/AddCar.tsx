import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle2, ArrowRight, Car } from 'lucide-react';
import { toast } from 'sonner';

export default function AddCar() {
  const [, setLocation] = useLocation();
  const [submitted, setSubmitted] = useState(false);

  const [carName, setCarName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('SUV / سيارة رباعية');
  const [price, setPrice] = useState('800');
  const [city, setCity] = useState('مراكش');
  const [transmission, setTransmission] = useState('أوتوماتيك');
  const [seats, setSeats] = useState('5 مقاعد');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!carName || !brand || !price) {
      toast.error('يرجى ملء كافة الحقول الإجبارية');
      return;
    }
    
    setSubmitted(true);
    toast.success('تم نشر السيارة بنجاح في أسطول الوكالة!');
    setTimeout(() => {
      setLocation('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-2xl">
        <button
          onClick={() => setLocation('/dashboard')}
          className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 mb-8 font-medium transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى لوحة تحكم الوكالة</span>
        </button>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Car className="w-4 h-4" /> إدارة الأسطول والوكالة المستقلة
            </span>
            <h1 className="text-3xl font-black text-white">إضافة سيارة جديدة لأسطول وكالتك</h1>
            <p className="text-slate-400 text-xs leading-relaxed">
              أدخل تفاصيل المركبة والمواصفات والسعر لتظهر مباشرة في نتائج البحث والصفحة الرئيسية للعملاء في المغرب.
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-500/15 border border-emerald-500/30 p-8 rounded-2xl text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h2 className="text-xl font-bold text-white">تم نشر المركبة بنجاح في المنصة!</h2>
              <p className="text-slate-300 text-xs">جاري تحويلك إلى لوحة تحكم الوكالة...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 text-right">
                <label className="text-xs font-bold text-slate-300">اسم السيارة / الموديل <span className="text-amber-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="مثال: Range Rover Velar Autobiography 2026"
                  value={carName}
                  onChange={(e) => setCarName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 text-right">
                  <label className="text-xs font-bold text-slate-300">الماركة (Brand) <span className="text-amber-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: Land Rover"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-xs font-bold text-slate-300">فئة المركبة</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="SUV / سيارة رباعية">SUV / سيارة رباعية دفع رباعي</option>
                    <option value="سيارة فاخرة / Luxury">سيارة فاخرة / Luxury</option>
                    <option value="سيارة اقتصادية / Economy">سيارة اقتصادية / Economy</option>
                    <option value="سيدان عائلية / Sedan">سيدان عائلية / Sedan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 text-right">
                  <label className="text-xs font-bold text-slate-300">السعر اليومي (درهم) <span className="text-amber-500">*</span></label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-xs font-bold text-slate-300">المدينة</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="مراكش">مراكش</option>
                    <option value="أغادير">أغادير</option>
                    <option value="الدار البيضاء">الدار البيضاء</option>
                    <option value="طنجة">طنجة</option>
                    <option value="الرباط">الرباط</option>
                  </select>
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-xs font-bold text-slate-300">ناقل الحركة</label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="أوتوماتيك">أوتوماتيك</option>
                    <option value="عادي">عادي</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 text-right">
                <label className="text-xs font-bold text-slate-300">صورة السيارة الرئيسية</label>
                <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center space-y-2 bg-slate-950/60 hover:border-amber-500/50 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-amber-500 mx-auto" />
                  <div className="text-xs text-slate-300 font-bold">اسحب صورة السيارة هنا أو اضغط للاختيار من جهازك</div>
                  <div className="text-[10px] text-slate-500">PNG, JPG, WEBP حتى 10 ميجابايت</div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-4 rounded-xl text-xs shadow-xl shadow-amber-500/20 transition-all"
              >
                نشر السيارة في أسطول الوكالة فوراً
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
