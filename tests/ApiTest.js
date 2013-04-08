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

		theMail.send(function(err, id) {
			test.ifError(err);

			httpTest.getApi('/api/o/1.gif', function(err, res) {
				test.ifError(err);

				db.query(
					'SELECT `opened` FROM {{mail_to}} WHERE `mail_id` = :id',
					{
						id: id
					},
					function(err, result) {
						test.ifError(err);

						test.done();
				});
			});
		});
	},

	testTrackingClick: function(test) {
		test.expect(8);

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
			},
			tracking: {
				links: true
			}
		});
		var mailToId = null;
		var plain = 0;
		var html = 0;

		theMail.send(function(err, id) {
			test.ifError(err);

			httpTest.getApi('/api/l/1', function(err, res) {
				test.ifError(err);

				db.query(
					'SELECT `mail_id` FROM {{mail_to}} LIMIT 1;',
					function(err, results) {
						test.ifError(err);

						test.strictEqual(results.length, 1);

						mailToId = results[0]['mail_id'];

						db.query(
							'SELECT `plain` FROM {{mail_link}} WHERE `mail_to_id` = :mail_to_id',
							{
								mail_to_id: mailToId
							},
							function(err, results) {
								test.ifError(err);

								test.strictEqual(results.length, 3);
								for (var i = 0; i < results.length; i++) {
									if (results[i]['plain'] === 0)
										html++;
									else
										plain++;
								}

								test.strictEqual(plain, 1);
								test.strictEqual(html, 2);

								test.done();
						});
					}
				);
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