import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Building2, CalendarCheck, Check, Plus, TrendingUp, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdvancedMediaUpload } from "@/components/AdvancedMediaUpload";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const labels = {
  office: "مكتب مستقل",
  coworking: "مساحة عمل مشتركة",
  meeting: "قاعة اجتماعات",
  headquarters: "مقر شركة",
} as const;

export default function HostDashboard() {
  const { user, loading } = useAuth();
  const listings = trpc.listings.mine.useQuery(undefined, { enabled: !!user });
  const bookings = trpc.bookings.ownerList.useQuery(undefined, { enabled: !!user });
  const createListing = trpc.listings.create.useMutation({ onSuccess: () => { listings.refetch(); toast.success("تم إرسال المكتب للمراجعة"); } });
  const updateStatus = trpc.bookings.ownerUpdateStatus.useMutation({ onSuccess: () => { bookings.refetch(); toast.success("تم تحديث حالة الحجز"); } });
  const [form, setForm] = useState({ title: "", city: "الدار البيضاء", officeType: "office", rentalPeriod: "monthly", price: "", description: "", amenities: [] as string[], imageUrl: "" });
  const [showForm, setShowForm] = useState(false);
  const activeBookings = useMemo(() => (bookings.data ?? []).filter((b) => b.status === "Pending" || b.status === "Confirmed").length, [bookings.data]);
  const monthlyRevenue = useMemo(() => (bookings.data ?? []).filter((b) => b.status === "Confirmed").reduce((sum, b) => sum + Number(b.netProfit ?? b.totalPrice ?? 0), 0), [bookings.data]);

  if (loading) return <div className="container py-24 text-center">جاري تحميل لوحة المالك...</div>;
  if (!user) return <div className="container py-24 text-center">يرجى تسجيل الدخول للوصول إلى لوحة المالك.</div>;
  if (user.role !== "owner" && user.role !== "admin") return <div className="container py-24 text-center"><h1 className="text-2xl font-bold">هذه اللوحة مخصصة للملاك</h1><Link href="/my-bookings"><Button className="mt-6">الانتقال إلى حجوزاتي</Button></Link></div>;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title || !form.price) return toast.error("أدخل اسم المكتب والسعر");
    createListing.mutate({ title: form.title, city: form.city, category: "office", pricePerDay: Number(form.price), description: form.description, officeType: form.officeType, rentalPeriod: form.rentalPeriod as "daily" | "monthly" | "yearly", amenities: form.amenities, imageUrl: form.imageUrl || undefined });
  };
  const toggleAmenity = (value: string) => setForm((current) => ({ ...current, amenities: current.amenities.includes(value) ? current.amenities.filter((item) => item !== value) : [...current.amenities, value] }));

  return <div className="container py-8 space-y-8" dir="rtl">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-sm text-muted-foreground">مساحة المالك</p><h1 className="text-3xl font-black">لوحة إدارة المكاتب</h1></div><Button onClick={() => setShowForm((value) => !value)} className="bg-[var(--brand-amber)] text-white"><Plus className="ml-2 h-4 w-4" />إضافة مكتب جديد</Button></div>
    <div className="grid gap-4 sm:grid-cols-3"><Stat icon={<TrendingUp />} title="الأرباح المؤكدة" value={`${monthlyRevenue.toLocaleString("fr-MA")} MAD`} /><Stat icon={<CalendarCheck />} title="الحجوزات النشطة" value={String(activeBookings)} /><Stat icon={<Building2 />} title="مكاتبي" value={String(listings.data?.length ?? 0)} /></div>
    {showForm && <form onSubmit={submit} className="space-y-5 rounded-3xl border bg-card p-6 shadow-sm"><div className="grid gap-4 md:grid-cols-2"><input className="rounded-xl border bg-background p-3" placeholder="اسم المكتب" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><input className="rounded-xl border bg-background p-3" placeholder="المدينة" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /><select className="rounded-xl border bg-background p-3" value={form.officeType} onChange={(e) => setForm({ ...form, officeType: e.target.value })}>{Object.entries(labels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><select className="rounded-xl border bg-background p-3" value={form.rentalPeriod} onChange={(e) => setForm({ ...form, rentalPeriod: e.target.value })}><option value="daily">يومي</option><option value="monthly">شهري</option><option value="yearly">سنوي</option></select><input type="number" min="0" className="rounded-xl border bg-background p-3" placeholder="السعر بالدرهم" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /><textarea className="rounded-xl border bg-background p-3 md:col-span-2" placeholder="وصف المكتب" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div><div className="flex flex-wrap gap-2">{[["fiber", "Fiber Optic"], ["ac", "مكيف"], ["parking", "Parking"], ["security", "حراسة"]].map(([value, label]) => <button type="button" key={value} onClick={() => toggleAmenity(value)} className={`rounded-full border px-4 py-2 text-sm ${form.amenities.includes(value) ? "border-amber-500 bg-amber-50 text-amber-800" : "bg-background"}`}>{label}</button>)}</div><AdvancedMediaUpload onImagesUploaded={(urls) => setForm((current) => ({ ...current, imageUrl: urls[0] ?? "" }))} /><Button type="submit" disabled={createListing.isPending}>{createListing.isPending ? "جاري الحفظ..." : "إرسال المكتب للمراجعة"}</Button></form>}
    <section className="space-y-4"><h2 className="text-xl font-bold">طلبات الحجز</h2>{bookings.data?.length ? bookings.data.map((booking) => <div key={booking.id} className="flex flex-col gap-4 rounded-2xl border bg-card p-5 md:flex-row md:items-center md:justify-between"><div><p className="font-bold">{booking.listingTitle ?? "مكتب"}</p><p className="text-sm text-muted-foreground">{booking.renterName ?? "مستأجر"} · {booking.status} · {Number(booking.totalPrice ?? 0).toLocaleString("fr-MA")} MAD</p></div>{booking.status === "Pending" && <div className="flex gap-2"><Button size="sm" onClick={() => updateStatus.mutate({ bookingId: booking.id, status: "Confirmed" })}><Check className="ml-1 h-4 w-4" />قبول</Button><Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ bookingId: booking.id, status: "Cancelled" })}><X className="ml-1 h-4 w-4" />رفض</Button></div>}</div>) : <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">لا توجد حجوزات واردة حالياً.</div>}</section>
  </div>;
}

function Stat({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) { return <div className="rounded-2xl border bg-card p-5"><div className="mb-3 flex items-center gap-2 text-[var(--brand-amber)]">{icon}<span className="text-sm text-muted-foreground">{title}</span></div><strong className="text-2xl">{value}</strong></div>; }
