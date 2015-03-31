define(function (require, exports, module) {
    //requirements
    var Router = require('router'),
        Backbone = require('bower_components/backbone/backbone');

    describe(module.id, function () {

        afterEach(function () {
            Backbone.history.stop();
        });

        it('Register route', function(){

            var handler = jasmine.createSpy('handler');

            var router = new Router({
                routes: {
                    'path(/)': handler
                }
            });

            Backbone.history.start({
                pushState: true
            });

            router.navigate('/path');

            expect(handler).toHaveBeenCalled();

        });

        it('Register nested routes', function(){

            var page1 = jasmine.createSpy('page1'),
                page2 = jasmine.createSpy('page2'),
                end = jasmine.createSpy('end');

            var router = new Router({
                routes: {
                    'path': {
                        '/to': {
                            '/page1(/)': page1,
                            '/page2(/)': page2
                        },
                        '/end(/)': end
                    }
                }
            });

            Backbone.history.start({
                pushState: true
            });

            router.navigate('/path/to/page1');
            router.navigate('/path/to/page2');
            router.navigate('/path/end');

            expect(page1).toHaveBeenCalled();
            expect(page2).toHaveBeenCalled();
            expect(end).toHaveBeenCalled();

        });

        it('Register route with string param', function(){

            var result;

            var router = new Router({
                routes: {
                    'path/:param(/:option)(/)': function(ctx){
                        result = ctx.params;
                    }
                }
            });

            Backbone.history.start({
                pushState: true
            });

            router.navigate('/path/a?query=a');

            expect(result.param).toEqual('a');
            expect(result.query).toEqual('a');
            expect(result.option).toBeUndefined();

            router.navigate('/path/b/b?query=b');

            expect(result.param).toEqual('b');
            expect(result.query).toEqual('b');
            expect(result.option).toEqual('b');

        });

        it('Register route with number param', function(){

            var result;

            var router = new Router({
                routes: {
                    'path/:param(/:option)(/)': function(ctx){
                        result = ctx.params;
                    }
                }
            });

            Backbone.history.start({
                pushState: true
            });

            router.navigate('/path/1?query=1');

            expect(result.param).toBe(1);
            expect(result.query).toBe(1);
            expect(result.option).toBeUndefined();

            router.navigate('/path/2/2?query=2');

            expect(result.param).toBe(2);
            expect(result.query).toBe(2);
            expect(result.option).toBe(2);

        });

        it('Register route with boolean param', function(){

            var result;

            var router = new Router({
                routes: {
                    'path/:param(/:option)(/)': function(ctx){
                        result = ctx.params;
                    }
                }
            });

            Backbone.history.start({
                pushState: true
            });

            router.navigate('/path/false?query=true');

            expect(result.param).toBe(false);
            expect(result.query).toBe(true);
            expect(result.option).toBeUndefined();

            router.navigate('/path/true/false?query=false');

            expect(result.param).toBe(true);
            expect(result.query).toBe(false);
            expect(result.option).toBe(false);

        });

        it('Navigate to route by params', function(){

            var router = new Router({
                routes: {
                    'path/:param(/:option)(/)': function(){}
                }
            });

            Backbone.history.start({
                pushState: true
            });

            router.navigate('/path/a');

            router.navigate({
                param: 'b',
                query: 'b'
            });

            expect(location.pathname).toBe('/path/b');
            expect(location.search).toBe('?query=b');

            router.navigate({
                param: 'c',
                option: 'c',
                query: 'c'
            });

            expect(location.pathname).toBe('/path/c/c');
            expect(location.search).toBe('?query=c');

        });

    });
});