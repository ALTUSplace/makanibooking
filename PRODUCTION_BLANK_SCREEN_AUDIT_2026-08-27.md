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

## إعادة التحقق بعد دفع d020bdc8

- المصدر: https://makanibooking-morocco.vercel.app/
- العنوان يظهر باسم MAKANIbooking، لكن `#root` بقي فارغاً في Production.
- لا توجد رسائل Console ظاهرة.
- DOM يحتوي `SCRIPT#manus-runtime` قبل `DIV#root`، وسكربت module المنشور ما زال يشير إلى `/assets/index-Bx1aAPss.js`.
- يلزم التحقق من أن هذا اسم الأصل الجديد فعلاً ومقارنة محتواه/تاريخ النشر قبل استنتاج أن Vercel ما زال على نسخة قديمة.

## فحص بعد دفع `d020bdc8` — 2026-08-27 18:26 GMT+1

المصدر الخارجي المفحوص: https://makanibooking-morocco.vercel.app/

- رؤوس HTTP تُظهر `server: Vercel` و`cache-control: public, max-age=0, must-revalidate` و`age: 0`.
- HTML Production الجديد يشير إلى `assets/index-5LTKFbLV.js` وchunks جديدة مثل `misc-vendor-1-DsyEh6RP.js`، وليس الأصول القديمة `index-Bx1aAPss.js`.
- عنوان الصفحة هو `MAKANIbooking | منصة الوساطة الأولى لتأجير السيارات والعقارات في المغرب`.
- مع ذلك، المتصفح ما زال يرى خلفية داكنة بلا عناصر تفاعلية؛ لم تظهر عناصر مرئية في viewport. يلزم تشخيص runtime الحالي في الأصول الجديدة قبل اعتبار العطل محلولاً.
## فحص Production makanibooking-morocco_vercel_app_page_1787855479129.html
Thu Aug 27 18:31:30 UTC 2026

### مؤشرات HTML
<link rel="icon" type="image/svg+xml" href="/favicon.svg"
<link rel="canonical" href="https://makanibooking-morocco.vercel.app/"
<link rel="preconnect" href="https://fonts.googleapis.com"
<link rel="preconnect" href="https://fonts.gstatic.com"
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&amp;display=swap"
<script type="module" crossorigin="" src="/assets/index-5LTKFbLV.js"
<link rel="modulepreload" crossorigin="" href="/assets/shared-vendor-erWsuhty.js"
<link rel="modulepreload" crossorigin="" href="/assets/misc-vendor-3-BAiz__cX.js"
<link rel="modulepreload" crossorigin="" href="/assets/misc-vendor-2-Cc-WclDh.js"
<link rel="modulepreload" crossorigin="" href="/assets/react-dom-vendor-CPohRNJW.js"
<link rel="modulepreload" crossorigin="" href="/assets/misc-vendor-1-DsyEh6RP.js"
<link rel="modulepreload" crossorigin="" href="/assets/react-vendor-Bg-A-2kq.js"
<link rel="modulepreload" crossorigin="" href="/assets/data-vendor-BGg8jYhe.js"
<link rel="modulepreload" crossorigin="" href="/assets/ui-vendor-Dqe_NE0H.js"
<link rel="modulepreload" crossorigin="" href="/assets/utils-vendor-CjzaFIDm.js"
<link rel="modulepreload" crossorigin="" href="/assets/pdf-vendor-B4sVHMfd.js"
<link rel="modulepreload" crossorigin="" href="/assets/navigation-vendor-CkF8dgGZ.js"
<link rel="modulepreload" crossorigin="" href="/assets/icons-vendor-C2WD759I.js"
<link rel="modulepreload" crossorigin="" href="/assets/supabase-vendor-03XOsRLA.js"
<link rel="stylesheet" crossorigin="" href="/assets/index-C-WyxT54.css"
<body class="bg-slate-950 text-slate-100 antialiased">
<div id="root">

### حجم HTML
370815 /home/ubuntu/browser_html/makanibooking-morocco_vercel_app_page_1787855479129.html

### آخر سجل dev server
[2026-08-27T16:11:49.473Z] 4:11:49 PM [tsx] change in ./server/db.ts Restarting...
[2026-08-27T16:11:51.187Z] c[OAuth] Initialized with baseURL: https://api.manus.im
[2026-08-27T16:11:51.421Z] Server running on http://localhost:3000/
[2026-08-27T16:12:10.433Z] [Auth] Missing session cookie
[2026-08-27T16:13:12.297Z] [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[2026-08-27T18:17:58.634Z] 6:17:58 PM [tsx] change in ./vite.config.ts Restarting...
[2026-08-27T18:18:00.473Z] c[OAuth] Initialized with baseURL: https://api.manus.im
[2026-08-27T18:18:00.721Z] Server running on http://localhost:3000/
[2026-08-27T18:19:05.431Z] [Auth] Missing session cookie
[2026-08-27T18:20:40.703Z] [Auth] Missing session cookie
[2026-08-27T18:21:57.352Z] ELIFECYCLE  Command failed.
[2026-08-27T18:21:57.394Z] Dev server exited with code -1
[2026-08-27T18:21:58.465Z] Starting dev server with command: pnpm run dev
[2026-08-27T18:21:59.121Z] > b2_rent_platform@1.0.0 dev /home/ubuntu/b2_rent_platform
[2026-08-27T18:21:59.121Z] > NODE_ENV=development tsx watch server/_core/index.ts
[2026-08-27T18:22:01.195Z] [OAuth] Initialized with baseURL: https://api.manus.im
[2026-08-27T18:22:01.460Z] Server running on http://localhost:3000/
[2026-08-27T18:22:19.764Z] [Auth] Missing session cookie
[2026-08-27T18:23:00.426Z] [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[2026-08-27T18:30:34.386Z] [Auth] Missing session cookie
