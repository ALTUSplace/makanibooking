import { Link } from 'wouter';
import { Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <div className="h-16 w-40 overflow-hidden flex items-center">
              <img src="/manus-storage/35942_9a6ce071.png" alt="B2-Rent Logo" className="h-full w-full object-contain" />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              منصة B2-Rent الاحترافية لتأجير السيارات في المغرب. نربطك بأرقى الوكالات المستقلة المعتمدة مع توفير عقود رقمية وتوقيع إلكتروني فوري.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-amber-400">
                <ShieldCheck className="w-4 h-4" />
                <span>وكالات معتمدة وموثوقة</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4 border-l-2 border-amber-500 pl-3">روابط سريعة</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">الصفحة الرئيسية</Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-amber-400 transition-colors">تصفح أسطول السيارات</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-amber-400 transition-colors">لوحة تحكم الوكالة المستقلة</Link>
              </li>
              <li>
                <Link href="/add-car" className="hover:text-amber-400 transition-colors">إضافة سيارة للوكالة</Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-amber-400 transition-colors">الدعم وخدمة العملاء</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4 border-l-2 border-amber-500 pl-3">المدن الرئيسية</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/search?city=أغادير" className="hover:text-amber-400 transition-colors">تأجير السيارات في أغادير</Link></li>
              <li><Link href="/search?city=مراكش" className="hover:text-amber-400 transition-colors">تأجير السيارات في مراكش</Link></li>
              <li><Link href="/search?city=الدار البيضاء" className="hover:text-amber-400 transition-colors">تأجير السيارات في الدار البيضاء</Link></li>
              <li><Link href="/search?city=طنجة" className="hover:text-amber-400 transition-colors">تأجير السيارات في طنجة</Link></li>
              <li><Link href="/search?city=الرباط" className="hover:text-amber-400 transition-colors">تأجير السيارات في الرباط</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4 border-l-2 border-amber-500 pl-3">الدعم الرسمي</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-500 shrink-0" />
                <a href="tel:0754382654" className="hover:text-amber-400 transition-colors font-bold">0754382654</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-amber-500 shrink-0" />
                <a href="mailto:b2rentt@gmail.com" className="hover:text-amber-400 transition-colors">b2rentt@gmail.com</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span>المغرب - الدار البيضاء، مراكش، أغادير، طنجة</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 B2-Rent. جميع الحقوق محفوظة. منصة تأجير السيارات الأولى في المغرب.</p>
          <div className="flex items-center gap-6">
            <Link href="/help" className="hover:text-amber-400 transition-colors">شروط الاستخدام</Link>
            <Link href="/help" className="hover:text-amber-400 transition-colors">سياسة الخصوصية</Link>
            <Link href="/help" className="hover:text-amber-400 transition-colors">الدعم الفني</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
