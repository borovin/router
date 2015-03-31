define(function (require) {
    //requirements
    var _ = require('bower_components/lodash/lodash'),
        queryString = require('bower_components/query-string/query-string'),
        makeClass = require('bower_components/makeClass/makeClass'),
        Backbone = require('bower_components/backbone/backbone');

    var Router = Backbone.Router;

    // Cached regular expressions for matching named param parts and splatted
    // parts of route strings.
    var optionalParam = /\((.*?)\)/g;
    var brackets = /\(|\)/g;
    var namedParamRegExp = /(\(\?)?:\w+/g;

    function expand(prefix, object){

        var result = {};

        if (typeof prefix !== 'string'){
            object = prefix;
            prefix = '';
        }

        _.forEach(object, function(value, key){

            if (_.isPlainObject(value)){
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

            options.routes = expand(options.routes);

            Router.apply(this, arguments);

        },
        _extractParameters: function(routeRegExp, fragment) {

            var pathName = fragment.split('?')[0],
                query = fragment.split('?')[1],
                queryParams = queryString.parse(query),
                params = routeRegExp.exec(pathName).slice(1),
                paramNames = [],
                namedParams = {},
                result;

            _.find(this.routes, function(value, key) {

                if (routeRegExp.test(key)) {

                    paramNames = _.map(key.match(namedParamRegExp), function(name) {
                        return name.substring(1);
                    });

                    return true;
                }
            });

            _.forEach(params, function(param, index){

                if (typeof param === 'undefined'){
                    return;
                }

                namedParams[paramNames[index]] = param;

            });

            result = _.mapValues(_.extend(queryParams, namedParams), function(value){

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
        navigate: function(fragment, options){

            options = _.extend({
                trigger: true,
                replace: false
            }, options);

            return Router.prototype.navigate.call(this, fragment, options);

        }
    });
});