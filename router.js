define(function (require) {

    var page = require('bower_components/page.js/page'),
        queryString = require('bower_components/query-string/query-string'),
        _ = require('bower_components/lodash/lodash');

    var router = function(){

        var args = [].slice.call(arguments);

        if (args.length >= 2){

            args.splice(1, 0, function(ctx, next){

                var data = _.extend(queryString.parse(ctx.querystring), ctx.params);

                ctx.data = _.transform(data, function(result, data, key) {

                    result[key] = data;

                    if (data === 'true'){
                        result[key] = true;
                    }

                    if (data === 'false'){
                        result[key] = false;
                    }

                    if (!isNaN(Number(data))){
                        result[key] = Number(data)
                    }
                });

                router.currentPathTemplate = ctx.pathTemplate = args[0];

                next();
            });
        }

        return page.apply(null, args);

    };

    _.extend(router, page);

    return router;
});