import { useMemo } from "react";
import { Link, useLocation, useParams } from "wouter";
import { ArrowRight, Bath, Bed, Building2, CheckCircle2, Heart, MapPin, Share2, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { OptimizedImage } from "@/components/OptimizedImage";

function parseAmenities(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
}

export default function PropertyDetailWithVideo() {
  const params = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const { language, direction, t } = useLanguage();
  const listingId = Number(params.id);
  const listingQuery = trpc.listings.getById.useQuery({ id: listingId }, { enabled: Number.isInteger(listingId) && listingId > 0 });
  const listing = listingQuery.data;
  const amenities = useMemo(() => parseAmenities(listing?.amenities), [listing?.amenities]);
  const imageUrl = listing?.imageUrl || "";
  const title = listing?.title || (language === "fr" ? "Détails de l’annonce" : "تفاصيل الإعلان");
  const description = listing?.description || (language === "fr" ? "Aucune description fournie par le propriétaire." : "لم يضف المالك وصفاً لهذا الإعلان بعد.");

  if (listingQuery.isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">{t("loading")}</div>;
  }
  if (listingQuery.isError || !listing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 px-4 text-center" dir={direction}>
        <h1 className="text-2xl font-bold text-slate-900">{language === "fr" ? "Annonce introuvable" : "الإعلان غير موجود"}</h1>
        <p className="text-slate-600">{language === "fr" ? "Cette annonce n’est plus disponible ou n’existe pas." : "هذا الإعلان غير متاح أو غير موجود."}</p>
        <Button onClick={() => setLocation("/search")}>{language === "fr" ? "Retour à la recherche" : "العودة إلى البحث"}</Button>
      </div>
    );
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description,
    image: imageUrl ? [imageUrl] : [],
    address: { "@type": "PostalAddress", addressLocality: listing.city, addressCountry: "MA" },
    offers: { "@type": "Offer", priceCurrency: "MAD", price: listing.pricePerDay, availability: "https://schema.org/InStock" },
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-4 sm:px-6" dir={direction}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => window.history.back()} className="gap-2 text-slate-600 px-0">
            <ArrowRight className="w-4 h-4" /> {language === "fr" ? "Retour aux résultats" : "العودة إلى النتائج"}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.success(language === "fr" ? "Lien copié" : "تم نسخ الرابط")}><Share2 className="w-4 h-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => toast.success(language === "fr" ? "Ajouté aux favoris" : "تمت الإضافة إلى المفضلة")}><Heart className="w-4 h-4" /></Button>
          </div>
        </div>

        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-2"><Badge className="bg-amber-500">{listing.status}</Badge><span className="text-xs text-slate-500">{language === "fr" ? "Aucun avis vérifié pour le moment" : "لا توجد مراجعات موثقة بعد"}</span></div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900">{title}</h1>
          <p className="flex items-center gap-1.5 text-sm text-slate-600"><MapPin className="w-4 h-4 text-amber-600" />{listing.city}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 min-h-[280px] sm:min-h-[420px] rounded-2xl overflow-hidden bg-slate-200">
            {imageUrl ? <OptimizedImage src={imageUrl} alt={title} width={1400} height={820} widthHint={1400} sizes="100vw" className="w-full h-full min-h-[280px] sm:min-h-[420px] object-cover" /> : <div className="h-full min-h-[280px] sm:min-h-[420px] flex items-center justify-center text-slate-500">{language === "fr" ? "Aucune image fournie" : "لا توجد صورة مضافة"}</div>}
          </div>
          <Card><CardContent className="p-5 space-y-4"><div><p className="text-xs text-slate-500">{t("price")}</p><p className="text-3xl font-bold text-slate-900">{listing.pricePerDay.toLocaleString()} <span className="text-sm font-normal">MAD / {language === "fr" ? "jour" : "يوم"}</span></p></div><Button asChild className="w-full bg-amber-500 hover:bg-amber-600"><Link href={`/booking?listingId=${listing.id}`}>{t("bookNow")}</Link></Button><p className="text-xs text-slate-500">{language === "fr" ? "Le prix final est calculé côté serveur lors de la réservation." : "يُحتسب السعر النهائي على الخادم أثناء الحجز."}</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[[Building2, language === "fr" ? "Type" : "النوع", listing.officeType || listing.category], [Bed, language === "fr" ? "Pièces" : "الغرف", listing.rooms ? String(listing.rooms) : "—"], [Bath, language === "fr" ? "Période" : "المدة", listing.rentalPeriod || "—"], [MapPin, language === "fr" ? "Ville" : "المدينة", listing.city]].map(([Icon, label, value]) => <Card key={String(label)}><CardContent className="p-4"><Icon className="w-5 h-5 text-amber-600 mb-2" /><p className="text-xs text-slate-500">{String(label)}</p><p className="font-semibold text-slate-800 truncate">{String(value)}</p></CardContent></Card>)}
        </div>

        <Card><CardContent className="p-5 space-y-4"><h2 className="text-xl font-bold text-slate-900">{language === "fr" ? "Description" : "الوصف"}</h2><p className="text-slate-600 leading-7">{description}</p></CardContent></Card>
        <Card><CardContent className="p-5 space-y-4"><h2 className="text-xl font-bold text-slate-900">{language === "fr" ? "Équipements et visite vidéo" : "التجهيزات وجولة الفيديو"}</h2>{amenities.length ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{amenities.map((item) => <div key={item} className="flex items-center gap-2 text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-600" />{item}</div>)}</div> : <p className="text-sm text-slate-500">{language === "fr" ? "Aucun équipement renseigné." : "لم تُسجل تجهيزات لهذا الإعلان بعد."}</p>}<div className="border-t pt-4 flex items-center gap-3 text-sm text-slate-500"><Video className="w-5 h-5 text-slate-400" />{language === "fr" ? "Aucune vidéo vérifiée n’est disponible pour cette annonce." : "لا يوجد فيديو موثق متاح لهذا الإعلان حالياً."}</div></CardContent></Card>
      </div>
    </div>
  );
}
