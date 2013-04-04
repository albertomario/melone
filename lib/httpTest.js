var config = require(__dirname + '/config.js');
var app = require(__dirname + '/../server.js');

var server = null;

var request = require('request');
var url = require('url');

function createUrl(path) {
	if (!path)
		path = '';

	return config.url + ':' + config.app.port + path;
}

module.exports = {
	startServer: function(cb) {
		server = app.listen(config.app.port, function(err) {
			if (err) return cb(err);

			return cb(null);
		});
	},

	closeServer: function(cb) {
		if (server) {
			server.close();

			return cb(null);
		} else {
			return cb('Server not started!');
		}
	},

	get: function(path, cb) {
		request(createUrl(path), function(err, res, body) {
			if (err) return cb(err, null);

			switch (res.statusCode) {
				case 200:
					return cb(null, res);
				default:
					return cb(res.statusCode, res);
			}
		});
	},

	post: function(path, data, cb) {
		var options = {
			json: data,
			method: 'POST'
		};

		request(createUrl(path), options, function(err, res, body) {
			if (err) return cb(err, null);

			return cb(null, res);
		});
	}
};