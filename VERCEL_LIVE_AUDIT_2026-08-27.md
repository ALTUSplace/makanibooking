# تدقيق حي لـ MAKANIbooking — 2026-08-27

## النطاق المفحوص
- `https://makanibooking-morocco.vercel.app/`

## النتائج
- الصفحة الرئيسية تستجيب ولا تظهر شاشة فارغة.
- عنوان الصفحة وهوية العلامة يظهران باسم MAKANIbooking.
- الشعار الظاهر هو صورة شفافة من مسار Manus Storage.
- شريط التنقل يعرض السيارات، العقارات، الدعم، إضافة إعلان، حسابي، العملة واللغة.
- البحث يعرض اختيار المدينة وتاريخي الاستلام والتسليم وزر البحث.
- بطاقات التوفر تعرض أرقاماً مشتقة من الإعلانات النشطة: Casablanca (1 سيارة، 2 عقار/مساحة)، Marrakech (0، 3)، Tanger (0، 1)، Agadir (1، 0)، مطار محمد الخامس (1، 2).
- روابط الشروط والخصوصية والإشعارات القانونية ودخول الشركاء موجودة في التذييل.
- الهاتف الظاهر: `+212 754 382 654`، والبريد: `contact@makanibooking.com`.
- تم اختيار Français من القائمة؛ تغيّرت الواجهة والنصوص إلى الفرنسية دون إعادة تحميل الصفحة، مع بقاء بعض أسماء المدن العربية في قائمة الخيارات، وهو سلوك مقبول وظيفياً لكنه تحسين ترجمة اختياري.
- روابط التواصل الظاهرة: Facebook وTikTok.

## قيد مهم
- الموقع يعلن في الواجهة أن نسخة الاختبار قيد الإعداد ولا تستقبل الحجوزات بعد؛ لذلك لا يُعتبر تدفق حجز/دفع إنتاجي مقبولاً من هذا الفحص وحده.

## فحص Vercel MCP
- الفريق الظاهر: `B2-Rent morocco`, `team_hjPMwDz7qyfSKcaWN2t5otJK`.
- `list_projects` أعاد قائمة فارغة.
- جلب المشروع بالمعرّف المعروف `prj_WYqFkAKX5Qi3QWJhiADPmUsyxLMm` أعاد `404 Not Found`.
- جلبه بالاسم `makanibooking-morocco` أعاد `404 Not Found`.
- النتيجة: موصل Vercel أصبح مفعلاً، لكن الحساب/الفريق المرتبط به لا يرى مشروع Vercel المستهدف؛ لا يمكن تعديل Environment Variables أو تنفيذ cutover آمن عبر هذا المسار حالياً.

## تحقق إضافي من لوحة Vercel
- لوحة Vercel المفتوحة على `https://vercel.com/b2-rent/makanibooking-morocco` تُظهر المشروع `makanibooking-morocco` داخل الفريق `B2-Rent morocco`، مرتبطاً بمستودع `kamalbouragba/makanibooking` وفرع `main`.
- النشر الإنتاجي ظاهر بحالة `Ready` على النطاق `https://makanibooking-morocco.vercel.app`، وآخر commit ظاهر هو `175e1d6`.
- لوحة Observability تعرض 504 طلبات، و60 استدعاء دالة، ومعدل خطأ ظاهر 86.7% خلال 6 ساعات. هذا مؤشر يحتاج فحص سجلات الإنتاج قبل تفعيل PostgreSQL، ولا يجوز تجاهله.
- رغم ظهور المشروع في المتصفح، ما زال Vercel MCP يعيد `projects: []` و404 عند جلب المشروع؛ الوصول البرمجي للموصل لا يطابق الوصول المرئي في المتصفح.
- لم يتم تغيير Environment Variables أو تفعيل محول PostgreSQL.

## نتائج فحص Environment Variables وسجلات Production
صفحة إعدادات المشروع تُظهر أن متغيرات Supabase الأساسية (`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_URL`) موجودة في Production فقط. يوجد متغير باسم `B2RENT_AUTH_PRIVIDER`، ويبدو أنه خطأ إملائي مقارنة بالاسم المتوقع في الكود `B2RENT_AUTH_PROVIDER`. لا يظهر `B2RENT_VERCEL_ADAPTERS_READY` ضمن الجرد.

صفحة Logs أظهرت فشل `GET /api/trpc/listings.list` بحالة 500، و`GET /api/health` بحالة 503، وفشل تحميل شعار Manus Storage بحالة 500، مع رسائل مرتبطة بغياب `OAUTH_SERVER_URL`. لذلك لم يتم تفعيل محول PostgreSQL في Production، ولم تتم إضافة أي متغير عبر النموذج، لأن اختيار Preview وحدها لم يكن مستقراً في واجهة Vercel. يجب معالجة هذه الأخطاء وإعادة نشر Preview ناجحة قبل التفعيل النهائي.

مصدر الفحص: https://vercel.com/b2-rent/makanibooking-morocco/settings/environment-variables و https://vercel.com/b2-rent/makanibooking-morocco/logs (27 Aug 2026).
