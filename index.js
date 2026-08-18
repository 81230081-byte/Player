// ===================== COMPONENTS: BASE COMPONENT =====================
export class BaseComponent {
    constructor(props = {}) {
        this.props = props;
        this.element = null;
        this.listeners = [];
    }

    render() {
        throw new Error('render() must be implemented');
    }

    mount(container) {
        this.element = this.render();
        if (container) {
            container.appendChild(this.element);
        }
        return this.element;
    }

    update(newProps) {
        this.props = { ...this.props, ...newProps };
        if (this.element) {
            const newElement = this.render();
            this.element.replaceWith(newElement);
            this.element = newElement;
        }
    }

    on(event, selector, handler) {
        const wrappedHandler = (e) => {
            const target = e.target.closest(selector);
            if (target) handler(e, target);
        };

        if (this.element) {
            this.element.addEventListener(event, wrappedHandler);
            this.listeners.push({ event, handler: wrappedHandler });
        }
    }

    destroy() {
        this.listeners.forEach(({ event, handler }) => {
            this.element?.removeEventListener(event, handler);
        });
        this.listeners = [];
        this.element?.remove();
    }
}

// ===================== COMPONENTS: PRAYER CARD =====================
export class PrayerCard extends BaseComponent {
    render() {
        const { nextPrayer, countdown, prayers, onToggle } = this.props;

        if (!nextPrayer) return document.createElement('div');

        const div = document.createElement('div');
        div.className = 'prayer-card';
        div.innerHTML = `
            <div class="prayer-glow rounded-3xl p-5 mb-5 text-white relative overflow-hidden">
                <div class="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div class="relative z-10">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <p class="text-white/70 text-xs mb-1">الصلاة القادمة</p>
                            <h2 class="text-3xl font-bold">${nextPrayer.ar}</h2>
                            <p class="text-emerald-200 text-lg">${nextPrayer.time} ${nextPrayer.isTomorrow ? '(غداً)' : ''}</p>
                        </div>
                        <div class="text-center">
                            <div class="text-4xl font-light font-mono">${String(countdown?.hours || 0).padStart(2, '0')}:${String(countdown?.minutes || 0).padStart(2, '0')}</div>
                            <p class="text-white/60 text-xs mt-1">متبقي</p>
                        </div>
                    </div>
                    <div class="flex justify-between mt-4 pt-4 border-t border-white/10">
                        ${this.renderPrayerIcon('fajr', 'الفجر', 'fa-sun', prayers?.fajr?.completed)}
                        ${this.renderPrayerIcon('dhuhr', 'الظهر', 'fa-sun', prayers?.dhuhr?.completed)}
                        ${this.renderPrayerIcon('asr', 'العصر', 'fa-cloud-sun', prayers?.asr?.completed)}
                        ${this.renderPrayerIcon('maghrib', 'المغرب', 'fa-moon', prayers?.maghrib?.completed)}
                        ${this.renderPrayerIcon('isha', 'العشاء', 'fa-star', prayers?.isha?.completed)}
                    </div>
                </div>
            </div>
        `;

        // Add click handlers
        div.querySelectorAll('.prayer-icon-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prayerId = btn.dataset.prayer;
                onToggle?.(prayerId);
            });
        });

        return div;
    }

    renderPrayerIcon(id, name, icon, completed) {
        const isNext = this.props.nextPrayer?.id === id;
        return `
            <div class="text-center cursor-pointer haptic prayer-icon-btn" data-prayer="${id}">
                <div class="w-10 h-10 rounded-full ${completed ? 'bg-emerald-500' : 'bg-white/10'} flex items-center justify-center mb-1 transition-all relative">
                    <i class="fas ${completed ? 'fa-check text-white' : icon + ' text-white/70'} text-sm"></i>
                    ${isNext && !completed ? '<div class="absolute inset-0 rounded-full border-2 border-emerald-400/50 pulse-ring"></div>' : ''}
                </div>
                <span class="text-[10px] text-white/80">${name}</span>
            </div>
        `;
    }
}

// ===================== COMPONENTS: HABIT ITEM =====================
export class HabitItem extends BaseComponent {
    render() {
        const { habit, data, onToggle, onOpen } = this.props;
        const completed = data?.completed || false;
        const streak = data?.streak || 0;

        const colors = {
            emerald: 'from-emerald-600 to-emerald-800',
            sky: 'from-sky-600 to-sky-800',
            indigo: 'from-indigo-600 to-indigo-800',
            violet: 'from-violet-600 to-violet-800',
            orange: 'from-orange-600 to-red-700',
            pink: 'from-pink-600 to-rose-700',
            amber: 'from-amber-600 to-orange-700'
        };

        const div = document.createElement('div');
        div.className = 'glass-card p-4 flex items-center gap-4 cursor-pointer haptic habit-item';
        div.innerHTML = `
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[habit.color] || colors.emerald} flex items-center justify-center text-white text-xl habit-ring ${completed ? 'completed scale-95' : ''}">
                <i class="fas ${habit.icon}"></i>
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="text-white font-semibold truncate">${habit.title}</h4>
                <p class="text-white/50 text-xs">${habit.desc}</p>
                ${streak > 0 ? `<span class="text-amber-400 text-xs">⚡ ${streak} أيام</span>` : ''}
            </div>
            <div class="check-anim ${completed ? 'checked' : ''}">
                <i class="fas fa-check text-white check-icon"></i>
            </div>
        `;

        div.addEventListener('click', () => {
            if (habit.track) {
                onOpen?.(habit.id);
            } else {
                onToggle?.(habit.id);
            }
        });

        return div;
    }
}

// ===================== COMPONENTS: PROGRESS RING =====================
export class ProgressRing extends BaseComponent {
    render() {
        const { progress, size = 80, strokeWidth = 6, color = '#0d8b4a' } = this.props;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (progress / 100) * circumference;

        const div = document.createElement('div');
        div.className = 'progress-ring-container';
        div.style.cssText = `width: ${size}px; height: ${size}px; position: relative;`;
        div.innerHTML = `
            <svg width="${size}" height="${size}" style="transform: rotate(-90deg);">
                <circle cx="${size/2}" cy="${size/2}" r="${radius}" 
                    fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="${strokeWidth}"/>
                <circle cx="${size/2}" cy="${size/2}" r="${radius}" 
                    fill="none" stroke="${color}" stroke-width="${strokeWidth}"
                    stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
                    stroke-linecap="round" class="progress-ring-circle"/>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-white font-bold text-sm">${Math.round(progress)}%</span>
            </div>
        `;

        return div;
    }
}

// ===================== COMPONENTS: ATHKAR COUNTER =====================
export class AthkarCounter extends BaseComponent {
    render() {
        const { text, source, target, current, onIncrement, onReset } = this.props;
        const done = current >= target;

        const div = document.createElement('div');
        div.className = `glass-card p-5 ${done ? 'opacity-60 border-emerald-500/30' : ''}`;
        div.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <span class="text-emerald-400 text-xs font-medium bg-emerald-500/10 px-3 py-1 rounded-full">
                    ${target} ${target === 1 ? 'مرة' : 'مرات'}
                </span>
                ${done ? '<span class="text-emerald-400 text-sm"><i class="fas fa-check-circle"></i></span>' : ''}
            </div>
            <p class="quran-font text-white text-center mb-4 leading-relaxed">${text}</p>
            <div class="flex justify-between items-center pt-3 border-t border-white/10">
                <span class="text-white/40 text-xs">${source}</span>
                <div class="flex items-center gap-2">
                    <button class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 transition-colors athkar-reset">
                        <i class="fas fa-undo text-xs"></i>
                    </button>
                    <span class="text-white/60 text-sm w-8 text-center">${current}/${target}</span>
                    <button class="w-10 h-10 rounded-full ${done ? 'bg-emerald-800' : 'bg-emerald-600 hover:bg-emerald-500'} flex items-center justify-center text-white transition-colors athkar-increment" ${done ? 'disabled' : ''}>
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;

        div.querySelector('.athkar-increment')?.addEventListener('click', () => onIncrement?.());
        div.querySelector('.athkar-reset')?.addEventListener('click', () => onReset?.());

        return div;
    }
}

// ===================== COMPONENTS: TOAST =====================
export class Toast {
    static container = null;

    static init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 8px;
                pointer-events: none;
            `;
            document.body.appendChild(this.container);
        }
    }

    static show(message, type = 'success', duration = 2500) {
        this.init();

        const toast = document.createElement('div');
        const colors = {
            success: 'rgba(13,139,74,0.95)',
            error: 'rgba(239,68,68,0.95)',
            warning: 'rgba(245,158,11,0.95)',
            info: 'rgba(59,130,246,0.95)'
        };

        toast.style.cssText = `
            background: ${colors[type]};
            color: white;
            padding: 12px 24px;
            border-radius: 16px;
            font-size: 14px;
            backdrop-filter: blur(10px);
            transform: translateY(-100px);
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            pointer-events: auto;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        toast.textContent = message;

        this.container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0)';
        });

        setTimeout(() => {
            toast.style.transform = 'translateY(-100px)';
            setTimeout(() => toast.remove(), 400);
        }, duration);
    }
}

// ===================== COMPONENTS: MODAL =====================
export class Modal {
    constructor() {
        this.overlay = null;
        this.content = null;
        this.isOpen = false;
        this.setup();
    }

    setup() {
        // Remove existing modal if any
        document.getElementById('modal-overlay')?.remove();
        document.getElementById('modal-content')?.remove();

        this.overlay = document.createElement('div');
        this.overlay.id = 'modal-overlay';
        this.overlay.className = 'modal-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(8px);
            z-index: 200;
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        this.content = document.createElement('div');
        this.content.id = 'modal-content';
        this.content.className = 'modal-content';
        this.content.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--bg-primary, #0d1f0d);
            border-radius: 30px 30px 0 0;
            padding: 24px;
            z-index: 201;
            max-height: 85vh;
            overflow-y: auto;
            transform: translateY(100%);
            transition: transform 0.3s ease;
        `;

        this.overlay.addEventListener('click', () => this.close());

        document.body.appendChild(this.overlay);
        document.body.appendChild(this.content);
    }

    open(html, options = {}) {
        const { onClose, fullScreen = false } = options;

        this.content.innerHTML = `
            <div class="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6"></div>
            ${html}
        `;

        if (fullScreen) {
            this.content.style.maxHeight = '100vh';
            this.content.style.borderRadius = '0';
        }

        this.overlay.style.display = 'block';

        requestAnimationFrame(() => {
            this.overlay.style.opacity = '1';
            this.content.style.transform = 'translateY(0)';
        });

        this.isOpen = true;
        this.onCloseCallback = onClose;

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    close() {
        if (!this.isOpen) return;

        this.content.style.transform = 'translateY(100%)';
        this.overlay.style.opacity = '0';

        setTimeout(() => {
            this.overlay.style.display = 'none';
            this.content.innerHTML = '';
            document.body.style.overflow = '';
        }, 300);

        this.isOpen = false;
        this.onCloseCallback?.();
    }

    destroy() {
        this.close();
        this.overlay?.remove();
        this.content?.remove();
    }
}

// ===================== COMPONENTS: GARDEN GRID =====================
export class GardenGrid extends BaseComponent {
    render() {
        const { garden } = this.props;
        const div = document.createElement('div');
        div.className = 'glass-card p-4';

        const plants = ['🌱', '🌿', '🌷', '🌻', '🌺', '🌸', '🌼', '🌳'];
        const days = 28; // 4 weeks

        let html = '<p class="text-white/50 text-xs mb-3 text-center">كل يوم من الاستمرارية يزرع زهرة</p>';
        html += '<div class="grid grid-cols-7 gap-2">';

        for (let i = 0; i < days; i++) {
            const day = garden[i];
            const plant = day === true ? plants[Math.min(i, plants.length - 1)] : 
                         day === false ? '🥀' : '';
            const bg = day === true ? 'bg-emerald-500/20' : 
                      day === false ? 'bg-red-500/10' : 'bg-white/5';

            html += `
                <div class="garden-cell ${bg} aspect-square flex items-center justify-center text-lg rounded-lg transition-all hover:scale-110">
                    ${plant}
                </div>
            `;
        }

        html += '</div>';
        div.innerHTML = html;

        return div;
    }
}

// ===================== COMPONENTS: WEEK DOTS =====================
export class WeekDots extends BaseComponent {
    render() {
        const { weekData } = this.props;
        const div = document.createElement('div');
        div.className = 'flex gap-1';

        const days = ['أحد', 'إثن', 'ثل', 'أرب', 'خم', 'جم', 'سبت'];

        div.innerHTML = days.map((day, i) => {
            const status = weekData?.[i];
            const color = status === 'complete' ? 'bg-emerald-500' : 
                         status === 'partial' ? 'bg-amber-500' : 
                         status === 'missed' ? 'bg-red-500/50' : 'bg-white/10';

            return `
                <div class="flex flex-col items-center gap-1">
                    <div class="w-3 h-3 rounded-full ${color} transition-all"></div>
                    <span class="text-[8px] text-white/40">${day}</span>
                </div>
            `;
        }).join('');

        return div;
    }
}
