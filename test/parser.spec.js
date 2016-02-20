/* jshint -W030 */
'use strict';

var parseBundle = require('../index');
var path = require('path');
var chai = require('chai');
var assert = chai.assert;

describe('main bundle parsing', function () {
    it('should error when package.json does not exist', function () {
        assert.throws(parseBundle.bind(parseBundle, './test'), /does not contain a package.json!/);
    });

    it('should error when package.json has no "nodecg" property', function () {
        assert.throws(parseBundle.bind(parseBundle, './test/test_bundles/no-nodecg-prop'),
            /lacks a "nodecg" property, and therefore cannot be parsed/);
    });

    it('should error when package.json is not valid JSON', function () {
        assert.throws(parseBundle.bind(parseBundle, './test/test_bundles/invalid-manifest-json'),
            /package.json is not valid JSON/);
    });

    it('should return the expected data when "nodecg" property does exist', function () {
        var parsedBundle = parseBundle('./test/test_bundles/good-bundle');
        assert.equal(parsedBundle.name, 'good-bundle');
        assert.equal(parsedBundle.version, '0.0.1');
        assert.equal(parsedBundle.description, 'A test bundle');
        assert.equal(parsedBundle.homepage, 'http://github.com/nodecg');
        assert.equal(parsedBundle.author, 'Alex Van Camp <email@alexvan.camp>');
        assert.deepEqual(parsedBundle.contributors, ['Matt McNamara']);
        assert.equal(parsedBundle.license, 'MIT');
        assert.equal(parsedBundle.compatibleRange, '~0.7.0');
        assert.isUndefined(parsedBundle.bundleDependencies);
        assert.isString(parsedBundle.rawManifest);
        assert.isString(parsedBundle.dir);
        assert.deepEqual(parsedBundle.dependencies, {commander: '^2.6.0'});
        assert.isString(parsedBundle.dashboard.dir);
        assert.deepEqual(parsedBundle.dashboard.panels, [
            {
                name: 'test',
                title: 'Test Panel',
                width: 1,
                headerColor: '#9f9bbd',
                path: path.resolve(__dirname, './test_bundles/good-bundle/dashboard/panel.html'),
                file: 'panel.html',
                html: '<!DOCTYPE html>\n<head></head>\n<body>\n<p>This is a test panel!</p>\n<script>' +
                '\n    window.parent.dashboardApi = window.nodecg;\n</script>\n</body>\n',
                dialog: false
            },
            {
                name: 'test-dialog',
                title: 'Test Dialog',
                width: 3,
                headerColor: '#333222',
                path: path.resolve(__dirname, './test_bundles/good-bundle/dashboard/dialog.html'),
                file: 'dialog.html',
                html: '<!DOCTYPE html>\n<head></head>\n<body>\n<p>This is a test dialog!</p>\n</body>\n',
                dialog: true
            }
        ]);
        assert.isArray(parsedBundle.graphics);
        assert.isTrue(parsedBundle.hasExtension);
    });

    it('should error when "nodecg.compatibleRange" is not a valid semver range', function () {
        assert.throws(parseBundle.bind(parseBundle, './test/test_bundles/no-compatible-range'),
            /does not have a valid "nodecg.compatibleRange"/);
    });

    it('should error when both "extension.js" and a directory named "extension" exist', function () {
        assert.throws(parseBundle.bind(parseBundle, './test/test_bundles/double-extension'),
            /has both "extension.js" and a folder named "extension"/);
    });

    it('should error when "extension" exists and it is not a directory', function () {
        assert.throws(parseBundle.bind(parseBundle, './test/test_bundles/illegal-extension'),
            /has an illegal file named "extension"/);
    });

    it('should error when the bundle\'s folder name doesn\'t match its manifest name', function () {
        assert.throws(parseBundle.bind(parseBundle, './test/test_bundles/bad-folder-name'),
            /Please rename it to "/);
    });
});

describe('config parsing', function() {
    context('when the config file exists', function() {
        it('should parse the config and add it as bundle.config', function() {
            var parsedBundle = parseBundle('./test/test_bundles/good-bundle',
                './test/test_bundles/good-bundle/bundleConfig.json');
            assert.deepEqual(parsedBundle.config, {foo: 'foo'});
        });
    });

    context('when the config file does not exist', function() {
        it('should throw an error', function() {
            assert.throws(parseBundle.bind(parseBundle, './test/test_bundles/good-bundle', './made/up/path.json'),
                /does not exist/);
        });
    });

    context('when the config file isn\'t valid JSON', function() {
        it('should throw an error', function() {
            var fn = parseBundle.bind(parseBundle, './test/test_bundles/bad-json',
                './test/test_bundles/bad-json/bundleConfig.json');
            assert.throws(fn, /Ensure that it is valid JSON/);
        });
    });
});

describe('config validation', function() {
    context('when the schema file exists', function() {
        it('should not throw when the config passes validation', function() {
            var fn = parseBundle.bind(parseBundle, './test/test_bundles/config-validation',
                './test/test_bundles/config-validation/validConfig.json');
            assert.doesNotThrow(fn);
        });

        it('should throw when the config fails validation', function() {
            var fn = parseBundle.bind(parseBundle, './test/test_bundles/config-validation',
                './test/test_bundles/config-validation/invalidConfig.json');
            assert.throws(fn, /is invalid:/);
        });
    });

    context('when the schema file does not exist', function() {
        it('should skip validation and not throw an error', function() {
            var fn = parseBundle.bind(parseBundle, './test/test_bundles/good-bundle',
                './test/test_bundles/good-bundle/bundleConfig.json');
            assert.doesNotThrow(fn);
        });
    });

    context('when the schema file isn\'t valid JSON', function() {
        it('should throw an error', function() {
            var fn = parseBundle.bind(parseBundle, './test/test_bundles/bad-schema',
                './test/test_bundles/bad-schema/bundleConfig.json');
            assert.throws(fn, /configschema.json for bundle /);
        });
    });
});

describe('dashboard panel parsing', function() {
    context('when there is no "dashboard" folder', function() {
        it('should assign an empty array to bundle.dashboard.panels', function() {
            var parsedBundle = parseBundle('./test/test_bundles/no-panels');
            assert.isArray(parsedBundle.dashboard.panels);
            assert.lengthOf(parsedBundle.dashboard.panels, 0);
        });
    });

    context('when there is a "dashboard" folder but no "dashboardPanels" property', function() {
        it('should throw an error', function() {
            assert.throws(parseBundle.bind(parseBundle, './test/test_bundles/no-panels-prop'),
                /no "nodecg.dashboardPanels" property was found/);
        });
    });

    context('when there is a "dashboardPanels" property but no "dashboard" folder', function() {
        it('should throw an error', function() {
            assert.throws(parseBundle.bind(parseBundle, './test/test_bundles/no-dashboard-folder'),
                /but no "dashboard" folder/);
        });
    });

    context('when critical properties are missing from the "dashboardPanels" property', function() {
        it('should throw an error explaining what is missing', function() {
            assert.throws(parseBundle.bind(parseBundle, './test/test_bundles/missing-panel-props'),
                /the following properties: name, title, file/);
        });
    });

    context('when two panels have the same name', function() {
        it('should throw an error', function() {
            assert.throws(parseBundle.bind(parseBundle, './test/test_bundles/dupe-panel-name'),
                /has the same name as another panel/);
        });
    });

    context('when a panel\'s file has no <head> tag', function() {
        it('should throw an error', function() {
            assert.throws(parseBundle.bind(parseBundle, './test/test_bundles/no-head'),
                /has no <head>/);
        });
    });

    context('when a panel\'s file has no <!DOCTYPE>', function() {
        it('should throw an error', function() {
            assert.throws(parseBundle.bind(parseBundle, './test/test_bundles/no-doctype'),
                /has no DOCTYPE/);
        });
    });

    context('when a panel\'s file does not exist', function() {
        it('should throw an error', function() {
            assert.throws(parseBundle.bind(parseBundle, './test/test_bundles/non-existant-panel'),
                / does not exist/);
        });
    });
});

describe('dashboard graphic parsing', function() {
    context('when there is no "graphics" folder', function() {
        it('should assign an empty array to bundle.graphics', function() {
            var parsedBundle = parseBundle('./test/test_bundles/no-graphics');
            assert.isArray(parsedBundle.graphics);
            assert.lengthOf(parsedBundle.graphics, 0);
        });
    });

    context('when there is a "graphics" folder but no "graphics" property', function() {
        it('should throw an error', function() {
            assert.throws(parseBundle.bind(parseBundle, './test/test_bundles/no-graphics-prop'),
                /no "nodecg.graphics" property was found/);
        });
    });

    context('when there is a "graphics" property but no "graphics" folder', function() {
        it('should throw an error', function() {
            assert.throws(parseBundle.bind(parseBundle, './test/test_bundles/no-graphics-folder'),
                /but no "graphics" folder/);
        });
    });

    context('when critical properties are missing from the "graphics" property', function() {
        it('should throw an error explaining what is missing', function() {
            assert.throws(parseBundle.bind(parseBundle, './test/test_bundles/missing-graphic-props'),
                /the following properties: file, width, height/);
        });
    });

    context('when two graphics have the same file', function() {
        it('should throw an error', function() {
            assert.throws(parseBundle.bind(parseBundle, './test/test_bundles/dupe-graphic-file'),
                /has the same file as another graphic/);
        });
    });
});
