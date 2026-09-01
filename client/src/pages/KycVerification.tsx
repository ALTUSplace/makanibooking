import { useRef, useState } from "react";
import { ShieldCheck, Upload, FileText, Clock3, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

function readAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}

export default function KycVerification() {
  const { isAuthenticated, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const { language, direction, t } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [role, setRole] = useState<"renter" | "owner" | "company">("renter");
  const [documentType, setDocumentType] = useState<"cni" | "commercial_register">("cni");
  const [file, setFile] = useState<File | null>(null);
  const submissions = trpc.kyc.listMine.useQuery(undefined, { enabled: isAuthenticated });
  const submit = trpc.kyc.submit.useMutation({
    onSuccess: async () => {
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      await submissions.refetch();
      toast.success(language === "ar" ? "تم إرسال وثيقتك للمراجعة بأمان." : "Votre document a été envoyé pour vérification.");
    },
    onError: error => toast.error(error.message),
  });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return toast.error(language === "ar" ? "اختر وثيقة قبل الإرسال." : "Choisissez un document avant l'envoi.");
    if (file.size > 8 * 1024 * 1024) return toast.error(language === "ar" ? "حجم الملف يجب ألا يتجاوز 8 ميجابايت." : "La taille du fichier ne doit pas dépasser 8 Mo.");
    try {
      submit.mutate({
        applicantRole: role,
        documentType,
        fileName: file.name,
        mimeType: file.type as "application/pdf" | "image/jpeg" | "image/png",
        contentBase64: await readAsBase64(file),
      });
    } catch {
      toast.error(language === "ar" ? "تعذر تجهيز الملف." : "Impossible de préparer le fichier.");
    }
  };

  const statusLabel = (status: string) => status === "Approved" ? t("approved") : status === "Rejected" ? t("rejected") : t("pendingReview");
  const roleLabel = (value: string) => value === "owner" ? (language === "ar" ? "مالك" : "Propriétaire") : value === "company" ? (language === "ar" ? "شركة" : "Entreprise") : (language === "ar" ? "مستأجر" : "Locataire");

  if (authLoading || !isAuthenticated) return <div className="min-h-screen grid place-items-center">{t("loading")}</div>;
  return <main dir={direction} lang={language} className="min-h-screen bg-background px-4 py-8 text-foreground"><div className="mx-auto max-w-3xl space-y-6">
    <header className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl"><div className="flex items-start gap-3"><ShieldCheck className="mt-1 text-amber-400" /><div><h1 className="text-2xl font-black">{t("kycTitle")}</h1><p className="mt-2 text-sm text-slate-300">{t("kycSubtitle")} {t("maxFile")}</p></div></div></header>
    <form onSubmit={onSubmit} className="space-y-5 rounded-3xl border bg-card p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2"><label className="space-y-2 text-sm font-bold">{language === "ar" ? "صفة مقدم الطلب" : "Qualité du demandeur"}<select value={role} onChange={e => setRole(e.target.value as typeof role)} className="mt-1 w-full rounded-xl border bg-background p-3"><option value="renter">{roleLabel("renter")}</option><option value="owner">{roleLabel("owner")}</option><option value="company">{roleLabel("company")}</option></select></label><label className="space-y-2 text-sm font-bold">{language === "ar" ? "نوع الوثيقة" : "Type de document"}<select value={documentType} onChange={e => setDocumentType(e.target.value as typeof documentType)} className="mt-1 w-full rounded-xl border bg-background p-3"><option value="cni">{t("cni")}</option><option value="commercial_register">{t("commercialRegister")}</option></select></label></div>
      <button type="button" onClick={() => fileRef.current?.click()} className="flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-amber-400/60 bg-amber-50/50 p-4 text-center dark:bg-amber-950/20"><Upload className="text-amber-600" /><span className="font-bold">{file ? file.name : t("selectFile")}</span><span className="text-xs text-muted-foreground">{t("maxFile")}</span></button><input ref={fileRef} hidden type="file" accept="application/pdf,image/jpeg,image/png" onChange={e => setFile(e.target.files?.[0] ?? null)} />
      <button disabled={!file || submit.isPending} className="w-full rounded-xl bg-amber-500 px-4 py-3 font-black text-slate-950 disabled:opacity-50">{submit.isPending ? t("loading") : t("submitDocument")}</button>
    </form>
    <section className="space-y-3"><h2 className="text-lg font-black">{language === "ar" ? "سجل طلباتك" : "Historique de vos demandes"}</h2>{submissions.isLoading ? <div className="rounded-2xl border p-5 text-muted-foreground">{t("loading")}</div> : submissions.data?.length ? submissions.data.map(item => <article key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4"><div className="flex min-w-0 items-center gap-3"><FileText className="shrink-0 text-amber-600" /><div className="min-w-0"><p className="truncate font-bold">{item.originalFileName}</p><p className="text-xs text-muted-foreground">{roleLabel(item.applicantRole)} · {new Date(item.submittedAt).toLocaleDateString(language === "ar" ? "ar-MA" : "fr-MA")}</p></div></div><div className="flex shrink-0 items-center gap-1 text-xs font-bold">{item.status === "Approved" ? <CheckCircle2 className="text-emerald-600" /> : item.status === "Rejected" ? <XCircle className="text-red-600" /> : <Clock3 className="text-amber-600" />}{statusLabel(item.status)}</div></article>) : <div className="rounded-2xl border p-5 text-sm text-muted-foreground">{language === "ar" ? "لا توجد طلبات تحقق بعد." : "Aucune demande de vérification pour le moment."}</div>}</section>
  </div></main>;
}
