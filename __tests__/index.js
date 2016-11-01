const router = require('../index');

afterEach(() => {
    router.navigate('/test/path?a=1&b=b&c=false#hash');
    router.stop();
    router.routes = {};
});

it('should call defined route handler', () => {
    const handler = jest.fn();

    router.routes = {
        '/test/path': handler
    };

    router.start();

    expect(handler).toHaveBeenCalled();
});

it('should call undefined route handler through Systemjs loader', () => {
    window.System = {
        import: jest.fn()
    };

    router.start();

    expect(window.System.import).toHaveBeenCalledWith('pages/test/path/index');
});

it('should prevent from starting twice', () => {
    const handler = jest.fn();

    router.routes = {
        '/test/path': handler
    };

    router.start();
    router.start();

    expect(handler).toHaveBeenCalledTimes(1);
});

it('should prevent from navigating at the same url', () => {
    const handler = jest.fn();

    router.routes = {
        '/test/path': handler
    };

    router.start();

    router.navigate('/test/path?a=1&b=b&c=false#hash');

    expect(handler).toHaveBeenCalledTimes(1);
});

it('should return route params', () => {
    router.routes = {
        '/test/:b': function(){}
    };

    expect(router.params()).toEqual({
        b: 'path',
        a: 1,
        c: false
    });
});

it('should set route params', () => {
    router.routes = {
        '/test/:b': function(){}
    };

    router.start();

    router.params({
        b: 'b',
        a: 2,
        c: true
    });

    expect(window.location.href).toBe('http://localhost/test/b?a=2&c=true#hash');
});