import router from '../index';

const testemId = document.location.pathname.split('/')[0];

System.paths[`pages${document.location.pathname}/index`] = `${testemId}/_tests/testPage.js`;

describe('router', () => {
  afterEach(() => {
    router.stop();
  });

  it('should load page by url on start', (done) => {
    router.start().then(() => {
      expect(router.currentPage.name).toBe('test');
      done();
    });
  });
});
