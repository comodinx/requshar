Requshar [![NPM Version](https://img.shields.io/npm/v/requshar.svg?style=flat)](https://www.npmjs.com/package/requshar)
========

An HTTP client library for use in server (restler) and client side (jQuery)


Installing
----------

```
npm install requshar
```


Running the tests
-----------------

```
npm test
```


Features
--------

* Equal API in client and server side
* Easy interface for common operations via http.request and $.ajax
* Simple service wrapper that allows you to easily put together REST API libraries


API
---

### request(url[, options\][, callback])

Basic method to make a request of any type. The function returns a *request instance*.

### get(url[, options\][, callback])

GET request.

### post(url[, options\][, callback])

POST request.

### put(url[, options\][, callback])

PUT request.

### patch(url[, options\][, callback])

PATCH request.

### delete(url[, options\][, callback])

DELETE request.

### json(url[, options\][, callback])

Parse response to json.

#### Options

##### Options :: Shared 

* `method` Request method, can be get, post, put, patch and delete. Defaults to `'get'`.
* `query` Query string variables as a javascript object, will override the querystring in the URL. Defaults to empty.
* `data` The data to be added to the body of the request. Default to empty.
* `headers` Request headers. Default to empty.
* `parseJSON` Enabled parse to json responses. Default to `false`.
* `defaultErrorCode` Error code for internal errors. Default to `598`.
* `timeout` If set, will emit the timeout event when the response does not return within the said value (in ms).
* `debug` Enabled debug mode. Default to `false`.
* `logger` Debbuger. Default to `console`.

##### Options :: Server

* `onTimeout` Function callback for timeout responses.

##### Options :: Client

* `done` Function callback for success responses. Default to `_.noop`.
* `fail` Function callback for fail responses. Default to `_.noop`.

For more option see [Restler](https://github.com/danwrong/restler) and [jQuery.ajax](http://api.jquery.com/jQuery.ajax/)

#### Callback

`function callback(err, response, body)`

* `response` In _server side_ is the restler response Object. In _client side_ is an object with next properties `readyState`, `responseText`, `statusCode`, `statusText`, `status` and `res` (jQuery response)
* `body` Response text. If `parseJSON` options is true, `body` is an Object.

#### Request instance

```javascript
var Requshar = require('requshar');
var requshar = new Requshar();

var request = requshar.get('http://www.google.com.ar', function(err, res, body) {
  if (err instanceof Error) {
    console.log('Error:', err.message);
  } else {
    console.log(body);
  }
});

request.req; // Server side restler request instance.
request.req; // Client side jQuery request instance.
```


Example usage
-------------

### Default usage

```javascript
var Requshar = require('requshar');
var requshar = new Requshar();

requshar.get('http://www.google.com.ar', function(err, res, body) {
  if (err instanceof Error) {
    console.log('Error:', err.message);
  } else {
    console.log(body);
  }
});

requshar.post('http://yourpage.com/users', {
  data: {
    id: 334,
    name: 'pepito'
  }
}, function(err, res, body) {
  if (err instanceof Error) {
    console.log('Error:', err.message);
  } else {
    console.log(body);
  }
});
```

### Usage with default options

```javascript
var Requshar = require('requshar');
var requshar = new Requshar({
  baseUrl: 'http://www.google.com.ar',
  headers: {
    'content-type': 'text/plain',
    'connection': 'keep-alive',
    'accept': '*/*'
  }
});

requshar.get('/', function(err, res, body) {
  if (err instanceof Error) {
    console.log('Error:', err.message);
  } else {
    console.log(body);
  }
});
```

### Usage in debug mode

```javascript
var logger = require('debug')('requshar');
var Requshar = require('requshar');
var requshar = new Requshar({
  debug: true,
  logger: logger
});

requshar.get('http://www.google.com.ar', function(err, res, body) {
  if (err instanceof Error) {
    console.log('Error:', err.message);
  } else {
    console.log(body);
  }
});
```

### Usage in client side

```html
<html>
  <head>
    <meta charset="utf-8">
    <title>Requshar in client side</title>
  </head>
  <body>
    <script src="https://cdn.rawgit.com/jquery/jquery/2.1.4/dist/jquery.min.js"></script>
    <script src="https://cdn.rawgit.com/jashkenas/underscore/1.8.3/underscore.js"></script>
    <script src="https://cdn.rawgit.com/comodinx/requshar/v0.1.3/requshar.js"></script>
    <script>
      var requshar = new Requshar({
        baseUrl: 'https://api.github.com',
        debug: true
      });

      requshar.json('/repos/comodinx/requshar', function(err, res, body) {
        if (err instanceof Error) {
          alert('Error:' + err.message);
        } else {
          alert(JSON.stringify(_.pick(body, 'id', 'name', 'full_name', 'language'), null, '  '));
        }
      });
    </script>
  </body>
</html>
```
