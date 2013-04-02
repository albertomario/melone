var config = require(__dirname + '/config.js');
var logger = require(__dirname + '/logger.js');

var mysql = require('mysql');

var Db = {
	_tablePrefix: '',

	_prependTablePrefix: function(table) {
		return '`' + this._tablePrefix + table + '`';
	},

	queryFormat: function(query, values) {
		if (!query)
			return query;

		//Append table prefix
		query = query.replace(/\{\{(\w+)\}\}/g, function(txt, key) {
			return txt.replace(txt, Db._prependTablePrefix(key));
		});

		if (!values) return query;

		//Escape query identifiers
		query = query.replace(/\{(\w+)\}/g, function(txt, key) {
			return txt.replace(txt, mysql.escapeId(key));
		});

		//Replace values
		return query.replace(/\:(\w+)/g, function (txt, key) {
			if (values.hasOwnProperty(key)) {
				return this.escape(values[key]);
			}

			return txt;
		}.bind(this));
	},

	setTablePrefix: function(newPrefix) {
		this._tablePrefix = newPrefix;
	}
};

var connection = mysql.createConnection({
	host: config.db.host,
	user: config.db.username,
	password: config.db.password,
	database: config.db.database
});

Db.setTablePrefix(config.db.prefix);
connection.config.queryFormat = Db.queryFormat;

connection.connect(function(err) {
	if (err) {
		logger.info('Database options: ', config.db);
		throw 'Could not connect to database!';
	} else {
		logger.info('Connected to database.');
	}
});

module.exports = connection;