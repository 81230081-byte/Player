// ===================== APP: MAIN ENTRY =====================
import { store } from './core/state.js';
import { router } from './core/router.js';
import { i18n } from './core/i18n.js';
import { DateUtils, Haptics } from './utils/index.js';
import { HomePage, HabitsPage, AthkarPage, ProfilePage, SocialPage } from './pages/index.js';
import { Toast, Modal } from './components/index.js';

// ===================== APP INITIALIZATION =====================
class App {
    constructor() {
        this.modal = new Modal();
        this.init();
    }

    async init() {
        // Load saved state
        store.load();

        // Initialize theme
        this.initTheme();

        // Setup router
        this.setupRouter();

        // Setup navigation
        this.setupNavigation();

        // Check onboarding
        this.checkOnboarding();

        // Initialize daily check
        this.checkNewDay();

        // Handle initial route
        router.handleRoute();

        console.log('✅ عاداتي - Islamic Habits App v2.0 Initialized');
    }

    initTheme() {
        const theme = store.getState('user.settings.theme') || 'dark';
        document.body.classList.toggle('light-mode', theme === 'light');

        // Update toggle icon
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            const icon = toggle.querySelector('i');
            if (icon) icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    setupRouter() {
        router
            .register('home', HomePage, { title: 'الرئيسية', keepAlive: true })
            .register('habits', HabitsPage, { title: 'العادات' })
            .register('athkar', AthkarPage, { title: 'الأذكار', keepAlive: true })
            .register('social', SocialPage, { title: 'مجتمعي' })
            .register('profile', ProfilePage, { title: 'الملف الشخصي', keepAlive: true });

        router.beforeEach((to, from) => {
            // Cleanup previous page
            const prevPage = document.querySelector('.page.active');
            if (prevPage && prevPage.cleanup) {
                prevPage.cleanup();
            }
            return true;
        });
    }

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const route = item.dataset.route;
                if (route) router.navigate(route);
            });
        });
    }

    checkOnboarding() {
        const user = store.getState('user');
        if (!user || !user.name) {
            this.showOnboarding();
        }
    }

    showOnboarding() {
        const html = `
            <div class="text-center py-8">
                <div class="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 mx-auto flex items-center justify-center text-white text-3xl mb-4">
                    <i class="fas fa-seedling"></i>
                </div>
                <h2 class="text-white text-2xl font-bold mb-2">أهلاً بك في عاداتي 🌿</h2>
                <p class="text-white/60 text-sm mb-8">رحلتك نحو عادات إسلامية أفضل تبدأ من هنا</p>

                <div class="space-y-4 mb-8">
                    <div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <div class="w-10 h-10 rounded-full bg-emerald-600/30 flex items-center justify-center text-emerald-400">
                            <i class="fas fa-pray"></i>
                        </div>
                        <div class="text-right">
                            <p class="text-white text-sm font-medium">تتبع الصلوات</p>
                            <p class="text-white/50 text-xs">أوقات دقيقة وعداد تنازلي</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <div class="w-10 h-10 rounded-full bg-sky-600/30 flex items-center justify-center text-sky-400">
                            <i class="fas fa-book-open"></i>
                        </div>
                        <div class="text-right">
                            <p class="text-white text-sm font-medium">عادات يومية</p>
                            <p class="text-white/50 text-xs">ورد، أذكار، تعلم، رياضة</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <div class="w-10 h-10 rounded-full bg-amber-600/30 flex items-center justify-center text-amber-400">
                            <i class="fas fa-fire"></i>
                        </div>
                        <div class="text-right">
                            <p class="text-white text-sm font-medium">سلسلة الإنجاز</p>
                            <p class="text-white/50 text-xs">حافظ على استمراريتك يوماً بعد يوم</p>
                        </div>
                    </div>
                </div>

                <input type="text" id="onboarding-name" 
                    class="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white text-center mb-4 focus:outline-none focus:border-emerald-500 transition-colors" 
                    placeholder="ما هو اسمك؟">

                <button class="w-full py-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors" id="onboarding-submit">
                    ابدأ رحلتك
                </button>
            </div>
        `;

        this.modal.open(html, { fullScreen: true });

        setTimeout(() => {
            const submitBtn = document.getElementById('onboarding-submit');
            const nameInput = document.getElementById('onboarding-name');

            if (submitBtn && nameInput) {
                submitBtn.addEventListener('click', () => {
                    const name = nameInput.value.trim();
                    if (name && name.length >= 2) {
                        store.dispatch({
                            type: 'SET_USER',
                            payload: {
                                user: {
                                    name: name,
                                    joinedDate: new Date().toISOString()
                                }
                            }
                        });

                        this.modal.close();
                        Toast.show('أهلاً بك يا ' + name + '! 🎉');

                        // Refresh page to show full content
                        setTimeout(() => router.navigate('home', true), 500);
                    } else {
                        nameInput.style.borderColor = '#ef4444';
                        Toast.show('الرجاء إدخال اسم صحيح');
                    }
                });

                nameInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') submitBtn.click();
                });
            }
        }, 100);
    }

    checkNewDay() {
        const lastDate = store.getState('lastDate');
        const today = new Date().toDateString();

        if (lastDate !== today) {
            // Reset daily progress
            const habits = store.getState('habits') || {};
            const prayers = store.getState('prayers') || {};

            // Check streak
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const wasComplete = this.checkDayCompletion(lastDate);

            if (lastDate === yesterday.toDateString() && wasComplete) {
                // Streak continues
                const currentStreak = (store.getState('user.streak') || 0) + 1;
                store.dispatch({
                    type: 'UPDATE_STREAK',
                    payload: {
                        user: { streak: currentStreak },
                        garden: [...(store.getState('garden') || []), true],
                        lastDate: today
                    }
                });

                if (currentStreak > 0) {
                    Toast.show('🔥 سلسلة ' + currentStreak + ' أيام! أحسنت!');
                }
            } else if (lastDate && lastDate !== today) {
                // Streak broken
                const oldStreak = store.getState('user.streak') || 0;
                store.dispatch({
                    type: 'BREAK_STREAK',
                    payload: {
                        user: { 
                            streak: 0,
                            longestStreak: Math.max(oldStreak, store.getState('user.longestStreak') || 0)
                        },
                        garden: [...(store.getState('garden') || []), false],
                        lastDate: today
                    }
                });

                Toast.show('للأسف، انقطعت سلسلتك. ابدأ من جديد! 💪', 'warning');
            } else {
                store.dispatch({
                    type: 'SET_LAST_DATE',
                    payload: { lastDate: today }
                });
            }

            // Reset daily states
            const resetHabits = {};
            Object.keys(habits).forEach(key => {
                resetHabits[key] = { ...habits[key], completed: false, completedAt: null };
            });

            const resetPrayers = {};
            Object.keys(prayers).forEach(key => {
                resetPrayers[key] = { ...prayers[key], completed: false, time: null };
            });

            store.dispatch({
                type: 'RESET_DAILY',
                payload: {
                    habits: resetHabits,
                    prayers: resetPrayers,
                    athkar: { morning: {}, evening: {}, sleep: {} }
                }
            });
        }
    }

    checkDayCompletion(dateStr) {
        // Check if all prayers and habits were completed on a given date
        // This would need historical data - simplified for now
        return false;
    }
}

// ===================== SERVICE WORKER REGISTRATION =====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registered:', reg.scope))
            .catch(err => console.warn('SW registration failed:', err));
    });
}

// ===================== APP START =====================
const app = new App();
export default app;
