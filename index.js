'use strict';

var fs = require('fs');
var path = require('path');
var debug = require('debug')('nodecg:bundle-parser');
var parsePanels = require('./lib/panels');
var parseManifest = require('./lib/manifest');
var parseConfig = require('./lib/config');

module.exports = function (bundlePath, bundleCfgPath) {
    // resolve the path to the bundle and its nodecg.json
    var manifestPath = path.join(bundlePath, 'nodecg.json');

    // TODO: Should this throw an error instead?
    // Return undefined if nodecg.json doesn't exist
    if (!fs.existsSync(manifestPath)) return;

    debug('Discovered bundle in folder %s', bundlePath);

    // Read metadata from the nodecg.json manifest file
    var manifest = parseManifest(manifestPath);
    var bundle = manifest;
    bundle.rawManifest = JSON.stringify(manifest);
    bundle.dir = bundlePath;

    // If there is a config file for this bundle, parse it
    if (bundleCfgPath) {
        bundle.config = parseConfig(bundleCfgPath);
    }

    bundle.dashboard = {
        dir: path.resolve(bundle.dir, 'dashboard'),
        panels: parsePanels(path.resolve(bundle.dir, 'dashboard/panels.json'))
    };

    bundle.display = {
        dir: path.join(bundle.dir, 'display')
    };

    return bundle;
};
