'use strict';

var fs = require('fs');
var path = require('path');
var debug = require('debug')('nodecg:bundle-parser');
var parsePanels = require('./lib/panels');
var parseGraphics = require('./lib/graphics');
var parseManifest = require('./lib/manifest');
var parseConfig = require('./lib/config');

module.exports = function (bundlePath, bundleCfgPath) {
    // Resolve the path to the bundle and its package.json
    var manifestPath = path.join(bundlePath, 'package.json');

    // TODO: Should this throw an error instead?
    // Return undefined if package.json doesn't exist
    if (!fs.existsSync(manifestPath)) return;

    // Read metadata from the package.json
    var manifest = parseManifest(manifestPath);
    var bundle = manifest;
    bundle.rawManifest = JSON.stringify(manifest);
    bundle.dir = bundlePath;

    // If there is a config file for this bundle, parse it
    if (bundleCfgPath) {
        bundle.config = parseConfig(bundleCfgPath);
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

    return bundle;
};
