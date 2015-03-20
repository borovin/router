if (typeof exports === 'object' && typeof define !== 'function') {
    var define = function (factory) {
        factory(require, exports, module);
    };
}

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

    router.list = function (routes, parentPathTemplate) {

        if (!_.isPlainObject(routes)) {
            return page.apply(null, arguments);
        }

        parentPathTemplate = parentPathTemplate || '';

        _.forEach(routes, function (handler, pathTemplate) {

            pathTemplate = parentPathTemplate + pathTemplate;

            if (typeof handler === 'function') {

                router.path(pathTemplate, handler);

            } else {

                router.list(handler, pathTemplate);

            }

        });

    };

    router.path = function (pathTemplate, handler) {

        page(pathTemplate, function (ctx) {

            _.extend(ctx, {
                pathTemplate: pathTemplate,
                params: _.extend(queryString.parse(ctx.querystring), ctx.params)
            });

            ctx.params = _.transform(ctx.params, function (result, data, key) {

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

            handler(ctx);
        });

    };

    module.exports = router;
});