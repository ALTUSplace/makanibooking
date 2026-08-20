import { Link } from 'wouter';
import { Car, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold tracking-wider text-white">
                <span>B2</span>
                <span className="text-amber-400">-</span>
                <span>RENT</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              المنصة المغربية الرائدة لتأجير السيارات الفاخرة والاقتصادية. نربطك بأفضل الوكالات المعتمدة في أغادير، مراكش، الدار البيضاء، وطنجة.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-amber-400">
                <ShieldCheck className="w-4 h-4" />
                <span>وكالات معتمدة 100%</span>
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
                <Link href="/dashboard" className="hover:text-amber-400 transition-colors">لوحة تحكم الوكالة</Link>
              </li>
              <li>
                <Link href="/add-car" className="hover:text-amber-400 transition-colors">إضافة سيارة للوكالة</Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-amber-400 transition-colors">مركز المساعدة والأسئلة الشائعة</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4 border-l-2 border-amber-500 pl-3">المدن الرئيسية</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/search?city=agadir" className="hover:text-amber-400 transition-colors">تأجير السيارات في أغادير</Link></li>
              <li><Link href="/search?city=marrakech" className="hover:text-amber-400 transition-colors">تأجير السيارات في مراكش</Link></li>
              <li><Link href="/search?city=casablanca" className="hover:text-amber-400 transition-colors">تأجير السيارات في الدار البيضاء</Link></li>
              <li><Link href="/search?city=tangier" className="hover:text-amber-400 transition-colors">تأجير السيارات في طنجة</Link></li>
              <li><Link href="/search?city=rabat" className="hover:text-amber-400 transition-colors">تأجير السيارات في الرباط</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4 border-l-2 border-amber-500 pl-3">تواصل معنا</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span>شارع محمد الخامس، إقامة النخيل، الدار البيضاء، المغرب</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-500 shrink-0" />
                <span dir="ltr">+212 661 234 567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-amber-500 shrink-0" />
                <span>contact@b2-rent.ma</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 B2-Rent. جميع الحقوق محفوظة. منصة تأجير السيارات الأولى في المغرب.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-amber-400 transition-colors">الشروط والأحكام</Link>
            <Link href="/privacy" className="hover:text-amber-400 transition-colors">سياسة الخصوصية</Link>
            <Link href="/about" className="hover:text-amber-400 transition-colors">من نحن</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
