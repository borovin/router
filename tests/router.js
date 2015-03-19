define(function (require, exports, module) {
    //requirements
    var router = require('router');

    describe(module.id, function () {

        afterEach(function () {
            router.stop();
        });

        it('Call route', function () {

            var handler = jasmine.createSpy('handler');

            router({
                '/path': handler
            });

            router.start();

            router('/path/');

            expect(handler).toHaveBeenCalled();

        });

        it('Call nested route', function () {

            var handler = jasmine.createSpy('handler');

            router({
                '/path': {
                    '/to': {
                        '/page': handler
                    }
                }
            });

            router.start();

            router('/path/to/page');

            expect(handler).toHaveBeenCalled();

        });

        it('Merge params and query', function () {

            var params;

            router({
                '/number/:number': {
                    '/string/:string': {
                        '/bool/:bool': function (ctx) {
                            params = ctx.params;
                        }
                    }
                }
            });

            router.start();

            router('/number/1/string/a/bool/true?queryNumber=2&queryString=b&queryBool=false');

            expect(params.number).toEqual(1);
            expect(params.string).toEqual('a');
            expect(params.bool).toEqual(true);
            expect(params.queryNumber).toEqual(2);
            expect(params.queryString).toEqual('b');
            expect(params.queryBool).toEqual(false);

        });

        it('Change execute method', function () {

            var handler = jasmine.createSpy('handler');

            router.execute = function(ctx, handler){

                handler('test');

            };

            router({
                '/execute': handler
            });

            router.start();

            router('/execute');

            expect(handler).toHaveBeenCalledWith('test');

        });
    });
});