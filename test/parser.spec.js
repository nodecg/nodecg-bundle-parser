/* jshint -W030 */
'use strict';

var parseBundle = require('../index');
var cheerio = require('cheerio');
var chai = require('chai');
var expect = chai.expect;
chai.should();

describe('main bundle parsing', function () {
    it('should error when package.json does not exist', function () {
        expect(
            parseBundle.bind(parseBundle, './test')
        ).to.throw(/does not contain a package.json!/);
    });

    it('should error when package.json has no "nodecg" property', function () {
        expect(
            parseBundle.bind(parseBundle, './test/test_bundles/no-nodecg-prop')
        ).to.throw(/lacks a "nodecg" property, and therefore cannot be parsed/);
    });

    it('should return the expected data when "nodecg" property does exist', function () {
        var parsedBundle = parseBundle('./test/test_bundles/good-bundle');
        parsedBundle.name.should.equal('good-bundle');
        parsedBundle.version.should.equal('0.0.1');
        parsedBundle.description.should.equal('A test bundle');
        parsedBundle.homepage.should.equal('http://github.com/nodecg');
        parsedBundle.author.should.equal('Alex Van Camp <email@alexvan.camp>');
        parsedBundle.contributors.should.deep.equal(['Matt McNamara']);
        parsedBundle.license.should.equal('MIT');
        parsedBundle.compatibleRange.should.equal('~0.7.0');
        expect(parsedBundle.bundleDependencies).to.be.undefined;
        parsedBundle.rawManifest.should.be.a.string;
        parsedBundle.dir.should.be.a.string;
        parsedBundle.dashboard.dir.should.be.a.string;
        parsedBundle.dashboard.panels.should.deep.equal([
            {
                name: 'test',
                title: 'Test Panel',
                width: 1,
                headerColor: '#9f9bbd',
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
                file: 'dialog.html',
                html: '<!DOCTYPE html>\n<head></head>\n<body><h2>Test Dialog</h2>' +
                      '\n<p>This is a test dialog!</p>\n</body>\n',
                dialog: true
            }
        ]);
        parsedBundle.graphics.should.be.an.array;
        parsedBundle.hasExtension.should.be.true;
    });

    it('should error when "nodecg.compatibleRange" is not a valid semver range', function () {
        expect(
            parseBundle.bind(parseBundle, './test/test_bundles/no-compatible-range')
        ).to.throw(/does not have a valid "nodecg.compatibleRange"/);
    });

    it('should error when both "extension.js" and a directory named "extension" exist', function () {
        expect(
            parseBundle.bind(parseBundle, './test/test_bundles/double-extension')
        ).to.throw(/has both "extension.js" and a folder named "extension"/);
    });

    it('should error when "extension" exists and it is not a directory', function () {
        expect(
            parseBundle.bind(parseBundle, './test/test_bundles/illegal-extension')
        ).to.throw(/has an illegal file named "extension"/);
    });

    it('should error when the bundle\'s folder name doesn\'t match its manifest name', function () {
        expect(
            parseBundle.bind(parseBundle, './test/test_bundles/bad-folder-name')
        ).to.throw(/Please rename it to "/);
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
});

describe('dashboard panel parsing', function() {
    context('when there is no "dashboard" folder', function() {
        it('should assign an empty array to bundle.dashboard.panels', function() {
            var parsedBundle = parseBundle('./test/test_bundles/no-panels');
            parsedBundle.dashboard.panels.should.be.an.instanceof(Array).and.be.empty;
        });
    });

    context('when there is a "dashboard" folder but no "dashboardPanels" property', function() {
        it('should throw an error', function() {
            expect(
                parseBundle.bind(parseBundle, './test/test_bundles/no-panels-prop')
            ).to.throw(/no "nodecg.dashboardPanels" property was found/);
        });
    });

    context('when there is a "dashboardPanels" property but no "dashboard" folder', function() {
        it('should throw an error', function() {
            expect(
                parseBundle.bind(parseBundle, './test/test_bundles/no-dashboard-folder')
            ).to.throw(/but no "dashboard" folder/);
        });
    });

    context('when critical properties are missing from the "dashboardPanels" property', function() {
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

describe('dashboard graphic parsing', function() {
    context('when there is no "graphics" folder', function() {
        it('should assign an empty array to bundle.graphics', function() {
            var parsedBundle = parseBundle('./test/test_bundles/no-graphics');
            parsedBundle.graphics.should.be.an.instanceof(Array).and.be.empty;
        });
    });

    context('when there is a "graphics" folder but no "graphics" property', function() {
        it('should throw an error', function() {
            expect(
                parseBundle.bind(parseBundle, './test/test_bundles/no-graphics-prop')
            ).to.throw(/no "nodecg.graphics" property was found/);
        });
    });

    context('when there is a "graphics" property but no "graphics" folder', function() {
        it('should throw an error', function() {
            expect(
                parseBundle.bind(parseBundle, './test/test_bundles/no-graphics-folder')
            ).to.throw(/but no "graphics" folder/);
        });
    });

    context('when critical properties are missing from the "graphics" property', function() {
        it('should throw an error explaining what is missing', function() {
            expect(
                parseBundle.bind(parseBundle, './test/test_bundles/missing-graphic-props')
            ).to.throw(/the following properties: file, width, height/);
        });
    });

    context('when two graphics have the same file', function() {
        it('should throw an error', function() {
            expect(
                parseBundle.bind(parseBundle, './test/test_bundles/dupe-graphic-file')
            ).to.throw(/has the same file as another graphic/);
        });
    });
});
