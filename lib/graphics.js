'use strict';

var format = require('util').format;
var fs = require('fs');
var path = require('path');

module.exports = function (graphicsDir, manifest) {
	var graphics = [];

	// If the graphics folder exists but the nodecg.graphics property doesn't, throw an error.
	if (fs.existsSync(graphicsDir) && typeof manifest.graphics === 'undefined') {
		throw new Error(manifest.name + ' has a "graphics" folder, ' +
			'but no "nodecg.graphics" property was found in its package.json');
	}

	// If nodecg.graphics exists but the graphics folder doesn't, throw an error.
	if (!fs.existsSync(graphicsDir) && typeof manifest.graphics !== 'undefined') {
		throw new Error(manifest.name + ' has a "nodecg.graphics" property in its package.json, ' +
			'but no "graphics" folder');
	}

	// If neither the folder nor the manifest exist, return an empty array.
	if (!fs.existsSync(graphicsDir) && typeof manifest.graphics === 'undefined') {
		return graphics;
	}

	manifest.graphics.forEach(function (graphic, index) {
		var missingProps = [];
		if (typeof graphic.file === 'undefined') {
			missingProps.push('file');
		}

		if (typeof graphic.width === 'undefined') {
			missingProps.push('width');
		}

		if (typeof graphic.height === 'undefined') {
			missingProps.push('height');
		}

		if (missingProps.length) {
			throw new Error(
				format('Graphic #%d could not be parsed as it is missing the following properties:',
					index, missingProps.join(', '))
			);
		}

		// Check if this bundle already has a graphic for this file
		var dupeFound = graphics.some(function (g) {
			return g.file === graphic.file;
		});
		if (dupeFound) {
			throw new Error(
				format('Graphic #%d (%s) has the same file as another graphic in %s', index, manifest.name)
			);
		}

		var filePath = path.join(graphicsDir, graphic.file);

		// check that the panel file exists, throws error if it doesn't
		/* jshint -W016 */
		fs.accessSync(filePath, fs.F_OK | fs.R_OK);
		/* jshint +W016 */

		// Calculate the graphic's url
		graphic.url = '/graphics/' + manifest.name + '/' + graphic.file;

		graphics.push(graphic);
	});

	return graphics;
};
