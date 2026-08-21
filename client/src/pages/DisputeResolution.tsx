import React, { useState } from 'react';
import { ShieldAlert, FileText, CheckCircle2, Clock, AlertTriangle, Send, MessageSquare, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function DisputeResolution() {
  const [disputes, setDisputes] = useState([
    {
      id: 'DSP-9482',
      bookingRef: 'BK-2026-8841',
      type: 'مشكلة في تسليم السيارة (تأخير)',
      status: 'قيد المراجعة',
      date: '2026-08-15',
      description: 'تم تأخير تسليم السيارة لمدة ساعتين عن الموعد المحدد في مطار محمد الخامس.',
      party: 'وكالة الأناقة للسيارات'
    },
    {
      id: 'DSP-9102',
      bookingRef: 'BK-2026-7210',
      type: 'طلب استرداد تأمين العقار',
      status: 'تم الحل',
      date: '2026-08-10',
      description: 'تم حل النزاع وإعادة مبلغ الضمان بالكامل للزبون بعد فحص الشقة.',
      party: 'خالد العقاري'
    }
  ]);

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [newBookingRef, setNewBookingRef] = useState('');
  const [newType, setNewType] = useState('مشكلة في حالة الوحدة');
  const [newDescription, setNewDescription] = useState('');

  const handleCreateDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookingRef || !newDescription) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const newDisp = {
      id: `DSP-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingRef: newBookingRef,
      type: newType,
      status: 'جديد قيد المعالجة',
      date: new Date().toISOString().split('T')[0],
      description: newDescription,
      party: 'الطرف الثاني (الوكالة/المستأجر)'
    };

    setDisputes([newDisp, ...disputes]);
    setIsOpenModal(false);
    setNewBookingRef('');
    setNewDescription('');
    toast.success('تم فتح نزاع جديد بنجاح وتعيينه لفرق الوساطة القانونية في B2-Rent');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-amber-600 font-semibold mb-1">
              <ShieldAlert className="w-5 h-5" />
              <span>مركز حل النزاعات والوساطة القانونية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">نظام تسوية النزاعات الشفاف</h1>
            <p className="text-slate-600 mt-1 text-sm">
              نضمن حقوق المستأجرين والشركاء من خلال فريق وساطة محايد يفصل في المطالبات خلال 24-48 ساعة.
            </p>
          </div>

          <Dialog open={isOpenModal} onOpenChange={setIsOpenModal}>
            <DialogTrigger asChild>
              <Button className="bg-[#0B3C5D] hover:bg-[#0B3C5D]/90 text-white gap-2 font-medium shadow-md">
                <PlusCircle className="w-4 h-4" />
                فتح نزاع جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-slate-900 text-xl font-bold">تقديم طلب نزاع أو شكوى رسمية</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateDispute} className="space-y-4 pt-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">رقم الحجز (مثال: BK-2026-XXXX)</label>
                  <Input 
                    placeholder="أدخل رقم الحجز المرتبط بالنزاع" 
                    value={newBookingRef} 
                    onChange={(e) => setNewBookingRef(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">نوع النزاع</label>
                  <Select value={newType} onValueChange={setNewType}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع المشكلة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="مشكلة في تسليم السيارة (تأخير/حالة)">مشكلة في تسليم السيارة (تأخير/حالة)</SelectItem>
                      <SelectItem value="مخالفة شروط العقد الإيجاري">مخالفة شروط العقد الإيجاري</SelectItem>
                      <SelectItem value="طلب استرداد تأمين / ضمان">طلب استرداد تأمين / ضمان</SelectItem>
                      <SelectItem value="إلغاء حجز غير مبرر">إلغاء حجز غير مبرر</SelectItem>
                      <SelectItem value="مشكلة مالية أو استرداد أموال">مشكلة مالية أو استرداد أموال</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">وصف تفصيلي للمشكلة والحل المطلوب</label>
                  <Textarea 
                    placeholder="اكتب تفاصيل النزاع بدقة وأرفق الأدلة إن وجدت..." 
                    rows={4}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    required
                  />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="submit" className="w-full bg-[#0B3C5D] hover:bg-[#0B3C5D]/90 text-white">
                    إرسال الشوى وتفعيل لجنة الوساطة
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* FAQ / Info Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-blue-600 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                سرعة الاستجابة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                يتم الرد على البلاغات والنزاعات خلال 12 ساعة عمل مع تجميد المدفوعات مؤقتاً لحين التسوية.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                حيادية تامة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                فريق قانوني مستقل يقوم بمراجعة العقود الرقمية وصور الاستلام والتسليم الموثقة لضمان العدالة.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-600 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                تسوية مضمونة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                أكثر من 98% من النزاعات تم حلها وودياً وإعادة المستحقات لأصحابها عبر المحفظة أو الحسابات البنكية.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Disputes List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 border-b pb-3">سجل النزاعات والطلبات النشطة</h2>

          <div className="space-y-4">
            {disputes.map((disp) => (
              <div key={disp.id} className="p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 text-sm bg-slate-200 px-2.5 py-1 rounded-md">{disp.id}</span>
                    <span className="text-sm text-slate-500 font-medium">الحجز: {disp.bookingRef}</span>
                    <Badge variant={disp.status === 'تم الحل' ? 'default' : 'secondary'} className={disp.status === 'تم الحل' ? 'bg-emerald-600' : 'bg-amber-500 text-white'}>
                      {disp.status}
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold text-slate-800">{disp.type}</h3>
                  <p className="text-sm text-slate-600 max-w-2xl">{disp.description}</p>
                  <div className="text-xs text-slate-500 flex items-center gap-4 pt-1">
                    <span>الطرف المقابل: <strong>{disp.party}</strong></span>
                    <span>تاريخ التقديم: {disp.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center">
                  <Button variant="outline" size="sm" className="gap-1.5 text-slate-700" onClick={() => toast.info(`فتح تفاصيل النزاع ${disp.id} وغرفة الدردشة الوسيطة`)}>
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    متابعة التحقيق
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
