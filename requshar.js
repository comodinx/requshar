/*! requshar
    v0.1.3 (c) Nicolas Molina
    MIT License
*/

'use strict';

var isServer = typeof window === 'undefined';
var root = isServer ? {} : window;

(function umd(name, definition) {
    var _ = root._;
    var qs = root.qs;

    if (!_ && typeof require !== 'undefined') {
        _ = require('underscore');
    }
    if (!qs && typeof require !== 'undefined') {
        qs = require('querystring');
    }

    root[name] = definition(_, qs, name);
    if (module && module.exports) {
        module.exports = root[name];
    }
})('Requshar', function def(_, qs, name) {

    var previous = root[name];
    var defaults = {
        defaultErrorCode: 598,
        parseJSON: false,
        debug: false,
        logger: console
    };

    var Request;

    // Helpers
    // -------

    function extend(properties, statics) {
        var parent = this;
        var Surrogate;
        var subclass;

        if (properties && _.has(properties, 'constructor')) {
            subclass = properties.constructor;
        }
        else {
            subclass = function() {
                return parent.apply(this, arguments);
            };
        }

        _.extend(subclass, parent, statics);

        Surrogate = function() {
            this.constructor = subclass;
        };
        Surrogate.prototype = parent.prototype;
        subclass.prototype = new Surrogate;

        if (properties) {
            _.extend(subclass.prototype, properties);
        }
        subclass.__super__ = parent.prototype;
        return subclass;
    }

    function params(url, key, value) {
        var parts = url.split('?');
        var parameters = {};
        var out = [];

        out.push(parts.shift());
        if (parts.length) {
            parameters = qs.parse(parts.join('?')) || parameters;
        }
        if (_.isObject(key)) {
            parameters = _.extend(parameters, key);
        }
        else if (!value && key) {
            return parameters[key];
        }
        else if (key) {
            parameters[key] = value;
        }
        else {
            return parameters;
        }
        if (!_.isEmpty(parameters)) {
            out.push('?');
            out.push(qs.stringify(parameters));
        }
        if (url.slice(url.length - 1) === '#') {
            out.push('#');
        }
        return out.join('');
    }

    // Requshar
    // ---------

    function Requshar(options) {
        this.options = _.defaults(options || {}, defaults);
    }

    _.extend(Requshar.prototype, {
        request: function(url, options, callback) {
            var req;

            if (options instanceof Function) {
                callback = options;
                options = {};
            }

            req = new Request(_.defaults(_.pick(options, _.keys(defaults)), this.options));

            return req.request(_.defaults({
                url: url
            }, options, {
                method: 'get'
            }), callback);
        },

        json: function(url, options, callback) {
            if (options instanceof Function) {
                callback = options;
                options = {};
            }
            return this.request(url, _.defaults({
                parseJSON: true
            }, options, {
                method: 'get'
            }), callback);
        },

        file: function(path, name, size, encoding, mime) {
            if (!isServer) {
                throw 'Restler library not available on the client';
            }
            return restler.file(path, name, size, encoding, mime);
        }
    });

    _.each(['get', 'post', 'put', 'patch', 'delete'], function each(method) {
        Requshar.prototype[method] = function(url, options, callback) {
            if (options instanceof Function) {
                callback = options;
                options = {};
            }
            return this.request(url, _.defaults({
                _method: method,
                method: method
            }, options), callback);
        };
    });

    Requshar.noConflict = function() {
        root[name] = previous;
        return this;
    };

    Requshar.extend = extend;

    // BaseRequest
    // -----------

    function BaseRequest(options) {
        this.options = options || {};
    }

    _.extend(BaseRequest.prototype, {
        request: function(options, callback) {
            if (options instanceof Function) {
                callback = options;
                options = {};
            }
            this.reqTimeStart = _.now();
            this.callback = callback || _.noop;

            options = this.prepare(options);
            this.makeRequest(options);
            return this;
        },

        prepare: function(options) {
            options = this.defaults(options);
            options.query = options.query || {};
            if (options.method.toUpperCase() !== 'GET') {
                options.data = options.data || {};
            }
            return options;
        },

        makeRequest: function(url, options) {
            throw new Error('requshar.makeRequest is not implement');
        },

        check: function(err, res, body) {
            if (err) {
                return this.fail(err, res);
            }
            this.success(res, this.prepareBody(body));
        },

        success: function(res, body) {
            (this.callback)(null, res, body);
        },

        fail: function(err, res) {
            (this.callback)(err, res);
        },

        defaults: function(options, req) {
            options = _.clone(options);
            if (options.path) {
                options.url = options.path;
                delete options.path;
            }
            if (this.options.baseUrl && !~options.url.indexOf(this.options.baseUrl)) {
                options.url = this.options.baseUrl + options.url;
            }
            _.defaults(options, {
                method: 'get',
                headers: {}
            });
            _.defaults(options.headers, this.options.headers || {});

            if (options.body && (!options.headers['Content-Type'] || options.headers['Content-Type'] === 'application/json')) {
                options.json = options.body;
            }
            if (options.method.toUpperCase() === 'GET') {
                delete options.json;
                delete options.body;
                delete options.data;
            }
            if (!isServer) {
                options.type = options.method;
                delete options.method;
            }
            return options;
        },

        elapsed: function(start, _elapsed) {
            if (_elapsed) {
                return _elapsed;
            }
            return _.now() - start;
        },

        prepareBody: function(body) {
            if (this.options.parseJSON) {
                try {
                    body = JSON.parse(body);
                } catch(e) {
                    if (this.options.debug) {
                        this.options.logger.warn('Not parse body ' + e.toString());
                    }
                }
            }
            return body;
        }
    });

    BaseRequest.extend = extend;

    // ClientRequest
    // -------------

    var ClientRequest = (function() {
        function prepare(options) {
            options = this.defaults(options);
            options = prepareOptions(options);
            this.succeeded = options.done || _.noop;
            this.failed = options.fail || _.noop;
            delete options.done;
            delete options.fail;
            return options;
        }

        function makeRequest(options) {
            var elapsed;

            this.req = $.ajax(options)
                .done(success.bind(this))
                .fail(fail.bind(this));

            function success(body, textStatus, res) {
                if (this.options.debug) {
                    elapsed = this.elapsed(this.reqTimeStart, elapsed);
                    this.options.logger.log('%s %d %s %s ms', options.type.toUpperCase(), res.status, options.url, elapsed);
                }
                this.succeeded.apply(this, arguments);
                this.check(null, prepareResponse(res, textStatus), res.responseText);
            }

            function fail(res, textStatus, err) {
                if (this.options.debug) {
                    elapsed = this.elapsed(this.reqTimeStart, elapsed);
                    this.options.logger.error('%s %d %s %j %s ms', options.type.toUpperCase(), res.status, options.url, err, elapsed);
                }
                if (textStatus === 'timeout' && options.onTimeout) {
                    options.onTimeout.apply(this, arguments);
                }
                else {
                    this.failed.apply(this, arguments);
                }
                this.check(prepareError(err, res), prepareResponse(res), res.responseText);
            }
        }

        function prepareOptions(options) {
            var data;

            if (options.query) {
                options.url = params(options.url, options.query);
            }
            if (options.data && options.multipart) {
                data = new FormData();
                _.each(_.keys(options.data), function each(key) {
                    data.append(key, options.data[key]);
                });
                options.data = data;
            }
            return options;
        }

        function prepareResponse(res, textStatus) {
            return {
                readyState: res.readyState,
                responseText: res.responseText,
                statusCode: res.status,
                statusText: res.statusText,
                status: textStatus,
                res: res
            };
        }

        function prepareError(err, res) {
            return err || {
                statusCode: res.status
            };
        }

        return BaseRequest.extend({
            prepare: prepare,
            makeRequest: makeRequest
        });
    })();

    // ServerRequest
    // -------------

    var ServerRequest = (function() {
        var restlerModule = 'restler';
        var restler;

        function makeRequest(options) {
            var elapsed;

            this.req = (restler || (restler = require(restlerModule))).request(options.url, _.omit(options, 'url'))
                .on('success', success.bind(this))
                .on('fail', fail.bind(this))
                .on('error', fail.bind(this));

            if (options.timeout !== undefined && options.onTimeout) {
                this.req.on('timeout', options.onTimeout);
            }

            function success(body, res) {
                if (this.options.debug) {
                    elapsed = this.elapsed(this.reqTimeStart, elapsed);
                    this.options.logger.log('%s %d %s %s ms', options.method.toUpperCase(), res.statusCode, url, elapsed);
                }
                this.check(null, res, body);
            }

            function fail(err, res) {
                if (this.options.debug) {
                    elapsed = this.elapsed(this.reqTimeStart, elapsed);
                    this.options.logger.error('%s %d %s %j %s ms', options.method.toUpperCase(), res.statusCode, url, err, elapsed);
                }
                this.check(err, res);
            }
        }

        return BaseRequest.extend({
            makeRequest: makeRequest
        });
    })();

    // Check Request type
    // ------------------

    if (isServer) {
        Request = ServerRequest;
    }
    else {
        Request = ClientRequest;
    }

    return Requshar;
});
