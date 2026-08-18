// ===================== CORE: API SERVICE =====================
class ApiService {
    constructor() {
        this.baseURL = 'https://api.aladhan.com/v1';
        this.cache = new Map();
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
        this.fallbackTimes = {
            Fajr: '04:30',
            Sunrise: '05:50',
            Dhuhr: '12:15',
            Asr: '15:30',
            Maghrib: '18:00',
            Isha: '19:30'
        };
    }

    async fetchWithTimeout(url, options = {}, timeout = 10000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    }

    async getPrayerTimes(latitude, longitude, method = 4, date = new Date()) {
        const cacheKey = `${latitude.toFixed(2)},${longitude.toFixed(2)},${method},${date.toDateString()}`;

        // Check cache
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        try {
            const dateStr = date.toISOString().split('T')[0];
            const url = `${this.baseURL}/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${method}`;

            const response = await this.fetchWithTimeout(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            if (data.code === 200 && data.data) {
                const result = {
                    timings: data.data.timings,
                    date: data.data.date,
                    meta: data.data.meta
                };

                // Cache result
                this.cache.set(cacheKey, { data: result, timestamp: Date.now() });

                return result;
            }
            throw new Error('Invalid API response');
        } catch (error) {
            console.warn('Prayer times API failed, using fallback:', error.message);
            return {
                timings: this.fallbackTimes,
                date: { readable: date.toDateString() },
                meta: { method: { id: method } },
                isFallback: true
            };
        }
    }

    async getLocationByIP() {
        try {
            const response = await this.fetchWithTimeout('https://ipinfo.io/json');
            if (!response.ok) throw new Error('IP lookup failed');

            const data = await response.json();
            const [lat, lng] = data.loc.split(',').map(Number);

            return {
                latitude: lat,
                longitude: lng,
                city: data.city,
                country: data.country,
                timezone: data.timezone
            };
        } catch (error) {
            console.warn('IP geolocation failed:', error.message);
            // Default to Mecca
            return {
                latitude: 21.4225,
                longitude: 39.8262,
                city: 'مكة المكرمة',
                country: 'SA',
                timezone: 'Asia/Riyadh',
                isFallback: true
            };
        }
    }

    async getCurrentPosition(options = {}) {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                }),
                (error) => reject(error),
                { timeout: 10000, enableHighAccuracy: false, ...options }
            );
        });
    }

    async getHijriDate(date = new Date()) {
        try {
            const dateStr = date.toISOString().split('T')[0];
            const response = await this.fetchWithTimeout(
                `${this.baseURL}/gToH?date=${dateStr}`
            );

            if (!response.ok) throw new Error('Hijri API failed');

            const data = await response.json();
            return data.data || null;
        } catch (error) {
            console.warn('Hijri date fetch failed:', error.message);
            return null;
        }
    }

    clearCache() {
        this.cache.clear();
    }
}

export const api = new ApiService();
export default ApiService;
