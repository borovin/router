import { defaults, extend, isElement } from 'lodash-es';
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

function getCurrentUrl() {
  return document.location.pathname + document.location.search + document.location.hash;
}

const router = {
  currentUrl: null,
  currentPage: null,
  baseUrl: '',
  pagesRoot: 'pages',

  onPopstate() {
    if (!loaded) {
      return;
    }

    this.navigate(getCurrentUrl(), {
      replace: true,
    });
  },

  onClick(e) {
    if (this.checkLink(e.target)) {
      e.preventDefault();
      this.navigate(e.target.getAttribute('href'));
    }
  },

  checkLink(linkElement) {
    let result = true;

    if (!isElement(linkElement)) {
      result = false;
    }

    if (!linkElement.getAttribute('href')) {
      result = false;
    }

    if (linkElement.getAttribute('rel') === 'external') {
      result = false;
    }

    return result;
  },

  start() {
    if (running) {
      return Promise.resolve();
    }

    running = true;

    window.addEventListener('popstate', this.onPopstate);
    document.addEventListener('click', this.onClick);

    return this.navigate(getCurrentUrl(), {
      replace: true,
    });
  },

  stop() {
    running = false;

    window.removeEventListener('popstate', this.onPopstate);
    document.removeEventListener('click', this.onClick);
  },

  navigate(url, options) {
    let normalizedUrl = url;

    if (normalizedUrl.indexOf(this.baseUrl) === 0) {
      normalizedUrl = normalizedUrl.substr(this.baseUrl.length);
    }

    if (normalizedUrl === this.currentUrl) {
      return false;
    }

    if (this.currentUrl && (this.currentUrl.split('#')[0] === normalizedUrl.split('#')[0])) {
      return false;
    }

    const opt = defaults(options || {}, {
      replace: false,
    });

    window.history[opt.replace ? 'replaceState' : 'pushState']({}, '', normalizedUrl);

    this.currentUrl = normalizedUrl;

    return this.loadPage(normalizedUrl).catch(this.renderError);
  },

  loadPage(url) {
    const pageUrl = (`${this.pagesRoot}${url.split('?')[0].split('#')[0]}/index`)
      .split('//')
      .join('/');

    return System.import(pageUrl).then((Module) => {
      const Page = Module.default;
      this.currentPage = new Page();
    });
  },

  renderError(error) {
    document.body.innerHTML = error;
  },

  query(params) {
    if (!params) {
      return qs.parse(document.location.search.substring(1));
    }

    const currentQuery = qs.parse(document.location.search.substring(1));

    extend(currentQuery, params);

    const url = `${this.baseUrl}/${this.currentUrl}`.split('//').join('/');
    const queryString = qs.stringify(currentQuery);

    window.history.replaceState({}, '', `${url}?${queryString}`);

    return queryString;
  },
};

export default router;

