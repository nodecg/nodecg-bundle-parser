/* jshint -W030 */
'use strict';

var parseBundle = require('../index');
var chai = require('chai');
var expect = chai.expect;
chai.should();

describe('bundle parser', function () {
    it('should return "undefined" when nodecg.json does not exist', function () {
        expect(parseBundle('./test')).to.be.undefined;
    });

    it('should return the expected data when nodecg.json does exist', function () {
        var parsedBundle = parseBundle('./test/test_bundles/good-bundle');
        parsedBundle.name.should.equal('test-bundle');
        parsedBundle.version.should.equal('0.0.1');
        parsedBundle.description.should.equal('A test bundle');
        parsedBundle.homepage.should.equal('http://github.com/nodecg');
        parsedBundle.authors.should.deep.equal(['Alex Van Camp <email@alexvan.camp>', 'Matt McNamara']);
        parsedBundle.license.should.equal('MIT');
        parsedBundle.nodecgDependency.should.equal('~0.7.0');
        parsedBundle.extension.should.deep.equal({path: 'extension.js'});
        expect(parsedBundle.bundleDependencies).to.be.undefined;
        parsedBundle.rawManifest.should.be.a.string;
        parsedBundle.dir.should.be.a.string;
        parsedBundle.dashboard.dir.should.be.a.string;
        parsedBundle.dashboard.panels.should.deep.equal([{
            name: 'test',
            title: 'Test Panel',
            width: 1,
            file: 'panel.html',
            dialog: false
        }]);
        parsedBundle.display.dir.should.be.a.string;
    });

    context('when bundleCfgPath is provided', function() {
        context('and the file exists', function() {
            it('should parse the config and add it as bundle.config', function() {
                var parsedBundle = parseBundle('./test/test_bundles/good-bundle',
                    './test/test_bundles/good-bundle/bundleConfig.json');
                parsedBundle.config.should.deep.equal({foo: 'foo'});
            });
        });

        context('and the file does not exist', function() {
            it('should throw an error', function() {
                expect(
                    parseBundle.bind(parseBundle, './test/test_bundles/good-bundle', './made/up/path.json')
                ).to.throw(/does not exist/);
            });
        });

        context('and the file isn\'t valid JSON', function() {
            it('should throw an error', function() {
                expect(
                    parseBundle.bind(parseBundle, './test/test_bundles/bad-json',
                        './test/test_bundles/bad-json/bundleConfig.json')
                ).to.throw(/Ensure that it is valid JSON/);
            });
        });
    });

    context('when there is no "dashboard" folder', function() {
        it('should assign an empty array to bundle.dashboard.panels', function() {
            var parsedBundle = parseBundle('./test/test_bundles/no-dashboard-folder');
            parsedBundle.dashboard.panels.should.be.an.instanceof(Array).and.be.empty;
        });
    });

    context('when there is a "dashboard" folder but no "panels.json"', function() {
        it('should throw an error', function() {
            expect(
                parseBundle.bind(parseBundle, './test/test_bundles/no-panelsjson')
            ).to.throw(/"dashboard\/panels.json" was not found/);
        });
    });

    context('when "panels.json" isn\'t valid JSON', function() {
        it('should throw an error', function() {
            expect(
                parseBundle.bind(parseBundle, './test/test_bundles/bad-json')
            ).to.throw(/"dashboard\/panels.json" could not be read/);
        });
    });

    context('when critical properties are missing from "panels.json"', function() {
        it('should throw an error explaining what is missing', function() {
            expect(
                parseBundle.bind(parseBundle, './test/test_bundles/missing-panel-props')
            ).to.throw(/the following properties: name, title, file/);
        });
    });

    context('when two panels have the same name', function() {
        it('should throw an error', function() {
            expect(
                parseBundle.bind(parseBundle, './test/test_bundles/dupe-panel-name')
            ).to.throw(/has the same name as another panel/);
        });
    });

    context('when a panel\'s file has no <head> tag', function() {
        it('should throw an error', function() {
            expect(
                parseBundle.bind(parseBundle, './test/test_bundles/no-head')
            ).to.throw(/has no <head>/);
        });
    });

    context('when a panel\'s file has no <!DOCTYPE>', function() {
        it('should throw an error', function() {
            expect(
                parseBundle.bind(parseBundle, './test/test_bundles/no-doctype')
            ).to.throw(/has no DOCTYPE/);
        });
    });
});
