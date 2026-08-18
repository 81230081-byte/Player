// ===================== CORE: ROUTER =====================
class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.beforeHooks = [];
        this.afterHooks = [];
        this.cache = new Map();

        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('popstate', () => this.handleRoute());
    }

    register(path, component, options = {}) {
        this.routes.set(path, {
            component,
            title: options.title || '',
            requiresAuth: options.requiresAuth || false,
            transition: options.transition || 'fade',
            keepAlive: options.keepAlive || false
        });
        return this;
    }

    beforeEach(hook) {
        this.beforeHooks.push(hook);
    }

    afterEach(hook) {
        this.afterHooks.push(hook);
    }

    async navigate(path, replace = false) {
        const route = this.routes.get(path);
        if (!route) {
            console.warn(`Route ${path} not found`);
            return this.navigate('home', true);
        }

        // Run before hooks
        for (const hook of this.beforeHooks) {
            const result = await hook(path, this.currentRoute);
            if (result === false) return;
        }

        // Update URL
        if (replace) {
            window.location.replace(`#${path}`);
        } else {
            window.location.hash = path;
        }

        await this.handleRoute();
    }

    async handleRoute() {
        const hash = window.location.hash.slice(1) || 'home';
        const route = this.routes.get(hash);

        if (!route) return;

        // Cleanup previous route
        if (this.currentRoute && this.currentRoute.cleanup) {
            this.currentRoute.cleanup();
        }

        // Transition
        const app = document.getElementById('app-content');
        if (app) {
            app.style.opacity = '0';
            app.style.transform = 'translateY(10px)';
            await this.delay(150);
        }

        // Render new route
        const pageContainer = document.getElementById('page-container');
        if (pageContainer) {
            // Check cache
            if (route.keepAlive && this.cache.has(hash)) {
                pageContainer.innerHTML = '';
                pageContainer.appendChild(this.cache.get(hash));
            } else {
                const element = await route.component();
                pageContainer.innerHTML = '';
                if (typeof element === 'string') {
                    pageContainer.innerHTML = element;
                } else {
                    pageContainer.appendChild(element);
                }
                if (route.keepAlive) {
                    this.cache.set(hash, pageContainer.firstElementChild.cloneNode(true));
                }
            }
        }

        // Update nav
        this.updateNavigation(hash);

        // Update title
        if (route.title) {
            document.title = `${route.title} | عاداتي`;
        }

        // Animate in
        if (app) {
            requestAnimationFrame(() => {
                app.style.opacity = '1';
                app.style.transform = 'translateY(0)';
            });
        }

        this.currentRoute = route;

        // Run after hooks
        for (const hook of this.afterHooks) {
            await hook(hash);
        }
    }

    updateNavigation(activePath) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.route === activePath) {
                item.classList.add('active');
            }
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    goBack() {
        window.history.back();
    }

    getCurrentRoute() {
        return window.location.hash.slice(1) || 'home';
    }
}

export const router = new Router();
export default Router;
