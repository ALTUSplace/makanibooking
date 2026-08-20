import { Link } from 'wouter';
import { Phone, Mail, MapPin, ShieldCheck, ChevronLeft } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800 relative overflow-hidden" dir="rtl">
      {/* تأثير إضاءة خلفية خفيفة */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          <div className="space-y-4">
            <div className="h-16 w-40 overflow-hidden flex items-center transition-transform duration-300 hover:scale-105">
              <img src="/manus-storage/35942_9a6ce071.png" alt="B2-Rent Logo" className="h-full w-full object-contain" />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              منصة B2-Rent الاحترافية لتأجير السيارات والعقارات في المغرب. نربطك بأرقى الوكالات المستقلة المعتمدة مع توفير عقود رقمية وتوقيع إلكتروني فوري.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-amber-400 shadow-lg shadow-amber-500/5">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>وكالات معتمدة وموثوقة</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4 border-l-2 border-amber-500 pl-3">روابط سريعة</h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/', label: 'الصفحة الرئيسية' },
                { href: '/search', label: 'تصفح أسطول السيارات' },
                { href: '/dashboard', label: 'لوحة تحكم الوكالة المستقلة' },
                { href: '/add-car', label: 'إضافة سيارة للوكالة' },
                { href: '/help', label: 'الدعم وخدمة العملاء' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-all duration-300 transform hover:translate-x-[-6px]"
                  >
                    <ChevronLeft className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="group-hover:font-bold">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4 border-l-2 border-amber-500 pl-3">المدن الرئيسية</h3>
            <ul className="space-y-3 text-sm">
              {[
                { city: 'أغادير', label: 'تأجير السيارات في أغادير' },
                { city: 'مراكش', label: 'تأجير السيارات في مراكش' },
                { city: 'الدار البيضاء', label: 'تأجير السيارات في الدار البيضاء' },
                { city: 'طنجة', label: 'تأجير السيارات في طنجة' },
                { city: 'الرباط', label: 'تأجير السيارات في الرباط' },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={`/search?city=${encodeURIComponent(item.city)}`}
                    className="group flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-all duration-300 transform hover:translate-x-[-6px]"
                  >
                    <MapPin className="w-4 h-4 text-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                    <span className="group-hover:font-bold">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4 border-l-2 border-amber-500 pl-3">الدعم الرسمي</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-300 shadow">
                  <Mail className="w-4 h-4" />
                </div>
                <a href="mailto:b2rentt@gmail.com" className="text-slate-300 group-hover:text-amber-400 transition-colors font-bold">b2rentt@gmail.com</a>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-500 shrink-0 mt-0.5 shadow">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-slate-400 text-xs leading-relaxed pt-1">المغرب - الدار البيضاء، مراكش، أغادير، طنجة، الرباط</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 B2-Rent. جميع الحقوق محفوظة. منصة تأجير السيارات والعقارات الأولى في المغرب.</p>
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
