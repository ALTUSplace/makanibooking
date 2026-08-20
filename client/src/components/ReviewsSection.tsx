import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, CheckCircle2, User } from 'lucide-react';
import { toast } from 'sonner';

export default function ReviewsSection({ listingId = 1 }: { listingId?: number }) {
  const [reviews, setReviews] = useState([
    { id: 1, name: 'عمر المنصوري', rating: 5, comment: 'سيارة ممتازة نظيفة جداً والمعاملة مع الوكالة كانت احترافية وسريعة. أنصح بالتعامل بشدة!', date: 'منذ يومين' },
    { id: 2, name: 'سناء العلوي', rating: 5, comment: 'العقار رائع ومطابق تماماً للصور تماماً، واستلام العقد الرقمي وتوقيعه تم بسلاسة تامة.', date: 'منذ أسبوع' },
  ]);

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment || !userName) {
      toast.error('يرجى إدخال الاسم وتعليق التقييم');
      return;
    }

    const review = {
      id: reviews.length + 1,
      name: userName,
      rating: newRating,
      comment: newComment,
      date: 'الآن'
    };

    setReviews([review, ...reviews]);
    setNewComment('');
    setUserName('');
    toast.success('تمت إضافة تقييمك بنجاح ونشره لزيادة موثوقية الوكالة!');
  };

  return (
    <div className="space-y-8 my-10" dir="rtl">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" /> تقييمات العملاء والمراجعات
          </h3>
          <p className="text-sm text-muted-foreground mt-1">تقييمات موثقة من عملاء أكملوا عملية الكراء والحجز بنجاح.</p>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-600 font-bold px-3 py-1.5 text-sm gap-1">
          <CheckCircle2 className="w-4 h-4" /> 4.9 / 5.0 (موثق)
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          {reviews.map((rev) => (
            <Card key={rev.id} className="p-5 border-border shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold">{rev.name}</h4>
                    <span className="text-xs text-muted-foreground">{rev.date}</span>
                  </div>
                </div>
                <div className="flex text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">{rev.comment}</p>
            </Card>
          ))}
        </div>

        {/* Add Review Form */}
        <div>
          <Card className="p-6 border-border shadow-md">
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> أضف تقييمك بعد انتهاء الكراء
            </h4>
            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسمك الكريم</label>
                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="مثال: يوسف الإدريسي" className="w-full p-3 rounded-xl bg-background border border-border text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">التقييم بالنجوم</label>
                <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))} className="w-full p-3 rounded-xl bg-background border border-border text-sm">
                  <option value={5}>⭐⭐⭐⭐⭐ (ممتاز جداً)</option>
                  <option value={4}>⭐⭐⭐⭐ (جيد جداً)</option>
                  <option value={3}>⭐⭐⭐ (مقبول)</option>
                  <option value={2}>⭐⭐ (دون المتوسط)</option>
                  <option value={1}>⭐ (سيء)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">تعليقك وتجربتك</label>
                <textarea rows={3} value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="كيف كانت تجربتك مع السيارة أو العقار؟" className="w-full p-3 rounded-xl bg-background border border-border text-sm" required></textarea>
              </div>
              <Button type="submit" className="w-full font-bold">
                إرسال النشر والتقييم
              </Button>
            </form>
          </Card>
        </div>

      </div>
    </div>
  );
}
