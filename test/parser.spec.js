'use strict';

const parseBundle = require('../index');
const path = require('path');
const assert = require('chai').assert;

describe('main bundle parsing', () => {
	it('should error when package.json does not exist', () => {
		assert.throws(parseBundle.bind(parseBundle, './test'), /does not contain a package.json!/);
	});

	it('should error when package.json has no "nodecg" property', () => {
		assert.throws(parseBundle.bind(parseBundle, './test/fixtures/no-nodecg-prop'),
			/lacks a "nodecg" property, and therefore cannot be parsed/);
	});

	it('should error when package.json is not valid JSON', () => {
		assert.throws(parseBundle.bind(parseBundle, './test/fixtures/invalid-manifest-json'),
			/package.json is not valid JSON/);
	});

	it('should return the expected data when "nodecg" property does exist', () => {
		const parsedBundle = parseBundle('./test/fixtures/good-bundle');
		assert.equal(parsedBundle.name, 'good-bundle');
		assert.equal(parsedBundle.version, '0.0.1');
		assert.equal(parsedBundle.description, 'A test bundle');
		assert.equal(parsedBundle.homepage, 'http://github.com/nodecg');
		assert.equal(parsedBundle.author, 'Alex Van Camp <email@alexvan.camp>');
		assert.equal(parsedBundle.enableCustomCues, false);
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
				path: path.resolve(__dirname, './fixtures/good-bundle/dashboard/panel.html'),
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
				path: path.resolve(__dirname, './fixtures/good-bundle/dashboard/dialog.html'),
				file: 'dialog.html',
				html: '<!DOCTYPE html>\n<head></head>\n<body>\n<p>This is a test dialog!</p>\n</body>\n',
				dialog: true
			}
		]);
		assert.isArray(parsedBundle.graphics);
		assert.isTrue(parsedBundle.hasExtension);
		assert.deepEqual(parsedBundle.soundCues, [{
			name: 'name-only',
			assignable: true
		}, {
			name: 'default-volume',
			defaultVolume: 80,
			assignable: true
		}, {
			name: 'non-assignable',
			assignable: false
		}, {
			name: 'default-file',
			defaultFile: '../default-file.ogg',
			assignable: true
		}]);
	});

	it('should error when "nodecg.compatibleRange" is not a valid semver range', () => {
		assert.throws(parseBundle.bind(parseBundle, './test/fixtures/no-compatible-range'),
			/does not have a valid "nodecg.compatibleRange"/);
	});

	it('should error when both "extension.js" and a directory named "extension" exist', () => {
		assert.throws(parseBundle.bind(parseBundle, './test/fixtures/double-extension'),
			/has both "extension.js" and a folder named "extension"/);
	});

	it('should error when "extension" exists and it is not a directory', () => {
		assert.throws(parseBundle.bind(parseBundle, './test/fixtures/illegal-extension'),
			/has an illegal file named "extension"/);
	});

	it('should error when the bundle\'s folder name doesn\'t match its manifest name', () => {
		assert.throws(parseBundle.bind(parseBundle, './test/fixtures/bad-folder-name'),
			/Please rename it to "/);
	});
});

describe('config parsing', () => {
	context('when the config file exists', () => {
		it('should parse the config and add it as bundle.config', () => {
			const parsedBundle = parseBundle('./test/fixtures/good-bundle',
				'./test/fixtures/good-bundle/bundleConfig.json');
			assert.deepEqual(parsedBundle.config, {foo: 'foo'});
		});

		it('should set default values if the config doesn\'t define them', () => {
			const parsedBundle = parseBundle('./test/fixtures/config-defaults');
			assert.deepEqual(parsedBundle.config, {foo: 'foo'});
		});
	});

	context('when the config file does not exist', () => {
		it('should throw an error', () => {
			assert.throws(parseBundle.bind(parseBundle, './test/fixtures/good-bundle', './made/up/path.json'),
				/does not exist/);
		});
	});

	context('when the config file isn\'t valid JSON', () => {
		it('should throw an error', () => {
			const fn = parseBundle.bind(parseBundle, './test/fixtures/bad-json',
				'./test/fixtures/bad-json/bundleConfig.json');
			assert.throws(fn, /Ensure that it is valid JSON/);
		});
	});
});

describe('config validation', () => {
	context('when the schema file exists', () => {
		it('should not throw when the config passes validation', () => {
			const fn = parseBundle.bind(parseBundle, './test/fixtures/config-validation',
				'./test/fixtures/config-validation/validConfig.json');
			assert.doesNotThrow(fn);
		});

		it('should throw when the config fails validation', () => {
			const fn = parseBundle.bind(parseBundle, './test/fixtures/config-validation',
				'./test/fixtures/config-validation/invalidConfig.json');
			assert.throws(fn, /is invalid:/);
		});

		// Smoke test for https://github.com/chute/json-schema-defaults/issues/10
		it('should properly merge configs that have arrays of objects', () => {
			const parsedBundle = parseBundle('./test/fixtures/config-schema-array-of-objects',
				'./test/fixtures/config-schema-array-of-objects/bundleConfig.json');
			assert.deepEqual(parsedBundle.config, {
				gameAudioChannels: [
					{sd: 17, hd: 25},
					{sd: 19, hd: 27},
					{sd: 21, hd: null},
					{sd: 23, hd: null}
				]
			});
		});
	});

	context('when the schema file does not exist', () => {
		it('should skip validation and not throw an error', () => {
			const fn = parseBundle.bind(parseBundle, './test/fixtures/good-bundle',
				'./test/fixtures/good-bundle/bundleConfig.json');
			assert.doesNotThrow(fn);
		});
	});

	context('when the schema file isn\'t valid JSON', () => {
		it('should throw an error', () => {
			const fn = parseBundle.bind(parseBundle, './test/fixtures/bad-schema',
				'./test/fixtures/bad-schema/bundleConfig.json');
			assert.throws(fn, /configschema.json for bundle /);
		});
	});
});

describe('dashboard panel parsing', () => {
	context('when there is no "dashboard" folder', () => {
		it('should assign an empty array to bundle.dashboard.panels', () => {
			const parsedBundle = parseBundle('./test/fixtures/no-panels');
			assert.isArray(parsedBundle.dashboard.panels);
			assert.lengthOf(parsedBundle.dashboard.panels, 0);
		});
	});

	context('when there is a "dashboard" folder but no "dashboardPanels" property', () => {
		it('should throw an error', () => {
			assert.throws(parseBundle.bind(parseBundle, './test/fixtures/no-panels-prop'),
				/no "nodecg.dashboardPanels" property was found/);
		});
	});

	context('when there is a "dashboardPanels" property but no "dashboard" folder', () => {
		it('should throw an error', () => {
			assert.throws(parseBundle.bind(parseBundle, './test/fixtures/no-dashboard-folder'),
				/but no "dashboard" folder/);
		});
	});

	context('when critical properties are missing from the "dashboardPanels" property', () => {
		it('should throw an error explaining what is missing', () => {
			assert.throws(parseBundle.bind(parseBundle, './test/fixtures/missing-panel-props'),
				/the following properties: name, title, file/);
		});
	});

	context('when two panels have the same name', () => {
		it('should throw an error', () => {
			assert.throws(parseBundle.bind(parseBundle, './test/fixtures/dupe-panel-name'),
				/has the same name as another panel/);
		});
	});

	context('when a panel\'s file has no <head> tag', () => {
		it('should throw an error', () => {
			assert.throws(parseBundle.bind(parseBundle, './test/fixtures/no-head'),
				/has no <head>/);
		});
	});

	context('when a panel\'s file has no <!DOCTYPE>', () => {
		it('should throw an error', () => {
			assert.throws(parseBundle.bind(parseBundle, './test/fixtures/no-doctype'),
				/has no DOCTYPE/);
		});
	});

	context('when a panel\'s file does not exist', () => {
		it('should throw an error', () => {
			assert.throws(parseBundle.bind(parseBundle, './test/fixtures/non-existant-panel'),
				/ does not exist/);
		});
	});
});

describe('dashboard graphic parsing', () => {
	context('when there is no "graphics" folder', () => {
		it('should assign an empty array to bundle.graphics', () => {
			const parsedBundle = parseBundle('./test/fixtures/no-graphics');
			assert.isArray(parsedBundle.graphics);
			assert.lengthOf(parsedBundle.graphics, 0);
		});
	});

	context('when there is a "graphics" folder but no "graphics" property', () => {
		it('should throw an error', () => {
			assert.throws(parseBundle.bind(parseBundle, './test/fixtures/no-graphics-prop'),
				/no "nodecg.graphics" property was found/);
		});
	});

	context('when there is a "graphics" property but no "graphics" folder', () => {
		it('should throw an error', () => {
			assert.throws(parseBundle.bind(parseBundle, './test/fixtures/no-graphics-folder'),
				/but no "graphics" folder/);
		});
	});

	context('when critical properties are missing from the "graphics" property', () => {
		it('should throw an error explaining what is missing', () => {
			assert.throws(parseBundle.bind(parseBundle, './test/fixtures/missing-graphic-props'),
				/the following properties: file, width, height/);
		});
	});

	context('when two graphics have the same file', () => {
		it('should throw an error', () => {
			assert.throws(parseBundle.bind(parseBundle, './test/fixtures/dupe-graphic-file'),
				/has the same file as another graphic/);
		});
	});
});
