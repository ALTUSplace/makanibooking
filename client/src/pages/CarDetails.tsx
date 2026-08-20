import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { MOCK_CARS, Car, Review } from '@/data/cars';
import { Button } from '@/components/ui/button';
import { Star, ShieldCheck, Users, Car as CarIcon, Fuel, MapPin, Phone, CheckCircle2, Award, Calendar, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function CarDetails() {
  const [, params] = useRoute('/car/:id');
  const [, setLocation] = useLocation();

  const carId = params?.id || 'car-1';
  const car = MOCK_CARS.find((c) => c.id === carId) || MOCK_CARS[0];

  const [startDate, setStartDate] = useState('2026-08-20');
  const [endDate, setEndDate] = useState('2026-08-25');
  const [includeInsurance, setIncludeInsurance] = useState(true);
  const [includeBabySeat, setIncludeBabySeat] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>(car.reviews || []);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newUserName, setNewUserName] = useState('');

  const daysCount = 5; // simplified or calculated
  const dailyPrice = car.pricePerDay;
  const insurancePrice = includeInsurance ? 100 * daysCount : 0;
  const babySeatPrice = includeBabySeat ? 50 * daysCount : 0;
  const totalPrice = dailyPrice * daysCount + insurancePrice + babySeatPrice;

  const isExcellence = car.agency.rating >= 4.8;

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newComment.trim()) {
      toast.error('الرجاء إدخال الاسم والتعليق للتقييم');
      return;
    }

    const review: Review = {
      id: `rev-${Date.now()}`,
      userName: newUserName,
      rating: newRating,
      comment: newComment,
      date: new Date().toISOString().split('T')[0],
      verifiedBooking: true,
    };

    setReviews([review, ...reviews]);
    setNewComment('');
    setNewUserName('');
    toast.success('تمت إضافة تقييمك بنجاح وشكراً لموثوقيتك');
  };

  const handleProceedBooking = () => {
    const bookingData = {
      carId: car.id,
      carName: car.name,
      carImage: car.image,
      city: car.cityName,
      startDate,
      endDate,
      days: daysCount,
      totalPrice,
      agencyName: car.agency.name,
      whatsapp: car.agency.whatsapp,
    };
    localStorage.setItem('b2_current_booking', JSON.stringify(bookingData));
    setLocation('/booking');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
      <div className="container mx-auto px-4 space-y-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span onClick={() => setLocation('/')} className="hover:text-amber-400 cursor-pointer">الرئيسية</span>
          <ChevronRight className="w-3 h-3" />
          <span onClick={() => setLocation('/search')} className="hover:text-amber-400 cursor-pointer">السيارات</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white font-semibold">{car.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="relative h-96">
                <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md text-amber-400 font-bold px-4 py-1.5 rounded-2xl text-xs border border-amber-500/30">
                  {car.cityName}
                </div>
                <div className="absolute top-4 left-4 bg-slate-950/95 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl text-xs flex items-center gap-1.5 font-bold shadow-lg">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{car.rating} ({car.reviewsCount} تقييم)</span>
                </div>
                {isExcellence && (
                  <div className="absolute bottom-4 right-4 bg-amber-500 text-slate-950 font-extrabold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg">
                    <Award className="w-4 h-4" /> وكالة متميزة (Excellence)
                  </div>
                )}
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2 border-b border-slate-800 pb-6">
                  <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">{car.brand}</div>
                  <h1 className="text-3xl font-black text-white">{car.name}</h1>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    سيارة مجهزة بالكامل لتلبية كافة احتياجاتك في السفر والتنقل داخل المدن والمطارات المغربية بأعلى معايير الأمان والرفاهية.
                  </p>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center space-y-1">
                    <CarIcon className="w-5 h-5 text-amber-400 mx-auto" />
                    <div className="text-[10px] text-slate-400">ناقل الحركة</div>
                    <div className="text-xs font-bold text-white">{car.transmission}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center space-y-1">
                    <Users className="w-5 h-5 text-amber-400 mx-auto" />
                    <div className="text-[10px] text-slate-400">المقاعد</div>
                    <div className="text-xs font-bold text-white">{car.seats} مقاعد</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center space-y-1">
                    <Fuel className="w-5 h-5 text-amber-400 mx-auto" />
                    <div className="text-[10px] text-slate-400">نوع الوقود</div>
                    <div className="text-xs font-bold text-white">{car.fuel}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center space-y-1">
                    <MapPin className="w-5 h-5 text-amber-400 mx-auto" />
                    <div className="text-[10px] text-slate-400">المدينة</div>
                    <div className="text-xs font-bold text-white">{car.cityName}</div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white">مميزات السيارة والرفاهية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {car.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 bg-slate-900/60 border border-slate-800/80 px-4 py-3 rounded-2xl text-xs text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agency Info Box */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 font-black text-xl">
                      {car.agency.name.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base">{car.agency.name}</h4>
                        {isExcellence && <Award className="w-4 h-4 text-amber-400" />}
                      </div>
                      <p className="text-xs text-slate-400">{car.agency.address} | موثقة رسمياً</p>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${car.agency.whatsapp}?text=${encodeURIComponent(`مرحباً، أرغب في الاستفسار عن سيارة ${car.name}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Phone className="w-4 h-4" /> مراسلة الوكالة عبر واتساب
                  </a>
                </div>

                {/* Reviews Section */}
                <div className="space-y-6 pt-6 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      <span>تقييمات ومراجعات العملاء ({reviews.length})</span>
                    </h3>
                  </div>

                  {/* Add Review Form */}
                  <form onSubmit={handleAddReview} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                    <h4 className="text-xs font-bold text-amber-400 uppercase">أضف تقييمك بعد إتمام التجربة</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300">اسمك الكريم</label>
                        <input
                          type="text"
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          placeholder="مثال: يوسف العلوي"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300">التقييم بالنجوم</label>
                        <select
                          value={newRating}
                          onChange={(e) => setNewRating(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5/5 ممتاز)</option>
                          <option value={4}>⭐⭐⭐⭐ (4/5 جيد جداً)</option>
                          <option value={3}>⭐⭐⭐ (3/5 متوسط)</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">تعليقك وملاحظاتك</label>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="كيف كانت تجربتك مع السيارة والوكالة؟"
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs">
                      إرسال التقييم
                    </Button>
                  </form>

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{rev.userName}</span>
                            {rev.verifiedBooking && (
                              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                                حجز مؤكد موثق
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-amber-400">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                        <div className="text-[10px] text-slate-500">{rev.date}</div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-6 sticky top-28 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-2xl font-black text-white">{car.pricePerDay}</span>
                  <span className="text-xs text-slate-400 mr-1">درهم / يوم</span>
                </div>
                <span className="bg-amber-500/15 text-amber-400 text-xs font-bold px-3 py-1 rounded-xl border border-amber-500/30">
                  متوفر للتسليم الفوري
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" /> تاريخ الاستلام والتسليم
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-[11px]"
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-[11px]"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="font-semibold text-slate-300">الإضافات الاختيارية:</div>
                  <label className="flex items-center justify-between bg-slate-900 p-3 rounded-xl cursor-pointer border border-slate-800">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeInsurance}
                        onChange={(e) => setIncludeInsurance(e.target.checked)}
                        className="accent-amber-500 rounded w-4 h-4"
                      />
                      <span>تأمين شامل (تغطية كاملة)</span>
                    </div>
                    <span className="font-bold text-amber-400">+100 درهم/يوم</span>
                  </label>

                  <label className="flex items-center justify-between bg-slate-900 p-3 rounded-xl cursor-pointer border border-slate-800">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeBabySeat}
                        onChange={(e) => setIncludeBabySeat(e.target.checked)}
                        className="accent-amber-500 rounded w-4 h-4"
                      />
                      <span>مقعد أطفال آمن</span>
                    </div>
                    <span className="font-bold text-amber-400">+50 درهم/يوم</span>
                  </label>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-800 text-slate-300">
                  <div className="flex justify-between">
                    <span>إيجار السيارة (5 أيام)</span>
                    <span className="font-bold text-white">{dailyPrice * daysCount} درهم</span>
                  </div>
                  {includeInsurance && (
                    <div className="flex justify-between">
                      <span>التأمين الشامل</span>
                      <span className="font-bold text-white">{insurancePrice} درهم</span>
                    </div>
                  )}
                  {includeBabySeat && (
                    <div className="flex justify-between">
                      <span>مقعد الأطفال</span>
                      <span className="font-bold text-white">{babySeatPrice} درهم</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-extrabold text-white pt-3 border-t border-slate-800">
                    <span>المبلغ الإجمالي</span>
                    <span className="text-amber-400">{totalPrice} درهم</span>
                  </div>
                </div>

                <Button
                  onClick={handleProceedBooking}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-4 rounded-2xl text-sm shadow-xl shadow-amber-500/20"
                >
                  تأكيد الحجز ومتابعة الدفع
                </Button>

                <p className="text-[10px] text-center text-slate-400">
                  ⚡ حجز فوري مؤكد دون دفع مسبق — الدفع عند الاستلام نقداً أو بالبطاقة للوكالة.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
