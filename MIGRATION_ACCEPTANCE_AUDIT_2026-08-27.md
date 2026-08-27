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
