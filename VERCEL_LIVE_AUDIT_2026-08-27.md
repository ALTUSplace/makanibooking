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

## 2026-08-28 — حالة إعداد Preview بعد التأكيد
- مشروع Vercel ظاهر على `https://vercel.com/b2-rent/makanibooking-morocco` داخل فريق `b2-rent`.
- `B2RENT_AUTH_PROVIDER` موجود في Preview.
- `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `SUPABASE_DB_URL`, `SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, و`VITE_SUPABASE_URL` ظهرت في Production فقط أثناء الفحص الأخير.
- فُتح تحرير `SUPABASE_SERVICE_ROLE_KEY`، لكن لم يُحفظ أي تغيير؛ القيمة بقيت مخفية، ولا يوجد دليل على تغيير Production.
- محاولة قراءة Runtime Errors عبر Vercel MCP أعادت `403 Forbidden`.
- رابط Preview المرتبط بفرع `preview/supabase-readiness`: `https://makanibooking-morocco-git-preview-supabase-readiness-b2-rent.vercel.app`.

## 2026-08-28 — نتيجة محاولة نسخ سر Preview
- فُتح نموذج إضافة `SUPABASE_SERVICE_ROLE_KEY`، لكن قيمة الحافظة لم تُقرأ داخل المتصفح؛ أُزيل الإدخال الناقص وأُغلِق النموذج عبر `Discard Changes`.
- لا يوجد دليل على حفظ أي قيمة جديدة، ولا تغيير في Production.
- ما زالت بيئة Preview تفتقد أسرار Supabase الخادمية و`JWT_SECRET`، لذلك لم يبدأ اختبار PostgreSQL الإنتاجي.

## 2026-08-28 — إعادة نشر Preview قيد التنفيذ
- أنشأ Vercel deployment جديداً بالمعرّف `B1fcq6moZEFFdiDg6c4qvSyptCbt` بعد تحديث متغيرات Preview.
- البيئة: Preview، والمصدر الظاهر: مستودع `kamalbouragba/makanibooking`، الفرع `main`، commit `175e1d6`.
- البناء تقدم إلى `Installing dependencies...` ثم ظهر `Already up to date` و`2728 modules transformed`، وما زال يعرض `Building` في آخر فحص؛ لم يظهر خطأ بناء حتى الآن.
- لم يتم تفعيل أي متغير جديد في Production أثناء هذه العملية.
- المصدر: https://vercel.com/b2-rent/makanibooking-morocco/B1fcq6moZEFFdiDg6c4qvSyptCbt

## 2026-08-28 — تحقق health بعد إعادة النشر
- رابط Preview المختبَر: `https://makanibooking-morocco-mz32v1inu-b2-rent.vercel.app`.
- الصفحة الرئيسية تفتح بنجاح.
- `/api/health` أعاد: `{"ok":false,"service":"b2-rent-api","missing":["SUPABASE_DB_URL","JWT_SECRET"]}`.
- صفحة Vercel تعرض `B2RENT_VERCEL_ADAPTERS_READY` و`SUPABASE_SERVICE_ROLE_KEY` و`SUPABASE_URL` و`VITE_SUPABASE_URL` في Preview، بينما `SUPABASE_DB_URL` و`JWT_SECRET` مرتبطان ببيئة Preview وفرع `preview/supabase-readiness` فقط.
- الاستنتاج: deployment المختبَر مبني من `main`، لذلك لا يلتقط القيم المرتبطة بالفرع المخصص. لم يُفعّل PostgreSQL في Production.
