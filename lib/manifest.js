'use strict';

module.exports = function (manifestPath) {
    // Parse the JSON from nodecg.json
    var manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Copy the JSON we use into the beginnings of our bundle object
    return {
        name: manifest.name,
        version: manifest.version,
        description: manifest.description,
        homepage: manifest.homepage,
        authors: manifest.authors,
        license: manifest.license,
        nodecgDependency: manifest.nodecgDependency,
        dependencies: manifest.dependencies,
        extension: manifest.extension,
        bundleDependencies: manifest.bundleDependencies
    };
};