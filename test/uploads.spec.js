'use strict';

const assert = require('chai').assert;
const parseUploads = require('../lib/uploads');

describe('uploads parsing', () => {
	it('should return the validated uploadCategories', () => {
		const categories = [
			{
				name: 'cat1',
				title: 'Cat1'
			},
			{
				name: 'cat2',
				title: 'Cat2',
				allowedTypes: ['mp4']
			}
		];

		assert.deepEqual(parseUploads({nodecg: {uploadCategories: categories}}), categories);
	});

	it('should return an empty array when pkg.nodecg.uploadCategories is falsey', () => {
		assert.deepEqual(parseUploads({nodecg: {}}), []);
	});

	it('should throw an error when pkg.nodecg.uploadCategories is not an Array', () => {
		assert.throws(parseUploads.bind(null, {
			name: 'test-bundle',
			nodecg: {
				uploadCategories: 'foo'
			}
		}), 'test-bundle\'s nodecg.uploadCategories is not an Array');
	});

	it('should throw an error when an uploadCategory lacks a name', () => {
		assert.throws(parseUploads.bind(null, {
			name: 'test-bundle',
			nodecg: {
				uploadCategories: [{}]
			}
		}), 'nodecg.uploadCategories[0] in bundle test-bundle lacks a "name" property');
	});

	it('should throw an error when an uploadCategory lacks a title', () => {
		assert.throws(parseUploads.bind(null, {
			name: 'test-bundle',
			nodecg: {
				uploadCategories: [{name: 'category'}]
			}
		}), 'nodecg.uploadCategories[0] in bundle test-bundle lacks a "title" property');
	});

	it('should throw an error when an uploadCategory\'s allowedTypes isn\'t an array', () => {
		assert.throws(parseUploads.bind(null, {
			name: 'test-bundle',
			nodecg: {
				uploadCategories: [{
					name: 'category',
					title: 'Category',
					allowedTypes: 'foo'
				}]
			}
		}), 'nodecg.uploadCategories[0].allowedTypes in bundle test-bundle is not an Array');
	});

	it('should throw an error when an uploadCategory is named "sounds"', () => {
		assert.throws(parseUploads.bind(null, {
			name: 'test-bundle',
			nodecg: {
				uploadCategories: [{name: 'Sounds'}]
			}
		}), '"sounds" is a reserved uploadCategory name. ' +
			'Please change nodecg.uploadCategories[0].name in bundle test-bundle');
	});
});
