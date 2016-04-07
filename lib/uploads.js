'use strict';

module.exports = function (pkg) {
	if (pkg.nodecg.uploadCategories) {
		if (!Array.isArray(pkg.nodecg.uploadCategories)) {
			throw new Error(`${pkg.name}'s nodecg.uploadCategories is not an Array`);
		}

		return pkg.nodecg.uploadCategories.map((category, index) => {
			if (typeof category.name !== 'string') {
				throw new Error(`nodecg.uploadCategories[${index}] in bundle ${pkg.name} lacks a "name" property`);
			}
			
			if (category.name.toLowerCase() === 'sounds') {
				throw new Error('"sounds" is a reserved uploadCategory name. ' +
					`Please change nodecg.uploadCategories[${index}].name in bundle ${pkg.name}`);
			}

			if (typeof category.title !== 'string') {
				throw new Error(`nodecg.uploadCategories[${index}] in bundle ${pkg.name} lacks a "title" property`);
			}

			if (category.allowedTypes && !Array.isArray(category.allowedTypes)) {
				throw new Error(`nodecg.uploadCategories[${index}].allowedTypes in bundle ${pkg.name} is not an Array`);
			}

			return category;
		});
	}

	return [];
};
