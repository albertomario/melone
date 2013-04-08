var Mail = require(__dirname + '/../models/Mail.js');

var Sql = require(__dirname + '/../components/Sql.js');
var Tracking = require(__dirname + '/../components/Tracking.js');

var config = require(__dirname + '/../lib/config.js');
var db = require(__dirname + '/../lib/db.js');

var async = require('async');

module.exports.Tracking = {
	setUp: function(cb) {
		var querys = [
			Sql.create.mail,
			Sql.create.mail_to,
			Sql.create.mail_link,
			Sql.create.mail_link_click
		];

		async.eachSeries(querys, function(query, next) {
			db.query(query, function(err, result) {
				if (err)
					throw err;

				next(null);
			});
		}, function(err) {
			if (err)
				throw err;

			cb();
		});
	},

	testOpen: function(test) {
		test.expect(2);

		var theMail = new Mail({
			to: [
				{
					email: 'test@example.org'
				}
			],
			subject: 'Welcome',
			content: {
				html: {
					text: '<h1>Welcome</h1>'
				},
				plain: {
					text: 'Welcome'
				}
			}
		});

		theMail.send(function(err) {
			test.ifError(err);

			Tracking.open(1, function(err) {
				test.ifError(err);

				test.done();
			});
		});
	},

	testOpenNotFound: function(test) {
		test.expect(1);

		Tracking.open(1, function(err) {
			test.notStrictEqual(err, null);

			test.done();
		});
	},

	testOpenTwice: function(test) {
		test.expect(3);

		var theMail = new Mail({
			to: [
				{
					email: 'test@example.org'
				}
			],
			subject: 'Welcome',
			content: {
				html: {
					text: '<h1>Welcome</h1>'
				},
				plain: {
					text: 'Welcome'
				}
			}
		});

		theMail.send(function(err) {
			test.ifError(err);

			Tracking.open(1, function(err) {
				test.ifError(err);

				Tracking.open(1, function(err) {
					test.ifError(err);

					test.done();
				});
			});
		});
	},

	testClick: function(test) {
		test.expect(3);

		var theUrl = 'http://www.example.com';
		var theMail = new Mail({
			to: [
				{
					email: 'test@example.org'
				}
			],
			subject: 'Welcome',
			content: {
				html: {
					text: '<h1>Welcome</h1> <p>Welcome to <a href="' + theUrl + '">example</a></p>'
				},
				plain: {
					text: 'Welcome'
				}
			},
			tracking: {
				links: true
			}
		});

		theMail.send(function(err) {
			test.ifError(err);

			Tracking.click(1, '127.0.0.1', function(err, url) {
				test.ifError(err);

				test.strictEqual(url, theUrl);

				test.done();
			});
		});
	},

	testClickNotFound: function(test) {
		test.expect(1);

		Tracking.click(1, '127.0.0.1', function(err, url) {
			test.notStrictEqual(err, null);

			test.done();
		});
	},

	tearDown: function(cb) {
		var querys = [
			Sql.remove.mail,
			Sql.remove.mail_to,
			Sql.remove.mail_link,
			Sql.remove.mail_link_click
		];

		async.eachSeries(querys, function(query, next) {
			db.query(query, function(err, result) {
				if (err)
					throw err;

				next(null);
			});
		}, function(err) {
			if (err)
				throw err;

			cb();
		});
	}
};