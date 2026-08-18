// ===================== CORE: STATE MANAGEMENT =====================
class Store {
    constructor(initialState = {}) {
        this.state = this.deepClone(initialState);
        this.listeners = new Map();
        this.reducers = new Map();
        this.middlewares = [];
        this.history = [];
        this.maxHistory = 50;
    }

    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (Array.isArray(obj)) return obj.map(item => this.deepClone(item));
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) cloned[key] = this.deepClone(obj[key]);
        }
        return cloned;
    }

    getState(path = null) {
        if (!path) return this.deepClone(this.state);
        const keys = path.split('.');
        let value = this.state;
        for (const key of keys) {
            if (value === undefined || value === null) return undefined;
            value = value[key];
        }
        return this.deepClone(value);
    }

    dispatch(action) {
        // Run middlewares
        let processedAction = action;
        for (const mw of this.middlewares) {
            processedAction = mw(processedAction, this.state);
            if (!processedAction) return;
        }

        // Save history for undo
        this.history.push(this.deepClone(this.state));
        if (this.history.length > this.maxHistory) this.history.shift();

        // Apply reducers
        const newState = this.deepClone(this.state);
        if (this.reducers.has(action.type)) {
            const reducer = this.reducers.get(action.type);
            this.state = reducer(newState, processedAction);
        } else {
            // Default: merge payload
            if (processedAction.payload) {
                this.mergeDeep(this.state, processedAction.payload);
            }
        }

        // Notify subscribers
        this.notify(processedAction.type, processedAction.path);

        // Auto-save to localStorage
        this.persist();
    }

    mergeDeep(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key] || typeof target[key] !== 'object') target[key] = {};
                this.mergeDeep(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }

    subscribe(key, callback, immediate = false) {
        if (!this.listeners.has(key)) this.listeners.set(key, new Set());
        this.listeners.get(key).add(callback);
        if (immediate) callback(this.getState(key));
        return () => this.listeners.get(key).delete(callback);
    }

    notify(actionType, path) {
        // Notify specific path listeners
        if (path && this.listeners.has(path)) {
            this.listeners.get(path).forEach(cb => cb(this.getState(path)));
        }
        // Notify wildcard listeners
        if (this.listeners.has('*')) {
            this.listeners.get('*').forEach(cb => cb(this.getState(), actionType));
        }
    }

    addReducer(type, reducer) {
        this.reducers.set(type, reducer);
    }

    addMiddleware(mw) {
        this.middlewares.push(mw);
    }

    persist() {
        try {
            localStorage.setItem('islamicHabitApp_v2', JSON.stringify(this.state));
        } catch (e) {
            console.warn('Storage full, using memory only');
        }
    }

    load() {
        try {
            const saved = localStorage.getItem('islamicHabitApp_v2');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
                return true;
            }
        } catch (e) {
            console.error('Failed to load state:', e);
        }
        return false;
    }

    undo() {
        if (this.history.length > 0) {
            this.state = this.history.pop();
            this.notify('UNDO', null);
            this.persist();
        }
    }

    reset() {
        this.history = [];
        this.state = this.deepClone(this.initialState || {});
        this.notify('RESET', null);
        this.persist();
    }
}

// Singleton instance
const initialState = {
    user: {
        name: '',
        avatar: '',
        level: 1,
        xp: 0,
        streak: 0,
        longestStreak: 0,
        joinedDate: null,
        settings: {
            theme: 'dark',
            notifications: true,
            haptics: true,
            language: 'ar',
            prayerMethod: 4
        }
    },
    prayers: {
        fajr: { completed: false, time: null, jamaah: false },
        dhuhr: { completed: false, time: null, jamaah: false },
        asr: { completed: false, time: null, jamaah: false },
        maghrib: { completed: false, time: null, jamaah: false },
        isha: { completed: false, time: null, jamaah: false }
    },
    habits: {},
    athkar: { morning: {}, evening: {}, sleep: {} },
    wird: { dailyGoal: 5, lastPage: 1, history: [] },
    progress: {},
    garden: [],
    achievements: [],
    stats: {
        totalCompleted: 0,
        currentStreak: 0,
        bestStreak: 0,
        weeklyRate: [],
        monthlyRate: []
    },
    prayerTimes: null,
    prayerTimesDate: null,
    lastSync: null,
    version: '2.0.0'
};

export const store = new Store(initialState);
export default Store;
