const Route = require('route-parser');
const defaults = require('lodash.defaults');
const forEach = require('lodash.foreach');
const qs = require('qs');

let running = false;

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

function match() {
    const result = {};

    forEach(router.routes, (handler, pattern) => {
        const route = new Route(pattern);
        const params = route.match(getCurrentUrl());

        if (params) {
            result.handler = handler;
            result.params = params;
            result.route = route;
            return false;
        }
    });

    return result;
}

function onPopstate() {
    router.navigate(getCurrentUrl(), {
        replace: true,
    });
}

function getParams() {
    const route = match().route;
    const queryString = window.location.search.substring(1);
    const routeParams = route.match(getCurrentUrl());
    const queryParams = qs.parse(queryString);

    forEach(queryParams, (val, key) => {
        try {
            queryParams[key] = JSON.parse(val);
        } catch (e) {
            queryParams[key] = val;
        }
    });

    return defaults(routeParams, queryParams);
}

function setParams(params, options) {
    const route = match().route;
    let url = route.reverse(params);
    let routeParams = route.match(url);
    let queryParams = {};

    forEach(params, (val, key) => {
        if (!routeParams.hasOwnProperty(key)) {
            queryParams[key] = val;
        }
    });

    const queryString = qs.stringify(queryParams);

    if (queryString){
        url += `?${queryString}`;
    }

    if (window.location.hash){
        url += window.location.hash;
    }

    router.navigate(url, options);
}

const router = {
    routes: {},

    start() {
        if (running) {
            return Promise.resolve();
        }

        this.routes['*pagePath'] = loadPage;

        window.addEventListener('popstate', onPopstate);

        const navigate = this.navigate(getCurrentUrl(), {
            replace: true,
        });

        running = true;

        return navigate;
    },

    stop() {
        running = false;

        window.removeEventListener('popstate', onPopstate);
    },

    navigate(url, options) {
        if (running && getCurrentUrl() === url) {
            return false;
        }

        const opt = defaults(options || {}, {
            replace: false,
        });

        window.history[opt.replace ? 'replaceState' : 'pushState']({}, '', url);

        const route = match();

        return Promise.resolve(route.handler && route.handler(route.params)).catch(this.onError);
    },

    onError(error) {
        alert(error);
    },

    params(params, options) {
        return params ? setParams(params, options) : getParams();
    }
};

module.exports = router;

