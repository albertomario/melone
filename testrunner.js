process.env.MELONE_TEST = true;
process.env.MELONE_CONFIG = 'test.json';

var db = require(__dirname + '/lib/db.js');

var reporter = require('nodeunit').reporters.default;

//process.chdir(__dirname);
reporter.run(['tests/'], null, function(err) {
	db.end();
});