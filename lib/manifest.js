'use strict';

var fs = require('fs');

module.exports = function (manifestPath) {
    // Parse the JSON from package.json
    var manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Check if this manifest has a nodecg property
    if (!manifest.hasOwnProperty('nodecg')) {
        throw new Error(manifest.name + '\'s package.json lacks a "nodecg" property, and therefore cannot be parsed.');
    }

    // Return the "nodecg" property object verbatim. This will be the start of our new bundle object.
    var obj = manifest.nodecg;
    obj.name = manifest.name;
    obj.version = manifest.version;
    obj.license = manifest.license;
    obj.description = manifest.description;
    obj.homepage = manifest.homepage;
    obj.authors = manifest.authors;
    return obj;
};
