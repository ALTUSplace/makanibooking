# ملاحظات الأمان: تخزين Supabase لـ B2-Rent

**تاريخ المراجعة:** 25 أغسطس 2026.

| نوع الملف | النموذج المقترح | سبب العزل |
|---|---|---|
| وثائق KYC (CNI والسجل التجاري) | bucket خاص `b2rent-private-documents` | لا يجوز أن يظهر ملف الهوية عبر رابط عام. |
| عقود الكراء PDF | bucket خاص `b2rent-private-documents` | الوصول يقتصر على أطراف الحجز المخولين والإدارة. |
| مرفقات النزاعات | bucket خاص `b2rent-private-documents` | قد تتضمن أدلة أو معلومات شخصية. |
| صور العروض العامة | bucket عام منفصل في مرحلة لاحقة | المحتوى معد للعرض العام ويمكن الاستفادة من CDN. |

تعتمد Supabase buckets الخاصة افتراضياً على سياسات التحكم بالوصول (RLS)، ولا تتاح ملفاتها عبر رابط عام. يجب أن يولد الخادم رابط تنزيل موقّعاً قصير الصلاحية فقط بعد تحقق التطبيق من هوية المستخدم وملكيته للسجل. لا يُنشأ bucket ولا تُكتب سياسات RLS ولا تُنقل أي ملفات ضمن هذه المرحلة التحضيرية.

## قرار التصميم التحضيري

سيُضاف adapter خادمي منفصل لا يستبدل `server/storage.ts` ولا يُوصل بمسارات الرفع الحالية. وظيفته في هذه المرحلة هي التحقق الآمن من جاهزية إعدادات Supabase، وتطبيع مفاتيح الملفات، ومنع مسارات غير مصرح بها. لا يستخدم adapter قيمة service-role في العميل أو في السجل، ولا ينشئ روابط أو يرفع ملفات قبل إعداد bucket خاص وسياسة وصول ومفتاح خادمي مخصص في Vercel.

## المصادر الرسمية

1. [Supabase Storage Buckets – Fundamentals](https://supabase.com/docs/guides/storage/buckets/fundamentals): توضح أن buckets الخاصة تخضع لـ RLS وأن الوثائق الحساسة من حالات الاستخدام المناسبة، مع روابط موقعة مؤقتة للتنزيل.
2. [Supabase Storage – Serving assets](https://supabase.com/docs/guides/storage/serving/downloads): توضح أن ملفات bucket الخاص لا تملك رابطاً عاماً، وأن إنشاء الرابط الموقّع يجب أن يتم من الخادم بمدة صلاحية محددة.

## تحقق واجهات اختبار القبول المؤقت

راجعت في 25 أغسطس 2026 تنفيذ مكتبة Supabase Storage الرسمية ومصدر خدمة التخزين. يعتمد الاختبار المؤقت فقط على `POST /storage/v1/object/{bucket}/{path}` للرفع، و`POST /storage/v1/object/sign/{bucket}/{path}` لإنشاء رابط تنزيل موقّع قصير الأجل، و`DELETE /storage/v1/object/{bucket}` مع جسم `{"prefixes":[path]}` لحذف الملف المحدد. هذه الصيغة تطابق دالة `remove(paths)` في المكتبة الرسمية، ولا يستخدم الاختبار أي حذف SQL أو حذف واسع للـbucket.

يتحقق الاختبار أيضاً من أن طلب الوصول عبر المسار العام يعيد منعاً متوقعاً (`401` أو `403` أو `404`) وأن رابط التنزيل الموقّع يبقى ضمن مصدر مشروع Supabase نفسه. لذلك لا تُتبع أي URL خارجية صادرة من حمولة غير سليمة.

3. [Supabase Storage JS – StorageFileApi](https://github.com/supabase/storage-js/blob/main/src/packages/StorageFileApi.ts): يبين مسارات الرفع والتوقيع وحمولة `prefixes` المستخدمة في الحذف عبر `remove`.
4. [Supabase Storage – Delete Objects](https://supabase.com/docs/guides/storage/management/delete-objects): يؤكد أن حذف الكائنات يجب أن يتم عبر Storage API لا عبر SQL.
