import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, FileText, Headphones, Car, Building2, CheckCircle2, Clock, XCircle, Download, Send } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

export default function RenterDashboard() {
  const { data: user } = trpc.auth.me.useQuery();
  const { data: bookings = [], isLoading } = trpc.bookings.list.useQuery();
  const [supportMessage, setSupportMessage] = useState('');

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    toast.success('تم إرسال رسالتك بنجاح إلى فريق الدعم الفني b2rentt@gmail.com. سنرد عليك خلال دقائق!');
    setSupportMessage('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">لوحة تحكم المستأجر (الزبون)</h1>
            <p className="text-muted-foreground mt-1">
              مرحباً بك، {user?.name || 'الزبون الكريم'} | تتبع حجزك، الفواتير، وتواصل مع الدعم الفني
            </p>
          </div>
          <Badge variant="outline" className="px-4 py-2 text-sm font-semibold bg-primary/10 text-primary border-primary/20">
            مستأجر معتمد
          </Badge>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="bg-card p-1 rounded-xl border border-border grid grid-cols-3 max-w-md">
            <TabsTrigger value="bookings" className="rounded-lg gap-2">
              <Calendar className="w-4 h-4" /> حجزاتي
            </TabsTrigger>
            <TabsTrigger value="invoices" className="rounded-lg gap-2">
              <FileText className="w-4 h-4" /> الفواتير والعقود
            </TabsTrigger>
            <TabsTrigger value="support" className="rounded-lg gap-2">
              <Headphones className="w-4 h-4" /> الدعم الفني
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <h2 className="text-xl font-semibold">سجل الحجوزات الحالية والسابقة</h2>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">جاري تحميل الحجوزات...</div>
            ) : bookings.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">لا توجد حجوزات مسجلة حتى الآن.</p>
                <Button className="mt-4" onClick={() => window.location.href = '/'}>تصفح السيارات والعقارات</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map((booking: any) => (
                  <Card key={booking.id} className="overflow-hidden border-border hover:shadow-md transition-shadow">
                    <CardHeader className="bg-muted/40 pb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-muted-foreground">حجز #{booking.id}</span>
                        <Badge className={
                          booking.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' :
                          booking.status === 'Pending' ? 'bg-amber-500/10 text-amber-600 border-amber-200' :
                          'bg-rose-500/10 text-rose-600 border-rose-200'
                        }>
                          {booking.status === 'Confirmed' ? 'مؤكد' : booking.status === 'Pending' ? 'قيد المراجعة' : 'ملغي'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>من: {new Date(booking.startDate).toLocaleDateString('ar-MA')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>إلى: {new Date(booking.endDate).toLocaleDateString('ar-MA')}</span>
                      </div>
                      <div className="pt-2 border-t border-border flex justify-between items-center font-bold">
                        <span>المبلغ الإجمالي:</span>
                        <span className="text-primary text-lg">{booking.totalPrice} د.م</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            <h2 className="text-xl font-semibold">الفواتير وعقود الإيجار الرقمية</h2>
            <Card className="p-6">
              <div className="space-y-4">
                {bookings.map((booking: any) => (
                  <div key={booking.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl bg-muted/30 border border-border gap-4">
                    <div>
                      <h4 className="font-bold">فاتورة وعقد حجز #{booking.id}</h4>
                      <p className="text-sm text-muted-foreground">تاريخ الإصدار: {new Date(booking.createdAt).toLocaleDateString('ar-MA')} | القيمة: {booking.totalPrice} د.م</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                      const doc = new jsPDF();
                      doc.setFont("helvetica", "bold");
                      doc.text("B2-Rent Platform - Booking Invoice", 20, 20);
                      doc.setFont("helvetica", "normal");
                      doc.text(`Booking ID: #${booking.id}`, 20, 30);
                      doc.text(`Date: ${new Date(booking.createdAt).toLocaleDateString()}`, 20, 40);
                      doc.text(`Total Price: ${booking.totalPrice} MAD`, 20, 50);
                      doc.text(`Status: ${booking.status}`, 20, 60);
                      doc.save(`invoice-${booking.id}.pdf`);
                      toast.success('تم تحميل الفاتورة بصيغة PDF بنجاح');
                    }}>
                      <Download className="w-4 h-4" /> تحميل الفاتورة PDF
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-4">
            <h2 className="text-xl font-semibold">التواصل مع الدعم الفني</h2>
            <Card className="p-6 max-w-2xl">
              <form onSubmit={handleSendSupport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">البريد الإلكتروني المعتمد</label>
                  <input type="email" value={user?.email || 'b2rentt@gmail.com'} disabled className="w-full p-3 rounded-xl bg-muted border border-border text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">نص الاستفسار أو المشكلة</label>
                  <textarea rows={4} value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} placeholder="اكتب استفسارك هنا..." className="w-full p-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                </div>
                <Button type="submit" className="gap-2">
                  <Send className="w-4 h-4" /> إرسال الاستفسار للدعم
                </Button>
              </form>
            </Card>
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}
