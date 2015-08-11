'use strict';

var open = require('open');
var jsonServer = require('json-server');
var routers = jsonServer.router({
    users: [{
        id: 1,
        name: 'pepito',
        age: 25
    }, {
        id: 2,
        name: 'juancito',
        age: 33
    }]
});
var port = process.env.TEST_PORT || 3000;

var server = jsonServer.create();

server.use(jsonServer.defaults);
server.use(routers);

server = server.listen(port);

open('http://localhost:' + port);
