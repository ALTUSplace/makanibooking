import { useState } from 'react';
import { Headphones, Plus, MessageSquare, CheckCircle2, Clock, Send, ShieldCheck, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved';
  date: string;
  lastMessage: string;
}

export default function SupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 'TCK-9241',
      subject: 'استفسار حول تمديد حجز سيارة Range Rover في الدار البيضاء',
      category: 'الحجوزات والمدفوعات',
      status: 'in_progress',
      date: '2026-08-20',
      lastMessage: 'تم استلام طلبكم، فريق الدعم يتواصل مع الوكالة لتأكيد التمديد.',
    },
    {
      id: 'TCK-8832',
      subject: 'طلب توضيح بشأن احتساب عمولة الشريك البالغ 10%',
      category: 'الشركاء والأرباح',
      status: 'resolved',
      date: '2026-08-15',
      lastMessage: 'تم توضيح آلية العمولة وتحويل صافي الأرباح لمحفظتكم بنجاح.',
    }
  ]);

  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('الحجوزات والمدفوعات');
  const [newDescription, setNewDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) {
      toast.error('يرجى ملء كافة الحقول المطلوبة لفتح التذكرة');
      return;
    }

    const ticket: Ticket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: newSubject,
      category: newCategory,
      status: 'open',
      date: new Date().toISOString().split('T')[0],
      lastMessage: 'تم إنشاء التذكرة بنجاح وسيتم الرد خلال أقل من 30 دقيقة.',
    };

    setTickets([ticket, ...tickets]);
    setNewSubject('');
    setNewDescription('');
    setIsCreating(false);
    toast.success('تم فتح تذكرة الدعم الفني بنجاح وتم إشعار فريق العمل');
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4" dir="rtl">
      <div className="container mx-auto max-w-5xl space-y-8">
        
        {/* Header */}
        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
              <Headphones className="w-8 h-8" />
            </div>
            <div>
              <span className="text-amber-500 text-xs font-extrabold uppercase tracking-widest">الدعم الفني المباشر 24/7</span>
              <h1 className="text-2xl md:text-3xl font-black text-white">مركز تذاكر الاستفسارات والمساعدة</h1>
            </div>
          </div>

          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> فتح تذكرة دعم جديدة
          </Button>
        </div>

        {/* Create Ticket Form */}
        {isCreating && (
          <form onSubmit={handleCreateTicket} className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 animate-in fade-in-50">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <span>تقديم استفسار أو مشكلة جديدة لفريق الدعم</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">موضوع التذكرة</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="أدخل عنواناً مختصراً للمشكلة أو الاستفسار"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">قسم التذكرة</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="الحجوزات والمدفوعات">الحجوزات والمدفوعات</option>
                  <option value="العقود الرقمية والتوقيع">العقود الرقمية والتوقيع</option>
                  <option value="الشركاء والأرباح">الشركاء والأرباح</option>
                  <option value="مشاكل تقنية في المنصة">مشاكل تقنية في المنصة</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">وصف التفاصيل</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={4}
                placeholder="اشرح استفسارك بالتفصيل وسيقوم فريقنا بالرد الفوري..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreating(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-900 text-xs px-6 py-2.5 rounded-xl"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg"
              >
                إرسال التذكرة
              </Button>
            </div>
          </form>
        )}

        {/* Tickets List */}
        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-amber-400" />
            <span>سجل التذاكر السابقة والاستجابات الفورية ({tickets.length})</span>
          </h3>

          <div className="space-y-4">
            {tickets.map(ticket => (
              <div key={ticket.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-amber-500/20 text-amber-400 font-mono text-xs font-bold px-3 py-1 rounded-xl border border-amber-500/30">
                      {ticket.id}
                    </span>
                    <h4 className="text-sm font-extrabold text-white">{ticket.subject}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] bg-slate-800 text-slate-300 px-3 py-1 rounded-full">{ticket.category}</span>
                    {ticket.status === 'open' && <span className="bg-amber-500/20 text-amber-400 text-xs px-2.5 py-1 rounded-full font-bold">مفتوحة</span>}
                    {ticket.status === 'in_progress' && <span className="bg-blue-500/20 text-blue-400 text-xs px-2.5 py-1 rounded-full font-bold">قيد المعالجة</span>}
                    {ticket.status === 'resolved' && <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold">محلولة ✓</span>}
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-400 block mb-1">آخر رد من الدعم الفني ({ticket.date}):</span>
                    <p>{ticket.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
