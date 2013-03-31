var fs = require('fs');
var path = require('path');
var filename = path.normalize(__dirname + '/../config/' + process.env.MELONE_CONFIG) || path.normalize(__dirname + '/../config/local.json');

config = fs.readFileSync(filename, 'utf8');

if (!config)
	throw 'Could not read config!';

try {
	config = JSON.parse(config);
} catch(e) {
	console.err('Could not parse config!');
	throw e;
}

module.exports = config;