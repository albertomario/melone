var config = require(__dirname + '/config.js');
var app = require(__dirname + '/../server.js');
var api = require(__dirname + '/../api.js');

var server = null;
var apiServer = null;

var request = require('request');
var url = require('url');

function createUrl(port, path) {
	if (!path)
		path = '';

	return config.url + ':' + port + path;
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

	startApiServer: function(cb) {
		apiServer = api.listen(config.api.port, function(err) {
			if (err) return cb(err);

			return cb(null);
		});
	},

	closeApiServer: function(cb) {
		if (apiServer) {
			apiServer.close();

			return cb(null);
		} else {
			return cb('API Server not started!');
		}
	},

	get: function(path, cb) {
		request(createUrl(config.app.port, path), function(err, res, body) {
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

		request(createUrl(config.app.port, path), options, function(err, res, body) {
			if (err) return cb(err, null);

			switch (res.statusCode) {
				case 200:
				case 302:
					return cb(null, res);
				default:
					return cb(res.statusCode, res);
			}
		});
	},

	getApi: function(path, cb) {
		request({
				url: createUrl(config.api.port, path),
				json: true
			},
			function(err, res, body) {
			if (err) return cb(err, null);

			switch (res.statusCode) {
				case 200:
					return cb(null, res);
				default:
					return cb(res.statusCode, res);
			}
		});
	},

	postApi: function(path, data, cb) {
		var options = {
			json: data,
			method: 'POST'
		};

		request(createUrl(config.api.port, path), options, function(err, res, body) {
			if (err) return cb(err, null);

			switch (res.statusCode) {
				case 200:
				case 302:
					return cb(null, res);
				default:
					return cb(res.statusCode, res);
			}
		});
	}
};