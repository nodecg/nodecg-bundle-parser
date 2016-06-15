'use strict';

const assert = require('chai').assert;
const parseSounds = require('../lib/sounds');

describe('sound cue parsing', () => {
	it('should return the parsed soundCues', () => {
		const input = [{
			name: 'name-only'
		}, {
			name: 'default-volume',
			defaultVolume: 80
		}, {
			name: 'non-assignable',
			assignable: false
		}, {
			name: 'default-file',
			defaultFile: 'fixtures/default-file.ogg'
		}];

		const output = [{
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
			defaultFile: 'fixtures/default-file.ogg',
			assignable: true
		}];

		const bundle = {
			dir: __dirname
		};

		const pkg = {
			name: 'test-bundle',
			nodecg: {soundCues: input}
		};

		parseSounds(bundle, pkg);

		assert.deepEqual(bundle.soundCues, output);
	});

	it('should set bundle.soundCues to an empty array when pkg.nodecg.soundCues does not exist', () => {
		const bundle = {};
		parseSounds(bundle, {
			name: 'test-bundle',
			nodecg: {}
		});
		assert.deepEqual(bundle.soundCues, []);
	});

	it('should throw an error when pkg.nodecg.soundCues is not an Array', () => {
		assert.throws(parseSounds.bind(null, {}, {
			name: 'test-bundle',
			nodecg: {
				soundCues: 'foo'
			}
		}), 'test-bundle\'s nodecg.soundCues is not an Array');
	});

	it('should throw an error when a soundCue lacks a name', () => {
		assert.throws(parseSounds.bind(null, {}, {
			name: 'test-bundle',
			nodecg: {
				soundCues: [{}]
			}
		}), 'nodecg.soundCues[0] in bundle test-bundle lacks a "name" property');
	});

	it('should clamp default volume to a max of 100', () => {
		const bundle = {};
		parseSounds(bundle, {
			name: 'test-bundle',
			nodecg: {
				soundCues: [{
					name: 'cue',
					defaultVolume: 101
				}]
			}
		});
		assert.equal(bundle.soundCues[0].defaultVolume, 100);
	});

	it('should clamp default volume to a min of 0', () => {
		const bundle = {};
		parseSounds(bundle, {
			name: 'test-bundle',
			nodecg: {
				soundCues: [{
					name: 'cue',
					defaultVolume: -1
				}]
			}
		});
		assert.equal(bundle.soundCues[0].defaultVolume, 0);
	});

	it('should throw an error when a soundCue\'s default file doesn\'t exist', () => {
		assert.throws(parseSounds.bind(null, {
			dir: __dirname
		}, {
			name: 'test-bundle',
			nodecg: {
				soundCues: [{
					name: 'cue',
					defaultFile: 'nope'
				}]
			}
		}), 'nodecg.soundCues[0].defaultFile in bundle test-bundle does not exist');
	});
});
