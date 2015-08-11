'use strict';

var jsdom = require('jsdom');
var jQuery = require('jquery');
var server;

describe('client', function testClient() {
    describe('requshar', function testRequshar() {
        before(beforeTests);
        after(afterTests);
        specs();
    });
});

function beforeTests(done) {
    server = jsonServer.create();

    server.use(jsonServer.defaults);
    server.use(routers);

    server = server.listen(port, callback);

    function callback() {
        jsdom.env('<html><body></body></html>', [], function cb(errors, window) {
            global.window = window;
            global.document = window.document;
            global.navigator = window.navigator || {
                browser: 'Emulator window Nodejs'
            };
            global.window._ = global._;
            global.$ = global.jQuery = global.window.jQuery = global.window.$ = jQuery;
            require('../../../requshar');
            global.Requshar = global.window.Requshar;
            done();
        });
    }
}

function afterTests(done) {
    server.close();
    server = null;
    done();
}
