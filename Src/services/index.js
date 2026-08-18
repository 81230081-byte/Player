// ===================== SERVICES: PRAYER TIMES =====================
import { api } from '../core/api.js';
import { store } from '../core/state.js';
import { DateUtils } from '../utils/index.js';

export class PrayerTimeService {
    constructor() {
        this.updateInterval = null;
        this.countdownInterval = null;
        this.nextPrayer = null;
        this.listeners = new Set();
    }

    async initialize() {
        const saved = store.getState('prayerTimes');
        const savedDate = store.getState('prayerTimesDate');
        const today = new Date().toDateString();

        if (saved && savedDate === today) {
            this.nextPrayer = this.calculateNextPrayer(saved.timings);
            this.startCountdown();
            return saved;
        }

        return this.refresh();
    }

    async refresh(force = false) {
        try {
            let location;

            try {
                location = await api.getCurrentPosition();
            } catch (e) {
                location = await api.getLocationByIP();
            }

            const method = store.getState('user.settings.prayerMethod') || 4;
            const result = await api.getPrayerTimes(
                location.latitude, 
                location.longitude, 
                method
            );

            store.dispatch({
                type: 'SET_PRAYER_TIMES',
                payload: {
                    prayerTimes: result,
                    prayerTimesDate: new Date().toDateString(),
                    location: {
                        city: location.city,
                        country: location.country
                    }
                }
            });

            this.nextPrayer = this.calculateNextPrayer(result.timings);
            this.startCountdown();

            return result;
        } catch (error) {
            console.error('Failed to refresh prayer times:', error);
            throw error;
        }
    }

    calculateNextPrayer(timings) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const prayers = [
            { id: 'fajr', name: 'Fajr', ar: 'الفجر' },
            { id: 'sunrise', name: 'Sunrise', ar: 'الشروق' },
            { id: 'dhuhr', name: 'Dhuhr', ar: 'الظهر' },
            { id: 'asr', name: 'Asr', ar: 'العصر' },
            { id: 'maghrib', name: 'Maghrib', ar: 'المغرب' },
            { id: 'isha', name: 'Isha', ar: 'العشاء' }
        ];

        let nextPrayer = null;
        let minDiff = Infinity;

        for (const prayer of prayers) {
            if (!timings[prayer.name]) continue;

            const time = DateUtils.parseTime(timings[prayer.name]);
            const prayerMinutes = time.totalMinutes;

            let diff = prayerMinutes - currentMinutes;
            if (diff < 0) diff += 24 * 60; // Next day

            if (diff < minDiff) {
                minDiff = diff;
                nextPrayer = {
                    ...prayer,
                    time: timings[prayer.name],
                    timeMinutes: prayerMinutes,
                    remainingMinutes: diff,
                    isTomorrow: prayerMinutes < currentMinutes
                };
            }
        }

        return nextPrayer;
    }

    startCountdown() {
        if (this.countdownInterval) clearInterval(this.countdownInterval);

        const update = () => {
            if (!this.nextPrayer) return;

            const now = new Date();
            const target = new Date();
            const [hours, minutes] = this.nextPrayer.time.split(':').map(Number);

            target.setHours(hours, minutes, 0);
            if (this.nextPrayer.isTomorrow) {
                target.setDate(target.getDate() + 1);
            }

            const diff = target - now;

            if (diff <= 0) {
                // Prayer time reached, recalculate
                this.nextPrayer = this.calculateNextPrayer(
                    store.getState('prayerTimes.timings')
                );
                this.notifyListeners('prayerTime', this.nextPrayer);
                return;
            }

            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);

            this.notifyListeners('countdown', { hours: h, minutes: m, seconds: s });
        };

        update(); // Immediate update
        this.countdownInterval = setInterval(update, 1000);
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notifyListeners(event, data) {
        this.listeners.forEach(cb => cb(event, data));
    }

    cleanup() {
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        if (this.updateInterval) clearInterval(this.updateInterval);
        this.listeners.clear();
    }

    togglePrayer(prayerId) {
        const prayers = store.getState('prayers');
        const current = prayers[prayerId];

        store.dispatch({
            type: 'TOGGLE_PRAYER',
            payload: {
                prayers: {
                    [prayerId]: {
                        ...current,
                        completed: !current.completed,
                        time: !current.completed ? new Date().toISOString() : null
                    }
                }
            }
        });

        return !current.completed;
    }
}

// ===================== SERVICES: SYNC =====================
export class SyncService {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        this.setupListeners();
    }

    setupListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    async syncToCloud() {
        if (!this.isOnline) {
            return { success: false, error: 'Offline' };
        }

        try {
            const state = store.getState();
            // Placeholder for actual cloud sync
            // await fetch('/api/sync', { method: 'POST', body: JSON.stringify(state) });

            store.dispatch({
                type: 'SET_LAST_SYNC',
                payload: { lastSync: new Date().toISOString() }
            });

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async restoreFromCloud() {
        if (!this.isOnline) {
            return { success: false, error: 'Offline' };
        }

        try {
            // Placeholder for actual cloud restore
            // const response = await fetch('/api/sync');
            // const data = await response.json();
            // store.dispatch({ type: 'RESTORE_STATE', payload: data });

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    queueAction(action) {
        this.syncQueue.push({
            action,
            timestamp: Date.now()
        });

        if (this.isOnline) {
            this.processQueue();
        }
    }

    async processQueue() {
        while (this.syncQueue.length > 0) {
            const item = this.syncQueue.shift();
            try {
                // Process item
                console.log('Processing sync queue item:', item);
            } catch (error) {
                this.syncQueue.unshift(item);
                break;
            }
        }
    }

    exportData() {
        const state = store.getState();
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `islamic-habits-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    async importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    store.dispatch({ type: 'RESTORE_STATE', payload: data });
                    resolve({ success: true });
                } catch (error) {
                    reject(new Error('Invalid backup file'));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
}

// ===================== SERVICES: ANALYTICS =====================
export class AnalyticsService {
    constructor() {
        this.events = [];
        this.sessionStart = Date.now();
    }

    track(eventName, properties = {}) {
        const event = {
            name: eventName,
            properties,
            timestamp: Date.now(),
            sessionId: this.sessionStart
        };

        this.events.push(event);

        // Keep only last 1000 events
        if (this.events.length > 1000) {
            this.events = this.events.slice(-1000);
        }

        // Send to analytics (placeholder)
        console.log('Analytics:', event);
    }

    getStats() {
        const state = store.getState();
        const habits = state.habits || {};
        const prayers = state.prayers || {};

        const totalHabits = Object.keys(habits).length;
        const completedHabits = Object.values(habits).filter(h => h.completed).length;
        const completedPrayers = Object.values(prayers).filter(p => p.completed).length;

        return {
            totalHabits,
            completedHabits,
            completionRate: totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0,
            completedPrayers,
            prayerRate: Math.round((completedPrayers / 5) * 100),
            currentStreak: state.user?.streak || 0,
            totalXP: state.user?.xp || 0,
            level: state.user?.level || 1
        };
    }

    getWeeklyProgress() {
        // Generate last 7 days data
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push({
                date: date.toDateString(),
                day: date.toLocaleDateString('ar-SA', { weekday: 'short' }),
                completed: Math.floor(Math.random() * 100) // Placeholder
            });
        }
        return days;
    }
}
