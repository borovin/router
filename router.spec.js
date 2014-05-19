define(function(require, exports, module) {
    //requirements
    var router = require('./router');

    describe(module.id, function() {

        afterEach(function() {
            router.routes = {};
            router.stop();
        });

        it('call root route', function() {

            var root = jasmine.createSpy('root');

            router.routes = {
                '*path': root
            };

            router.start();

            expect(root).toHaveBeenCalled();
        });

        it('call custom route', function() {

            var route = jasmine.createSpy('route');

            router.routes = {
                'stores/:storeId/products/:productId': route
            };

            router.start();

            router.navigate('/stores/1/products/2');

            expect(route).toHaveBeenCalledWith({
                params: {
                    storeId: '1',
                    productId: '2'
                },
                route: 'stores/:storeId/products/:productId'
            });
        });

        it('call custom route with query params', function() {

            var route = jasmine.createSpy('route');

            router.routes = {
                'stores/:storeId': route
            };

            router.start();

            router.navigate('/stores/0?storeId=1&productId=2');

            expect(route).toHaveBeenCalledWith({
                params: {
                    storeId: '0',
                    productId: '2'
                },
                route: 'stores/:storeId'
            });
        });

        it('call route with query params only', function() {

            var route = jasmine.createSpy('route');

            router.routes = {
                'stores(/)': route
            };

            router.start();

            router.navigate('/stores?test=1');

            expect(route).toHaveBeenCalledWith({
                params: {
                    test: '1'
                },
                route: 'stores(/)'
            });
        });

    });
});