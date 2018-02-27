const fs = require('fs'),
    path = require('path');

function loadServices(config) {
    return fs.readdirSync(path.resolve(config.manager.serviceDirectory))
        .filter(file => /\.js$/.test(file))
        .map(file => path.join(config.manager.serviceDirectory, file));
}

module.exports.loadServices = loadServices;
