export interface Review {
  id: string;
  userName: string;
  rating?: number;
  comment: string;
  date: string;
  verifiedBooking: boolean;
}

export interface Agency {
  id: string;
  name: string;
  city: string;
  rating?: number;
  reviewsCount?: number;
  phone: string;
  whatsapp: string;
  address: string;
  verified: boolean;
  carCount: number;
  email?: string;
}

export interface Car {
  id: string;
  name: string;
  brand: string;
  category: 'suv' | 'luxury' | 'sedan' | 'economic';
  city: string;
  cityName: string;
  pricePerDay: number;
  rating?: number;
  reviewsCount?: number;
  transmission: 'أوتوماتيك' | 'عادي';
  fuel: 'ديزل' | 'بنزين' | 'هجين';
  seats: number;
  image: string;
  agencyId: string;
  agency: Agency;
  features: string[];
  reviews?: Review[];
  available?: boolean;
}

export const CITIES = [
  { id: 'all', name: 'جميع المدن المغربية' },
  { id: 'marrakech', name: 'مراكش (المطار والمدينة)' },
  { id: 'casablanca', name: 'الدار البيضاء (محمد الخامس)' },
  { id: 'agadir', name: 'أغادير (المسيرة)' },
  { id: 'tangier', name: 'طنجة (ابن بطوطة)' },
  { id: 'rabat', name: 'الرباط (سلا)' },
];

export const CAR_CATEGORIES = [
  { id: 'all', name: 'جميع الفئات' },
  { id: 'suv', name: 'دفع رباعي (SUV)' },
  { id: 'luxury', name: 'سيارات فاخرة (Luxury)' },
  { id: 'sedan', name: 'سيارات عائلية (Sedan)' },
  { id: 'economic', name: 'سيارات اقتصادية (Economic)' },
];

export const AGENCIES: Agency[] = [
  {
    id: 'agency-1',
    name: 'Atlas Car Marrakesh',
    city: 'marrakech',
    phone: '',
    whatsapp: '',
    address: 'شارع محمد السادس، مراكش',
    verified: true,
    carCount: 12,
    email: 'b2rentt@gmail.com'
  },
  {
    id: 'agency-2',
    name: 'Casablanca Prestige Rent',
    city: 'casablanca',
    phone: '',
    whatsapp: '',
    address: 'المعاريف، الدار البيضاء',
    verified: true,
    carCount: 18,
    email: 'b2rentt@gmail.com'
  },
  {
    id: 'agency-3',
    name: 'Souss Car Agadir',
    city: 'agadir',
    phone: '',
    whatsapp: '',
    address: 'شارع الحسن الثاني، أغادير',
    verified: true,
    carCount: 9,
    email: 'b2rentt@gmail.com'
  },
  {
    id: 'agency-4',
    name: 'Boughaz Express Tangier',
    city: 'tangier',
    phone: '',
    whatsapp: '',
    address: 'طريق المطار، طنجة',
    verified: true,
    carCount: 14,
    email: 'b2rentt@gmail.com'
  }
];

export const MOCK_CITIES_IMAGES = [
  {
    id: 'marrakech',
    name: 'مراكش الحمراء',
    carCount: 45,
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
    desc: 'استلم سيارتك مباشرة في مطار مراكش المنارة واستمتع بمدينة السحر.'
  },
  {
    id: 'casablanca',
    name: 'الدار البيضاء العاصمة الاقتصادية',
    carCount: 62,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    desc: 'أسطول فاخر واقتصادي في مطار محمد الخامس وقلب المدينة.'
  },
  {
    id: 'agadir',
    name: 'أغادير لؤلؤة الأطلس',
    carCount: 34,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    desc: 'استمتع بشواطئ أغادير الساحرة بسيارة مجهزة ومريحة.'
  },
  {
    id: 'tangier',
    name: 'طنجة بوابة إفريقيا',
    carCount: 40,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    desc: 'توصيل مجاني في مطار طنجة ابن بطوطة ومحطة القطار السريع.'
  }
];

export const MOCK_CARS: Car[] = [
  {
    id: 'car-1',
    name: 'Dacia Duster 2024 الجديدة',
    brand: 'Dacia',
    category: 'suv',
    city: 'marrakech',
    cityName: 'مراكش',
    pricePerDay: 350,
    transmission: 'عادي',
    fuel: 'ديزل',
    seats: 5,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80',
    agencyId: 'agency-1',
    agency: AGENCIES[0],
    features: ['تكييف هيرماتيك', 'شاشة تعمل باللمس 8 بوصة', 'كاميرا خلفية', 'حساسات ركن', 'اقتصادية جداً للوقود'],
    available: true,
  },
  {
    id: 'car-2',
    name: 'Hyundai Accent الكورية',
    brand: 'Hyundai',
    category: 'economic',
    city: 'casablanca',
    cityName: 'الدار البيضاء',
    pricePerDay: 300,
    transmission: 'أوتوماتيك',
    fuel: 'بنزين',
    seats: 5,
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80',
    agencyId: 'agency-2',
    agency: AGENCIES[1],
    features: ['ناقل حركة أوتوماتيك سلس', 'مكيف هواء ممتاز', 'بلوتوث ومنفذ USB', 'صندوق أمتعة واسع'],
    available: true,
  },
  {
    id: 'car-3',
    name: 'Range Rover Evoque الفاخرة',
    brand: 'Land Rover',
    category: 'luxury',
    city: 'casablanca',
    cityName: 'الدار البيضاء',
    pricePerDay: 1400,
    transmission: 'أوتوماتيك',
    fuel: 'ديزل',
    seats: 5,
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80',
    agencyId: 'agency-2',
    agency: AGENCIES[1],
    features: ['سقف بانورامي واسع', 'فرش جلد فاخر', 'نظام صوتي Meridian فاخر', 'دفع رباعي دائم'],
    available: true,
  },
  {
    id: 'car-4',
    name: 'Renault Clio 5 الجديدة',
    brand: 'Renault',
    category: 'economic',
    city: 'agadir',
    cityName: 'أغادير',
    pricePerDay: 280,
    transmission: 'عادي',
    fuel: 'ديزل',
    seats: 5,
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1000&q=80',
    agencyId: 'agency-3',
    agency: AGENCIES[2],
    features: ['استهلاك اقتصادي ممتاز', 'تحكم في المقود', 'مثبت ومحدد السرعة', 'أضواء LED متطورة'],
    available: true,
  },
  {
    id: 'car-5',
    name: 'Peugeot 3008 SUV',
    brand: 'Peugeot',
    category: 'suv',
    city: 'tangier',
    cityName: 'طنجة',
    pricePerDay: 600,
    transmission: 'أوتوماتيك',
    fuel: 'ديزل',
    seats: 5,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80',
    agencyId: 'agency-4',
    agency: AGENCIES[3],
    features: ['مقصورة قيادة رقمية i-Cockpit', 'كاميرا رؤية محيطية 360', 'فتحة سقف كهربائية', 'مساعد القيادة الذكية'],
    available: true,
  },
  {
    id: 'car-6',
    name: 'Mercedes-Benz C-Class',
    brand: 'Mercedes',
    category: 'luxury',
    city: 'marrakech',
    cityName: 'مراكش',
    pricePerDay: 1200,
    transmission: 'أوتوماتيك',
    fuel: 'بنزين',
    seats: 5,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
    agencyId: 'agency-1',
    agency: AGENCIES[0],
    features: ['إضاءة محيطية متعددة الألوان', 'شاشة عرض مركزية ذكية', 'مقاعد كهربائية بالكامل', 'نظام تعليق مريح'],
    available: true,
  }
];

export interface Booking {
  id: string;
  carId: string;
  carName: string;
  carImage: string;
  city: string;
  startDate: string;
  endDate: string;
  days: number;
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status: 'confirmed' | 'pending' | 'completed' | 'rejected';
  createdAt: string;
}

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'B2R-8841',
    carId: 'car-1',
    carName: 'Dacia Duster 2024 الجديدة',
    carImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    city: 'مراكش',
    startDate: '2026-08-15',
    endDate: '2026-08-20',
    days: 5,
    totalPrice: 1750,
    customerName: 'يوسف العلوي',
    customerPhone: '+212 661 112 233',
    customerEmail: 'youssef@example.ma',
    status: 'confirmed',
    createdAt: '2026-08-08',
  },
  {
    id: 'B2R-8842',
    carId: 'car-2',
    carName: 'Hyundai Accent الكورية',
    carImage: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80',
    city: 'الدار البيضاء',
    startDate: '2026-08-18',
    endDate: '2026-08-25',
    days: 7,
    totalPrice: 2100,
    customerName: 'سارة ابناني',
    customerPhone: '+212 662 334 455',
    customerEmail: 'sara@example.ma',
    status: 'pending',
    createdAt: '2026-08-08',
  }
];
