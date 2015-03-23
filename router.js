define(function (require, exports, module) {

    var page = require('bower_components/page.js/page'),
        queryString = require('bower_components/query-string/query-string'),
        _ = require('bower_components/lodash/lodash');

    var router = {};

    router.isStarted = false;

    router.start = function (options) {

        router.isStarted = true;

        page.start(options);
    };

    router.stop = function () {

        router.isStarted = false;

        page.stop();
    };

    router.clear = function () {

        page.callbacks = [];
    };

    router.navigate = function (path, options) {

        options = _.extend({
            trigger: true,
            replace: false
        }, options);

        page.show(path);
    };

    router.setRoutes = function (routes, parentPathTemplate) {

        if (!_.isPlainObject(routes)) {
            return page.apply(null, arguments);
        }

        parentPathTemplate = parentPathTemplate || '';

        _.forEach(routes, function (handler, pathTemplate) {

            pathTemplate = parentPathTemplate + pathTemplate;

            if (typeof handler === 'function') {

                router.setRoute(pathTemplate, handler);

            } else {

                router.setRoutes(handler, pathTemplate);

            }

        });

    };

    router.setRoute = function (pathTemplate, handler) {

        page(pathTemplate, function (ctx) {

            var context = {
                pathTemplate: pathTemplate,
                params: _.extend(queryString.parse(ctx.querystring), ctx.params)
            };

            context.params = _.transform(context.params, function (result, data, key) {

                result[key] = data;

                if (data === 'true') {
                    result[key] = true;
                }

                if (data === 'false') {
                    result[key] = false;
                }

                if (!_.isNaN(Number(data))) {
                    result[key] = Number(data)
                }
            });

            handler(context);
        });

    };

    module.exports = router;
});