var Sql = require(__dirname + '/../components/Sql.js');

var db = require(__dirname + '/../lib/db.js');

var _ = require('underscore');
var async = require('async');

var querys = [];

_.each(Sql.remove, function(query, name) {
	querys.push(query.replace(/TEMPORARY /, ''));
});

async.eachSeries(querys, function(query, next) {
	db.query(query, function(err, result) {
		if (err)
			throw err;

		next(null);
	});
}, function(err) {
	if (err)
		throw err;

	console.log('Database schema successfully removed.');

	process.exit(0);
});