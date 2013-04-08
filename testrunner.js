var varTest = process.env.MELONE_TEST;
var varConfig = process.env.MELONE_CONFIG;

process.on('uncaughtException', function(err) {
	process.env.MELONE_TEST = varTest;
	process.env.MELONE_CONFIG = varConfig;

	console.log('Exception: ', err);
	process.exit(1);
});

process.env.MELONE_TEST = "true";
process.env.MELONE_CONFIG = 'test.json';

var db = require(__dirname + '/lib/db.js');
var httpTest = require(__dirname + '/lib/httpTest.js');

var reporter = require('nodeunit').reporters.default;

httpTest.startServer(function(err) {
	if (err) throw err;

	httpTest.startApiServer(function(err) {
		if (err) throw err;

		reporter.run(['tests/'], null, function(err) {
			db.end();

			httpTest.closeServer(function(err) {
				if (err) throw err;

				httpTest.closeApiServer(function(err) {
					if (err) throw err;

					process.env.MELONE_TEST = varTest;
					process.env.MELONE_CONFIG = varConfig;

					process.exit(0);
				});
			});
		});
	});
});