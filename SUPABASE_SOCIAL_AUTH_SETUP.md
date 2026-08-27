# إعداد تسجيل الدخول الاجتماعي في MAKANIbooking

أضيفت أزرار Google وApple إلى صفحة `/register` باستخدام `supabase.auth.signInWithOAuth`. الكود يرسل المستخدم إلى مزود OAuth ثم يعيده إلى `/register?next=...` مع حماية لمسار العودة.

## Supabase

من لوحة Supabase افتح **Authentication → Providers** ثم فعّل **Google** و/أو **Apple** وأدخل بيانات OAuth التي تحصل عليها من Google Cloud Console وApple Developer. يجب إضافة عنوان callback الذي تعرضه Supabase داخل إعدادات كل مزود؛ لا يُستبدل هذا العنوان بعنوان Vercel من الذاكرة.

أضف نطاقات الإنتاج والمعاينة الموثوقة من **Authentication → URL Configuration → Redirect URLs**، ومنها:

```text
https://makanibooking-morocco.vercel.app/register
```

يمكن إضافة نطاق المعاينة الحالي عند الحاجة، مع تجنب استخدام wildcard واسع في الإنتاج.

## Google

في Google Cloud Console أنشئ OAuth Client من نوع Web application، ثم أضف callback URL الذي يظهره Supabase في إعداد Google Provider. بعد الحفظ، انسخ Client ID وClient Secret إلى حقلي Google داخل Supabase فقط، ولا تضع Client Secret في الواجهة أو GitHub أو Vercel كمتغير `VITE_*`.

## Apple

في Apple Developer أنشئ Service ID وفعّل Sign in with Apple، ثم أضف النطاق وعنوان callback الذي يعرضه Supabase. يحتاج Apple إلى Team ID وKey ID وPrivate Key بصيغة صحيحة؛ تحفظ هذه القيم داخل Supabase Provider configuration ولا تُضمّن في حزمة المتصفح.

## التحقق

إذا ظهر للمستخدم أن المزود غير مفعّل، فهذا يعني أن الزر يعمل لكن إعداد المزود لم يكتمل في Supabase. بعد تفعيل المزود، اختبر في نافذة خاصة: فتح الزر، إتمام OAuth، العودة إلى MAKANIbooking، ثم فتح `/my-bookings`. لا يتم إنشاء حساب تجريبي أو تغيير بيانات إنتاج تلقائياً.
