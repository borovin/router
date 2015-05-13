define(function (require) {
    //requirements
    var _ = require('bower_components/lodash/lodash'),
        queryString = require('bower_components/query-string/query-string'),
        makeClass = require('bower_components/makeClass/makeClass'),
        deepExtend = require('bower_components/deepExtend/deepExtend'),
        Backbone = require('bower_components/backbone/backbone');

    var Router = Backbone.Router;

    // Cached regular expressions for matching named param parts and splatted
    // parts of route strings.
    var optionalParamRegExp = /\((.*?)\)/g;
    var bracketsRegExp = /\(|\)/g;
    var splatParam    = /\*\w+/g;
    var namedParamRegExp = /(\(\?)?:\w+/g;

    function expand(prefix, object) {

        var result = {};

        if (typeof prefix !== 'string') {
            object = prefix;
            prefix = '';
        }

        _.forEach(object, function (value, key) {

            if (_.isPlainObject(value)) {
                _.extend(result, expand(prefix + key, value));
            } else {
                result[prefix + key] = value;
            }

        });

        return result;

    }

    return makeClass(Router, {
        constructor: function (options) {

            options || (options = {});

            options.routes = expand(deepExtend({}, this.routes, options.routes));

            Router.apply(this, arguments);

        },
        _extractParameters: function (routeRegExp, fragment) {

            var router = this,
                pathName = fragment.split('?')[0],
                query = fragment.split('?')[1],
                queryParams = queryString.parse(query),
                params = routeRegExp.exec(pathName).slice(1),
                paramNames = [],
                namedParams = {},
                result;

            _.find(this.routes, function (value, key) {

                if (router._routeToRegExp(key).test(fragment)) {

                    paramNames = _.map(_.union(key.match(namedParamRegExp), key.match(splatParam)), function (name) {
                        return name.substring(1);
                    });

                    return true;
                }
            });

            _.forEach(params, function (param, index) {

                if (typeof param === 'undefined' || typeof paramNames[index] === 'undefined') {
                    return;
                }

                namedParams[paramNames[index]] = param;

            });

            result = _.mapValues(_.extend(queryParams, namedParams), function (value) {

                if (value === 'true') {
                    return true;
                }

                if (value === 'false') {
                    return false;
                }

                if (!_.isNaN(Number(value))) {
                    return Number(value)
                }

                return value;

            });

            return [result];
        },
        execute: function(handler, params){

            handler && handler.call(this, {
                params: params[0]
            })

        },
        navigate: function (fragment, options) {

            options = _.extend({
                trigger: true,
                replace: false
            }, options);

            if (_.isPlainObject(fragment)) {
                fragment = this.generateFragment(fragment)
            }

            return Router.prototype.navigate.call(this, fragment, options);

        },
        generateFragment: function (params) {

            var router = this,
                routeRegExp,
                currentRoute,
                currentParams,
                fragment;

            _.any(this.routes, function (value, key) {

                var regExp = router._routeToRegExp(key);

                if (regExp.test(Backbone.history.fragment)) {
                    routeRegExp = regExp;
                    currentRoute = key;
                    return true;
                }
            });

            currentParams = router._extractParameters(routeRegExp, Backbone.history.fragment)[0];

            params = _.extend({}, currentParams, params);

            fragment = currentRoute
                .replace(optionalParamRegExp, function(match){

                    var paramName = match.match(namedParamRegExp);

                    if (paramName){
                        paramName = paramName[0].substring(1);
                    } else {
                        return '';
                    }

                    var param = params[paramName];

                    delete params[paramName];

                    if (typeof param === 'undefined' || param === null) {
                        return '';
                    } else {
                        return match.replace(namedParamRegExp, param).replace(bracketsRegExp, '');
                    }

                })
                .replace(namedParamRegExp, function (match) {

                    var paramName = match.substring(1),
                        param = params[paramName];

                    delete params[paramName];

                    return param;
                });

            params = _.pick(params, function (value) {
                return value !== null;
            });

            fragment = fragment + '?' + queryString.stringify(params);

            return fragment;
        }
    });
});