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
  '/path/to/page/:pageId': handler
});

router.start()
```

