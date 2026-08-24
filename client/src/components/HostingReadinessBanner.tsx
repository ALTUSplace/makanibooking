import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const OFFICIAL_SITE_URL = "https://b2rentmorocc-muehrc85.manus.space";

type HealthPayload = {
  ready?: boolean;
};

const copy = {
  ar: {
    label: "نسخة تجريبية",
    message: "هذه النسخة قيد التهيئة التقنية ولا تستقبل الحجوزات حالياً.",
    action: "فتح النسخة الرسمية",
  },
  fr: {
    label: "Version de test",
    message: "Cette version est en cours de configuration technique et ne reçoit pas encore de réservations.",
    action: "Ouvrir le site officiel",
  },
  en: {
    label: "Preview version",
    message: "This version is still being configured and is not accepting bookings yet.",
    action: "Open the official site",
  },
} as const;

function isVercelHost() {
  return typeof window !== "undefined" && window.location.hostname.endsWith(".vercel.app");
}

export default function HostingReadinessBanner() {
  const { language } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!isVercelHost()) return;

    let active = true;
    void fetch("/api/health", { credentials: "same-origin" })
      .then(async response => {
        if (!active) return;
        const payload = (await response.json().catch(() => ({}))) as HealthPayload;
        setShowBanner(!response.ok || payload.ready === false);
      })
      .catch(() => {
        if (active) setShowBanner(true);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!showBanner) return null;

  const content = copy[language];

  return (
    <aside
      aria-label={content.label}
      className="border-b border-amber-200 bg-amber-50 text-slate-950"
    >
      <div className="container flex min-h-12 flex-col items-start justify-between gap-2 py-2 text-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
          <span><strong>{content.label}:</strong> {content.message}</span>
        </div>
        <a
          href={OFFICIAL_SITE_URL}
          className="inline-flex shrink-0 items-center gap-1 font-bold text-[#0B3C5D] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3C5D]"
        >
          {content.action}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </aside>
  );
}
