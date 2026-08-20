import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Phone, Home, Download, Edit3, Eraser, Check, Stamp } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { useRef, useState, useEffect } from 'react';

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

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [includeOfficialStamp, setIncludeOfficialStamp] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureDataUrl(canvas.toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    setSignatureDataUrl(null);
  };

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
      doc.text("Terms & Conditions Summary:", 20, 112);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const terms = [
        "1. Driver must hold a valid driver's license for at least 2 years.",
        "2. Fuel policy: Return with the same fuel level as received.",
        "3. Comprehensive insurance covers all authorized drivers as per contract.",
        "4. Free cancellation up to 24 hours before pickup time.",
        "5. For assistance, contact the agency WhatsApp directly."
      ];
      
      let y = 120;
      terms.forEach(term => {
        doc.text(term, 20, y);
        y += 7;
      });

      doc.setFont("helvetica", "bold");
      doc.text("Agency Stamp & Signature", 30, 175);
      doc.text("Customer Signature", 140, 175);

      if (includeOfficialStamp) {
        doc.setDrawColor(217, 119, 6);
        doc.setFillColor(254, 243, 199);
        doc.roundedRect(25, 180, 45, 25, 3, 3, 'FD');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(180, 83, 9);
        doc.text("B2-RENT OFFICIAL", 47, 188, { align: "center" });
        doc.text("VERIFIED AGENCY", 47, 195, { align: "center" });
        doc.text("MOROCCO", 47, 201, { align: "center" });
        doc.setTextColor(0, 0, 0);
      }

      if (signatureDataUrl) {
        doc.addImage(signatureDataUrl, 'PNG', 135, 180, 50, 20);
      } else {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.text("(Electronically Agreed)", 140, 190);
      }

      doc.save(`B2-Rent-Contract-${bookingRef}.pdf`);
      toast.success('تم تحميل عقد الإيجار الرقمي بنجاح!');
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error('حدث خطأ أثناء توليد ملف PDF. يرجى المحاولة مرة أخرى.');
    }
  };

  const whatsappMessage = encodeURIComponent(
    `مرحباً، لقد قمت بحجز سيارة عبر منصة B2-Rent وتوقيع العقد إلكترونياً مع الختم الرسمي.\nرقم الحجز: ${bookingRef}\nالاسم: ${name}\nالهاتف: ${phone}\nمن تاريخ ${start} إلى ${end} (${days} أيام)\nالمجموع: ${total} درهم.`
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4">
      <div className="container mx-auto px-4 max-w-2xl text-center space-y-8">
        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">تم الحجز بنجاح 🚀</span>
            <h1 className="text-2xl font-extrabold text-white">شكراً لك، {name}!</h1>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              رقم مرجع الحجز الخاص بك هو <span className="text-amber-400 font-bold">{bookingRef}</span>. يرجى توقيع العقد أدناه.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-right space-y-3 text-xs">
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

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Stamp className="w-5 h-5 text-amber-400" />
              <div className="text-right">
                <div className="text-xs font-bold text-white">إدراج الختم الرقمي الرسمي للوكالة</div>
                <div className="text-[10px] text-slate-400">يثبت المصداقية القانونية والاعتماد الرسمي للوكالة</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={includeOfficialStamp}
              onChange={(e) => setIncludeOfficialStamp(e.target.checked)}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 text-right">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-amber-400" /> التوقيع الإلكتروني (ارسم توقيعك في المربع أدناه):
              </label>
              {hasSigned && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <Check className="w-3 h-3" /> تم التوقيع بنجاح
                </span>
              )}
            </div>

            <div className="bg-white rounded-xl overflow-hidden border border-slate-700 relative shadow-inner cursor-crosshair">
              <canvas
                ref={canvasRef}
                width={500}
                height={160}
                className="w-full h-36 touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!hasSigned && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
                  ارسم توقيعك هنا بالإصبع أو الفأرة
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={clearSignature}
                type="button"
                className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
              >
                <Eraser className="w-3.5 h-3.5" /> مسح وإعادة التوقيع
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <Button
              onClick={handleDownloadPDF}
              type="button"
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>تحميل عقد الإيجار الرقمي المذيل بالختم والتوقيع (PDF)</span>
            </Button>

            <a
              href={`https://wa.me/212661234567?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-900/30 transition-all text-xs"
            >
              <Phone className="w-4 h-4" />
              <span>تأكيد الحجز الفوري عبر واتساب الوكالة</span>
            </a>

            <Button
              onClick={() => setLocation('/')}
              type="button"
              variant="outline"
              className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 py-3 rounded-xl flex items-center justify-center gap-2 text-xs"
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
