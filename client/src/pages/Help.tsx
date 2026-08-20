import { useState } from 'react';
import { HelpCircle, ChevronDown, Phone, Mail, ShieldCheck } from 'lucide-react';

export default function Help() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'ما هي الشروط المطلوبة لتأجير سيارة في المغرب عبر المنصة؟',
      a: 'يجب أن يتوفر المستأجر على رخصة قيادة سارية المفعول (مغربية أو دولية)، وأن يكون بلغ سن 21 سنة على الأقل (أو 25 سنة لبعض السيارات الفاخرة)، مع بطاقة الوطنية أو جواز السفر.',
    },
    {
      q: 'كيف يتم تأكيد الحجز والدفع؟',
      a: 'بعد اختيار السيارة وتحديد تواريخ الاستلام والتسليم، يمكنك إرسال تفاصيل الحجز مباشرة إلى الوكالة عبر واتساب أو اختيار الدفع عند الاستلام نقداً أو بالبطاقة.',
    },
    {
      q: 'هل يشمل السعر التأمين على السيارة؟',
      a: 'نعم، جميع السيارات المدرجة في المنصة تشمل تأميناً أساسياً ضد الغير. يمكنك إضافة تأمين شامل ممتاز أثناء إتمام عملية الحجز لحماية إضافية.',
    },
    {
      q: 'هل يمكنني استلام السيارة من مطار أغادير أو مراكش أو الدار البيضاء؟',
      a: 'بالتأكيد! توفر وكالاتنا خدمة التوصيل والاستلام المجاني أو المدفوع مباشرة عند بوابة الوصول في جميع مطارات المغرب الرئيسية والفنادق.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 mx-auto">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">مركز المساعدة والأسئلة الشائعة</h1>
          <p className="text-slate-400 text-sm">كل ما تحتاج معرفته حول تأجير السيارات عبر منصة B2-Rent في المغرب</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-right font-bold text-white hover:text-amber-400 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${openIndex === idx ? 'rotate-180 text-amber-400' : 'text-slate-500'}`} />
              </button>
              {openIndex === idx && (
                <div className="px-6 pb-6 text-slate-300 text-sm leading-relaxed border-t border-slate-900 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl text-center space-y-4 shadow-xl mt-12">
          <h3 className="text-xl font-bold text-white">لم تجد إجابة لسؤالك؟</h3>
          <p className="text-slate-400 text-sm">فريق الدعم في خدمتك على مدار الساعة طوال أيام الأسبوع.</p>
          <a
            href="https://wa.me/212661234567"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/30 transition-all text-sm"
          >
            <Phone className="w-4 h-4" />
            <span>تواصل معنا عبر واتساب الفوري</span>
          </a>
        </div>
      </div>
    </div>
  );
}
