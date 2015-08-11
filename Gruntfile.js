'use strict';

var _ = require('underscore');

module.exports = function(grunt) {
    var options = {
        reporter: 'spec',
        clearRequireCache: true,
        require: ['test/setting']
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            client: {
                options: {
                    sourceMap: false,
                    preserveComments: 'some'
                },
                files: {
                    'requshar.min.js': ['requshar.js']
                }
            }
        },

        copy: {
            client: {
                files: [{
                    expand: true,
                    src: ['requshar.min.js'],
                    dest: 'public/',
                    filter: 'isFile'
                }]
            }
        },

        mochaTest: {
            client: {
                src: ['test/spec/client/*.js'],
                options: options
            },
            server: {
                src: ['test/spec/server/*.js'],
                options: options
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('minify', ['uglify', 'copy']);
    grunt.registerTask('default', ['mochaTest']);
};