// ===================== CORE: I18N =====================
const translations = {
    ar: {
        greeting: 'السلام عليكم',
        welcome: 'أهلاً بك في عاداتي',
        prayer_next: 'الصلاة القادمة',
        prayer_fajr: 'الفجر',
        prayer_dhuhr: 'الظهر',
        prayer_asr: 'العصر',
        prayer_maghrib: 'المغرب',
        prayer_isha: 'العشاء',
        remaining: 'متبقي',
        day_progress: 'تقدم يومك',
        streak_days: 'يوم متتالي',
        habits_today: 'عادات اليوم',
        athkar_morning: 'أذكار الصباح',
        athkar_evening: 'أذكار المساء',
        athkar_sleep: 'أذكار النوم',
        wird_daily: 'الورد اليومي',
        learn: 'تعلم العلم الشرعي',
        exercise: 'الرياضة',
        social: 'صلة الرحم',
        rest: 'الترويح عن النفس',
        complete: 'أنجزت',
        save: 'حفظ',
        cancel: 'إلغاء',
        confirm: 'تأكيد',
        delete: 'حذف',
        edit: 'تعديل',
        add: 'إضافة',
        settings: 'الإعدادات',
        profile: 'الملف الشخصي',
        achievements: 'الإنجازات',
        garden: 'حديقة الأعمال',
        notifications: 'الإشعارات',
        theme: 'المظهر',
        language: 'اللغة',
        location: 'الموقع',
        reset_data: 'إعادة ضبط البيانات',
        reset_confirm: 'هل أنت متأكد من مسح جميع بياناتك؟',
        xp_points: 'نقطة',
        level: 'مستوى',
        beginner: 'المبتدئ',
        intermediate: 'المتقدم',
        advanced: 'المحترف',
        expert: 'الخبير',
        master: 'الأستاذ',
        streak_freeze: 'يوم إجازة',
        combo: 'سلسلة إنجاز',
        today: 'اليوم',
        yesterday: 'أمس',
        tomorrow: 'غداً',
        week: 'أسبوع',
        month: 'شهر',
        year: 'سنة',
        close: 'إغلاق',
        done: 'تم',
        skip: 'تخطي',
        next: 'التالي',
        back: 'السابق',
        finish: 'إنهاء',
        loading: 'جاري التحميل...',
        error: 'حدث خطأ',
        retry: 'إعادة المحاولة',
        no_internet: 'لا يوجد اتصال بالإنترنت',
        offline_mode: 'الوضع Offline',
        sync_now: 'مزامنة الآن',
        last_sync: 'آخر مزامنة',
        prayer_times_updated: 'تم تحديث أوقات الصلاة',
        location_updated: 'تم تحديث الموقع',
        habit_completed: 'تم إنجاز العادة!',
        athkar_completed: 'تم إكمال الأذكار!',
        new_achievement: 'إنجاز جديد!',
        streak_broken: 'للأسف، انقطعت سلسلتك',
        streak_saved: 'تم استخدام يوم الإجازة لحماية سلسلتك',
        daily_quote: 'آية اليوم',
        no_habits: 'لا توجد عادات لهذا اليوم',
        add_custom_habit: 'إضافة عادة خاصة',
        habit_name: 'اسم العادة',
        habit_target: 'الهدف',
        habit_unit: 'الوحدة',
        habit_frequency: 'التكرار',
        daily: 'يومي',
        weekly: 'أسبوعي',
        monthly: 'شهري',
        reminder: 'تذكير',
        enable_reminder: 'تفعيل التذكير',
        reminder_time: 'وقت التذكير',
        custom_habit_added: 'تمت إضافة العادة بنجاح',
        delete_habit_confirm: 'هل تريد حذف هذه العادة؟',
        share: 'مشاركة',
        share_message: 'أنجزت {count} عادات اليوم في تطبيق عاداتي!',
        leaderboard: 'لوحة المتصدرين',
        family_group: 'مجموعة العائلة',
        create_group: 'إنشاء مجموعة',
        join_group: 'الانضمام لمجموعة',
        group_code: 'رمز المجموعة',
        invite: 'دعوة',
        members: 'الأعضاء',
        challenges: 'التحديات',
        weekly_challenge: 'التحدي الأسبوعي',
        daily_challenge: 'التحدي اليومي',
        challenge_complete: 'تم إنجاز التحدي!',
        points_earned: 'النقاط المكتسبة',
        rank: 'الترتيب',
        global: 'عالمي',
        friends: 'الأصدقاء',
        no_notifications: 'لا توجد إشعارات',
        mark_all_read: 'تحديد الكل كمقروء',
        vibration: 'الاهتزاز',
        sound: 'الصوت',
        prayer_alert: 'تنبيه الصلاة',
        athkar_alert: 'تنبيه الأذكار',
        habit_alert: 'تنبيه العادات',
        silent_mode: 'الوضع الصامت',
        font_size: 'حجم الخط',
        small: 'صغير',
        medium: 'متوسط',
        large: 'كبير',
        extra_large: 'كبير جداً',
        quran_font: 'خط القرآن',
        system_font: 'خط النظام',
        compact_mode: 'الوضع المضغوط',
        show_completed: 'إظهار المنجز',
        hide_completed: 'إخفاء المنجز',
        sort_by: 'الترتيب حسب',
        priority: 'الأولوية',
        time: 'الوقت',
        name: 'الاسم',
        progress: 'التقدم',
        statistics: 'الإحصائيات',
        export_data: 'تصدير البيانات',
        import_data: 'استيراد البيانات',
        data_exported: 'تم تصدير البيانات',
        data_imported: 'تم استيراد البيانات',
        invalid_file: 'ملف غير صالح',
        backup: 'نسخ احتياطي',
        restore: 'استعادة',
        auto_backup: 'نسخ احتياطي تلقائي',
        about: 'عن التطبيق',
        version: 'الإصدار',
        privacy_policy: 'سياسة الخصوصية',
        terms_of_service: 'شروط الاستخدام',
        contact_us: 'تواصل معنا',
        rate_app: 'تقييم التطبيق',
        share_app: 'مشاركة التطبيق',
        logout: 'تسجيل الخروج',
        login: 'تسجيل الدخول',
        register: 'إنشاء حساب',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        forgot_password: 'نسيت كلمة المرور',
        or: 'أو',
        continue_guest: 'المتابعة كضيف',
        sync_cloud: 'المزامنة السحابية',
        sync_description: 'احفظ بياناتك في السحابة للوصول من أي جهاز',
        enable_sync: 'تفعيل المزامنة',
        sync_enabled: 'تم تفعيل المزامنة',
        last_backup: 'آخر نسخة احتياطية',
        backup_now: 'نسخ احتياطي الآن',
        restore_backup: 'استعادة نسخة',
        no_backups: 'لا توجد نسخ احتياطية',
        confirm_restore: 'هل تريد استعادة هذه النسخة؟',
        restore_success: 'تمت الاستعادة بنجاح',
        cloud_sync_required: 'يجب تفعيل المزامنة السحابية أولاً'
    }
};

class I18n {
    constructor() {
        this.locale = 'ar';
        this.fallbackLocale = 'ar';
        this.listeners = new Set();
    }

    setLocale(locale) {
        if (translations[locale]) {
            this.locale = locale;
            document.documentElement.lang = locale;
            document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
            this.notify();
        }
    }

    t(key, params = {}) {
        const text = translations[this.locale]?.[key] || translations[this.fallbackLocale]?.[key] || key;
        return text.replace(/\{([^}]+)\}/g, (match, param) => params[param] || match);
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notify() {
        this.listeners.forEach(cb => cb(this.locale));
    }

    getLocale() {
        return this.locale;
    }

    isRTL() {
        return this.locale === 'ar';
    }
}

export const i18n = new I18n();
export default I18n;
