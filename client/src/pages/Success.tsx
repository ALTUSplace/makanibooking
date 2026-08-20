import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Phone, Home, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

export default function Success() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);

  const bookingRef = 'B2R-' + Math.floor(1000 + Math.random() * 9000);
  const name = searchParams.get('name') || 'يوسف العلوي';
  const phone = searchParams.get('phone') || '+212 661 112 233';
  const total = searchParams.get('total') || '9000';
  const days = searchParams.get('days') || '5';
  const start = searchParams.get('start') || '2026-08-15';
  const end = searchParams.get('end') || '2026-08-20';

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("B2-RENT - Digital Rental Contract", 105, 20, { align: "center" });
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Official Car Rental Agreement in Morocco", 105, 28, { align: "center" });
      
      doc.line(20, 35, 190, 35);

      doc.setFont("helvetica", "bold");
      doc.text("Contract Reference:", 20, 48);
      doc.setFont("helvetica", "normal");
      doc.text(bookingRef, 70, 48);

      doc.setFont("helvetica", "bold");
      doc.text("Customer Name:", 20, 58);
      doc.setFont("helvetica", "normal");
      doc.text(name, 70, 58);

      doc.setFont("helvetica", "bold");
      doc.text("Phone Number:", 20, 68);
      doc.setFont("helvetica", "normal");
      doc.text(phone, 70, 68);

      doc.setFont("helvetica", "bold");
      doc.text("Rental Period:", 20, 78);
      doc.setFont("helvetica", "normal");
      doc.text(`${start} to ${end} (${days} Days)`, 70, 78);

      doc.setFont("helvetica", "bold");
      doc.text("Total Amount:", 20, 88);
      doc.setFont("helvetica", "normal");
      doc.text(`${total} MAD (Cash or Card at pickup)`, 70, 88);

      doc.line(20, 100, 190, 100);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Terms & Conditions Summary:", 20, 115);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const terms = [
        "1. Driver must hold a valid driver's license for at least 2 years.",
        "2. Fuel policy: Return with the same fuel level as received.",
        "3. Comprehensive insurance covers all authorized drivers as per contract.",
        "4. Free cancellation up to 24 hours before pickup time.",
        "5. For assistance, contact the agency WhatsApp directly."
      ];
      
      let y = 125;
      terms.forEach(term => {
        doc.text(term, 20, y);
        y += 8;
      });

      doc.setFont("helvetica", "bold");
      doc.text("Agency Stamp & Signature", 30, 185);
      doc.text("Customer Signature", 140, 185);

      doc.save(`B2-Rent-Contract-${bookingRef}.pdf`);
      toast.success('تم تحميل عقد الإيجار الرقمي بصيغة PDF بنجاح!');
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء توليد ملف PDF');
    }
  };

  const whatsappMessage = encodeURIComponent(
    `مرحباً، لقد قمت بحجز سيارة عبر منصة B2-Rent.\nرقم الحجز: ${bookingRef}\nالاسم: ${name}\nالهاتف: ${phone}\nمن تاريخ ${start} إلى ${end} (${days} أيام)\nالمجموع: ${total} درهم.`
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-16 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-2xl text-center space-y-8">
        <div className="bg-slate-950 border border-slate-800 p-10 rounded-3xl shadow-2xl space-y-6">
          <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">تم الحجز بنجاح 🚀</span>
            <h1 className="text-3xl font-extrabold text-white">شكراً لك، {name}!</h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              تم تسطير حجزك بنجاح في نظام B2-Rent. رقم مرجع الحجز الخاص بك هو <span className="text-amber-400 font-bold">{bookingRef}</span>
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-right space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">الرقم المرجعي:</span>
              <span className="font-bold text-white">{bookingRef}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">فترة الإيجار:</span>
              <span className="font-bold text-white">{start} إلى {end} ({days} أيام)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">المبلغ الإجمالي:</span>
              <span className="font-bold text-amber-400">{total} درهم</span>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <Button
              onClick={handleDownloadPDF}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Download className="w-5 h-5" />
              <span>تحميل عقد الإيجار الرقمي (PDF)</span>
            </Button>

            <a
              href={`https://wa.me/212661234567?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-900/30 transition-all text-base"
            >
              <Phone className="w-5 h-5" />
              <span>تأكيد الحجز الفوري عبر واتساب الوكالة</span>
            </a>

            <Button
              onClick={() => setLocation('/')}
              variant="outline"
              className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>العودة إلى الصفحة الرئيسية</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
