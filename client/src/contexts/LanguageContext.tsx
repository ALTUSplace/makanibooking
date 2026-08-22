import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type Language = "ar" | "fr";

interface LanguageContextType {
  language: Language;
  direction: "rtl" | "ltr";
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    home: "الرئيسية",
    cars: "تأجير السيارات",
    properties: "العقارات",
    search: "البحث والعروض",
    admin: "لوحة الإدارة",
    dashboard: "لوحة الوكالة",
    addCar: "إضافة إعلان",
    myBookings: "حجوزاتي",
    favorites: "المفضلة",
    profile: "الملف الشخصي",
    help: "الدعم والمساعدة",
    about: "عن المنصة",
    blog: "المدونة",
    notifications: "الإشعارات",
    kyc: "التحقق من الهوية",
    heroTitle: "بوابتك الموثوقة لحجز السيارات والعقارات في المغرب",
    heroSubtitle: "اكتشف عروضاً مختارة من وكالات موثوقة، واحجز بسهولة مع عقود رقمية وفوترة شفافة.",
    aiSearchPlaceholder: "مثال: أريد سيارة دفع رباعي في أكادير أو شقة فاخرة في مراكش...",
    searchNow: "ابحث الآن",
    bookNow: "احجز الآن",
    viewDetails: "عرض التفاصيل",
    city: "المدينة",
    propertyType: "نوع العقار",
    price: "السعر",
    dates: "التواريخ",
    language: "اللغة",
    currency: "العملة",
    chooseLanguage: "اختيار اللغة",
    arabic: "العربية",
    french: "Français",
    switchArabic: "التبديل إلى العربية",
    switchFrench: "Passer au français",
    cmiPayment: "الدفع عبر CMI",
    bankTransfer: "التحويل البنكي",
    invoice: "الفاتورة",
    vat: "TVA",
    kycTitle: "تحقق من هويتك بأمان",
    kycSubtitle: "ارفع بطاقة التعريف الوطنية أو السجل التجاري ليتمكن فريقنا من مراجعة حسابك.",
    cni: "بطاقة التعريف الوطنية",
    commercialRegister: "السجل التجاري",
    submitDocument: "إرسال الوثيقة للمراجعة",
    pendingReview: "قيد المراجعة",
    approved: "تم التحقق",
    rejected: "مرفوضة",
    selectFile: "اختر ملفاً",
    noFile: "لم يتم اختيار ملف",
    maxFile: "PDF أو JPG أو PNG، بحد أقصى 8 ميغابايت",
    save: "حفظ",
    cancel: "إلغاء",
    close: "إغلاق",
    back: "رجوع",
    loading: "جاري التحميل...",
    allRights: "جميع الحقوق محفوظة",
    officeSpaces: "مساحات الأعمال",
    officeType: "نوع المساحة",
    privateOffice: "مكتب مستقل",
    coworking: "مساحة عمل مشتركة",
    meetingRoom: "قاعة اجتماعات",
    companyHeadquarters: "مقر شركة",
    rentalType: "نوع الكراء",
    daily: "يومي",
    monthly: "شهري",
    yearly: "سنوي",
    amenities: "التجهيزات والخدمات",
    fiber: "إنترنت Fiber Optic",
    airConditioning: "مكيف هواء",
    reception: "قاعة استقبال",
    parking: "مرآب Parking",
    security: "حراسة",
    all: "الكل",
    resultsFound: "عرض متاح",
    officeOnly: "المكاتب فقط",
    allSectors: "كل القطاعات",
    detailsAndBooking: "التفاصيل والحجز",
    resetFilters: "إعادة ضبط",
    advancedFilters: "تصفية متقدمة",
    naturalSearch: "بحث ذكي باللغة الطبيعية",
    searchPlaceholder: "ابحث عما ترغب به...",
    sector: "القطاع",
    carsOnly: "السيارات فقط",
    propertiesOnly: "العقارات فقط",
    maxPrice: "السعر الأقصى",
  },
  fr: {
    home: "Accueil",
    cars: "Location de voitures",
    properties: "Immobilier",
    search: "Recherche et offres",
    admin: "Administration",
    dashboard: "Tableau de bord agence",
    addCar: "Ajouter une annonce",
    myBookings: "Mes réservations",
    favorites: "Favoris",
    profile: "Profil",
    help: "Aide et support",
    about: "À propos",
    blog: "Blog",
    notifications: "Notifications",
    kyc: "Vérification d'identité",
    heroTitle: "Votre passerelle de confiance pour louer voitures et biens au Maroc",
    heroSubtitle: "Découvrez des offres sélectionnées auprès d'agences fiables, réservez simplement avec contrats numériques et facturation transparente.",
    aiSearchPlaceholder: "Exemple : je veux un SUV à Agadir ou un appartement de luxe à Marrakech...",
    searchNow: "Rechercher",
    bookNow: "Réserver maintenant",
    viewDetails: "Voir les détails",
    city: "Ville",
    propertyType: "Type de bien",
    price: "Prix",
    dates: "Dates",
    language: "Langue",
    currency: "Devise",
    chooseLanguage: "Choisir la langue",
    arabic: "العربية",
    french: "Français",
    switchArabic: "التبديل إلى العربية",
    switchFrench: "Passer au français",
    cmiPayment: "Paiement CMI",
    bankTransfer: "Virement bancaire",
    invoice: "Facture",
    vat: "TVA",
    kycTitle: "Vérifiez votre identité en toute sécurité",
    kycSubtitle: "Téléversez votre CNI ou registre de commerce pour permettre à notre équipe de vérifier votre compte.",
    cni: "Carte nationale d'identité",
    commercialRegister: "Registre de commerce",
    submitDocument: "Envoyer le document pour vérification",
    pendingReview: "En cours de vérification",
    approved: "Identité vérifiée",
    rejected: "Document refusé",
    selectFile: "Choisir un fichier",
    noFile: "Aucun fichier sélectionné",
    maxFile: "PDF, JPG ou PNG, 8 Mo maximum",
    save: "Enregistrer",
    cancel: "Annuler",
    close: "Fermer",
    back: "Retour",
    loading: "Chargement...",
    allRights: "Tous droits réservés",
    officeSpaces: "Espaces professionnels",
    officeType: "Type d'espace",
    privateOffice: "Bureau indépendant",
    coworking: "Espace coworking",
    meetingRoom: "Salle de réunion",
    companyHeadquarters: "Siège d'entreprise",
    rentalType: "Type de location",
    daily: "Journalier",
    monthly: "Mensuel",
    yearly: "Annuel",
    amenities: "Équipements et services",
    fiber: "Internet Fiber Optic",
    airConditioning: "Climatisation",
    reception: "Accueil",
    parking: "Parking",
    security: "Sécurité",
    all: "Tous",
    resultsFound: "offre(s) disponible(s)",
    officeOnly: "Bureaux uniquement",
    allSectors: "Tous les secteurs",
    detailsAndBooking: "Détails et réservation",
    resetFilters: "Réinitialiser",
    advancedFilters: "Filtres avancés",
    naturalSearch: "Recherche intelligente en langage naturel",
    searchPlaceholder: "Recherchez ce dont vous avez besoin...",
    sector: "Secteur",
    carsOnly: "Voitures uniquement",
    propertiesOnly: "Biens uniquement",
    maxPrice: "Prix maximum",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "ar";
    return window.localStorage.getItem("b2rent-language") === "fr" ? "fr" : "ar";
  });

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem("b2rent-language", nextLanguage);
  };

  const direction: "rtl" | "ltr" = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    document.body.dir = direction;
  }, [direction, language]);

  const value = useMemo(() => ({
    language,
    direction,
    setLanguage,
    t: (key: string) => translations[language][key] ?? translations.ar[key] ?? key,
  }), [direction, language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}
