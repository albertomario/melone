var fs = require('fs');
var path = require('path');

var filename = '';

if (process.env.TRAVIS) {
	filename = path.normalize(__dirname + '/../config/travis.json');
} else {
	filename = process.env.MELONE_CONFIG ? path.normalize(__dirname + '/../config/' + process.env.MELONE_CONFIG) : path.normalize(__dirname + '/../config/default.json');
}

try {
	config = fs.readFileSync(filename, 'utf8');
} catch (e) {
	console.log('Could not read config "' + filename + '"');
	throw e;
}

console.log('Read config from: "' + filename + '"');

try {
	config = JSON.parse(config);
} catch(e) {
	console.log('Could not parse config!');
	throw e;
}

module.exports = config;