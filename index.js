const qs = require('qs');
const Route = require('route-parser');
const defaults = require('lodash.defaults');
const forEach = require('lodash.foreach');

let running = false;
let routePattern;

function getCurrentUrl() {
    return document.location.pathname + document.location.search + document.location.hash;
}

function loadPage(options) {
    const url = options.pagePath;

    const pageUrl = (`pages/${url.split('?')[0].split('#')[0]}/index`)
        .split('//')
        .join('/');

    return window.System && Promise.resolve(System.import(pageUrl)).then(Page => Page());
}

const router = {
    onPopstate() {
        this.navigate(getCurrentUrl(), {
            replace: true,
        });
    },

    routes: {},

    start() {
        if (running) {
            return Promise.resolve();
        }

        this.routes['*pagePath'] = loadPage;

        window.addEventListener('popstate', this.onPopstate);

        const navigate = this.navigate(getCurrentUrl(), {
            replace: true,
        });

        running = true;

        return navigate;
    },

    stop() {
        running = false;

        window.removeEventListener('popstate', this.onPopstate);
    },

    navigate(url, options) {
        if (running && getCurrentUrl() === url) {
            return false;
        }

        const opt = defaults(options || {}, {
            replace: false,
        });

        let routeHandler;
        let routeParams;

        window.history[opt.replace ? 'replaceState' : 'pushState']({}, '', url);

        forEach(this.routes, (handler, pattern) => {
            const parsedRoute = new Route(pattern);
            const params = parsedRoute.match(url.split('#')[0]);

            if (params) {
                routePattern = pattern;
                routeHandler = handler;
                routeParams = params;

                return false;
            }
        });

        return Promise.resolve(routeHandler && routeHandler(routeParams)).catch(this.onError);
    },

    onError(error) {
        document.body.innerHTML = error;
    },

    set(params, options) {},

    get() {}
};

module.exports = router;

