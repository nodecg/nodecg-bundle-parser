'use strict';

var format = require('util').format;
var fs = require('fs');

module.exports = function (cfgPath) {
    if (fs.existsSync(cfgPath)) {
        try {
            return JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
        } catch (e) {
            throw new Error(
                format('bundleCfgPath "%s" could not be read. Ensure that it is valid JSON.', cfgPath)
            );
        }
    } else {
        throw new Error(
            format('bundleCfgPath "%s" does not exist', cfgPath)
        );
    }
};
