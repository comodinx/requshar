'use strict';

var server;

describe('server', function testServer() {
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

    server = server.listen(port, done);

    global.Requshar = require('../../../requshar');
}

function afterTests(done) {
    server.close();
    server = null;
    done();
}
