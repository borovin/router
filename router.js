define(function(require) {
    //requirements
    var Uri = require('bower_components/uri.js/src/URI'),
        _ = require('bower_components/lodash/dist/lodash');

    // Cached regex for stripping leading and trailing slashes.
    var rootStripper = /^\/+|\/+$/g;

    // Cached regex for stripping a leading hash/slash and trailing space.
    var routeStripper = /^[#\/]|\s+$/g;

    // Cached regex for removing a trailing slash.
    var trailingSlash = /\/$/;

    // Cached regular expressions for matching named param parts and splatted
    // parts of route strings.
    var optionalParam = /\((.*?)\)/g;
    var namesPattern = /[\:\*]([^\:\(\)\?\/]+)/g;
    var namedParam = /(\(\?)?:\w+/g;
    var splatParam = /\*\w+/g;
    var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;

    return _.extend({
        routes: {},
        root: '/',
        _handlers: [],

        start: function(options) {

            this._bindRoutes();

            options = _.extend({
                silent: false
            });

            if (this.started) {
                throw new Error("Router has already been started");
            }

            this.started = true;

            this.fragment = this._getFragment();

            // Normalize root to always include a leading and trailing slash.
            this.root = ('/' + this.root + '/').replace(rootStripper, '/');

            window.addEventListener('popstate', this._checkUrl.bind(this));

            if (!options.silent) {
                this._loadUrl();
            }

            return this;
        },

        stop: function() {
            window.removeEventListener('popstate', this._checkUrl);
            this.started = false;
        },

        // Save a fragment into the hash history, or replace the URL state if the
        // 'replace' option is passed. You are responsible for properly URL-encoding
        // the fragment in advance.
        //
        // The options object can contain `trigger: true` if you wish to have the
        // route callback be fired (not usually desirable), or `replace: true`, if
        // you wish to modify the current URL without adding an entry to the history.
        navigate: function(fragment, options) {

            if (!this.started) {
                return this;
            }

            options = _.extend({
                trigger: true,
                replace: false
            }, options);

            fragment = this._getFragment(fragment || '');

            if (this.fragment === fragment) {
                return this;
            }

            this.fragment = fragment;

            var url = this.root + fragment;

            window.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

            if (options.trigger) {
                this._loadUrl(fragment);
            }

            return this;
        },

        save: function(params) {

            if (!_.isPlainObject(params)) {
                return;
            }

            var router = this,
                currentParams = router._extractParameters(router.handler.route, router.handler.routeRegExp, router.fragment),
                fragment;

            params = _.extend({}, currentParams, params);

            fragment = router.handler.route
                .replace(optionalParam, '')
                .replace(namedParam, function(match) {
                    var paramName = match.match(namesPattern)[0].substring(1),
                        param = params[paramName];

                    delete params[paramName];

                    return param;
                });

            fragment = new Uri(fragment).setQuery(params).toString();

            router.navigate(fragment, {
                trigger: false
            });
        },

        // Get the cross-browser normalized URL fragment, either from the URL,
        // the hash, or the override.
        _getFragment: function(fragment) {
            if (fragment == null) {
                fragment = window.location.pathname + window.location.search;
                var root = this.root.replace(trailingSlash, '');
                if (!fragment.indexOf(root)) fragment = fragment.substr(root.length);
            }

            return fragment.replace(routeStripper, '');
        },

        // Checks the current URL to see if it has changed, and if it has,
        // calls `_loadUrl`, normalizing across the hidden iframe.
        _checkUrl: function() {

            if (this._getFragment() === this.fragment) {
                return this;
            }

            this._loadUrl();
            return this;
        },

        // Attempt to load the current URL fragment. If a route succeeds with a
        // match, returns `true`. If no defined routes matches the fragment,
        // returns `false`.
        _loadUrl: function(fragmentOverride) {

            var router = this;
            var fragment = this.fragment = router._getFragment(fragmentOverride);
            var fragmentPath = fragment.split('?')[0];

            return _.any(router._handlers, function(handler) {
                if (handler.routeRegExp.test(fragmentPath)) {
                    router.handler = handler;
                    handler.callback(fragment);
                    return true;
                }
            });
        },

        _bindRoute: function(route, callback) {

            var router = this,
                routeRegExp = this._routeToRegExp(route);

            this._handlers.unshift({
                route: route,
                routeRegExp: routeRegExp,
                callback: function(fragment) {
                    var params = router._extractParameters(route, routeRegExp, fragment);
                    callback && callback.call(router, {
                        params: params,
                        route: route
                    });
                }
            });

            return this;
        },

        // Bind all defined routes to router. We have to reverse the
        // order of the routes here to support behavior where the most general
        // routes can be defined at the bottom of the route map.
        _bindRoutes: function() {

            if (!this.routes) {
                return;
            }

            this.routes = _.result(this, 'routes');

            var route, routes = _.keys(this.routes);

            while ((route = routes.pop()) != null) {
                this._bindRoute(route, this.routes[route]);
            }
        },

        // Convert a route string into a regular expression, suitable for matching
        // against the current location hash.
        _routeToRegExp: function(route) {
            route = route.replace(escapeRegExp, '\\$&')
                .replace(optionalParam, '(?:$1)?')
                .replace(namedParam, function(match, optional) {
                    return optional ? match : '([^\/]+)';
                })
                .replace(splatParam, '(.*?)');
            return new RegExp('^' + route + '$');
        },

        // Given a route, and a URL fragment that it matches, return the hash of
        // extracted parameters.
        _extractParameters: function(route, routeRegExp, fragment) {
            var params = routeRegExp.exec(fragment.split('?')[0]).slice(1),
                queryParams = new Uri(fragment).search(true),
                paramNames = _.map(route.match(namesPattern) || [], function(name) {
                    return name.substring(1);
                }),
                namedParams = {};

            _.forEach(params, function(param, i) {
                namedParams[paramNames[i]] = param;
            });

            return _.extend(queryParams, namedParams);
        }
    });
});