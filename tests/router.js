define(function(require, exports, module) {
    //requirements
    var router = require('router');

    describe(module.id, function() {

        afterEach(function() {
            router.stop();
        });

        it('Save path template to router and context', function(){

            var ctxPathTemplate;

            router('/test/:test', function(ctx){
                ctxPathTemplate = ctx.pathTemplate;
            });

            router.start();

            router.show('/test/1');

            expect(ctxPathTemplate).toEqual('/test/:test');
            expect(router.currentPathTemplate).toEqual('/test/:test');

        });

        it('Save all params to data', function(){

            var data;

            router('/number/:number/string/:string/bool/:bool', function(ctx){
                data = ctx.data;
            });

            router.start();

            router.show('/number/1/string/a/bool/true?queryNumber=2&queryString=b&queryBool=false');

            expect(data.number).toEqual(1);
            expect(data.string).toEqual('a');
            expect(data.bool).toEqual(true);
            expect(data.queryNumber).toEqual(2);
            expect(data.queryString).toEqual('b');
            expect(data.queryBool).toEqual(false);

        });
    });
});