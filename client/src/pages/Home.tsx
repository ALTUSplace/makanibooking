import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Building2, Car, ShieldCheck, Star, ArrowRight, CheckCircle2, Award, Sparkles, Clock, Bot, Send, Mic, Bookmark, Check } from 'lucide-react';
import { PARTNERS, LISTINGS, ListingItem } from '@/data/b2rent';
import { toast } from 'sonner';

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedTab, setSelectedTab] = useState<'all' | 'car' | 'property'>('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentViewed, setRecentViewed] = useState<ListingItem[]>([]);

  // حالة البحث الذكي بالذكاء الاصطناعي
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiResults, setAiResults] = useState<ListingItem[] | null>(null);
  const [savedSearches, setSavedSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('b2_saved_searches');
      return saved ? JSON.parse(saved) : ['سيارة دفع رباعي أغادير', 'شقة ملاسح مراكش'];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const mockRecent = LISTINGS.slice(0, 3);
    setRecentViewed(mockRecent);
  }, []);

  // دعم البحث الصوتي عبر Web Speech API
  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('متصفحك لا يدعم ميزة البحث الصوتي المباشر');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-MA';
    recognition.start();

    toast.info('جاري الاستماع لطلبك الصوتي...');

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setAiPrompt(speechToText);
      toast.success(`تم التعرف على الصوت: "${speechToText}"`);
    };

    recognition.onerror = () => {
      toast.error('تعذر التعرف على الصوت، يرجى المحاولة مرة أخرى');
    };
  };

  // حفظ البحث الحالي
  const handleSaveSearch = () => {
    if (!aiPrompt.trim()) {
      toast.error('لا يوجد استعلام لحفظه');
      return;
    }
    if (savedSearches.includes(aiPrompt)) {
      toast.info('هذا الاستعلام محفوط مسبقاً');
      return;
    }
    const updated = [aiPrompt, ...savedSearches].slice(0, 5);
    setSavedSearches(updated);
    try {
      localStorage.setItem('b2_saved_searches', JSON.stringify(updated));
    } catch {}
    toast.success('تم حفظ استعلام البحث الذكي بنجاح');
  };

  // دالة معالجة البحث الذكي باللغة الطبيعية عبر الذكاء الاصطناعي مع Skeleton Loading
  const handleAiSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) {
      toast.error('يرجى كتابة وصف أو طلب باللغة الطبيعية أولاً');
      return;
    }

    setIsAiSearching(true);
    setAiResults(null);

    setTimeout(() => {
      setIsAiSearching(false);
      const queryLower = aiPrompt.toLowerCase();
      
      const matched = LISTINGS.filter(item => {
        if (queryLower.includes('أغادير') && item.city !== 'أغادير') return false;
        if (queryLower.includes('مراكش') && item.city !== 'مراكش') return false;
        if (queryLower.includes('الدار البيضاء') && item.city !== 'الدار البيضاء') return false;
        if (queryLower.includes('طنجة') && item.city !== 'طنجة') return false;
        
        if ((queryLower.includes('سيارة') || queryLower.includes('داسيا') || queryLower.includes('رينو')) && item.type !== 'car') return false;
        if ((queryLower.includes('شقة') || queryLower.includes('فيلا') || queryLower.includes('عقار')) && item.type !== 'property') return false;

        return (
          item.title.toLowerCase().includes(queryLower) ||
          item.description.toLowerCase().includes(queryLower) ||
          item.category.toLowerCase().includes(queryLower) ||
          item.city.toLowerCase().includes(queryLower) ||
          item.features.some(f => queryLower.includes(f.toLowerCase()))
        );
      });

      const finalResults = matched.length > 0 ? matched : LISTINGS.slice(0, 2);
      setAiResults(finalResults);
      toast.success('تم تحليل طلبك بنجاح وعرض النتائج المطابقة عبر الذكاء الاصطناعي!');
    }, 1000);
  };

  // الإكمال التلقائي لاقتراحات البحث مع الصور المصغرة والأسعار
  const suggestions = searchQuery.trim()
    ? LISTINGS.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const topRatedListings = [...LISTINGS].sort((a, b) => b.rating - a.rating).slice(0, 4);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation(`/search?type=${selectedTab}&city=${selectedCity}&q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" dir="rtl">
      
      {/* القسم الرئيسي البانر */}
      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-border">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
        
        <div className="container mx-auto max-w-5xl text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full text-amber-400 text-xs font-bold tracking-wide">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>منصة الوساطة الأولى المعتمدة بين المزودين والزبائن في المغرب</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
            بوابتك الموثوقة لحجز <span className="text-amber-500">السيارات</span> و<span className="text-amber-400">العقارات</span> بكل أمان
          </h1>

          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            B2-Rent منصة وسيطة ذكية تربطك بأرقى شركات كراء السيارات والوكالات العقارية المستقلة عبر المدن المغربية، مع عقود رقمية وتوقيع إلكتروني فوري.
          </p>

          {/* محرك البحث الذكي بالذكاء الاصطناعي (AI Natural Language Search) */}
          <div className="max-w-3xl mx-auto bg-slate-950/90 backdrop-blur-xl border border-amber-500/30 p-6 rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-black text-white">مساعد البحث الذكي بالذكاء الاصطناعي</h3>
                  <p className="text-[11px] text-slate-400">اكتب ما تبحث عنه بلغتك الطبيعية أو استخدم البحث الصوتي</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {aiPrompt && (
                  <button
                    onClick={handleSaveSearch}
                    className="flex items-center gap-1 text-[11px] bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl transition-all"
                    title="حفظ الاستعلام الحالي"
                  >
                    <Bookmark className="w-3.5 h-3.5" /> حفظ البحث
                  </button>
                )}
                <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-full animate-pulse">جديد ✨</span>
              </div>
            </div>

            <form onSubmit={handleAiSearch} className="flex gap-2">
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  placeholder="مثال: أريد سيارة دفع رباعي في أغادير أو شقة فخمة بمراكش مع مسبح..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 pl-10"
                />
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className="absolute left-3 text-slate-400 hover:text-amber-400 transition-colors"
                  title="بحث صوتي باللغة الطبيعية"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              <Button
                type="submit"
                disabled={isAiSearching}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 shrink-0"
              >
                {isAiSearching ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>بحث ذكي</span>
                  </>
                )}
              </Button>
            </form>

            {/* الأبحاث المحفوظة السريعة */}
            {savedSearches.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] text-slate-400">
                <span className="font-bold text-slate-300">عمليات البحث المحفوظة:</span>
                {savedSearches.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAiPrompt(s)}
                    className="bg-slate-900 hover:bg-slate-800 text-amber-400/90 border border-slate-800 px-2.5 py-1 rounded-lg transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* رسم متحرك للتحميل (Skeleton Loading) أثناء معالجة الذكاء الاصطناعي */}
            {isAiSearching && (
              <div className="pt-4 border-t border-slate-800 space-y-3 animate-pulse text-right">
                <div className="flex items-center gap-2 text-xs text-amber-400">
                  <span className="animate-spin">✨</span> جاري تحليل طلبك بالذكاء الاصطناعي واستخراج المطابقات...
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2].map((n) => (
                    <div key={n} className="bg-slate-900/60 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
                      <div className="w-14 h-14 bg-slate-800 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-800 rounded w-1/2" />
                        <div className="h-4 bg-slate-800 rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* نتائج البحث الذكي المنبثقة */}
            {aiResults && !isAiSearching && (
              <div className="pt-4 border-t border-slate-800 space-y-3 animate-in fade-in-50 text-right">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>نتائج التحليل الذكي للطلب ({aiResults.length} عرض مطابق):</span>
                  <button onClick={() => setAiResults(null)} className="text-amber-400 hover:underline">إغلاق النتائج</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {aiResults.map(item => (
                    <div key={item.id} className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center gap-3 hover:border-amber-500 transition-all">
                      <img src={item.image} alt={item.title} className="w-14 h-14 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0 text-right">
                        <div className="text-[10px] text-amber-400 font-bold">{item.city} - {item.providerName}</div>
                        <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                        <div className="text-xs font-extrabold text-slate-300">{item.pricePerUnit} {item.unitLabel}</div>
                      </div>
                      <Link href={`/car/${item.id}`}>
                        <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-bold px-3 py-1.5 rounded-xl">عرض</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* محرك البحث الكلاسيكي التقليدي مع الإكمال التلقائي المحسن بالصور والأسعار */}
          <div className="relative max-w-4xl mx-auto pt-2">
            <form onSubmit={handleSearchSubmit} className="bg-slate-900/95 backdrop-blur-xl border border-border p-4 rounded-3xl shadow-2xl grid grid-cols-1 md:grid-cols-4 gap-3">
              
              <div className="flex flex-col text-right">
                <label className="text-[11px] font-bold text-slate-400 mb-1 px-1">نوع الخدمة</label>
                <select
                  value={selectedTab}
                  onChange={(e) => setSelectedTab(e.target.value as 'all' | 'car' | 'property')}
                  className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="all">الكل (سيارات وعقارات)</option>
                  <option value="car">كراء السيارات</option>
                  <option value="property">العقارات والشقاق المفروشة</option>
                </select>
              </div>

              <div className="flex flex-col text-right">
                <label className="text-[11px] font-bold text-slate-400 mb-1 px-1">المدينة المغربية</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="all">جميع المدن المغربية</option>
                  <option value="أغادير">أغادير</option>
                  <option value="مراكش">مراكش</option>
                  <option value="الدار البيضاء">الدار البيضاء</option>
                  <option value="طنجة">طنجة</option>
                  <option value="الرباط">الرباط</option>
                </select>
              </div>

              <div className="flex flex-col text-right relative">
                <label className="text-[11px] font-bold text-slate-400 mb-1 px-1">بحث متقدم بالإكمال التلقائي</label>
                <input
                  type="text"
                  placeholder="ابحث باسم السيارة، العقار أو المدينة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500"
                />

                {/* قائمة الإكمال التلقائي المقترحة مع الصور المصغرة والأسعار */}
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-900 text-right">
                    {suggestions.map(sug => (
                      <div
                        key={sug.id}
                        onClick={() => {
                          setSearchQuery(sug.title);
                          setLocation(`/car/${sug.id}`);
                        }}
                        className="p-3 hover:bg-slate-900 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img src={sug.image} alt={sug.title} className="w-10 h-10 rounded-xl object-cover border border-slate-800" />
                          <div>
                            <div className="font-bold text-white">{sug.title}</div>
                            <div className="text-[10px] text-slate-400">{sug.city} - {sug.category}</div>
                          </div>
                        </div>
                        <span className="text-amber-400 font-extrabold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">{sug.pricePerUnit} {sug.unitLabel}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold py-3.5 px-6 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>ابحث الآن</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 1. قسم السيارات والعقارات الأعلى تقييماً */}
      <section className="py-16 bg-slate-950 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-amber-500 text-xs font-extrabold uppercase tracking-widest">
                <Sparkles className="w-4 h-4" /> الأعلى تقييماً وثقة
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">العروض المتميزة بناءً على آراء العملاء</h2>
            </div>
            <Link href="/search" className="text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1">
              تصفح كافة العروض <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topRatedListings.map(item => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-amber-500/60 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col group">
                <div className="relative h-48 overflow-hidden bg-slate-950">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 shadow-lg">
                    <Award className="w-3.5 h-3.5" /> تقييم ممتاز ⭐ {item.rating}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-extrabold border border-slate-800">
                    {item.pricePerUnit} {item.unitLabel}
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-500" /> {item.city}</span>
                      <span className="text-amber-400 font-bold">{item.providerName}</span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">{item.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">
                      {item.reviewsCount} مراجعة مؤكدة
                    </span>
                    <Link href={`/car/${item.id}`}>
                      <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow">
                        عرض التفاصيل
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 1.1 قسم العروض الترويجية والخصومات الموسمية الحصرية */}
      <section className="py-16 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-red-500 text-xs font-extrabold uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30">
                🔥 عروض لفترة محدودة
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">الخصومات الموسمية والعروض الترويجية الحصرية</h2>
            </div>
            <p className="text-xs text-slate-400 max-w-sm text-right">استفيد من خصومات تصل حتى 25% على الحجوزات المبكرة للسيارات والعقارات لدى الوكالات المستقلة المعتمدة.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-6 relative overflow-hidden shadow-2xl group">
              <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-xl animate-pulse">
                خصم 20%
              </div>
              <div className="space-y-4">
                <div className="text-xs text-amber-400 font-extrabold">عروض مدينة مراكش وأغادير</div>
                <h3 className="text-xl font-black text-white">باقات كراء سيارات الدفع الرباعي</h3>
                <p className="text-xs text-slate-300 leading-relaxed">احجز سيارتك المفضلة لمدة تتجاوز 5 أيام واحصل على تخفيض فوري مع توصيل مجاني للمطار.</p>
                <div className="pt-2">
                  <Link href="/search">
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl text-xs">
                      احجز العرض الآن
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 via-slate-900 to-slate-950 border border-blue-500/40 rounded-3xl p-6 relative overflow-hidden shadow-2xl group">
              <div className="absolute top-4 left-4 bg-amber-500 text-slate-950 text-xs font-black px-3 py-1 rounded-xl">
                خصم 25%
              </div>
              <div className="space-y-4">
                <div className="text-xs text-blue-400 font-extrabold">الشقاق الفاخرة والعقارات</div>
                <h3 className="text-xl font-black text-white">إقامات الصيف الفاخرة</h3>
                <p className="text-xs text-slate-300 leading-relaxed">شقق مفروشة راقية مع إطلالات ساحرة ومسابح خاصة في طنجة والدار البيضاء بأسعار تنافسية.</p>
                <div className="pt-2">
                  <Link href="/search">
                    <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs">
                      استكشف العقارات
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-3xl p-6 relative overflow-hidden shadow-2xl group">
              <div className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-xl">
                هدية مجانية
              </div>
              <div className="space-y-4">
                <div className="text-xs text-emerald-400 font-extrabold">عروض الوكالات المتميزة</div>
                <h3 className="text-xl font-black text-white">تأمين شامل وعقد رقمي مجاني</h3>
                <p className="text-xs text-slate-300 leading-relaxed">جميع الحجوزات تتضمن عقوداً إلكترونية موثقة وتأمين شامل ضد كافة المخاطر مع دعم فني 24/7.</p>
                <div className="pt-2">
                  <Link href="/search">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs">
                      ابدأ الحجز الفوري
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. قسم شوهد مؤخراً (Recently Viewed) لمساعدة المستخدمين على العودة بسهولة */}
      {recentViewed.length > 0 && (
        <section className="py-12 bg-slate-900/40 border-b border-border">
          <div className="container mx-auto px-4 space-y-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-extrabold text-white">شوهدت مؤخراً</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recentViewed.map(item => (
                <Link key={item.id} href={`/car/${item.id}`}>
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 hover:border-amber-500/50 transition-all cursor-pointer group">
                    <img src={item.image} alt={item.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div className="space-y-1 min-w-0">
                      <div className="text-[10px] text-amber-400 font-bold">{item.city}</div>
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition-colors">{item.title}</h4>
                      <div className="text-xs font-black text-slate-300">{item.pricePerUnit} {item.unitLabel}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. الوكالات والمزودون المستقلون */}
      <section className="py-16 bg-slate-950 border-b border-border">
        <div className="container mx-auto px-4 space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-white">الوكالات والشركات المعتمدة في المنصة</h2>
            <p className="text-xs text-slate-400">كل وكالة مستقلة بذاتها لإدارة أسطولها، تسعيرها، ومعالجة حجوزات الزبائن بكل شفافية وموثوقية</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PARTNERS.map(partner => (
              <div key={partner.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 relative overflow-hidden group hover:border-amber-500 transition-all">
                {partner.isExcellence && (
                  <div className="absolute top-3 left-3 bg-amber-500/20 border border-amber-500/40 text-amber-400 px-2.5 py-1 rounded-xl text-[10px] font-extrabold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> وكالة متميزة
                  </div>
                )}
                <img src={partner.logo} alt={partner.name} className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-amber-500/30 group-hover:scale-105 transition-transform" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">{partner.name}</h3>
                  <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" /> {partner.city}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs pt-2 border-t border-slate-800 text-slate-300">
                  <span className="flex items-center gap-1 text-amber-400 font-bold"><Star className="w-3.5 h-3.5 fill-amber-400" /> {partner.rating}</span>
                  <span>({partner.reviewsCount} تقييم)</span>
                </div>

                <div className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 py-1.5 rounded-xl border border-emerald-500/20">
                  ✓ موثق ومعتمد رسمياً
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* قسم الميزات والضمانات */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">وكالات مستقلة ومعتمدة</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              نضمن لك التعامل مباشرة مع أرقى وكالات كراء السيارات والشركات العقارية المرخصة رسمياً في المغرب لضمان أقصى درجات الثقة والموثوقية.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">عقود رقمية وتوقيع إلكتروني</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              احصل على عقد الإيجار الرسمي بصيغة PDF فور إتمام الحجز، مع إمكانية الرسم بخط اليد لتوقيع العقد وإدراج الختم الرقمي للوكالة تلقائياً.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">تقييمات حقيقية وموثوقة</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              نظام مراجعات وتقييمات لا يتم تفعيله إلا بعد انتهاء فترة الحجز الفعلية، لضمان بناء مجتمع شفاف وموثوق للمستخدمين والوكالات.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
