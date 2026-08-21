import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Play, Video, MapPin, Building2, Bed, Bath, ShieldCheck, Star, Calendar, Check, ArrowRight, Share2, Heart, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function PropertyDetailWithVideo() {
  const params = useParams();
  const [_, setLocation] = useLocation();
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Mock property detail data with video tour simulation
  const property = {
    id: params?.id || '1',
    title: 'شقة فاخرة مطلة على البحر والكورنيش',
    city: 'الدار البيضاء',
    address: 'شارع الكورنيش، عين الذئاب، الدار البيضاء',
    price: 1200,
    rooms: 3,
    bathrooms: 2,
    area: '160 متر²',
    type: 'شقة سكنية فاخرة',
    rating: 4.9,
    reviewsCount: 38,
    description: 'شقة عصرية مجهزة بالكامل بتصميم هندسي فاخر، مطلة مباشرة على المحيط الأطلسي. تحتوي على غرفة نوم رئيسية مجهزة، مطبخ أمريكي متكامل، وصالة واسعة تفتح على شرفة إيفست واسعة.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder video tour tour
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000'
    ],
    amenities: ['إطلالة بحرية مباشرة', 'مكيف هواء مركزي', 'موقف سيارات خاص', 'أمن 24/7', 'واي فاي فائق السرعة', 'مصعد كهربائي حديث']
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => window.history.back()} className="gap-2 text-slate-600 hover:text-slate-900 p-0">
            <ArrowRight className="w-4 h-4" />
            العودة إلى نتائج البحث
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { setIsLiked(!isLiked); toast.success(isLiked ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة إلى المفضلة'); }} className="gap-1.5">
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
              مفضلة
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success('تم نسخ رابط العقار بنجاح')} className="gap-1.5">
              <Share2 className="w-4 h-4 text-slate-600" />
              مشاركة
            </Button>
          </div>
        </div>

        {/* Title & Location Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge className="bg-amber-500 text-white">عقار مميز موثق</Badge>
            <div className="flex items-center gap-1 text-sm font-semibold text-amber-600">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{property.rating} ({property.reviewsCount} تقييم)</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{property.title}</h1>
          <p className="text-slate-600 flex items-center gap-1.5 text-sm">
            <MapPin className="w-4 h-4 text-slate-400" />
            {property.address}
          </p>
        </div>

        {/* Image Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 h-[350px] sm:h-[420px] rounded-2xl overflow-hidden shadow-md">
            <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4 h-[350px] sm:h-[420px]">
            <div className="h-[170px] sm:h-[202px] rounded-2xl overflow-hidden shadow-sm">
              <img src={property.images[1]} alt="Interior view" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="h-[170px] sm:h-[202px] rounded-2xl overflow-hidden shadow-sm">
              <img src={property.images[2]} alt="Balcony view" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </div>

        {/* Main Content & Booking Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">نوع العقار</p>
                  <p className="text-sm font-bold text-slate-800">{property.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Bed className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">غرف النوم</p>
                  <p className="text-sm font-bold text-slate-800">{property.rooms} غرف</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Bath className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">الحمامات</p>
                  <p className="text-sm font-bold text-slate-800">{property.bathrooms} حمامات</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">المساحة</p>
                  <p className="text-sm font-bold text-slate-800">{property.area}</p>
                </div>
              </div>
            </div>

            {/* NEW: Property Video Tour Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Video className="w-5 h-5 text-amber-600" />
                  جولة فيديو افتراضية للعقار (Virtual Video Tour)
                </h2>
                <Badge variant="outline" className="text-amber-600 border-amber-300">عالية الدقة 4K</Badge>
              </div>
              <p className="text-sm text-slate-600">
                شاهد معاينة فيديو حصرية لتفاصيل التشطيبات الداخلية، الإطلالة، وتوزيع الغرف كأنك في مكانك.
              </p>

              <div className="relative rounded-xl overflow-hidden bg-slate-900 h-[300px] sm:h-[380px] flex items-center justify-center group shadow-md">
                {!isPlayingVideo ? (
                  <>
                    <img 
                      src={property.images[0]} 
                      alt="Video thumbnail" 
                      className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center">
                      <button 
                        onClick={() => setIsPlayingVideo(true)}
                        className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300"
                      >
                        <Play className="w-7 h-7 fill-white translate-x-0.5" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      مدة الجولة: 2:45 دقيقة
                    </div>
                  </>
                ) : (
                  <iframe 
                    className="w-full h-full"
                    src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1" 
                    title="Property Video Tour"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <h2 className="text-xl font-bold text-slate-900">تفاصيل ووصف العقار</h2>
              <p className="text-slate-600 leading-relaxed text-sm">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <h2 className="text-xl font-bold text-slate-900">مميزات ومرافق العقار</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Booking Card */}
          <div className="space-y-6">
            <Card className="sticky top-6 shadow-md border border-slate-100 p-6 space-y-6 rounded-2xl bg-white">
              <div className="flex items-baseline justify-between border-b pb-4">
                <div>
                  <span className="text-2xl font-bold text-slate-900">{property.price} درهم</span>
                  <span className="text-slate-500 text-sm"> / الليلة</span>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 font-medium">متوفر الآن</Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">تاريخ الوصول والمغادرة</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" className="p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50" defaultValue="2026-09-01" />
                    <input type="date" className="p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50" defaultValue="2026-09-05" />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>{property.price} درهم × 4 ليالي</span>
                    <span className="font-semibold">{property.price * 4} درهم</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>خصم الباقة المدمجة (15%)</span>
                    <span>-{(property.price * 4 * 0.15).toFixed(0)} درهم</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-sm font-bold text-slate-900">
                    <span>الإجمالي النهائي</span>
                    <span className="text-amber-600">{(property.price * 4 * 0.85).toFixed(0)} درهم</span>
                  </div>
                </div>

                <Button className="w-full bg-[#0B3C5D] hover:bg-[#0B3C5D]/90 text-white font-bold py-3 shadow-lg" onClick={() => toast.success('تم الانتقال لصفحة تأكيد الحجز الآمن')}>
                  احجز العقار الآن
                </Button>

                <p className="text-center text-xs text-slate-500">لن يتم خصم أي مبلغ حتى تؤكد الحجز وتوقع العقد الرقمي.</p>
              </div>
            </Card>
          </div>

        </div>

      </div>
    </div>
  );
}
