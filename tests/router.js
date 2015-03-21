define(function (require, exports, module) {
    //requirements
    var router = require('router');

    describe(module.id, function () {

        afterEach(function () {
            router.stop();
            router.clear();
        });

        it('Register route path', function () {

            var handler = jasmine.createSpy('handler');

            router.setRoute('/path', handler);

            router.start();

            router.navigate('/path/');

            expect(handler).toHaveBeenCalled();

        });

        it('Register routes list', function () {

            var handler = jasmine.createSpy('handler');

            router.setRoutes({
                '/path': handler
            });

            router.start();

            router.navigate('/path/');

            expect(handler).toHaveBeenCalled();

        });

        it('Register routes nested list', function () {

            var handler = jasmine.createSpy('handler');

            router.setRoutes({
                '/path': {
                    '/to': {
                        '/page': handler
                    }
                }
            });

            router.start();

            router.navigate('/path/to/page');

            expect(handler).toHaveBeenCalled();

        });

        it('Merge params and query', function () {

            var params;

            router.setRoutes({
                '/number/:number': {
                    '/string/:string': {
                        '/bool/:bool': function (ctx) {
                            params = ctx.params;
                        }
                    }
                }
            });

            router.start();

            router.navigate('/number/1/string/a/bool/true?queryNumber=2&queryString=b&queryBool=false');

            expect(params.number).toEqual(1);
            expect(params.string).toEqual('a');
            expect(params.bool).toEqual(true);
            expect(params.queryNumber).toEqual(2);
            expect(params.queryString).toEqual('b');
            expect(params.queryBool).toEqual(false);

        });

    });
});