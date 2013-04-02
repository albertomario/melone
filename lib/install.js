var Sql = require(__dirname + '/../components/Sql.js');

var db = require(__dirname + '/../lib/db.js');

var _ = require('underscore');
var async = require('async');

var querys = [];

_.each(Sql.create, function(query, name) {
	querys.push(query.replace(/TEMPORARY /, ''));
});

_.each(Sql.foreign_keys, function(query) {
	querys.push(query);
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

	console.log('Database scheme successfully created.');

	process.exit(0);
});