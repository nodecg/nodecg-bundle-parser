'use strict';

var debug = require('debug')('nodecg:bundle-parser');
var format = require('util').format;
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
        // Only throw an error if the dashboard folder exists
        // Otherwise, assume that the lack of panels is intentional.
        if (fs.existsSync(dashboardDir)) {
            if (fs.existsSync(panelsManifestPath)) {
                throw new Error('This bundle has a "dashboard" folder, but "dashboard/panels.json" could not be read,'
                    + ' Ensure that it is valid JSON.');
            } else {
                throw new Error('This bundle has a "dashboard" folder, but "dashboard/panels.json" was not found');
            }
        }
        return panels;
    }

    manifest.forEach(function(panel, index) {
        var missingProps = [];
        if (typeof(panel.name) === 'undefined') missingProps.push('name');
        if (typeof(panel.title) === 'undefined') missingProps.push('title');
        if (typeof(panel.file) === 'undefined') missingProps.push('file');
        if (missingProps.length) {
            throw new Error(
                format('Panel #%d could not be parsed as it is missing the following properties:',
                    index, missingProps.join(', '))
            );
        }

        // Check if this bundle already has a panel by this name
        var dupeFound = panels.some(function(p) {
            return p.name === panel.name;
        });
        if (dupeFound) {
            throw new Error(
                format('Panel #%d (%s) has the same name as another panel in this bundle.', index, panel.name)
            );
        }

        var filePath = path.join(dashboardDir, panel.file);

        // check that the panel file exists, throws error if it doesn't
        /* jshint -W016 */
        fs.accessSync(filePath, fs.F_OK | fs.R_OK);
        /* jshint +W016 */

        var $ = cheerio.load(fs.readFileSync(filePath));

        // Check that the panel has a <head> tag, which we need to inject our scripts.
        if ($('head').length < 1) {
            throw new Error(
                format('Panel "%s" has no <head>, and therefore cannot have scripts injected.'
                    + ' Add a <head> tag to it.', path.basename(panel.file))
            );
        }

        // Check that the panel has a DOCTYPE
        var html = $.html();
        if (html.indexOf('<!DOCTYPE') < 0) {
            throw new Error(
                format('Panel "%s" has no DOCTYPE, panel resizing will not work. Add <!DOCTYPE html> to it.',
                    path.basename(panel.file))
            );
        }

        panel.width = panel.width || 1;
        panel.dialog = !!panel.dialog; // No undefined please

        panels.push(panel);
    });

    return panels;
};
