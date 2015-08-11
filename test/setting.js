'use strict';

var _ = require('underscore');
var chai = require('chai');
var jsonServer = require('json-server');
var specs = require('./spec/base');
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
var options = {
    baseUrl: 'http://localhost:' + port
};

global._ = _;
global.expect = chai.expect;
global.jsonServer = jsonServer;
global.specs = specs;
global.routers = routers;
global.port = port;
global.options = options;
