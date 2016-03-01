'use strict';

var fs = require('fs');
var path = require('path');
var parsePanels = require('./lib/panels');
var parseGraphics = require('./lib/graphics');
var parseManifest = require('./lib/manifest');
var config = require('./lib/config');
var parseExtension = require('./lib/extension');

module.exports = function (bundlePath, bundleCfgPath) {
	// Resolve the path to the bundle and its package.json
	var manifestPath = path.join(bundlePath, 'package.json');

	if (!fs.existsSync(manifestPath)) {
		throw new Error('Bundle at path ' + bundlePath + ' does not contain a package.json!');
	}

	// Read metadata from the package.json
	var manifest = parseManifest(manifestPath);
	var bundle = manifest;
	bundle.rawManifest = JSON.stringify(manifest);
	bundle.dir = bundlePath;

	// If there is a config file for this bundle, parse it.
	// Else if there is only a configschema for this bundle, parse that and apply any defaults.
	if (bundleCfgPath) {
		bundle.config = config.parse(bundle, bundleCfgPath);
	} else {
		bundle.config = config.parseDefaults(bundle);
	}

	// Parse the dashboard panels
	var dashboardDir = path.resolve(bundle.dir, 'dashboard');
	bundle.dashboard = {
		dir: dashboardDir,
		panels: parsePanels(dashboardDir, manifest)
	};

	// Parse the graphics
	var graphicsDir = path.resolve(bundle.dir, 'graphics');
	bundle.graphics = parseGraphics(graphicsDir, manifest);

	// Determine if this bundle has an extension that should be loaded by NodeCG
	bundle.hasExtension = parseExtension(bundle.dir, manifest);

	return bundle;
};
