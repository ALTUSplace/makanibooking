import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, FileText, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";
import { startLogin } from "@/const";
import { legalDisclosure, persistLegalConsent } from "@/lib/legalDisclosure";
import { supabase } from "@/lib/supabase";

export default function Register() {
  const [, setLocation] = useLocation();
  const { language, direction } = useLanguage();
  const [accepted, setAccepted] = useState(false);
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const content = legalDisclosure[language];
  const isArabic = language === "ar";
  const nextPath = useMemo(() => {
    if (typeof window === "undefined") return "/";
    const next = new URLSearchParams(window.location.search).get("next");
    return next?.startsWith("/") && !next.startsWith("//") && next !== "/register" ? next : "/";
  }, []);

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    if (!accepted) return;
    persistLegalConsent();

    if (!supabase) {
      startLogin();
      return;
    }

    setPending(true);
    const result = mode === "sign-up"
      ? await supabase.auth.signUp({ email: email.trim(), password })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setPending(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "sign-up" && !result.data.session) {
      setMessage(isArabic
        ? "تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيد الحساب قبل الدخول."
        : "Compte créé. Vérifiez votre e-mail pour confirmer le compte avant de vous connecter.");
      return;
    }

    setLocation(nextPath);
  };

  return (
    <main className="min-h-[70vh] bg-slate-50 px-4 py-10 sm:px-6" dir={direction}>
      <section className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-700">
                <ShieldCheck className="h-5 w-5" />
                <span>{isArabic ? "التسجيل الآمن والمسؤول" : "Inscription sécurisée et responsable"}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">{content.title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{content.summary}</p>
            </div>
            <Button variant="outline" onClick={() => setLocation("/terms")} className="shrink-0 gap-2">
              <FileText className="h-4 w-4" />
              {isArabic ? "الشروط كاملة" : "Conditions complètes"}
            </Button>
          </div>

          <div className="mt-8 space-y-4">
            {content.sections.map((section) => (
              <article key={section.title} className="border-s-4 border-amber-400 bg-amber-50/60 p-4 text-sm leading-7 text-slate-700">
                <h2 className="font-black text-slate-900">{section.title}</h2>
                <p className="mt-1">{section.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label={isArabic ? "نوع العملية" : "Type d'opération"}>
            <Button type="button" variant={mode === "sign-in" ? "default" : "outline"} onClick={() => { setMode("sign-in"); setMessage(null); }}>
              {isArabic ? "تسجيل الدخول" : "Se connecter"}
            </Button>
            <Button type="button" variant={mode === "sign-up" ? "default" : "outline"} onClick={() => { setMode("sign-up"); setMessage(null); }}>
              {isArabic ? "إنشاء حساب" : "Créer un compte"}
            </Button>
          </div>

          <form onSubmit={submitAuth} className="mt-5 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-800 sm:col-span-2">
              {isArabic ? "البريد الإلكتروني" : "Adresse e-mail"}
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-[#0A2540] focus:ring-2 focus:ring-[#0A2540]/15"
                placeholder="name@example.com"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-800 sm:col-span-2">
              {isArabic ? "كلمة المرور" : "Mot de passe"}
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-[#0A2540] focus:ring-2 focus:ring-[#0A2540]/15"
                placeholder={isArabic ? "6 أحرف على الأقل" : "6 caractères minimum"}
              />
            </label>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
              <Checkbox
                id="legal-consent"
                checked={accepted}
                onCheckedChange={(value) => setAccepted(value === true)}
                aria-label={isArabic ? "الموافقة على الشروط والأحكام" : "Accepter les conditions générales"}
                className="mt-1"
              />
              <button
                type="button"
                onClick={() => setAccepted((value) => !value)}
                className="cursor-pointer text-start text-sm font-semibold leading-6 text-slate-800 outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-[#0A2540]/40"
              >
                {isArabic ? "أقر بأنني قرأت هذه البنود وفهمتها وأوافق عليها قبل إنشاء حساب أو تنفيذ عملية على المنصة." : "Je reconnais avoir lu et compris ces clauses et les accepter avant de créer un compte ou d'effectuer une opération sur la plateforme."}
              </button>
            </div>

            {message && <p role="alert" className="text-sm font-semibold leading-6 text-red-700 sm:col-span-2">{message}</p>}

            <Button type="submit" disabled={!accepted || pending} className="gap-2 bg-[#0A2540] text-white hover:bg-[#071b2e] sm:col-span-2 sm:w-fit">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {pending ? (isArabic ? "جارٍ المعالجة..." : "Traitement...") : mode === "sign-up" ? (isArabic ? "إنشاء الحساب" : "Créer le compte") : (isArabic ? "الدخول إلى الحساب" : "Se connecter")}
            </Button>
          </form>

          {!supabase && (
            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              {isArabic ? "سيتم استخدام مسار الدخول القديم مؤقتاً حتى تكتمل إعدادات Supabase Auth." : "Le parcours de connexion actuel reste actif jusqu'à la finalisation de Supabase Auth."}
            </p>
          )}
        </div>

        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#0A2540] hover:text-amber-700">
          <ArrowLeft className="h-4 w-4" />
          {isArabic ? "العودة إلى الرئيسية" : "Retour à l'accueil"}
        </Link>
      </section>
    </main>
  );
}
