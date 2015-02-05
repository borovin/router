define(function(require) {
    //requirements
    var Uri = require('bower_components/uri.js/src/URI'),
        _ = require('bower_components/lodash/lodash'),
        makeClass = require('bower_components/makeClass/makeClass'),
        Backbone = require('bower_components/backbone/backbone');

    var Router = Backbone.Router;

    // Cached regular expressions for matching named param parts and splatted
    // parts of route strings.
    var optionalParam = /\((.*?)\)/g;
    var brackets = /\(|\)/g;
    var namedParam    = /(\(\?)?:\w+/g;

    return makeClass(Router, {
        _extractParameters: function(routeRegExp, fragment) {

            var queryParams = new Uri(fragment).search(true),
                params = routeRegExp.exec(fragment.split('?')[0]).slice(1),
                namedParams = {},
                paramNames;

            _.any(this.routes, function(value, key) {
                if (routeRegExp.test(key)) {

                    paramNames = _.map(routeRegExp.exec(key.replace(brackets, '')).slice(1), function(name) {
                        return name ? name.substring(1) : name;
                    });

                    return true;
                }
            });

            _.forEach(params, function(param, i) {
                if (paramNames && paramNames[i]) {
                    namedParams[paramNames[i]] = param || null;
                }
            });

            return [_.extend(queryParams, namedParams)];
        },
        navigate: function(fragment, opt) {

            var router = this,
                routeRegExp,
                currentRoute,
                params,
                currentParams;

            if (typeof fragment === 'string') {
                return Router.prototype.navigate.call(router, fragment, opt);
            }

            // if fragment is plain object
            _.any(this.routes, function(value, key) {

                var regExp = router._routeToRegExp(key);

                if (regExp.test(Backbone.history.fragment)) {
                    routeRegExp = regExp;
                    currentRoute = key;
                    return true;
                }
            });

            currentParams = router._extractParameters(routeRegExp, Backbone.history.fragment)[0];

            params = _.extend({}, currentParams, fragment);

            fragment = currentRoute
                .replace(optionalParam, function(match){

                    if (!match.match(namedParam)){
                        return '';
                    };

                    var paramName = match.match(namedParam)[0].substring(1),
                        param = params[paramName];

                    delete params[paramName];

                    if (param === null){
                        return '';
                    }

                    return match
                        .replace(brackets, '')
                        .replace(namedParam, param);
                })
                .replace(namedParam, function(match) {
                    var paramName = match.match(namedParam)[0].substring(1),
                        param = params[paramName];

                    delete params[paramName];

                    return param;
                });

            params = _.pick(params, function(value){
                return value !== null;
            });

            fragment = new Uri(fragment).setQuery(params).toString();

            return Router.prototype.navigate.call(router, fragment, opt);
        }
    });
});