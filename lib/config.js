'use strict';

var path = require('path');
var format = require('util').format;
var fs = require('fs');
var tv4 = require('tv4');

module.exports = function (bundle, cfgPath) {
	if (fs.existsSync(cfgPath)) {
		var cfg;

		try {
			cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
		} catch (e) {
			throw new Error(
				format('bundleCfgPath "%s" could not be read. Ensure that it is valid JSON.', cfgPath)
			);
		}

		var cfgSchemaPath = path.resolve(bundle.dir, 'configschema.json');
		if (fs.existsSync(cfgSchemaPath)) {
			var schema;

			try {
				schema = JSON.parse(fs.readFileSync(cfgSchemaPath));
			} catch (e) {
				throw new Error(
					format('configschema.json for bundle "%s" could not be read. Ensure that it is valid JSON.',
						bundle.name)
				);
			}

			var result = tv4.validateResult(cfg, schema);
			if (result.valid) {
				return cfg;
			}

			throw new Error(
				format('Config for bundle "%s" is invalid:\n %s at %s',
					bundle.name, result.error.message, result.error.dataPath)
			);
		} else {
			return cfg;
		}
	} else {
		throw new Error(
			format('bundleCfgPath "%s" does not exist', cfgPath)
		);
	}
};
