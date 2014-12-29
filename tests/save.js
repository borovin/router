define(function(require, exports, module) {
    //requirements
    var Router = require('router'),
        Backbone = require('bower_components/backbone/backbone');

    describe('Сохранение параметров в текущем роуте', function(){

        afterEach(function() {
            Backbone.history.stop();
        });

        it('Сохранение обязательных параметров', function(){

            var router = new Router({
                routes: {
                    'stores/:storeId/products/:productId': function(){

                    }
                }
            });

            Backbone.history.start({pushState: true});

            router.navigate('/stores/1/products/2');

            router.navigate({
                storeId: 2,
                productId: 4
            });

            expect(document.location.pathname).toEqual('/stores/2/products/4');

        });

        it('Сохранение опциональных параметров', function(){

            var router = new Router({
                routes: {
                    'stores/:storeId(/products/:productId)': function(){

                    }
                }
            });

            Backbone.history.start({pushState: true});

            router.navigate('/stores/1');

            router.navigate({
                storeId: 2,
                productId: 4
            });

            expect(document.location.pathname).toEqual('/stores/2/products/4');

        });

        it('Удаление опциональных параметров', function(){

            var router = new Router({
                routes: {
                    'stores/:storeId(/products/:productId)': function(){

                    }
                }
            });

            Backbone.history.start({pushState: true});

            router.navigate('/stores/1/products/2');

            router.navigate({
                storeId: 2,
                productId: null
            });

            expect(document.location.pathname).toEqual('/stores/2');

        });

        it('Игнор опциональных параметров', function(){

            var router = new Router({
                routes: {
                    'stores/:storeId(/products/:productId)': function(){

                    }
                }
            });

            Backbone.history.start({pushState: true});

            router.navigate('/stores/1');

            router.navigate({
                storeId: 2
            });

            expect(document.location.pathname).toEqual('/stores/2');

        });
    });
});