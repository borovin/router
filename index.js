import { defaults, extend } from 'lodash-es';
import $ from 'jquery';
import qs from 'qs';

let running = false;
let loaded = false;

if (document.readyState === 'complete') {
  loaded = true;
} else {
  window.addEventListener('load', () => {
    setTimeout(() => {
      loaded = true;
    }, 0);
  });
}

function onpopstate() {
  if (!loaded) {
    return;
  }

  this.navigate(document.location.pathname + document.location.search + document.location.hash, {
    replace: true,
  });
}

export default {
  currentUrl: null,
  currentPage: null,
  baseUrl: '',
  pagesRoot: 'pages',

  onClick(event) {
    const router = this;

    if (event.metaKey || event.ctrlKey || event.shiftKey) {
      return;
    }

    if (event.defaultPrevented) {
      return;
    }

    const element = event.currentTarget;

    // Ignore if tag has
    // 1. "download" attribute
    // 2. "target" attribute
    if (element.hasAttribute('download') || element.hasAttribute('target')) {
      return;
    }

    const link = element.getAttribute('href');

    // Check for mailto: in the href
    if (link && link.indexOf('mailto:') > -1) {
      return;
    }

    if (link && link.indexOf('http') === 0) {
      return;
    }

    event.preventDefault();

    router.navigate(link);
  },

  start() {
    const router = this;

    if (running) {
      return;
    }

    running = true;

    $(window).on('popstate', onpopstate);
    $(document).on('click', '[href]', this.onClick);

    const url = document.location.pathname + document.location.search + document.location.hash;

    router.navigate(url, {
      replace: true,
    });
  },

  navigate(url, options) {
    const router = this;
    let normalizedUrl = url;

    if (normalizedUrl.indexOf(router.baseUrl) === 0) {
      normalizedUrl = normalizedUrl.substr(router.baseUrl.length);
    }

    if (normalizedUrl === router.currentUrl) {
      return false;
    }

    if (router.currentUrl && (router.currentUrl.split('#')[0] === normalizedUrl.split('#')[0])) {
      return false;
    }

    const opt = defaults(options || {}, {
      replace: false,
    });

    window.history[opt.replace ? 'replaceState' : 'pushState']({}, '', normalizedUrl);

    router.currentUrl = normalizedUrl;

    return router.loadPage(normalizedUrl).catch(router.renderError);
  },

  loadPage(url) {
    const router = this;
    const pageUrl = (`${router.pagesRoot}${url.split('?')[0].split('#')[0]}/index`)
      .split('//')
      .join('/');

    return System.import(pageUrl).then((Page) => {
      router.currentPage = new Page();
    });
  },

  renderError(error) {
    document.body.innerHTML = error;
  },

  query(params) {
    const router = this;

    if (!params) {
      return qs.parse(document.location.search.substring(1));
    }

    const currentQuery = qs.parse(document.location.search.substring(1));

    extend(currentQuery, params);

    const url = `${router.baseUrl}/${router.currentUrl}`.split('//').join('/');
    const queryString = qs.stringify(currentQuery);

    window.history.replaceState({}, '', `${url}?${queryString}`);

    return queryString;
  },

  extend(options) {
    const router = this;
    return extend({}, router, options);
  },
};
