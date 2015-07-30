'use strict';

var debug = require('debug')('nodecg:bundle-parser');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');

module.exports = function (panelsManifestPath) {
    var panels = [];

    var dashboardDir = path.dirname(panelsManifestPath);
    var manifest;
    try {
        manifest = JSON.parse(fs.readFileSync(panelsManifestPath, 'utf8'));
    } catch(e) {
        // Only warn if the dashboard folder exists.
        // Otherwise, assume that the lack of panels is intentional.
        if (fs.existsSync(dashboardDir)) {
            debug('panels.json not found or not valid, this bundle will not have any dashboard panels');
        }
        return panels;
    }

    manifest.forEach(function(panel, index) {
        try {
            var missingProps = [];
            if (typeof(panel.name) === 'undefined') missingProps.push('name');
            if (typeof(panel.title) === 'undefined') missingProps.push('title');
            if (typeof(panel.file) === 'undefined') missingProps.push('file');
            if (missingProps.length) {
                debug('Panel #%d could not be parsed as it is missing the following properties:',
                    index, missingProps.join(', '));
                return;
            }

            // Check if this bundle already has a panel by this name
            var dupeFound = panels.some(function(p) {
                return p.name === panel.name;
            });
            if (dupeFound) {
                debug('Panel #%d (%s) has the same name as another panel in this bundle, '
                    + 'and will not be loaded.', index, panel.name);
                return;
            }

            var filePath = path.join(dashboardDir, panel.file);

            // check that the panel file exists, throws error if it doesn't
            /* jshint -W016 */
            fs.accessSync(filePath, fs.F_OK | fs.R_OK);
            /* jshint +W016 */

            var $ = cheerio.load(fs.readFileSync(filePath));

            // Check that the panel has a <head> tag, which we need to inject our scripts.
            if ($('head').length < 1) {
                debug('Panel "%s" in bundle has no <head>, cannot inject scripts. Panel will not be loaded.',
                    path.basename(panel.file));
                return;
            }

            // Check that the panel has a DOCTYPE
            var html = $.html();
            if (html.indexOf('<!DOCTYPE') < 0) {
                debug('Panel "%s" has no DOCTYPE, panel resizing will not work. Panel will not be loaded.',
                    path.basename(panel.file));
                return;
            }

            panel.width = panel.width || 1;
            panel.dialog = !!panel.dialog; // No undefined please

            panels.push(panel);
        } catch (e) {
            debug('Error parsing panel \'%s\':\n', panel.name, e.message);
        }
    });

    return panels;
};
