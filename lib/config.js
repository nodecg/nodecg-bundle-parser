'use strict';

var path = require('path');
var format = require('util').format;
var fs = require('fs');
var tv4 = require('tv4');
var defaults = require('json-schema-defaults');
var extend = require('extend');

module.exports.parse = function (bundle, cfgPath) {
	if (fs.existsSync(cfgPath)) {
		var userConfig;

		try {
			userConfig = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
		} catch (e) {
			throw new Error(
				format('bundleCfgPath "%s" could not be read. Ensure that it is valid JSON.', cfgPath)
			);
		}

		var cfgSchemaPath = path.resolve(bundle.dir, 'configschema.json');
		if (fs.existsSync(cfgSchemaPath)) {
			var schema = _parseSchema(bundle.name, cfgSchemaPath);
			var result = tv4.validateResult(userConfig, schema);
			if (result.valid) {
				var defaultConfig = defaults(schema);
				return extend(true, defaultConfig, userConfig);
			}

			throw new Error(
				format('Config for bundle "%s" is invalid:\n %s at %s',
					bundle.name, result.error.message, result.error.dataPath)
			);
		} else {
			return userConfig;
		}
	} else {
		throw new Error(
			format('bundleCfgPath "%s" does not exist', cfgPath)
		);
	}
};

module.exports.parseDefaults = function (bundle) {
	var cfgSchemaPath = path.resolve(bundle.dir, 'configschema.json');
	if (fs.existsSync(cfgSchemaPath)) {
		var schema = _parseSchema(bundle.name, cfgSchemaPath);
		return defaults(schema);
	}

	return {};
};

function _parseSchema(bundleName, schemaPath) {
	try {
		return JSON.parse(fs.readFileSync(schemaPath));
	} catch (e) {
		throw new Error(
			format('configschema.json for bundle "%s" could not be read. Ensure that it is valid JSON.',
				bundleName)
		);
	}
}
