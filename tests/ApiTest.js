var config = require(__dirname + '/../lib/config.js');
var db = require(__dirname + '/../lib/db.js');
var httpTest = require(__dirname + '/../lib/httpTest.js');

var Sql = require(__dirname + '/../components/Sql.js');

var Key = require(__dirname + '/../models/Key.js');
var Mail = require(__dirname + '/../models/Mail.js');

var async = require('async');

module.exports.server = {
	setUp: function(cb) {
		var querys = [
			Sql.create.key,
			Sql.create.template,
			Sql.create.tag,
			Sql.create.mail,
			Sql.create.mail_tag,
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

	testStatus: function(test) {
		test.expect(2);

		httpTest.getApi('/api/status', function(err, res) {
			test.ifError(err);
			test.strictEqual(res.body.status, 'ok');

			test.done();
		});
	},

	testAuthenticate: function(test) {
		test.expect(4);

		var body = null;
		var theKey = Key.factory();

		theKey.setUniqueKey(function(err) {
			test.ifError(err);

			theKey.save(function(err) {
				test.ifError(err);

				body = {
					key: theKey.key,
					secret: theKey.secret
				};

				httpTest.postApi('/api/authenticate', body, function(err, res) {
					test.ifError(err);
					test.strictEqual(res.body.status, 'ok');

					test.done();
				});
			});
		});
	},

	testAuthenticateFailedNotProvided: function(test) {
		test.expect(2);

		httpTest.postApi('/api/authenticate', {}, function(err, res) {
			test.strictEqual(err, 400);
			test.strictEqual(res.body.error, 'No api key or secret given!');

			test.done();
		});
	},

	testAuthenticateFailedWrong: function(test) {
		test.expect(4);

		var body = null;
		var theKey = Key.factory();

		theKey.setUniqueKey(function(err) {
			test.ifError(err);

			theKey.save(function(err) {
				test.ifError(err);

				body = {
					key: theKey.key,
					secret: theKey.secret + 'a'
				};

				httpTest.postApi('/api/authenticate', body, function(err, res) {
					test.strictEqual(err, 401);
					test.strictEqual(res.body.error, 'Wrong api key or secret!');

					test.done();
				});
			});
		});
	},

	testMail: function(test) {
		test.expect(4);

		var body = null;
		var theKey = Key.factory();

		theKey.setUniqueKey(function(err) {
			test.ifError(err);

			theKey.save(function(err) {
				test.ifError(err);

				body = {
					key: theKey.key,
					secret: theKey.secret,
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
				};

				httpTest.postApi('/api/mail/send', body, function(err, res) {
					test.ifError(err);
					test.strictEqual(res.body.id, 1);

					test.done();
				});
			});
		});
	},

	testTrackingOpen: function(test) {
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
					text: '<h1>Welcome</h1> <a href="http://www.example.com">example.com</a>'
				},
				plain: {
					text: 'Welcome http://www.example.com'
				}
			}
		});

		var now = new Date();

		theMail.send(function(err, id) {
			test.ifError(err);

			httpTest.get('/api/l/o/1.gif', function(err, res) {
				test.ifError(err);

				db.query({
						sql: 'SELECT `opened` FROM {{mail_to}} WHERE `mail_id` = ' + id,
						typeCast: function (field, orig) {
							return field.type === 'TIMESTAMP' ? field.string() : orig();
						}
					},
					function(err, result) {
						test.ifError(err);

						test.done();
				});
			});
		});
	},

	testTrackingLink: function(test) {
		test.done();
	},

	tearDown: function(cb) {
		var querys = [
			Sql.remove.key,
			Sql.remove.template,
			Sql.remove.tag,
			Sql.remove.mail,
			Sql.remove.mail_tag,
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