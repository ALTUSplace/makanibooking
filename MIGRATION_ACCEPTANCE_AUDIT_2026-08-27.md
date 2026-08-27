# تقرير تدقيق ترحيل القبول — 2026-08-27

## النطاق
تم تنفيذ فحص قراءة فقط لمقارنة أسماء الجداول بين قاعدة MySQL الحالية وSupabase PostgreSQL. لم تُنفذ أوامر INSERT أو UPDATE أو DELETE أو DROP، ولم تتغير بيانات الإنتاج.

## النتيجة
نجح اتصال PostgreSQL واستعلام القراءة فقط. المصدر يحتوي على 20 جدولاً تقريباً، بينما مخطط PostgreSQL العام يحتوي على 4 جداول فقط: `bookings`, `cars`, `products`, `profiles`.

من الجداول المطلوبة في التطبيق، يوجد `bookings` فقط في الطرفين. الجداول الأساسية غير الموجودة في PostgreSQL تشمل: `users`, `listings`, `listing_analytics_events`, `reviews`, `kyc_submissions`, `payments`, `commercial_lease_contracts`, `notifications`, `booking_messages`, `audit_logs`, `refund_requests`, `platform_settings`, `payout_requests`, `booking_vouchers`, `invoices`, `disputes`, `dispute_attachments`, و`support_tickets`.

## القرار
لا يمكن بدء ترحيل بيانات قبول آمن بعد؛ لأن مخطط PostgreSQL غير مكتمل ولا يطابق مخطط التطبيق الحالي. يلزم أولاً إنشاء مخطط PostgreSQL مكافئ ومراجعته، ثم أخذ نسخة احتياطية قابلة للاستعادة، ثم ترحيل جداول محددة إلى بيئة قبول، ثم مقارنة عدد الصفوف والمفاتيح والعلاقات قبل أي تحويل للإنتاج.

## الإجراء التالي الآمن
إنشاء migration DDL متوافق مع PostgreSQL من مخطط التطبيق، تطبيقه في بيئة قبول فقط، والتحقق منه باستعلامات قراءة. لن يتم حذف أو تغيير جداول المصدر، ولن يتم تحويل التطبيق إلى PostgreSQL قبل نجاح اختبارات القبول.

## تحديث بعد مواءمة المخطط والنسخة الاحتياطية

تم تطبيق DDL غير تخريبي على Supabase باستخدام `CREATE TABLE IF NOT EXISTS` فقط، ثم نُفذت عينة قبول محدودة من 5 مستخدمين و5 عروض باستخدام `ON CONFLICT DO NOTHING` داخل معاملة. لم تُنفذ أي كتابة أو حذف على MySQL المصدر.

تم إنشاء Snapshot قراءة فقط عبر `mysql2` وTLS لأن `mysqldump` القياسي فشل مع savepoint غير المدعوم في خادم Manus/TiDB. الملف الخاص محفوظ خارج المشروع في:

`/home/ubuntu/makanibooking-backups/mysql-readonly-snapshot-2026-08-27T14-28-38-492Z.jsonl.gz`

اجتاز الملف `gzip -t`، وقيمة SHA-256 هي:

`5b8947646212642fa087f4cd9d23a380e83f734e1681faea4a228e65e3198d91`

| المؤشر | العدد |
|---|---:|
| الجداول | 20 |
| المستخدمون | 7 |
| العروض | 6 |
| الحجوزات | 2 |
| سجلات التدقيق | 6 |

يبقى **MySQL مصدر الإنتاج**، ولم ينفذ الترحيل الكامل أو تحويل Drizzle/Vercel إلى PostgreSQL. يلزم قبل cutover مقارنة العدادات والعلاقات، اختبار حجز قبول مستقل، والتحقق من الاستعادة من Snapshot. النسخة ليست عامة ولا تُرفع إلى GitHub أو Vercel.

## تدقيق قراءة فقط إضافي: العدادات والعلاقات

تم تنفيذ `scripts/migration_acceptance_counts.mjs` في 2026-08-27 دون أوامر كتابة. النتائج الحالية:

| الجدول | MySQL | Supabase | متطابق |
|---|---:|---:|---|
| users | 7 | 5 | لا |
| listings | 6 | 5 | لا |
| bookings | 2 | 0 | لا |
| audit_logs | 6 | 0 | لا |
| بقية الجداول المشتركة | متساوٍ عند 0 | متساوٍ عند 0 | نعم |

عدد المفاتيح الأجنبية: MySQL = 0 وفق `information_schema.REFERENTIAL_CONSTRAINTS`، وSupabase = 3. هذه النتيجة لا تعني أن القبول مكتمل؛ ما زالت بيانات عينة موجودة فقط في users/listings، بينما bookings وaudit_logs غير مرحّلة. لذلك لم يتم تفعيل `B2RENT_VERCEL_ADAPTERS_READY` ولم يُنفذ cutover.
