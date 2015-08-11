'use strict';

module.exports = function specs() {
    describe('#request', testRequest);
    describe('#post', testPost);
    describe('#put', testPut);
    describe('#patch', testPatch);
    describe('#delete', testDelete);
    describe('#get', testGet);
    describe('#json', testJson);

    function testRequest() {
        it('should be get request an user', function(done) {
            var req = new Requshar(options);

            req.request('/users', {
                method: 'get'
            }, function callback(err, res, body) {
                expect(body).to.have.string('"id": 1');
                done();
            });
        });
    }

    function testPost() {
        it('should be post an user', function(done) {
            var req = new Requshar(options);

            req.post('/users', {
                data: {
                    id: 3,
                    name: 'Milo',
                    age: 26
                }
            }, function callback(err, res, body) {
                expect(body).to.have.string('"id": 3');
                done();
            });
        });
    }

    function testPut() {
        it('should be put an user', function(done) {
            var req = new Requshar(options);

            req.put('/users/3', {
                data: {
                    id: 3,
                    name: 'Milo Molina',
                    age: 26
                }
            }, function callback(err, res, body) {
                expect(body).to.have.string('"name": "Milo Molina"');
                done();
            });
        });
    }

    function testPatch() {
        it('should be patch an user', function(done) {
            var req = new Requshar(options);

            req.patch('/users/3', {
                data: {
                    age: 27
                }
            }, function callback(err, res, body) {
                expect(body).to.have.string('"age": 27');
                done();
            });
        });
    }

    function testDelete() {
        it('should be delete an user', function(done) {
            var req = new Requshar(options);

            req.delete('/users/3', function callback(err, res, body) {
                if (err) {
                    throw err;
                }
                req.json('/users', function callback(err, res, body) {
                    expect(body).to.have.length(2);
                    done();
                });
            });
        });
    }

    function testGet() {
        it('should be get an user', function(done) {
            var req = new Requshar(options);

            req.get('/users/2', function callback(err, res, body) {
                expect(body).to.have.string('"id": 2');
                done();
            });
        });

        it('should be get an invalid user', function(done) {
            var req = new Requshar(options);

            req.get('/users/12345678', function callback(err, res, body) {
                expect(res).to.instanceOf(Object);
                expect(res.statusCode).to.equal(404);
                done();
            });
        });
    }

    function testJson() {
        it('should be json format an user', function(done) {
            var req = new Requshar(options);

            req.json('http://localhost:3000/users/1', function callback(err, res, body) {
                expect(body).to.have.property('id').that.equal(1);
                done();
            });
        });
    }
};
