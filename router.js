var _ = require('lodash');
var $ = require('jquery');
var qs = require('qs');
var page404 = require('./404.ejs!ejsLoader');

var location = window.location;
var history = window.history;

var router = {};


/**
 * Running flag.
 */

var running;


/**
 * Handle "populate" events.
 */

var onpopstate = (function () {

    var loaded = false;

    if (typeof window === 'undefined') {
        return;
    }

    if (document.readyState === 'complete') {
        loaded = true;
    } else {
        window.addEventListener('load', function () {
            setTimeout(function () {
                loaded = true;
            }, 0);
        });
    }

    return function () {

        if (!loaded) {
            return;
        }

        router.navigate(location.pathname + location.search + location.hash, {
            replace: true
        });
    };
})();


/**
 * Handle "click" events.
 */

router.onClick = function (event) {

    var element;
    var link;

    if (event.metaKey || event.ctrlKey || event.shiftKey) {
        return;
    }

    if (event.defaultPrevented) {
        return;
    }

    element = event.currentTarget;

    // Ignore if tag has
    // 1. "download" attribute
    // 2. "target" attribute
    // 3. rel="external" attribute
    if (element.hasAttribute('download') ||
        element.hasAttribute('target') ||
        element.getAttribute('rel') === 'external') {
        return;
    }

    link = element.getAttribute('href');

    // Check for mailto: in the href
    if (link && link.indexOf('mailto:') > -1) {
        return;
    }

    if (link && link.indexOf('http') === 0) {
        return;
    }

    event.preventDefault();

    router.navigate(link);
};

/**
 * Start navigation.
 *
 * @api public
 */

router.start = function () {

    var url;

    if (running) {
        return;
    }

    running = true;

    $(window).on('popstate', onpopstate);
    $(document).on('click', '[href]', router.onClick);

    url = location.pathname + location.search + location.hash;

    router.navigate(url, {
        replace: true
    });
};


router.navigate = function (url, options) {

    options = _.defaults(options || {}, {
        replace: false
    });

    history[options.replace ? 'replaceState' : 'pushState']({}, '', url);
    router.current = url;

    return router.loadPage(url).catch(router.renderError);

};

router.loadPage = function(url){

    var pageUrl = ('pages' + url.split('?')[0] + '/index').split('//').join('/');

    return System.import(pageUrl).then(function (Page) {
        new Page();
    });
};

router.renderError = function(error){
    document.body.innerHTML = page404({
        error: error
    })
};

router.setParams = function (params) {

    var currentQuery = qs.parse(document.location.search.substring(1));

    _.extend(currentQuery, params);

    window.history.replaceState({}, '', '?' + qs.stringify(currentQuery));

};

router.getParams = function () {

    return qs.parse(document.location.search.substring(1));

};

router.extend = function(options){
    return _.extend({}, router, options);
};

module.exports = router;
