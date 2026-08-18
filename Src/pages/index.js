// ===================== PAGES: HOME =====================
import { store } from '../core/state.js';
import { i18n } from '../core/i18n.js';
import { PrayerTimeService } from '../services/index.js';
import { DateUtils, Haptics, Confetti, Validators } from '../utils/index.js';
import { PrayerCard, HabitItem, ProgressRing, WeekDots, Toast } from '../components/index.js';

const prayerService = new PrayerTimeService();

export async function HomePage() {
    const container = document.createElement('div');
    container.id = 'page-home';
    container.className = 'page active';

    container.innerHTML = renderSkeleton();

    const state = store.getState();
    const user = state.user || {};
    const prayers = state.prayers || {};
    const habits = state.habits || {};

    prayerService.initialize().catch(() => {
        Toast.show('تعذر تحديث أوقات الصلاة', 'warning');
    });

    const unsubscribePrayer = prayerService.subscribe((event, data) => {
        if (event === 'countdown') updateCountdown(data);
    });

    const unsubscribeState = store.subscribe('*', () => updatePage(container));

    updatePage(container);

    container.cleanup = () => {
        unsubscribePrayer();
        unsubscribeState();
        prayerService.cleanup();
    };

    return container;
}

function renderSkeleton() {
    return `
        <div class="animate-pulse">
            <div class="h-20 bg-white/5 rounded-2xl mb-4"></div>
            <div class="h-40 bg-white/5 rounded-2xl mb-4"></div>
            <div class="h-24 bg-white/5 rounded-2xl mb-4"></div>
        </div>
    `;
}

function updatePage(container) {
    const state = store.getState();
    const user = state.user || {};
    const prayers = state.prayers || {};
    const habits = state.habits || {};
    const stats = state.stats || {};

    const totalItems = 5 + Object.keys(habits).length;
    const donePrayers = Object.values(prayers).filter(p => p.completed).length;
    const doneHabits = Object.values(habits).filter(h => h.completed).length;
    const percent = totalItems > 0 ? Math.round(((donePrayers + doneHabits) / totalItems) * 100) : 0;

    const weekData = ['complete', 'complete', 'partial', 'complete', 'missed', 'complete', null];

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <div>
                <p class="text-white/50 text-xs mb-1">${DateUtils.formatDate()}</p>
                <h1 class="text-white text-2xl font-bold">${i18n.t('greeting')} 👋 ${user.name ? 'يا ' + Validators.sanitizeInput(user.name) : ''}</h1>
                <p class="text-emerald-400 text-sm mt-1">يومك مبارك</p>
            </div>
            <div class="flex items-center gap-3">
                <button id="theme-toggle" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-emerald-400 transition-colors haptic hover:bg-white/20">
                    <i class="fas ${user.settings?.theme === 'light' ? 'fa-moon' : 'fa-sun'}"></i>
                </button>
                <div class="relative">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-lg border-2 border-emerald-400/30">
                        ${user.name ? Validators.sanitizeInput(user.name).charAt(0) : 'أ'}
                    </div>
                    ${stats.currentStreak > 0 ? `<div class="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-[10px]">🔥</div>` : ''}
                </div>
            </div>
        </div>

        <div id="prayer-card-container"></div>

        <div class="glass-card p-5 mb-5">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-white font-bold text-lg">${i18n.t('day_progress')}</h3>
                <span class="text-emerald-400 text-sm font-medium">${percent}%</span>
            </div>
            <div class="flex items-center gap-4">
                <div class="relative w-20 h-20 flex-shrink-0" id="progress-ring-container"></div>
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-amber-400 font-bold text-2xl">${stats.currentStreak || 0}</span>
                        <span class="text-white/60 text-sm">${i18n.t('streak_days')} 🔥</span>
                    </div>
                    <p class="text-white/40 text-xs">أكمل عاداتك اليوم للحفاظ على الاستمرارية</p>
                    <div class="mt-2" id="week-dots-container"></div>
                </div>
            </div>
        </div>

        <div class="flex gap-3 mb-5 overflow-x-auto hide-scroll pb-2">
            <button class="flex-shrink-0 px-5 py-3 rounded-2xl bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-sm font-medium flex items-center gap-2 haptic hover:bg-emerald-600/50 transition-colors" data-modal="wird">
                <i class="fas fa-book-open"></i> الورد
            </button>
            <button class="flex-shrink-0 px-5 py-3 rounded-2xl bg-sky-600/30 border border-sky-500/30 text-sky-400 text-sm font-medium flex items-center gap-2 haptic hover:bg-sky-600/50 transition-colors" data-modal="athkar_morning">
                <i class="fas fa-sun"></i> الأذكار
            </button>
            <button class="flex-shrink-0 px-5 py-3 rounded-2xl bg-violet-600/30 border border-violet-500/30 text-violet-400 text-sm font-medium flex items-center gap-2 haptic hover:bg-violet-600/50 transition-colors" data-modal="learn">
                <i class="fas fa-graduation-cap"></i> تعلم
            </button>
            <button class="flex-shrink-0 px-5 py-3 rounded-2xl bg-orange-600/30 border border-orange-500/30 text-orange-400 text-sm font-medium flex items-center gap-2 haptic hover:bg-orange-600/50 transition-colors" data-modal="exercise">
                <i class="fas fa-running"></i> رياضة
            </button>
        </div>

        <h3 class="text-white font-bold text-lg mb-3">${i18n.t('habits_today')}</h3>
        <div class="space-y-3 mb-5" id="habits-list"></div>

        <div class="verse-card rounded-3xl p-5 mb-5">
            <div class="flex items-center gap-2 mb-3">
                <i class="fas fa-quote-right text-emerald-400"></i>
                <span class="text-emerald-400 text-xs font-medium">${i18n.t('daily_quote')}</span>
            </div>
            <p class="quran-font text-white text-center font-medium">﴿وَأَقِمِ الصَّلَاةَ لِذِكْرِي﴾</p>
            <p class="text-white/50 text-xs text-center mt-2">سورة طه - الآية ١٤</p>
        </div>
    `;

    const ringContainer = container.querySelector('#progress-ring-container');
    if (ringContainer) {
        const ring = new ProgressRing({ progress: percent, size: 80 });
        ringContainer.appendChild(ring.render());
    }

    const dotsContainer = container.querySelector('#week-dots-container');
    if (dotsContainer) {
        const dots = new WeekDots({ weekData });
        dotsContainer.appendChild(dots.render());
    }

    const habitsList = container.querySelector('#habits-list');
    if (habitsList) {
        const habitsData = [
            { id: 'wird', title: 'الورد اليومي', desc: 'تتبع وحفظ صفحاتك', icon: 'fa-book-open', color: 'emerald', xp: 15 },
            { id: 'athkar_morning', title: 'أذكار الصباح', desc: 'بعد صلاة الفجر', icon: 'fa-sun', color: 'sky', xp: 20 },
            { id: 'athkar_evening', title: 'أذكار المساء', desc: 'بعد صلاة العصر', icon: 'fa-moon', color: 'indigo', xp: 20 },
            { id: 'learn', title: 'تعلم العلم الشرعي', desc: 'وقت التعلم', icon: 'fa-graduation-cap', color: 'violet', xp: 15, track: { unit: 'دقيقة', target: 15, step: 5 } },
            { id: 'exercise', title: 'الرياضة', desc: 'وقت التمرين', icon: 'fa-running', color: 'orange', xp: 10, track: { unit: 'دقيقة', target: 30, step: 5 } },
            { id: 'social', title: 'صلة الرحم', desc: 'اتصال بعائلتك', icon: 'fa-users', color: 'pink', xp: 10 },
            { id: 'rest', title: 'الترويح عن النفس', desc: 'استراحة وتأمل', icon: 'fa-coffee', color: 'amber', xp: 5 }
        ];

        habitsData.forEach(habit => {
            const item = new HabitItem({
                habit,
                data: habits[habit.id],
                onToggle: (id) => toggleHabit(id),
                onOpen: (id) => openHabitModal(id)
            });
            habitsList.appendChild(item.render());
        });
    }

    container.querySelector('#theme-toggle')?.addEventListener('click', toggleTheme);
    container.querySelectorAll('[data-modal]').forEach(btn => {
        btn.addEventListener('click', () => openHabitModal(btn.dataset.modal));
    });
}

function updateCountdown(data) {
    const countdownEl = document.getElementById('countdown');
    if (countdownEl) {
        countdownEl.textContent = `${String(data.hours).padStart(2, '0')}:${String(data.minutes).padStart(2, '0')}`;
    }
}

function toggleHabit(id) {
    const state = store.getState();
    const current = state.habits[id] || { completed: false, streak: 0 };

    store.dispatch({
        type: 'TOGGLE_HABIT',
        payload: {
            habits: {
                [id]: {
                    ...current,
                    completed: !current.completed,
                    completedAt: !current.completed ? new Date().toISOString() : null
                }
            }
        }
    });

    if (!current.completed) {
        Haptics.trigger('success');
        Confetti.create({ count: 20 });
        Toast.show('+15 نقطة! 🎉');
    }
}

function toggleTheme() {
    const state = store.getState();
    const newTheme = state.user?.settings?.theme === 'light' ? 'dark' : 'light';

    store.dispatch({
        type: 'SET_THEME',
        payload: { user: { settings: { theme: newTheme } } }
    });

    document.body.classList.toggle('light-mode', newTheme === 'light');
}

function openHabitModal(id) {
    Toast.show('قريباً: ' + id);
}

// ===================== PAGES: HABITS =====================
export async function HabitsPage() {
    const container = document.createElement('div');
    container.id = 'page-habits';
    container.className = 'page';

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-white text-2xl font-bold">عاداتي</h1>
            <button class="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white haptic hover:bg-emerald-500 transition-colors" id="add-habit-btn">
                <i class="fas fa-plus"></i>
            </button>
        </div>

        <div class="glass-card p-4 mb-5">
            <h3 class="text-white font-semibold mb-3 text-sm">معدل الإنجاز (آخر ٧ أيام)</h3>
            <canvas id="habitsChart" height="150"></canvas>
        </div>

        <div class="space-y-3" id="all-habits"></div>
    `;

    setTimeout(() => initHabitsChart(), 100);
    renderAllHabits(container);

    const unsubscribe = store.subscribe('*', () => renderAllHabits(container));
    container.cleanup = () => unsubscribe();

    return container;
}

function initHabitsChart() {
    const canvas = document.getElementById('habitsChart');
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
            datasets: [{
                label: 'نسبة الإنجاز',
                data: [65, 80, 45, 90, 75, 60, 85],
                borderColor: '#0d8b4a',
                backgroundColor: 'rgba(13,139,74,0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#0d8b4a',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderAllHabits(container) {
    const list = container.querySelector('#all-habits');
    if (!list) return;

    const state = store.getState();
    const habits = state.habits || {};

    const habitsData = [
        { id: 'wird', title: 'الورد اليومي', icon: 'fa-book-open', color: 'emerald' },
        { id: 'athkar_morning', title: 'أذكار الصباح', icon: 'fa-sun', color: 'sky' },
        { id: 'athkar_evening', title: 'أذكار المساء', icon: 'fa-moon', color: 'indigo' },
        { id: 'learn', title: 'تعلم العلم الشرعي', icon: 'fa-graduation-cap', color: 'violet' },
        { id: 'exercise', title: 'الرياضة', icon: 'fa-running', color: 'orange' },
        { id: 'social', title: 'صلة الرحم', icon: 'fa-users', color: 'pink' },
        { id: 'rest', title: 'الترويح عن النفس', icon: 'fa-coffee', color: 'amber' }
    ];

    list.innerHTML = habitsData.map(h => {
        const data = habits[h.id] || { completed: false, streak: 0 };
        return `
            <div class="glass-card p-4 flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-${h.color}-600/30 flex items-center justify-center text-${h.color}-400">
                    <i class="fas ${h.icon}"></i>
                </div>
                <div class="flex-1">
                    <h4 class="text-white font-medium">${h.title}</h4>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-xs ${data.completed ? 'text-emerald-400' : 'text-white/40'}">
                            ${data.completed ? '✓ منجز' : 'غير منجز'}
                        </span>
                        ${data.streak > 0 ? `<span class="text-amber-400 text-xs">🔥 ${data.streak}</span>` : ''}
                    </div>
                </div>
                <div class="text-white/40 text-sm">
                    ${data.completed ? '<i class="fas fa-check-circle text-emerald-400"></i>' : '<i class="far fa-circle"></i>'}
                </div>
            </div>
        `;
    }).join('');
}

// ===================== PAGES: ATHKAR =====================
export async function AthkarPage() {
    const container = document.createElement('div');
    container.id = 'page-athkar';
    container.className = 'page';

    container.innerHTML = `
        <div class="mb-6 flex items-center justify-between">
            <div>
                <h1 class="text-white text-2xl font-bold">الأذكار</h1>
                <p class="text-white/50 text-sm">أذكار الصباح والمساء</p>
            </div>
            <button class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white haptic hover:bg-white/20 transition-colors" data-nav="home">
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>

        <div class="flex gap-2 mb-5">
            <button class="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-medium text-sm haptic athkar-tab" data-tab="morning">
                <i class="fas fa-sun ml-1"></i> الصباح
            </button>
            <button class="flex-1 py-3 rounded-2xl bg-white/5 text-white/60 font-medium text-sm haptic athkar-tab" data-tab="evening">
                <i class="fas fa-moon ml-1"></i> المساء
            </button>
            <button class="flex-1 py-3 rounded-2xl bg-white/5 text-white/60 font-medium text-sm haptic athkar-tab" data-tab="sleep">
                <i class="fas fa-bed ml-1"></i> النوم
            </button>
        </div>

        <div class="glass-card p-3 mb-5">
            <div class="flex justify-between text-xs text-white/60 mb-2">
                <span>التقدم</span>
                <span id="athkar-progress-text">٠/٧</span>
            </div>
            <div class="h-2 bg-white/10 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-500 rounded-full transition-all" style="width: 0%" id="athkar-progress-bar"></div>
            </div>
        </div>

        <div class="space-y-3 pb-8" id="athkar-list"></div>
    `;

    let currentTab = 'morning';

    const renderAthkarList = () => {
        const state = store.getState();
        const athkar = state.athkar || {};
        const current = athkar[currentTab] || {};

        const athkarData = {
            morning: [
                { text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ...', source: 'مسلم', count: 1 },
                { text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ...', source: 'البخاري', count: 1 },
                { text: 'رَضِيتُ بِاللَّهِ رَبًّا...', source: 'أبو داود', count: 3 },
                { text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ...', source: 'الترمذي', count: 3 },
                { text: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ...', source: 'أبو داود', count: 7 },
                { text: 'قُلْ هُوَ اللَّهُ أَحَدٌ...', source: 'الإخلاص', count: 3 },
                { text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ...', source: 'الفلق', count: 3 },
                { text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ...', source: 'الناس', count: 3 }
            ],
            evening: [
                { text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ...', source: 'مسلم', count: 1 },
                { text: 'اللَّهُمَّ أَنْتَ رَبِّي...', source: 'البخاري', count: 1 },
                { text: 'رَضِيتُ بِاللَّهِ رَبًّا...', source: 'أبو داود', count: 3 },
                { text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ...', source: 'الترمذي', count: 3 },
                { text: 'حَسْبِيَ اللَّهُ...', source: 'أبو داود', count: 7 },
                { text: 'قُلْ هُوَ اللَّهُ أَحَدٌ...', source: 'الإخلاص', count: 3 },
                { text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ...', source: 'الفلق', count: 3 },
                { text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ...', source: 'الناس', count: 3 }
            ],
            sleep: [
                { text: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', source: 'البخاري', count: 1 },
                { text: 'سُبْحَانَ اللَّهِ (٣٣)...', source: 'البخاري ومسلم', count: 1 },
                { text: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي...', source: 'البخاري ومسلم', count: 1 },
                { text: 'اللَّهُمَّ قِنِي عَذَابَكَ...', source: 'أبو داود', count: 3 }
            ]
        };

        const data = athkarData[currentTab] || [];
        const progress = Object.values(current).filter((v, i) => (v || 0) >= data[i]?.count).length;

        document.getElementById('athkar-progress-text').textContent = `${progress}/${data.length}`;
        document.getElementById('athkar-progress-bar').style.width = `${(progress / data.length * 100)}%`;

        const list = container.querySelector('#athkar-list');
        if (!list) return;

        list.innerHTML = data.map((a, i) => {
            const count = current[i] || 0;
            const done = count >= a.count;

            return `
                <div class="glass-card p-5 ${done ? 'opacity-60 border-emerald-500/30' : ''}">
                    <div class="flex justify-between items-start mb-3">
                        <span class="text-emerald-400 text-xs font-medium bg-emerald-500/10 px-3 py-1 rounded-full">
                            ${a.count} ${a.count === 1 ? 'مرة' : 'مرات'}
                        </span>
                        ${done ? '<span class="text-emerald-400 text-sm"><i class="fas fa-check-circle"></i></span>' : ''}
                    </div>
                    <p class="quran-font text-white text-center mb-4 leading-relaxed">${a.text}</p>
                    <div class="flex justify-between items-center pt-3 border-t border-white/10">
                        <span class="text-white/40 text-xs">${a.source}</span>
                        <div class="flex items-center gap-2">
                            <button class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 transition-colors athkar-reset" data-index="${i}">
                                <i class="fas fa-undo text-xs"></i>
                            </button>
                            <span class="text-white/60 text-sm w-8 text-center">${count}/${a.count}</span>
                            <button class="w-10 h-10 rounded-full ${done ? 'bg-emerald-800' : 'bg-emerald-600 hover:bg-emerald-500'} flex items-center justify-center text-white transition-colors athkar-increment" data-index="${i}" ${done ? 'disabled' : ''}>
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        list.querySelectorAll('.athkar-increment').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                const currentCount = (store.getState().athkar?.[currentTab]?.[index] || 0);
                const target = data[index].count;

                if (currentCount < target) {
                    store.dispatch({
                        type: 'INCREMENT_ATHKAR',
                        payload: {
                            athkar: {
                                [currentTab]: {
                                    [index]: currentCount + 1
                                }
                            }
                        }
                    });

                    if (currentCount + 1 >= target) {
                        Haptics.trigger('success');
                        Confetti.create({ count: 10 });
                    }

                    renderAthkarList();
                }
            });
        });

        list.querySelectorAll('.athkar-reset').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                store.dispatch({
                    type: 'RESET_ATHKAR',
                    payload: {
                        athkar: {
                            [currentTab]: {
                                [index]: 0
                            }
                        }
                    }
                });
                renderAthkarList();
            });
        });
    };

    container.querySelectorAll('.athkar-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            currentTab = btn.dataset.tab;
            container.querySelectorAll('.athkar-tab').forEach(b => {
                b.classList.remove('bg-emerald-600', 'text-white');
                b.classList.add('bg-white/5', 'text-white/60');
            });
            btn.classList.remove('bg-white/5', 'text-white/60');
            btn.classList.add('bg-emerald-600', 'text-white');
            renderAthkarList();
        });
    });

    container.querySelector('[data-nav="home"]')?.addEventListener('click', () => {
        window.location.hash = 'home';
    });

    renderAthkarList();

    const unsubscribe = store.subscribe('*', renderAthkarList);
    container.cleanup = () => unsubscribe();

    return container;
}

// ===================== PAGES: PROFILE =====================
export async function ProfilePage() {
    const container = document.createElement('div');
    container.id = 'page-profile';
    container.className = 'page';

    const render = () => {
        const state = store.getState();
        const user = state.user || {};
        const stats = state.stats || {};
        const garden = state.garden || [];

        container.innerHTML = `
            <div class="text-center mb-6">
                <div class="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 mx-auto flex items-center justify-center text-white text-3xl font-bold border-4 border-emerald-500/30 mb-3 relative">
                    ${user.name ? Validators.sanitizeInput(user.name).charAt(0) : 'أ'}
                    <div class="absolute -bottom-2 -right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                        ${user.level || 1}
                    </div>
                </div>
                <h2 class="text-white text-xl font-bold">${user.name ? Validators.sanitizeInput(user.name) : 'ضيف'}</h2>
                <p class="text-white/50 text-sm">مستوى: ${getLevelName(user.level || 1)} 🌱</p>
            </div>

            <div class="glass-card p-4 mb-5">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-white/60 text-xs">المستوى ${user.level || 1}: ${getLevelName(user.level || 1)}</span>
                    <span class="text-emerald-400 text-xs">${(user.xp || 0) % 100}/100 XP</span>
                </div>
                <div class="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all" style="width: ${(user.xp || 0) % 100}%"></div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-5">
                <div class="glass-card p-4 text-center">
                    <div class="text-3xl font-bold text-emerald-400 mb-1">${stats.currentStreak || 0}</div>
                    <p class="text-white/50 text-xs">يوم متتالي</p>
                </div>
                <div class="glass-card p-4 text-center">
                    <div class="text-3xl font-bold text-amber-400 mb-1">${stats.completionRate || 0}%</div>
                    <p class="text-white/50 text-xs">معدل الإنجاز</p>
                </div>
            </div>

            <h3 class="text-white font-bold mb-3">حديقة الأعمال 🌱</h3>
            <div class="glass-card p-4 mb-5" id="garden-container"></div>

            <h3 class="text-white font-bold mb-3">الإعدادات ⚙️</h3>
            <div class="space-y-2 mb-5">
                <button class="w-full glass-card p-4 flex items-center justify-between text-right hover:bg-white/5 transition-colors" id="update-location">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-location-dot text-emerald-400"></i>
                        <span class="text-white text-sm">تحديث موقعي (لأوقات الصلاة)</span>
                    </div>
                    <i class="fas fa-chevron-left text-white/30 text-xs"></i>
                </button>
                <div class="glass-card p-4 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-bell text-emerald-400"></i>
                        <span class="text-white text-sm">الإشعارات</span>
                    </div>
                    <label class="switch">
                        <input type="checkbox" ${user.settings?.notifications !== false ? 'checked' : ''} id="notif-toggle">
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="glass-card p-4 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-vibrate text-emerald-400"></i>
                        <span class="text-white text-sm">الاهتزاز</span>
                    </div>
                    <label class="switch">
                        <input type="checkbox" ${user.settings?.haptics !== false ? 'checked' : ''} id="haptics-toggle">
                        <span class="slider"></span>
                    </label>
                </div>
                <button class="w-full glass-card p-4 flex items-center justify-between text-right hover:bg-white/5 transition-colors" id="export-data">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-download text-emerald-400"></i>
                        <span class="text-white text-sm">تصدير البيانات</span>
                    </div>
                    <i class="fas fa-chevron-left text-white/30 text-xs"></i>
                </button>
            </div>

            <button class="w-full py-3 rounded-2xl bg-red-500/20 text-red-400 text-sm font-medium mb-8 hover:bg-red-500/30 transition-colors" id="reset-data">
                <i class="fas fa-trash-alt ml-2"></i> إعادة ضبط البيانات
            </button>
        `;

        const gardenContainer = container.querySelector('#garden-container');
        if (gardenContainer) {
            import('../components/index.js').then(({ GardenGrid }) => {
                const grid = new GardenGrid({ garden });
                gardenContainer.appendChild(grid.render());
            });
        }

        container.querySelector('#update-location')?.addEventListener('click', async () => {
            Toast.show('جاري تحديث الموقع...');
            try {
                await prayerService.refresh(true);
                Toast.show('تم تحديث أوقات الصلاة', 'success');
            } catch (e) {
                Toast.show('تعذر تحديث الموقع', 'error');
            }
        });

        container.querySelector('#notif-toggle')?.addEventListener('change', (e) => {
            store.dispatch({
                type: 'SET_NOTIFICATIONS',
                payload: { user: { settings: { notifications: e.target.checked } } }
            });
        });

        container.querySelector('#haptics-toggle')?.addEventListener('change', (e) => {
            store.dispatch({
                type: 'SET_HAPTICS',
                payload: { user: { settings: { haptics: e.target.checked } } }
            });
            Haptics.setEnabled(e.target.checked);
        });

        container.querySelector('#export-data')?.addEventListener('click', () => {
            Toast.show('جاري التصدير...');
            setTimeout(() => Toast.show('تم تصدير البيانات', 'success'), 500);
        });

        container.querySelector('#reset-data')?.addEventListener('click', () => {
            if (confirm('هل أنت متأكد من مسح جميع بياناتك وإنجازاتك؟')) {
                store.reset();
                Toast.show('تم إعادة الضبط', 'warning');
                setTimeout(() => location.reload(), 1000);
            }
        });
    };

    render();

    const unsubscribe = store.subscribe('*', render);
    container.cleanup = () => unsubscribe();

    return container;
}

function getLevelName(level) {
    const levels = ['المبتدئ', 'المتقدم', 'المحترف', 'الخبير', 'الأستاذ'];
    return levels[Math.min(level - 1, levels.length - 1)] || 'المبتدئ';
}

// ===================== PAGES: SOCIAL =====================
export async function SocialPage() {
    const container = document.createElement('div');
    container.id = 'page-social';
    container.className = 'page';

    container.innerHTML = `
        <div class="mb-6">
            <h1 class="text-white text-2xl font-bold">مجتمعي</h1>
            <p class="text-white/50 text-sm">تحفيز وروابط اجتماعية</p>
        </div>

        <div class="glass-card p-5 mb-5">
            <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-xl">
                        <i class="fas fa-home"></i>
                    </div>
                    <div>
                        <h3 class="text-white font-bold">عائلتي</h3>
                        <p class="text-white/50 text-xs">٥ أعضاء</p>
                    </div>
                </div>
                <span class="text-emerald-400 text-sm font-medium">#١</span>
            </div>

            <div class="space-y-2 mb-4">
                <div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <div class="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs">أ</div>
                    <span class="text-white text-sm flex-1">أحمد</span>
                    <span class="text-amber-400 text-xs">🔥 ١٥</span>
                </div>
                <div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <div class="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white text-xs">م</div>
                    <span class="text-white text-sm flex-1">محمد</span>
                    <span class="text-amber-400 text-xs">🔥 ١٢</span>
                </div>
                <div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <div class="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs">ف</div>
                    <span class="text-white text-sm flex-1">فاطمة</span>
                    <span class="text-amber-400 text-xs">🔥 ٨</span>
                </div>
            </div>

            <button class="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-lg hover:from-emerald-500 hover:to-emerald-600 transition-all">
                <i class="fas fa-cloud ml-2"></i> تفعيل السحابة
            </button>
        </div>

        <div class="glass-card p-5 mb-5">
            <h3 class="text-white font-bold mb-3">التحديات الأسبوعية 🏆</h3>
            <div class="space-y-3">
                <div class="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div class="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                        <i class="fas fa-pray"></i>
                    </div>
                    <div class="flex-1">
                        <p class="text-white text-sm font-medium">صلاة الفجر في الجماعة</p>
                        <p class="text-white/50 text-xs">٥/٧ أيام</p>
                    </div>
                    <div class="w-16 h-16 relative">
                        <svg class="w-full h-full -rotate-90">
                            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="4"/>
                            <circle cx="32" cy="32" r="28" fill="none" stroke="#0d8b4a" stroke-width="4" 
                                stroke-dasharray="175.9" stroke-dashoffset="50" stroke-linecap="round"/>
                        </svg>
                        <span class="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">٧١%</span>
                    </div>
                </div>

                <div class="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <div class="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white">
                        <i class="fas fa-book-open"></i>
                    </div>
                    <div class="flex-1">
                        <p class="text-white text-sm font-medium">ورد يومي مستمر</p>
                        <p class="text-white/50 text-xs">٣٠ يوم</p>
                    </div>
                    <span class="text-amber-400 text-sm">🔥</span>
                </div>
            </div>
        </div>
    `;

    return container;
}
