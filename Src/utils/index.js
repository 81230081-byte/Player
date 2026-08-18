// ===================== UTILS: DATE HELPERS =====================
export const DateUtils = {
    getHijriDate(date = new Date()) {
        // Simplified Hijri calculation (approximate)
        const gregorianYear = date.getFullYear();
        const gregorianMonth = date.getMonth() + 1;
        const gregorianDay = date.getDate();

        // Approximate conversion
        const hijriYear = Math.floor((gregorianYear - 622) * 0.97);
        const hijriMonth = Math.floor((gregorianMonth + 9) % 12) + 1;
        const hijriDay = gregorianDay;

        const hijriMonths = [
            'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
            'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
            'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
        ];

        return {
            day: hijriDay,
            month: hijriMonths[hijriMonth - 1],
            year: hijriYear,
            full: `${hijriDay} ${hijriMonths[hijriMonth - 1]} ${hijriYear}هـ`
        };
    },

    getDayName(date = new Date()) {
        const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        return days[date.getDay()];
    },

    formatDate(date = new Date()) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('ar-SA', options);
    },

    getWeekDates(date = new Date()) {
        const week = [];
        const current = new Date(date);
        const day = current.getDay();
        const diff = current.getDate() - day;

        for (let i = 0; i < 7; i++) {
            const d = new Date(current);
            d.setDate(diff + i);
            week.push(d);
        }
        return week;
    },

    isSameDay(date1, date2) {
        return date1.toDateString() === date2.toDateString();
    },

    getTimeDiff(date1, date2) {
        const diff = date2 - date1;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return { hours, minutes, seconds, total: diff };
    },

    formatTime(date) {
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'م' : 'ص';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    },

    parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return { hours, minutes, totalMinutes: hours * 60 + minutes };
    }
};

// ===================== UTILS: VALIDATORS =====================
export const Validators = {
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        return input
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .trim()
            .slice(0, 100);
    },

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    isValidName(name) {
        return name && name.length >= 2 && name.length <= 50 && /^[؀-ۿ\s]+$/.test(name);
    },

    isValidNumber(value, min = 0, max = Infinity) {
        const num = Number(value);
        return !isNaN(num) && num >= min && num <= max;
    }
};

// ===================== UTILS: HAPTICS =====================
export const Haptics = {
    enabled: true,

    setEnabled(enabled) {
        this.enabled = enabled;
    },

    trigger(pattern = 'light') {
        if (!this.enabled || !navigator.vibrate) return;

        const patterns = {
            light: [10],
            medium: [20],
            heavy: [30],
            success: [10, 50, 10],
            error: [50, 30, 50],
            warning: [20, 40, 20]
        };

        navigator.vibrate(patterns[pattern] || patterns.light);
    }
};

// ===================== UTILS: CONFETTI =====================
export const Confetti = {
    create(options = {}) {
        const {
            count = 30,
            colors = ['#0d8b4a', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444'],
            duration = 2000,
            origin = { x: 0.5, y: 0.5 }
        } = options;

        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 9999;
            overflow: hidden;
        `;
        document.body.appendChild(container);

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 8 + 4;
            const isCircle = Math.random() > 0.5;

            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: ${isCircle ? '50%' : '0'};
                left: ${origin.x * 100 + (Math.random() - 0.5) * 20}%;
                top: ${origin.y * 100}%;
                opacity: 1;
                transform: rotate(0deg);
            `;

            container.appendChild(particle);

            // Animate
            const angle = (Math.random() - 0.5) * Math.PI;
            const velocity = Math.random() * 300 + 100;
            const gravity = 400;
            const rotationSpeed = (Math.random() - 0.5) * 720;

            const startTime = performance.now();

            const animate = (currentTime) => {
                const elapsed = (currentTime - startTime) / 1000;
                const x = Math.sin(angle) * velocity * elapsed;
                const y = -Math.cos(angle) * velocity * elapsed + 0.5 * gravity * elapsed * elapsed;
                const rotation = rotationSpeed * elapsed;
                const opacity = Math.max(0, 1 - elapsed / (duration / 1000));

                particle.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
                particle.style.opacity = opacity;

                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            };

            requestAnimationFrame(animate);
        }

        setTimeout(() => container.remove(), duration + 100);
    }
};

// ===================== UTILS: NOTIFICATIONS =====================
export const Notifications = {
    async requestPermission() {
        if (!('Notification' in window)) return false;
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    },

    async send(title, options = {}) {
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;

        const defaultOptions = {
            icon: '/assets/icons/icon-192x192.png',
            badge: '/assets/icons/icon-72x72.png',
            dir: 'rtl',
            lang: 'ar',
            vibrate: [200, 100, 200],
            ...options
        };

        try {
            const registration = await navigator.serviceWorker?.ready;
            if (registration) {
                await registration.showNotification(title, defaultOptions);
            } else {
                new Notification(title, defaultOptions);
            }
        } catch (e) {
            console.warn('Notification failed:', e);
        }
    },

    schedule(title, options = {}, delay = 0) {
        if (delay <= 0) {
            this.send(title, options);
            return;
        }

        setTimeout(() => this.send(title, options), delay);
    }
};

// ===================== UTILS: DOM HELPERS =====================
export const DOM = {
    createElement(tag, classes = [], attributes = {}) {
        const el = document.createElement(tag);
        if (classes.length) el.classList.add(...classes);
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'text') el.textContent = value;
            else if (key === 'html') el.innerHTML = value;
            else el.setAttribute(key, value);
        });
        return el;
    },

    debounce(fn, delay = 300) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    },

    throttle(fn, limit = 100) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                fn(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};
