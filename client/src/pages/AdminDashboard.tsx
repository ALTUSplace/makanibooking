import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Users, Building2, CalendarDays, WalletCards, CheckCircle2, XCircle, ShieldAlert, Loader2, ArrowLeft, LifeBuoy, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

const money = (value: number) => `${value.toLocaleString('fr-MA')} MAD`;

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState('overview');
  const overview = trpc.admin.overview.useQuery(undefined, { enabled: user?.role === 'admin' });
  const users = trpc.admin.users.useQuery(undefined, { enabled: user?.role === 'admin' });
  const listings = trpc.admin.listings.useQuery(undefined, { enabled: user?.role === 'admin' });
  const adminBookings = trpc.admin.bookings.useQuery(undefined, { enabled: user?.role === 'admin' });
  const commissionSettings = trpc.admin.commissionSettings.useQuery(undefined, { enabled: user?.role === 'admin' });
  const payouts = trpc.admin.payouts.useQuery(undefined, { enabled: user?.role === 'admin' });
  const payments = trpc.admin.payments.useQuery(undefined, { enabled: user?.role === 'admin' });
  const disputes = trpc.admin.disputes.useQuery(undefined, { enabled: user?.role === 'admin' });
  const supportTickets = trpc.admin.supportTickets.useQuery(undefined, { enabled: user?.role === 'admin' });
  const resolveDispute = trpc.admin.resolveDispute.useMutation({ onSuccess: async () => { toast.success('تم تحديث حالة النزاع'); await disputes.refetch(); }, onError: error => toast.error(error.message) });
  const updateSupportTicket = trpc.admin.updateSupportTicket.useMutation({ onSuccess: async () => { toast.success('تم تحديث تذكرة الدعم وإشعار صاحبها'); setTicketResponses({}); await supportTickets.refetch(); }, onError: error => toast.error(error.message) });
  const [commissionRate, setCommissionRate] = useState('10');
  const [ticketResponses, setTicketResponses] = useState<Record<number, string>>({});
  const updateCommission = trpc.admin.updateCommission.useMutation({ onSuccess: async () => { toast.success('تم تحديث عمولة المنصة'); await commissionSettings.refetch(); }, onError: error => toast.error(error.message) });
  const reviewPayout = trpc.admin.reviewPayout.useMutation({ onSuccess: async () => { toast.success('تم تحديث طلب السحب'); await payouts.refetch(); }, onError: error => toast.error(error.message) });
  const utils = trpc.useUtils();
  const cancelBooking = trpc.admin.cancelBooking.useMutation({ onSuccess: async () => { toast.success('تم إلغاء الحجز الطارئ'); await adminBookings.refetch(); }, onError: error => toast.error(error.message) });
  const moderate = trpc.admin.moderateListing.useMutation({
    onSuccess: async () => {
      toast.success('تم تحديث حالة الإعلان');
      await Promise.all([utils.admin.listings.invalidate(), utils.admin.overview.invalidate()]);
    },
    onError: error => toast.error(error.message),
  });

  useEffect(() => {
    if (!loading && user && user.role !== 'admin') navigate('/');
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-amber-600" /></div>;
  }
  if (user.role !== 'admin') return null;

  const stats = overview.data;
  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-2xl bg-[#0B3C5D] p-6 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">B2-Rent Morocco</p>
            <h1 className="mt-1 text-2xl font-black">لوحة الإدارة العامة</h1>
            <p className="mt-1 text-sm text-slate-200">مركز المراقبة والمراجعة المالية والتشغيلية للمنصة.</p>
          </div>
          <Link href="/host"><Button variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10"><ArrowLeft className="ml-2 h-4 w-4" /> لوحة المالك</Button></Link>
        </header>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {([
            { label: 'المستخدمون', value: stats?.users ?? 0, icon: Users },
            { label: 'الإعلانات', value: stats?.listings ?? 0, icon: Building2 },
            { label: 'قيد المراجعة', value: stats?.pendingListings ?? 0, icon: ShieldAlert },
            { label: 'عمولات مؤكدة', value: money(stats?.platformFees ?? 0), icon: WalletCards },
          ] as Array<{ label: string; value: string | number; icon: LucideIcon }>).map(({ label, value, icon: StatIcon }) => {
            return <Card key={String(label)} className="border-0 shadow-sm"><CardContent className="p-4"><StatIcon className="mb-3 h-5 w-5 text-amber-600" /><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-black text-[#0B3C5D]">{value}</p></CardContent></Card>;
          })}
        </section>

        <Tabs value={tab} onValueChange={setTab} dir="rtl">
          <TabsList className="grid h-auto w-full grid-cols-2 bg-white p-1 text-[#0B3C5D] shadow-sm sm:grid-cols-7">
            <TabsTrigger className="text-[#0B3C5D] data-[state=active]:bg-[#0B3C5D] data-[state=active]:text-white" value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger className="text-[#0B3C5D] data-[state=active]:bg-[#0B3C5D] data-[state=active]:text-white" value="listings">مراجعة الإعلانات</TabsTrigger>
            <TabsTrigger className="text-[#0B3C5D] data-[state=active]:bg-[#0B3C5D] data-[state=active]:text-white" value="users">المستخدمون</TabsTrigger>
            <TabsTrigger className="text-[#0B3C5D] data-[state=active]:bg-[#0B3C5D] data-[state=active]:text-white" value="bookings">الحجوزات</TabsTrigger>
            <TabsTrigger className="text-[#0B3C5D] data-[state=active]:bg-[#0B3C5D] data-[state=active]:text-white" value="finance">المالية</TabsTrigger>
            <TabsTrigger className="text-[#0B3C5D] data-[state=active]:bg-[#0B3C5D] data-[state=active]:text-white" value="disputes">النزاعات</TabsTrigger>
            <TabsTrigger className="text-[#0B3C5D] data-[state=active]:bg-[#0B3C5D] data-[state=active]:text-white" value="support">الدعم</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><LayoutDashboard className="h-5 w-5 text-amber-600" />المؤشرات التشغيلية</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-3">
              <div><p className="text-sm text-slate-500">الملاك</p><p className="text-2xl font-black">{stats?.owners ?? 0}</p></div>
              <div><p className="text-sm text-slate-500">المستأجرون</p><p className="text-2xl font-black">{stats?.renters ?? 0}</p></div>
              <div><p className="text-sm text-slate-500">الحجوزات</p><p className="text-2xl font-black">{stats?.bookings ?? 0}</p></div>
              <div><p className="text-sm text-slate-500">إجمالي المعاملات المؤكدة</p><p className="text-2xl font-black text-[#0B3C5D]">{money(stats?.grossRevenue ?? 0)}</p></div>
            </CardContent></Card>
          </TabsContent>
          <TabsContent value="listings" className="mt-4">
            <Card><CardHeader><CardTitle>مراجعة الإعلانات قبل نشرها</CardTitle></CardHeader><CardContent className="space-y-3">
              {listings.isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : listings.data?.length ? listings.data.map(item => (
                <div key={item.id} className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="font-bold text-[#0B3C5D]">{item.title}</p><p className="text-xs text-slate-500">{item.category} · المالك: {item.ownerName || `#${item.ownerId}`} · {money(item.pricePerDay)}</p></div>
                  <div className="flex items-center gap-2"><Badge variant={item.status === 'Approved' ? 'default' : 'secondary'}>{item.status}</Badge>{item.status === 'Pending' && <><Button size="sm" onClick={() => moderate.mutate({ listingId: item.id, status: 'Approved' })} disabled={moderate.isPending} className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="ml-1 h-4 w-4" />قبول</Button><Button size="sm" variant="destructive" onClick={() => moderate.mutate({ listingId: item.id, status: 'Rejected' })} disabled={moderate.isPending}><XCircle className="ml-1 h-4 w-4" />رفض</Button></>}</div>
                </div>
              )) : <p className="py-8 text-center text-sm text-slate-500">لا توجد إعلانات مسجلة.</p>}
            </CardContent></Card>
          </TabsContent>
          <TabsContent value="users" className="mt-4">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-amber-600" />المستخدمون المسجلون</CardTitle></CardHeader><CardContent className="space-y-2">
              {users.data?.map(item => <div key={item.id} className="flex items-center justify-between border-b py-3 last:border-0"><div><p className="font-semibold">{item.name || 'بدون اسم'}</p><p className="text-xs text-slate-500">{item.email || 'بدون بريد'}</p></div><Badge variant="outline">{item.role}</Badge></div>)}
            </CardContent></Card>
          </TabsContent>
          <TabsContent value="finance" className="mt-4 space-y-4">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><WalletCards className="h-5 w-5 text-amber-600" />إعدادات العمولة والتسويات</CardTitle></CardHeader><CardContent className="space-y-5"><form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={(event) => { event.preventDefault(); const rate = Number(commissionRate); if (!Number.isFinite(rate) || rate < 0 || rate > 30) return toast.error('أدخل نسبة بين 0 و30'); updateCommission.mutate({ commissionRateBasisPoints: Math.round(rate * 100) }); }}><label className="flex-1 text-sm font-semibold">عمولة المنصة (%)<input className="mt-2 w-full rounded-xl border bg-background p-3" type="number" min="0" max="30" step="0.1" value={commissionRate} onChange={(event) => setCommissionRate(event.target.value)} /></label><Button type="submit" disabled={updateCommission.isPending}>حفظ النسبة الحالية {Number(commissionSettings.data?.commissionRateBasisPoints ?? 1000) / 100}%</Button></form><div className="grid gap-3 sm:grid-cols-3"><Stat label="عمولة المنصة" value={money(stats?.platformFees ?? 0)} icon={WalletCards} /><Stat label="إجمالي المعاملات" value={money(stats?.grossRevenue ?? 0)} icon={WalletCards} /><Stat label="طلبات السحب" value={String(payouts.data?.length ?? 0)} icon={WalletCards} /></div></CardContent></Card>
            <Card><CardHeader><CardTitle>سجل المدفوعات الفعلية</CardTitle></CardHeader><CardContent className="space-y-3">{payments.isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : payments.data?.length ? payments.data.map(item => <div key={item.id} className="flex flex-col gap-2 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{money(item.amount)} · {item.method}</p><p className="text-xs text-slate-500">الحجز #{item.bookingId} · {item.payerName || `المستخدم #${item.payerId}`} · {item.payerEmail || 'بدون بريد'}</p></div><Badge variant={item.status === 'Succeeded' ? 'default' : 'secondary'}>{item.status}</Badge></div>) : <p className="py-8 text-center text-sm text-slate-500">لا توجد مدفوعات مسجلة.</p>}</CardContent></Card>
            <Card><CardHeader><CardTitle>طلبات تحويل مستحقات الملاك</CardTitle></CardHeader><CardContent className="space-y-3">{payouts.data?.length ? payouts.data.map(item => <div key={item.id} className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{item.ownerName || `مالك #${item.ownerId}`} · {money(item.amount)}</p><p className="text-xs text-slate-500">{item.method} · {item.status} · {item.ownerEmail || 'بدون بريد'}</p></div><div className="flex flex-wrap gap-2">{item.status === 'Pending' && <><Button size="sm" onClick={() => reviewPayout.mutate({ payoutId: item.id, status: 'Approved' })}>اعتماد</Button><Button size="sm" variant="destructive" onClick={() => reviewPayout.mutate({ payoutId: item.id, status: 'Rejected', adminNote: 'لم تتم الموافقة' })}>رفض</Button></>}{item.status === 'Approved' && <Button size="sm" onClick={() => reviewPayout.mutate({ payoutId: item.id, status: 'Paid', reference: `B2-${item.id}` })}>تأكيد التحويل</Button>}</div></div>) : <p className="py-8 text-center text-sm text-slate-500">لا توجد طلبات سحب.</p>}</CardContent></Card>
          </TabsContent>
          <TabsContent value="disputes" className="mt-4">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-amber-600" />مركز الشكاوى والنزاعات</CardTitle></CardHeader><CardContent className="space-y-3">
              {disputes.isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : disputes.data?.length ? disputes.data.map(item => <div key={item.id} className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">#{item.id} · {item.type} · الحجز #{item.bookingId}</p><p className="text-xs text-slate-500">{item.openerName || `المستخدم #${item.openedBy}`} · {item.description}</p><Badge variant={item.status === 'Resolved' ? 'default' : 'secondary'}>{item.status}</Badge>{item.resolutionNote && <p className="mt-1 text-xs text-slate-500">قرار: {item.resolutionNote}</p>}</div><div className="flex flex-wrap gap-2">{item.status !== 'Resolved' && item.status !== 'Rejected' && <><Button size="sm" variant="outline" onClick={() => resolveDispute.mutate({ disputeId: item.id, status: 'UnderReview', resolutionNote: 'تم تحويل الملف للمراجعة' })}>قيد المراجعة</Button><Button size="sm" onClick={() => resolveDispute.mutate({ disputeId: item.id, status: 'Resolved', resolutionNote: 'تمت معالجة النزاع من الإدارة' })}>حسم النزاع</Button><Button size="sm" variant="destructive" onClick={() => resolveDispute.mutate({ disputeId: item.id, status: 'Rejected', resolutionNote: 'تم رفض الطلب بعد المراجعة' })}>رفض</Button></>}</div></div>) : <p className="py-8 text-center text-sm text-slate-500">لا توجد نزاعات مسجلة.</p>}
            </CardContent></Card>
          </TabsContent>
          <TabsContent value="support" className="mt-4">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><LifeBuoy className="h-5 w-5 text-amber-600" />تذاكر الدعم والاستفسارات</CardTitle></CardHeader><CardContent className="space-y-3">
              {supportTickets.isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : supportTickets.isError ? <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">تعذر تحميل تذاكر الدعم. <Button variant="outline" size="sm" onClick={() => supportTickets.refetch()} className="mr-2 border-red-300 text-red-700">إعادة المحاولة</Button></div> : supportTickets.data?.length ? supportTickets.data.map(item => <div key={item.id} className="space-y-3 rounded-xl border bg-white p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-bold text-[#0B3C5D]">TCK-{item.id} · {item.subject}</p><p className="text-xs text-slate-500">{item.userName || `المستخدم #${item.userId}`} · {item.userEmail || 'بدون بريد'} · {item.category}</p></div><Badge variant={item.status === 'Resolved' ? 'default' : 'secondary'}>{item.status}</Badge></div><p className="text-sm leading-6 text-slate-700">{item.description}</p>{item.lastResponse && <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600"><strong>آخر رد:</strong> {item.lastResponse}</div>}<textarea value={ticketResponses[item.id] || ''} onChange={(event) => setTicketResponses((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="اكتب رداً يظهر لصاحب التذكرة..." maxLength={2000} rows={2} className="w-full rounded-lg border bg-background p-3 text-sm" /><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={updateSupportTicket.isPending} onClick={() => updateSupportTicket.mutate({ ticketId: item.id, status: 'InProgress', response: ticketResponses[item.id]?.trim() || undefined })}>إرسال رد وقيد المعالجة</Button><Button size="sm" disabled={updateSupportTicket.isPending} onClick={() => updateSupportTicket.mutate({ ticketId: item.id, status: 'Resolved', response: ticketResponses[item.id]?.trim() || undefined })}>إرسال الرد وإغلاق التذكرة</Button></div></div>) : <p className="py-8 text-center text-sm text-slate-500">لا توجد تذاكر دعم.</p>}
            </CardContent></Card>
          </TabsContent>
          <TabsContent value="bookings" className="mt-4">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-amber-600" />الحجوزات والإلغاء الطارئ</CardTitle></CardHeader><CardContent className="space-y-3">
              {adminBookings.data?.length ? adminBookings.data.map(item => <div key={item.id} className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{item.listingTitle || 'إعلان'} · #{item.id}</p><p className="text-xs text-slate-500">{item.renterName || 'مستأجر'} · {item.status} · {money(item.totalPrice)}</p></div>{item.status !== 'Cancelled' && <Button size="sm" variant="destructive" onClick={() => cancelBooking.mutate({ bookingId: item.id })} disabled={cancelBooking.isPending}>إلغاء طارئ</Button>}</div>) : <p className="py-8 text-center text-sm text-slate-500">لا توجد حجوزات.</p>}
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return <div className="rounded-xl border bg-white p-4"><Icon className="mb-2 h-4 w-4 text-amber-600" /><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-lg font-black text-[#0B3C5D]">{value}</p></div>;
}
