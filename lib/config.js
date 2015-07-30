'use strict';

var fs = require('fs');

module.exports = function (cfgPath) {
    if (!fs.existsSync(cfgPath)) {
        // Skip if config does not exist
        return {};
    }

    return JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
};
