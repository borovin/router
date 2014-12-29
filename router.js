define(function(require) {
    //requirements
    var Uri = require('bower_components/uri.js/src/URI'),
        _ = require('bower_components/lodash/dist/lodash'),
        makeClass = require('bower_components/makeClass/makeClass'),
        Backbone = require('bower_components/backbone/backbone');

    var Router = Backbone.Router;

    return makeClass(Router, {
        navigate: function(path, opt) {
            opt = _.extend({
                trigger: true
            }, opt);

            return Router.prototype.navigate.call(this, path, opt);
        },
        _extractParameters: function(routeRegExp, fragment) {

            var queryParams = new Uri(fragment).search(true),
                params = routeRegExp.exec(fragment.split('?')[0]).slice(1),
                namedParams = {},
                paramNames;

            _.any(this.routes, function(value, key){
                if (routeRegExp.test(key)){
                    paramNames = _.map(routeRegExp.exec(key).slice(1), function(name){
                        return name ? name.substring(1) : name;
                    });
                    return true;
                }
            });

            _.forEach(params, function(param, i) {
                if (paramNames && paramNames[i]){
                    namedParams[paramNames[i]] = param || null;
                }
            });

            return [_.extend(queryParams, namedParams)];
        }
    });
});