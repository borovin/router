define(function (require) {

    var page = require('bower_components/page.js/page'),
        queryString = require('bower_components/query-string/query-string'),
        _ = require('bower_components/lodash/lodash');

    var router = function (routes, parentPathTemplate) {

        if (!_.isPlainObject(routes)) {
            return page.apply(null, arguments);
        }

        parentPathTemplate = parentPathTemplate || '';

        _.forEach(routes, function (handler, pathTemplate) {

            pathTemplate = parentPathTemplate + pathTemplate;

            if (typeof handler === 'function') {
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

                        if (!isNaN(Number(data))) {
                            result[key] = Number(data)
                        }
                    });

                    router.execute(ctx, handler);
                });
            } else {

                router(handler, pathTemplate);

            }

        });

    };

    _.extend(router, page);

    router.execute = function (ctx, handler) {

        handler(ctx);

    };

    return router;
});