var Key = require(__dirname + '/../models/Key.js');
var Mail = require(__dirname + '/../models/Mail.js');

var Tracking = require(__dirname + '/Tracking.js');

var logger = require(__dirname + '/../lib/logger.js');

var util = require('util');
var fs = require('fs');

var ServerError = function(message) {
	this.code = 500;
	this.message = message;
};

util.inherits(ServerError, Error);
ServerError.name = 'ServerError';

var NotFoundError = function(message) {
	this.code = 404;
	this.message = message;
};

util.inherits(NotFoundError, Error);
NotFoundError.name = 'NotFoundError';

var BadRequestError = function(message) {
	this.code = 400;
	this.message = message;
};

util.inherits(BadRequestError, Error);
BadRequestError.name = 'BadRequestError';

var Routes = {
	error: function(err, req, res, next) {
		res.json(err.code, {
			error: err.message
		});
	},

	status: function(req, res, next) {
		res.json(200, {
			status: 'ok'
		});
	},

	mail: {
		send: function(req, res, next) {
			var theMail = new Mail(req.body);

			theMail.send(function(err) {
				if (err) {
					next(new ServerError(err));
				} else {
					res.json(200, {
						status: 'ok'
					});
				}
			});
		}
	},

	tracking: {
		open: function(req, res, next) {
			Tracking.open(req.params.id, function(err) {
				fs.readFile(__dirname + '/../assets/images/track_open.gif', function(err, img) {
					if (err) {
						next(new ServerError('Could not load image!'));
					} else {
						res.writeHead(200, {
							'Content-Type': 'image/gif'
						});
						res.end(img, 'binary');
					}
				});
			});
		},

		click: function(req, res, next) {
			Tracking.click(req.params.id, req.connection.remoteAddress, function(err, redirect) {
				if (err) {
					next(new NotFoundError('Could not find the link!'));
				} else {
					res.redirect(redirect);
				}
			});
		}
	}
};

module.exports = Routes;