define(function(require, exports, module) {
    //requirements
    var Router = require('router'),
        Backbone = require('bower_components/backbone/backbone');

    describe('Ининциализация и навигация по роутам', function() {

        afterEach(function() {
            Backbone.history.stop();
        });

        it('call root route', function() {

            var handler = jasmine.createSpy('handler');

            new Router({
                routes: {
                    '*path': handler
                }
            });

            Backbone.history.start({pushState: true});

            expect(handler).toHaveBeenCalled();
        });

        it('call custom route', function() {

            var handler = jasmine.createSpy('handler');

            var router = new Router({
                routes: {
                    'stores/:storeId/products/:productId': handler
                }
            });

            Backbone.history.start({pushState: true});

            router.navigate('/stores/1/products/2', {
                trigger: true
            });

            expect(handler).toHaveBeenCalledWith({
                storeId: '1',
                productId: '2'
            });
        });

        it('Вызов роута с опциональными параметрами', function() {

            var handler = jasmine.createSpy('handler');

            var router = new Router({
                routes: {
                    'stores/:storeId(/products/:productId)': handler
                }
            });

            Backbone.history.start({pushState: true});

            router.navigate('/stores/1', {
                trigger: true
            });

            expect(handler).toHaveBeenCalledWith({
                storeId: '1',
                productId: null
            });
        });

        it('call custom route with query params', function() {

            var handler = jasmine.createSpy('handler');

            var router = new Router({
                routes: {
                    'stores/:storeId': handler
                }
            });

            Backbone.history.start({pushState: true});

            router.navigate('/stores/0?storeId=1&productId=2', {
                trigger: true
            });

            expect(handler).toHaveBeenCalledWith({
                storeId: '0',
                productId: '2'
            });
        });

        it('call route with query params only', function() {

            var handler = jasmine.createSpy('handler');

            var router = new Router({
                routes: {
                    'stores(/)': handler
                }
            });

            Backbone.history.start({pushState: true});

            router.navigate('/stores?test=1', {
                trigger: true
            });

            expect(handler).toHaveBeenCalledWith({
                test: '1'
            });
        });

    });
});