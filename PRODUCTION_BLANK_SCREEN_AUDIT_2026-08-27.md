# Production blank-screen audit — 2026-08-27

## Source

URL checked: https://makanibooking-morocco.vercel.app/

## Read-only observations

The document title is `MAKANIbooking | منصة الوساطة الأولى لتأجير السيارات والعقارات في المغرب`.

The HTML contains `#root`, but its text and inner HTML are empty after `document.readyState === "complete"`; `#root.children.length` is `0`.

The main entry script `/assets/index-Bx1aAPss.js` returned HTTP 200. The split vendor assets and CSS also returned HTTP 200, including React, React DOM, navigation, icons, Supabase, and the application CSS chunks.

No API write, authentication, payment, or database mutation was performed during this check.

## Current conclusion

The public deployment is serving the HTML and JavaScript assets, but React is not mounting into `#root`. The next diagnostic step is to inspect the production entry bundle and compare it with the current source/bootstrap path, then reproduce locally before changing production configuration.

## Additional browser inspection

The production DOM has only two body children: an inline `script#manus-runtime` with approximately 367,094 characters, followed by `<div id="root"></div>`. The module entry script is `/assets/index-Bx1aAPss.js`. React has not mounted any children into `#root`.

The blank screen is therefore not caused by a missing root element. The large inline Manus runtime is a leading suspect and must be compared with the current `client/index.html` and build output before changing the deployment.

## 2026-08-27 — تشخيص نهائي أولي

إعادة استيراد حزمة نقطة الدخول المنشورة `/assets/index-Bx1aAPss.js` داخل المتصفح فشلت بالخطأ:

`ReferenceError: Cannot access 'eB' before initialization`

المصدر: `/assets/misc-vendor-1-C1F0qpVd.js:1:33742`.

كل موارد `/assets/` عادت بحالة HTTP 200، لكن `#root` بقي فارغاً؛ لذلك السبب ليس Supabase أو متغيرات البيئة، بل **دورة اعتماد/ترتيب تهيئة بين chunks ناتجة عن manualChunks**. يجب تعديل استراتيجية التقسيم وإعادة البناء ثم اختبار الاستيراد قبل حفظ checkpoint جديد.

## 2026-08-27 — إصلاح دورة chunks وإعادة البناء

تمت إزالة `onlyExplicitManualChunks: true` من `vite.config.ts` حتى يستطيع Rollup وضع الاعتمادات المشتركة مع مستهلكيها، بدلاً من فرض فصل صريح سبب خطأ Temporal Dead Zone في `misc-vendor-1`.

إعادة `pnpm build` نجحت. أكبر ملفات JavaScript الجديدة: `react-dom-vendor` 359.50KB، `pdf-vendor` 343.28KB، و`misc-vendor-1` 277.83KB. لم يظهر تحذير يتجاوز 500KB.

الخطوة التالية: تشغيل TypeScript وVitest، ثم فحص إنتاج محلي/معاينة للتأكد من أن React يركب داخل `#root` قبل حفظ checkpoint والنشر.
