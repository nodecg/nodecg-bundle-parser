'use strict';

var fs = require('fs');
var path = require('path');
var log = require('../../logger')('nodecg/lib/bundles/parser');
var parsePanels = require('./lib/panels');
var parseManifest = require('./lib/manifest');
var parseConfig = require('./lib/config');

module.exports = function (bundlePath, cfgPath) {
    // resolve the path to the bundle and its nodecg.json
    var manifestPath = path.join(bundlePath, 'nodecg.json');

    // TODO: Should this throw an error instead?
    // Return undefined if nodecg.json doesn't exist
    if (!fs.existsSync(manifestPath)) return;

    log.trace('Discovered bundle in folder bundles/%s', bundleName);

    // Read metadata from the nodecg.json manifest file
    var manifest = parseManifest(manifestPath);
    var bundle = manifest;
    bundle.rawManifest = JSON.stringify(manifest);
    bundle.dir = dir;

    // If there is a config file for this bundle, parse it
    if (cfgPath) {
        bundle.config = parseConfig(cfgPath);
    }

    bundle.dashboard = {
        dir: path.join(bundle.dir, 'dashboard'),
        panels: parsePanels(bundle)
    };

    bundle.display = {
        dir: path.join(bundle.dir, 'display')
    };

    return bundle;
};
