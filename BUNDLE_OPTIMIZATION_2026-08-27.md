# تقرير تحسين حزم JavaScript — 2026-08-27

تم تحليل بناء Vite وتطبيق تقسيم manualChunks مع الحفاظ على الوظائف الحالية. أضيفت حزمة مستقلة لـ `@supabase/*`، كما قُسّمت الاعتمادات غير المصنفة إلى ثلاث مجموعات ثابتة مبنية على اسم الحزمة حتى لا تتجمع في `vendor` واحد كبير.

## نتيجة التحقق

| الفحص | النتيجة |
|---|---|
| `pnpm check` | ناجح دون أخطاء TypeScript |
| `pnpm test` | 63 ملف اختبار ناجح، 169 اختباراً ناجحاً |
| `pnpm build` | ناجح، مع بناء Vercel API والتحقق من إنشاء Express |
| تحذير chunks أكبر من 500KB | لم يظهر في سجل البناء |
| أكبر JavaScript في `dist/public/assets` | `react-dom-vendor`: 359,496 bytes (~351.1 KiB) |
| أكبر chunk غير React | `pdf-vendor`: 342,792 bytes (~334.8 KiB) |
| Supabase | `supabase-vendor`: 211,461 bytes (~206.5 KiB) |
| Recharts | `charts-vendor`: 243,574 bytes (~237.9 KiB) |
| fallback chunks | 135,126–277,635 bytes، وكلها تحت 500KB |

## ملاحظات السلامة

لم يتم رفع `chunkSizeWarningLimit` لإخفاء المشكلة؛ بل تم تخفيض الأحجام فعلياً عبر التقسيم. لم تُحذف وظائف أو تغيّرت عقود API. بقي مسار PostgreSQL خارج هذا التغيير، كما بقي MySQL مسار التشغيل الافتراضي إلى حين اكتمال اختبار المحول ثنائي اللهجة وخطة القطع الآمن.
