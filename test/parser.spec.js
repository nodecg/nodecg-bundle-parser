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
        var parsedBundle = parseBundle('./test/test-bundle');
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
});
