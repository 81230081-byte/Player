# عاداتي 2.0

هذه نسخة أولية معاد تصميمها على مستوى UX والـ data flow، وتحتوي على:
- Home متمحور حول "خطوتك التالية"
- Prayer card + countdown
- Daily score
- Habit system
- Athkar focus/counter UX
- Weekly bars + calendar
- Insights + achievements
- Export/import backup
- Theme + notification/location hooks
- PWA manifest + service worker
- Local-first state
- Supabase schema جاهز للمزامنة المستقبلية

## التشغيل
افتح `index.html` عبر خادم محلي (مهم لعمل Service Worker)، مثل:
`python3 -m http.server 8080`
ثم افتح التطبيق من المتصفح.

## السحابة
ملف `supabase_schema.sql` يبني طبقة البيانات مع RLS. لا تضع `service_role` في الواجهة. عند ربط Supabase، استخدم publishable key فقط.

## ملاحظات إنتاجية
قبل الإطلاق النهائي:
1. استبدال CDN ببنية Vite/Tailwind مبنية ومثبتة الإصدارات.
2. استخدام IndexedDB بدل localStorage للبيانات الكبيرة/طابور المزامنة.
3. إضافة Auth وSync transactionally.
4. إضافة اختبارات E2E للـ streak/XP/الصلاة/الأذكار.
5. إضافة مصدر قرآن موثوق داخل التطبيق مع مراجعة النصوص والمصادر.
6. بناء scheduler للإشعارات على مستوى المنصة/PWA حسب الدعم.
