import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'ar' | 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    home: 'الرئيسية',
    search: 'تصفح السيارات والعقارات',
    admin: 'لوحة الإدارة الشاملة',
    dashboard: 'لوحة الوكالة',
    addCar: 'إضافة سيارة',
    myBookings: 'حجوزاتي',
    favorites: 'المفضلة',
    profile: 'الملف الشخصي',
    help: 'الدعم والمساعدة',
    about: 'عن المنصة',
    heroTitle: 'بوابتك الموثوقة لحجز السيارات والعقارات بكل أمان',
    heroSubtitle: 'منصة B2-Rent منصة وسيطة ذكية تربتك بأرقى شركات كراء السيارات والوكالات العقارية المستقلة عبر المدن المغربية، مع عقود رقمية وتوقيع إلكتروني فوري.',
    aiSearchPlaceholder: 'مثال: أريد سيارة دفع رباعي في أغادير أو شقة فخمة بمراكش مع مسبح...',
    searchNow: 'ابحث الآن',
    cmiPayment: 'الدفع الإلكتروني عبر CMI',
    whatsappNotification: 'إرسال إشعار WhatsApp فوراً',
  },
  fr: {
    home: 'Accueil',
    search: 'Parcourir',
    admin: 'Administration',
    dashboard: 'Tableau de Bord',
    addCar: 'Ajouter un Véhicule',
    myBookings: 'Mes Réservations',
    favorites: 'Favoris',
    profile: 'Profil',
    help: 'Aide & Support',
    about: 'À Propos',
    heroTitle: 'Votre passerelle de confiance pour la location de voitures et immobilière au Maroc',
    heroSubtitle: 'B2-Rent connecte les agences indépendantes et les clients avec des contrats numériques et une signature électronique instantanée.',
    aiSearchPlaceholder: 'Ex: Je veux un SUV à Agadir ou un appartement de luxe à Marrakech...',
    searchNow: 'Rechercher',
    cmiPayment: 'Paiement Sécurisé CMI',
    whatsappNotification: 'Notification WhatsApp instantanée',
  },
  en: {
    home: 'Home',
    search: 'Browse Listings',
    admin: 'Super Admin',
    dashboard: 'Agency Dashboard',
    addCar: 'Add Listing',
    myBookings: 'My Bookings',
    favorites: 'Favorites',
    profile: 'Profile',
    help: 'Help & Support',
    about: 'About Us',
    heroTitle: 'Your Trusted Gateway for Car & Real Estate Rentals in Morocco',
    heroSubtitle: 'B2-Rent connects independent car rental and real estate agencies with clients, featuring digital contracts and instant e-signatures.',
    aiSearchPlaceholder: 'Example: I want an SUV in Agadir or a luxury apartment in Marrakech...',
    searchNow: 'Search Now',
    cmiPayment: 'Secure CMI Payment',
    whatsappNotification: 'Instant WhatsApp Notification',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');

  const t = (key: string): string => {
    return translations[language][key] || translations['ar'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
