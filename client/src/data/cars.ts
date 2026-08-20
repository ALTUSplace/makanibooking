export interface Car {
  id: string;
  name: string;
  brand: string;
  category: 'luxury' | 'suv' | 'sedan' | 'economy';
  pricePerDay: number;
  city: 'agadir' | 'marrakech' | 'casablanca' | 'tangier' | 'rabat';
  cityName: string;
  image: string;
  transmission: 'أوتوماتيك' | 'عادي';
  fuel: 'ديزل' | 'بنزين' | 'هجين';
  seats: number;
  doors: number;
  bags: number;
  rating: number;
  reviewsCount: number;
  agency: {
    name: string;
    phone: string;
    whatsapp: string;
    verified: boolean;
    rating: number;
  };
  features: string[];
  description: string;
  available: boolean;
}

export const CITIES = [
  { id: 'all', name: 'جميع المدن المغربية' },
  { id: 'agadir', name: 'أغادير' },
  { id: 'marrakech', name: 'مراكش' },
  { id: 'casablanca', name: 'الدار البيضاء' },
  { id: 'tangier', name: 'طنجة' },
  { id: 'rabat', name: 'الرباط' },
];

export const CAR_CATEGORIES = [
  { id: 'all', name: 'جميع الفئات' },
  { id: 'luxury', name: 'فاخرة (Luxury)' },
  { id: 'suv', name: 'دفع رباعي (SUV)' },
  { id: 'sedan', name: 'سيدان عائلية' },
  { id: 'economy', name: 'اقتصادية' },
];

export const MOCK_CARS: Car[] = [
  {
    id: 'car-1',
    name: 'Range Rover Velar Autobiography',
    brand: 'Land Rover',
    category: 'luxury',
    pricePerDay: 1800,
    city: 'marrakech',
    cityName: 'مراكش',
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
    transmission: 'أوتوماتيك',
    fuel: 'ديزل',
    seats: 5,
    doors: 4,
    bags: 3,
    rating: 4.9,
    reviewsCount: 38,
    agency: {
      name: 'Atlas Luxury Cars Marrakech',
      phone: '+212 661 234 567',
      whatsapp: '+212661234567',
      verified: true,
      rating: 4.9,
    },
    features: ['سقف بانورامي', 'تكييف رقمي ثلاثي المناطق', 'جلد نابا فاخر', 'كاميرا 360 درجة', 'نظام صوتي Meridian'],
    description: 'استمتع بأفخم سيارات الدفع الرباعي في مراكش. سيارة تجمع بين الأداء الرياضي الفائق والفخامة المطلقة لتجربة استثنائية في المدينة الحمراء.',
    available: true,
  },
  {
    id: 'car-2',
    name: 'Mercedes-Benz C-Class AMG Line',
    brand: 'Mercedes',
    category: 'luxury',
    pricePerDay: 1200,
    city: 'casablanca',
    cityName: 'الدار البيضاء',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
    transmission: 'أوتوماتيك',
    fuel: 'ديزل',
    seats: 5,
    doors: 4,
    bags: 2,
    rating: 4.8,
    reviewsCount: 45,
    agency: {
      name: 'Casablanca Prestige Rent',
      phone: '+212 662 345 678',
      whatsapp: '+212662345678',
      verified: true,
      rating: 4.8,
    },
    features: ['باقة AMG الرياضية', 'إضاءة محيطية 64 لون', 'شاشة تحكم مركزية ذكية', 'نظام مساعدة القيادة'],
    description: 'سيارة السيدان الأكثر طلباً في الدار البيضاء، مثالية لرجال الأعمال والرحلات الرسمية بفضل هيبة التصميم وانسيابية القيادة.',
    available: true,
  },
  {
    id: 'car-3',
    name: 'Dacia Duster Comfort (New Gen)',
    brand: 'Dacia',
    category: 'suv',
    pricePerDay: 350,
    city: 'agadir',
    cityName: 'أغادير',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    transmission: 'عادي',
    fuel: 'ديزل',
    seats: 5,
    doors: 5,
    bags: 4,
    rating: 4.7,
    reviewsCount: 92,
    agency: {
      name: 'Souss Car Hire Agadir',
      phone: '+212 663 456 789',
      whatsapp: '+212663456789',
      verified: true,
      rating: 4.7,
    },
    features: ['اقتصادية جداً في الوقود', 'تكييف هواء', 'شاشة لمس مع Apple CarPlay', 'مساحة تخزين واسعة'],
    description: 'السيارة المفضلة لاكتشاف شواطئ أغادير وجبال سوس ماسة. اقتصادية، مريحة، وتتحمل كافة الطرقات بكفاءة عالية.',
    available: true,
  },
  {
    id: 'car-4',
    name: 'Volkswagen Golf 8 GTD',
    brand: 'Volkswagen',
    category: 'sedan',
    pricePerDay: 650,
    city: 'tangier',
    cityName: 'طنجة',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    transmission: 'أوتوماتيك',
    fuel: 'ديزل',
    seats: 5,
    doors: 5,
    bags: 2,
    rating: 4.9,
    reviewsCount: 64,
    agency: {
      name: 'Strait Auto Tangier',
      phone: '+212 664 567 890',
      whatsapp: '+212664567890',
      verified: true,
      rating: 4.9,
    },
    features: ['محرك ديزل قوي', 'تحكم رقمي بالكامل', 'مقاعد رياضية مدفأة', 'حساسات وقوف متقدمة'],
    description: 'انطلق في عروس الشمال طنجة بسيارة فولكس فويجن جولف 8 الأنيقة. أداء رياضي وثبات مذهل على طريق العرائش وتطوان.',
    available: true,
  },
  {
    id: 'car-5',
    name: 'Hyundai Accent CRDi',
    brand: 'Hyundai',
    category: 'economy',
    pricePerDay: 280,
    city: 'rabat',
    cityName: 'الرباط',
    image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80',
    transmission: 'عادي',
    fuel: 'ديزل',
    seats: 5,
    doors: 4,
    bags: 2,
    rating: 4.6,
    reviewsCount: 78,
    agency: {
      name: 'Capital Rent Rabat',
      phone: '+212 665 678 901',
      whatsapp: '+212665678901',
      verified: true,
      rating: 4.6,
    },
    features: ['استهلاك منخفض جداً', 'صندوق ترانك واسع', 'بلوتوث ومثبت سرعت', 'مكيف هواء قوي'],
    description: 'الخيار الاقتصادي الأول للتنقل في العاصمة الرباط وضواحيها. عملية، سهلة الركن، واعتمادية تماماً.',
    available: true,
  },
  {
    id: 'car-6',
    name: 'Range Rover Sport HSE',
    brand: 'Land Rover',
    category: 'suv',
    pricePerDay: 1600,
    city: 'agadir',
    cityName: 'أغادير',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
    transmission: 'أوتوماتيك',
    fuel: 'ديزل',
    seats: 5,
    doors: 4,
    bags: 4,
    rating: 4.9,
    reviewsCount: 51,
    agency: {
      name: 'Souss Car Hire Agadir',
      phone: '+212 663 456 789',
      whatsapp: '+212663456789',
      verified: true,
      rating: 4.9,
    },
    features: ['دفع رباعي ذكي', 'نظام تعليق هوائي قابل للتعديل', 'شاشات خلفية', 'سقف بانورامي كلي'],
    description: 'رفاهية لا تقارن في شواطئ أغادير الساحرة. سيارة قوية تفرض حضورها في كل مكان.',
    available: true,
  },
  {
    id: 'car-7',
    name: 'BMW X5 xDrive30d',
    brand: 'BMW',
    category: 'suv',
    pricePerDay: 1500,
    city: 'marrakech',
    cityName: 'مراكش',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    transmission: 'أوتوماتيك',
    fuel: 'ديزل',
    seats: 5,
    doors: 4,
    bags: 3,
    rating: 4.8,
    reviewsCount: 42,
    agency: {
      name: 'Atlas Luxury Cars Marrakech',
      phone: '+212 661 234 567',
      whatsapp: '+212661234567',
      verified: true,
      rating: 4.8,
    },
    features: ['مقصورة فخمة', 'إضاءة ليزرية', 'نظام تعليق متكيف', 'حزمة المساعدة في القيادة'],
    description: 'سيارة BMW X5 تجمع بين القوة الألمانية والرفاهية المذهلة، مثالية لرحلات مراكش ونتعلقاتها السياحية.',
    available: true,
  },
  {
    id: 'car-8',
    name: 'Peugeot 208 Allure',
    brand: 'Peugeot',
    category: 'economy',
    pricePerDay: 300,
    city: 'casablanca',
    cityName: 'الدار البيضاء',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    transmission: 'عادي',
    fuel: 'ديزل',
    seats: 5,
    doors: 5,
    bags: 2,
    rating: 4.7,
    reviewsCount: 85,
    agency: {
      name: 'Casablanca Prestige Rent',
      phone: '+212 662 345 678',
      whatsapp: '+212662345678',
      verified: true,
      rating: 4.7,
    },
    features: ['تصميم فرنسي عصري', 'شاشة عرض رقمية 3D', 'حساسات خلفية وكاميرا', 'استهلاك اقتصادي ممتاز'],
    description: 'سيارة هاتشباك شبابية وأنيقة للتنقل السريع في شوارع الدار البيضاء المزدحمة بكل مرونة وسهولة.',
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
  status: 'confirmed' | 'pending' | 'completed';
  createdAt: string;
}

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'B2R-8841',
    carId: 'car-1',
    carName: 'Range Rover Velar Autobiography',
    carImage: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80',
    city: 'مراكش',
    startDate: '2026-08-15',
    endDate: '2026-08-20',
    days: 5,
    totalPrice: 9000,
    customerName: 'يوسف العلوي',
    customerPhone: '+212 661 112 233',
    customerEmail: 'youssef@example.ma',
    status: 'confirmed',
    createdAt: '2026-08-08',
  },
  {
    id: 'B2R-8842',
    carId: 'car-3',
    carName: 'Dacia Duster Comfort (New Gen)',
    carImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    city: 'أغادير',
    startDate: '2026-08-18',
    endDate: '2026-08-25',
    days: 7,
    totalPrice: 2450,
    customerName: 'سارة ابناني',
    customerPhone: '+212 662 334 455',
    customerEmail: 'sara@example.ma',
    status: 'pending',
    createdAt: '2026-08-08',
  }
];
