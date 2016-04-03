'use strict';

const fs = require('fs');
const path = require('path');
const parsePanels = require('./lib/panels');
const parseGraphics = require('./lib/graphics');
const parseManifest = require('./lib/manifest');
const config = require('./lib/config');
const parseExtension = require('./lib/extension');

module.exports = function (bundlePath, bundleCfgPath) {
	// Resolve the path to the bundle and its package.json
	const manifestPath = path.join(bundlePath, 'package.json');

	if (!fs.existsSync(manifestPath)) {
		throw new Error(`Bundle at path ${bundlePath} does not contain a package.json!`);
	}

	// Read metadata from the package.json
	const manifest = parseManifest(manifestPath);
	const bundle = manifest;
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
	const dashboardDir = path.resolve(bundle.dir, 'dashboard');
	bundle.dashboard = {
		dir: dashboardDir,
		panels: parsePanels(dashboardDir, manifest)
	};

	// Parse the graphics
	const graphicsDir = path.resolve(bundle.dir, 'graphics');
	bundle.graphics = parseGraphics(graphicsDir, manifest);

	// Determine if this bundle has an extension that should be loaded by NodeCG
	bundle.hasExtension = parseExtension(bundle.dir, manifest);

	return bundle;
};
