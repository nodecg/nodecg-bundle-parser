'use strict';

var debug = require('debug')('nodecg:bundle-parser');
var format = require('util').format;
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');

module.exports = function (dashboardDir, manifest) {
    var panels = [];

    // If the dashboard folder exists but the nodecg.dashboardPanels property doesn't, throw an error.
    if (fs.existsSync(dashboardDir) && typeof manifest.dashboardPanels === 'undefined') {
        throw new Error(manifest.name + ' has a "dashboard" folder, '
            + 'but no "nodecg.dashboardPanels" property was found in its package.json');
    }

    // If nodecg.dashboardPanels exists but the dashboard folder doesn't, throw an error.
    if (!fs.existsSync(dashboardDir) && typeof manifest.dashboardPanels !== 'undefined') {
        throw new Error(manifest.name + ' has a "nodecg.dashboardPanels" property in its package.json, '
            + 'but no "dashboard" folder');
    }

    // If neither the folder nor the manifest exist, return an empty array.
    if (!fs.existsSync(dashboardDir) && typeof manifest.dashboardPanels === 'undefined') {
        return panels;
    }

    manifest.dashboardPanels.forEach(function(panel, index) {
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
                format('Panel #%d (%s) has the same name as another panel in %s.',
                    index, panel.name, manifest.name)
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
                format('Panel "%s" in bundle "%s" has no <head>, and therefore cannot have scripts injected.'
                    + ' Add a <head> tag to it.', path.basename(panel.file), manifest.name)
            );
        }

        // Check that the panel has a DOCTYPE
        var html = $.html();
        if (html.indexOf('<!DOCTYPE') < 0) {
            throw new Error(
                format('Panel "%s" in bundle "%s" has no DOCTYPE, panel resizing will not work.' +
                    ' Add <!DOCTYPE html> to it.', path.basename(panel.file), manifest.name)
            );
        }

        panel.width = panel.width || 1;
        panel.dialog = !!panel.dialog; // No undefined please
        panel.headerColor = panel.headerColor || '#9f9bbd';

        if (panel.dialog) {
            $('body').prepend('<h2>' + panel.title + '</h2>');
        }

        panel.html = $.html();

        panels.push(panel);
    });

    return panels;
};
