Router
==========

Расширение для [page.js](https://github.com/visionmedia/page.js)

installation
------------

```
bower install git@github.com:borovin/router.git
```

Usage
-----

router - это AMD-модуль. Для использования необходим require.js или подобный AMD-загрузчик

```javascript
var router = require('bower_components/router/router');

router({
  '/path/to/page/:pageId': function(ctx){
    console.log('page ' + ctx.params.pageId);
  }
});

router.start();

router('/path/to/page/1'); // page 1
```

Пути можно группировать:

```javascript
var page = function(ctx){
  console.log(ctx.path);
}

router({
  '/company': {
    '/about': page,
    '/contacts': page,
    '/projects': {
      '/sites': page,
      '/widgets': page
    }
  }
});

router.start();

router('/company/projects/sites'); // /company/projects/sites
```

