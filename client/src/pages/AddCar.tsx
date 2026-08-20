import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AddCar() {
  const [, setLocation] = useLocation();
  const [submitted, setSubmitted] = useState(false);

  const [carName, setCarName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('luxury');
  const [price, setPrice] = useState('1000');
  const [city, setCity] = useState('marrakech');
  const [transmission, setTransmission] = useState('أوتوماتيك');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setLocation('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <button
          onClick={() => setLocation('/dashboard')}
          className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 mb-8 font-medium transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى لوحة التحكم</span>
        </button>

        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">إضافة مركبة جديدة للأسطول</span>
            <h1 className="text-3xl font-extrabold text-white">إضافة سيارة جديدة للوكالة</h1>
            <p className="text-slate-400 text-sm">أدخل تفاصيل السيارة بدقة لتظهر فوراً في نتائج البحث للعملاء في المغرب.</p>
          </div>

          {submitted ? (
            <div className="bg-emerald-500/15 border border-emerald-500/30 p-8 rounded-2xl text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">تمت إضافة السيارة بنجاح!</h2>
              <p className="text-slate-300 text-sm">جاري تحويلك إلى لوحة التحكم...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">اسم السيارة / الموديل</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: Range Rover Velar Autobiography"
                  value={carName}
                  onChange={(e) => setCarName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">الماركة (Brand)</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: Land Rover"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">الفئة</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="luxury">فاخرة (Luxury)</option>
                    <option value="suv">دفع رباعي (SUV)</option>
                    <option value="sedan">سيدان عائلية</option>
                    <option value="economy">اقتصادية</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">السعر اليومي (درهم)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">المدينة</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="agadir">أغادير</option>
                    <option value="marrakech">مراكش</option>
                    <option value="casablanca">الدار البيضاء</option>
                    <option value="tangier">طنجة</option>
                    <option value="rabat">الرباط</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">ناقل الحركة</label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="أوتوماتيك">أوتوماتيك</option>
                    <option value="عادي">عادي</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">صورة السيارة الرئيسية</label>
                <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center space-y-2 bg-slate-900/50">
                  <Upload className="w-8 h-8 text-amber-400 mx-auto" />
                  <div className="text-sm text-slate-300">اسحب الصورة هنا أو اضغط للاختيار</div>
                  <div className="text-xs text-slate-500">PNG, JPG حتى 10 ميجابايت</div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-4 rounded-xl shadow-lg shadow-amber-500/25"
              >
                نشر السيارة في المنصة فوراً
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
