'use strict';

const assert = require('chai').assert;
const parseAssets = require('../lib/assets');

describe('assets parsing', () => {
	it('should return the validated assetCategories', () => {
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

		assert.deepEqual(parseAssets({nodecg: {assetCategories: categories}}), categories);
	});

	it('should return an empty array when pkg.nodecg.assetCategories is falsey', () => {
		assert.deepEqual(parseAssets({nodecg: {}}), []);
	});

	it('should throw an error when pkg.nodecg.assetCategories is not an Array', () => {
		assert.throws(parseAssets.bind(null, {
			name: 'test-bundle',
			nodecg: {
				assetCategories: 'foo'
			}
		}), 'test-bundle\'s nodecg.assetCategories is not an Array');
	});

	it('should throw an error when an assetCategory lacks a name', () => {
		assert.throws(parseAssets.bind(null, {
			name: 'test-bundle',
			nodecg: {
				assetCategories: [{}]
			}
		}), 'nodecg.assetCategories[0] in bundle test-bundle lacks a "name" property');
	});

	it('should throw an error when an assetCategory lacks a title', () => {
		assert.throws(parseAssets.bind(null, {
			name: 'test-bundle',
			nodecg: {
				assetCategories: [{name: 'category'}]
			}
		}), 'nodecg.assetCategories[0] in bundle test-bundle lacks a "title" property');
	});

	it('should throw an error when an assetCategory\'s allowedTypes isn\'t an array', () => {
		assert.throws(parseAssets.bind(null, {
			name: 'test-bundle',
			nodecg: {
				assetCategories: [{
					name: 'category',
					title: 'Category',
					allowedTypes: 'foo'
				}]
			}
		}), 'nodecg.assetCategories[0].allowedTypes in bundle test-bundle is not an Array');
	});

	it('should throw an error when an assetCategory is named "sounds"', () => {
		assert.throws(parseAssets.bind(null, {
			name: 'test-bundle',
			nodecg: {
				assetCategories: [{name: 'Sounds'}]
			}
		}), '"sounds" is a reserved assetCategory name. ' +
			'Please change nodecg.assetCategories[0].name in bundle test-bundle');
	});
});
