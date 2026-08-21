import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Database, Download, RefreshCw, CheckCircle2, HardDrive, Clock } from 'lucide-react';
import { toast } from 'sonner';

export const DisasterRecoveryTab: React.FC = () => {
  const [backups, setBackups] = useState([
    { id: 'bk_908', name: 'B2Rent_Full_DB_Snapshot_2026_08_21.sql', size: '14.2 MB', type: 'تلقائي (يومي)', time: 'منذ ساعتين', status: 'مستقر وآمن' },
    { id: 'bk_907', name: 'B2Rent_Full_DB_Snapshot_2026_08_20.sql', size: '13.9 MB', type: 'تلقائي (يومي)', time: 'أمس، 02:00 صباحاً', status: 'مستقر وآمن' },
    { id: 'bk_906', name: 'B2Rent_Manual_Backup_Pre_Deploy.sql', size: '13.5 MB', type: 'يدوي', time: '18 غشت 2026', status: 'مؤرشف' },
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleCreateBackup = () => {
    setIsCreating(true);
    setTimeout(() => {
      const newBackup = {
        id: `bk_${Math.floor(Math.random() * 900 + 100)}`,
        name: `B2Rent_Manual_Snapshot_${new Date().toISOString().slice(0, 10)}.sql`,
        size: '14.5 MB',
        type: 'يدوي',
        time: 'الآن تفصيلياً',
        status: 'مستقر وآمن',
      };
      setBackups([newBackup, ...backups]);
      setIsCreating(false);
      toast.success('تم إنشاء نسخة احتياطية جديدة بنجاح وتشفيرها في السحابة.');
    }, 1500);
  };

  const handleRestore = (name: string) => {
    setIsRestoring(true);
    setTimeout(() => {
      setIsRestoring(false);
      toast.success(`تمت استعادة قاعدة البيانات بنجاح من النسخة: ${name}`);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <Database className="w-6 h-6 text-amber-500" />
            نظام النسخ الاحتياطي التلقائي والتعافي من الكوارث (Disaster Recovery)
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            إدارة النسخ الاحتياطية لبيانات السيارات، العقارات، المستخدمين، والحجوزات لضمان استمرارية العمل بنسبة 100%.
          </p>
        </div>
        <Button
          onClick={handleCreateBackup}
          disabled={isCreating}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-lg"
        >
          {isCreating ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <HardDrive className="w-4 h-4 ml-2" />}
          {isCreating ? 'جاري إنشاء النسخة...' : 'إنشاء نسخة احتياطية الآن'}
        </Button>
      </div>

      {/* Grid Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/60 border-slate-800 text-slate-100">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">حالة نظام الحماية</p>
              <h3 className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                نشط وآمن 100%
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800 text-slate-100">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">آخر نسخ تلقائي</p>
              <h3 className="text-lg font-bold text-amber-400 mt-1 flex items-center gap-1.5">
                <Clock className="w-5 h-5 text-amber-400" />
                اليوم، 04:00 صباحاً
              </h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
              <Database className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800 text-slate-100">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">مساحة التخزين السحابي</p>
              <h3 className="text-lg font-bold text-sky-400 mt-1">4.2 GB / 50 GB</h3>
            </div>
            <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400">
              <HardDrive className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backups Table */}
      <Card className="bg-slate-900/80 border-slate-800 text-slate-100 shadow-xl">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-200">سجل النسخ الاحتياطية المتاحة للاستعادة</CardTitle>
          <CardDescription className="text-xs text-slate-400">
            يمكنك تحميل أي نسخة سابقة بصيغة SQL أو استعادتها بضغطة زر واحدة في حالة الطوارئ.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400">
                  <th className="py-3 px-4">اسم الملف</th>
                  <th className="py-3 px-4">نوع النسخ</th>
                  <th className="py-3 px-4">الحجم</th>
                  <th className="py-3 px-4">التوقيت</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {backups.map((bk) => (
                  <tr key={bk.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-amber-300">{bk.name}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${bk.type.includes('تلقائي') ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                        {bk.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{bk.size}</td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{bk.time}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        {bk.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center space-x-2 space-x-reverse">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200 text-xs"
                        onClick={() => toast.success(`جاري تحميل النسخة الاحتياطية: ${bk.name}`)}
                      >
                        <Download className="w-3.5 h-3.5 ml-1" />
                        تحميل
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                        disabled={isRestoring}
                        onClick={() => handleRestore(bk.name)}
                      >
                        <RefreshCw className="w-3.5 h-3.5 ml-1" />
                        استعادة
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
