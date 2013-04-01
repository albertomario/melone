var fs = require('fs');
var path = require('path');
var filename = process.env.MELONE_CONFIG ? path.normalize(__dirname + '/../config/' + process.env.MELONE_CONFIG) : path.normalize(__dirname + '/../config/local.json');

try {
	config = fs.readFileSync(filename, 'utf8');
} catch (e) {
	console.log('Could not read config "' + filename + '"');
	throw e;
}

if (!config)
	throw 'Could not read config!';

try {
	config = JSON.parse(config);
} catch(e) {
	console.log('Could not parse config!');
	throw e;
}

module.exports = config;