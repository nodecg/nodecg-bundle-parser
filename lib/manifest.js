'use strict';

var fs = require('fs');
var path = require('path');
var semver = require('semver');

module.exports = function (manifestPath) {
	// Parse the JSON from package.json
	var manifest;

	try {
		manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
	} catch (e) {
		throw new Error(manifestPath + ' is not valid JSON, ' +
			'please check it against a validator such as jsonlint.com');
	}

	// Check if this manifest has a nodecg property
	if (!manifest.hasOwnProperty('nodecg')) {
		throw new Error(manifest.name + '\'s package.json lacks a "nodecg" property, and therefore cannot be parsed.');
	}

	if (!semver.validRange(manifest.nodecg.compatibleRange)) {
		throw new Error(manifest.name + '\'s package.json does not have a valid "nodecg.compatibleRange" property.');
	}

	var bundleFolderName = path.dirname(manifestPath).split(path.sep).pop();
	if (bundleFolderName !== manifest.name) {
		throw new Error(manifest.name + '\'s folder is named "' + bundleFolderName + '". Please rename it to "' +
			manifest.name + '".');
	}

	// Return the "nodecg" property object verbatim. This will be the start of our new bundle object.
	var obj = manifest.nodecg;
	obj.name = manifest.name;
	obj.version = manifest.version;
	obj.license = manifest.license;
	obj.description = manifest.description;
	obj.homepage = manifest.homepage;
	obj.author = manifest.author;
	obj.contributors = manifest.contributors;
	obj.dependencies = manifest.dependencies;
	return obj;
};
