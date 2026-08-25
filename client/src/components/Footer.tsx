import { Link } from 'wouter';
import { Mail, MapPin, ShieldCheck, ChevronLeft } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[var(--brand-navy-deep)] bg-[var(--brand-navy-deep)] pb-12 pt-16 text-slate-200" dir="rtl">
      {/* تأثير إضاءة خلفية خفيفة */}
          <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[var(--brand-coral)]/15 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          <div className="space-y-4">
            <div className="inline-flex h-20 w-44 items-center justify-center rounded-2xl border border-white/20 bg-white px-3 shadow-sm transition-transform duration-300 hover:scale-105">
              <img
                src="/manus-storage/b2-rent-morocco-logo_ee8a6cb0.jpg"
                alt="B2-Rent Morocco"
                width={1664}
                height={928}
                className="h-16 w-full object-contain"
              />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              منصة B2-Rent الاحترافية لتأجير السيارات والعقارات في المغرب. نربطك بأرقى الوكالات المستقلة المعتمدة مع توفير عقود رقمية وتوقيع إلكتروني فوري.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-400 shadow-md">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>وكالات معتمدة وموثوقة 100%</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-4 border-l-2 border-amber-500 pl-3">روابط سريعة</h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/', label: 'الصفحة الرئيسية' },
                { href: '/search?type=car', label: 'تصفح أسطول السيارات' },
                { href: '/search?type=property', label: 'العقارات الفاخرة' },
                { href: '/host', label: 'لوحة تحكم المالك' },
                { href: '/add-car', label: 'إضافة إعلان جديد' },
                { href: '/support-tickets', label: 'الدعم وخدمة العملاء' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="group flex items-center gap-2.5 py-2 px-2 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 transition-all duration-300 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 text-amber-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-4 border-l-2 border-amber-500 pl-3">المدن الرئيسية</h3>
            <ul className="space-y-3 text-sm">
              {[
                { city: 'أغادير', label: 'تأجير في أغادير' },
                { city: 'مراكش', label: 'تأجير في مراكش' },
                { city: 'الدار البيضاء', label: 'تأجير في الدار البيضاء' },
                { city: 'طنجة', label: 'تأجير في طنجة' },
                { city: 'الرباط', label: 'تأجير في الرباط' },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={`/search?city=${encodeURIComponent(item.city)}`}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="group flex items-center gap-2.5 py-2 px-2 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 transition-all duration-300 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-4 border-l-2 border-amber-500 pl-3">الدعم الرسمي والاتصال</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shadow">
                  <Mail className="w-4 h-4" />
                </div>
                <a href="mailto:b2rentt@gmail.com" className="text-slate-200 hover:text-amber-400 transition-colors font-bold text-xs sm:text-sm">b2rentt@gmail.com</a>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0 shadow">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-slate-300 text-xs leading-relaxed pt-2">المغرب - الدار البيضاء، مراكش، أغادير، طنجة، الرباط</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-amber-500/30 bg-slate-800/70 p-5 text-xs leading-6 text-slate-300" role="note" aria-label="بنود حماية المنصة">
          <h3 className="mb-2 font-black text-amber-300">بنود حماية منصة B2-Rent</h3>
          <p>المنصة وسيط تقني وإعلاني فقط ولا تملك أو تدير السيارات أو العقارات. يتحمل الشريك مسؤولية الحالة الميكانيكية والسلامة والنظافة ومطابقة الأصل للوصف، وتخضع العلاقة النهائية للعقد المكتوب عند الاستلام. تظهر شروط الرسوم والإلغاء قبل الدفع، وتُراجع حالات إخلال الشريك عبر مركز النزاعات وفق القانون المغربي.</p>
          <Link href="/register" className="mt-2 inline-flex font-bold text-amber-300 hover:text-white">قراءة البنود والموافقة قبل التسجيل</Link>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 B2-Rent. جميع الحقوق محفوظة. منصة تأجير السيارات والعقارات الأولى في المغرب.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="py-1 transition-colors hover:text-amber-400">شروط الاستخدام</Link>
            <Link href="/privacy" className="py-1 transition-colors hover:text-amber-400">سياسة الخصوصية</Link>
            <Link href="/support-tickets" className="py-1 transition-colors hover:text-amber-400">الدعم الفني</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
