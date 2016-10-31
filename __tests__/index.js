const router = require('../index');

afterEach(() => {
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

it('onPopstate handler should call navigate method', () => {
    router.navigate = jest.fn();

    router.start();

    router.onPopstate();

    expect(router.navigate).toHaveBeenCalledWith('/test/path?a=1&b=b&c=false#hash', {replace: true});
});