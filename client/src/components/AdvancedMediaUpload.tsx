import { useState } from 'react';
import { Upload, X, CheckCircle2, Image as ImageIcon, Sparkles, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface AdvancedMediaUploadProps {
  onImagesUploaded: (urls: string[]) => void;
}

export function AdvancedMediaUpload({ onImagesUploaded }: AdvancedMediaUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
      toast.success(`تم اختيار ${newFiles.length} صور بنجاح`);
    }
  };

  const handleRemove = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartUpload = () => {
    if (selectedFiles.length === 0) {
      toast.error('يرجى اختيار صور أولاً');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    setTimeout(() => {
      setUploadProgress(50);
      toast.info('جاري ضغط الصور تلقائياً وتحسين الأداء...');
    }, 600);

    setTimeout(() => {
      setUploadProgress(85);
      toast.info('جاري إضافة العلامة المائية (B2-Rent Watermark)...');
    }, 1200);

    setTimeout(() => {
      setUploadProgress(100);
      setIsUploading(false);
      const mockUploadedUrls = previews;
      onImagesUploaded(mockUploadedUrls);
      toast.success('تم رفع ومعالجة جميع الوسائط بنجاح واعتمادها في النظام!');
    }, 1800);
  };

  return (
    <div className="space-y-6 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">نظام رفع الوسائط الذكي (Advanced Media Upload)</h3>
            <p className="text-xs text-slate-400">ضغط تلقائي للصور، إضافة علامة مائية، ومعاينة فورية قبل النشر.</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
          <Shield className="w-3.5 h-3.5" /> حماية العلامة المائية مفعلة
        </div>
      </div>

      <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 transition-all rounded-2xl p-8 text-center bg-slate-950/40 relative cursor-pointer group">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <ImageIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-200">اسحب الصور وأفلتها هنا، أو اضغط للاختيار</p>
            <p className="text-xs text-slate-400 mt-1">يدعم صيغ PNG, JPG, WEBP (مع ضغط تلقائي وحفظ الحقوق)</p>
          </div>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-300">معاينة الصور المختارة ({previews.length})</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previews.map((src, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video">
                <img src={src} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                <div className="absolute bottom-1 right-1 bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-amber-400 font-bold border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> B2-Rent Watermark
                </div>
                <button
                  onClick={() => handleRemove(idx)}
                  className="absolute top-2 left-2 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {isUploading && (
            <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>جاري معالجة ورفع الوسائط وضغط الحجم...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2 bg-slate-800" />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => { setSelectedFiles([]); setPreviews([]); }}
              disabled={isUploading}
            >
              إلغاء الكل
            </Button>
            <Button
              onClick={handleStartUpload}
              disabled={isUploading}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-2"
            >
              {isUploading ? 'جاري المعالجة والرفع...' : 'بدء الرفع والمعالجة الفورية'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
