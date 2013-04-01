var Mail = require(__dirname + '/../models/Mail.js');
var Template = require(__dirname + '/../models/Template.js');
var Tag = require(__dirname + '/../models/Tag.js');

var Sql = require(__dirname + '/../components/Sql.js');

var config = require(__dirname + '/../lib/config.js');
var db = require(__dirname + '/../lib/db.js');

var async = require('async');
var url = require('url');

module.exports.mail = {
	setUp: function(cb) {
		var querys = [
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
				if (err) {
					console.log(err);
					throw err;
				}

				next(null);
			});
		}, function(err) {
			if (err)
				throw err;

			cb();
		});
	},

	testGetApiUrl: function(test) {
		test.expect(5);

		var theMail = new Mail();
		var theUrl = theMail._getApiUrl();
		var formated = url.parse(theUrl);

		test.notStrictEqual(formated, null);
		test.strictEqual(typeof formated, 'object');
		test.notStrictEqual(formated.host, null);
		test.notStrictEqual(formated.path, null);
		test.notStrictEqual(formated.href, null);

		test.done();
	},

	testGetLinks: function(test) {
		test.expect(1);

		var theMail = new Mail();

		var text = '"http://www.test1.de" ' +
			'This is a www.test2.de url ' +
			'This is a http://www.test3.de url ' +
			'http://www.test4.de ' +
			'https://www.test5.de ' +
			'http://test6.de ' +
			'https://test7.de ' +
			'www.test8.de ' +
			'test9.de ' +
			'test10.de:80 ' +
			'test11.de/?query=search ' +
			'test12.de/?query=search&asd=%20wasd ' +
			'test13.de/path/to/test ' +
			'test14.de#!hashtag ';

		var links = theMail._getLinks(text);

		test.strictEqual(links.length, 14, 'There must be 14 links!');

		test.done();
	},

	testInsertRecipients: function(test) {
		test.expect(2);

		var theMail = new Mail();
		theMail.id = 1;
		var to = [
			{
				email: 'test1@example.org',
				name: 'Tom Test'
			},
			{
				email: 'test2@example.org',
				name: 'Toni Test'
			}
		];

		theMail._insertRecipients(to, function(err, recipients) {
			test.ifError(err);

			test.strictEqual(recipients.length, to.length, 'Not all recipients were added to the database!');

			test.done();
		});
	},

	testConvertRecipient: function(test) {
		test.expect(2);

		var theMail = new Mail();

		var rec1 = {
			name: 'Tom Test',
			email: 'test@example.org'
		};
		var rec2 = {
			email: 'test@example.org'
		};

		test.strictEqual(theMail._convertRecipient(rec1), 'Tom Test <test@example.org>');
		test.strictEqual(theMail._convertRecipient(rec2), 'test@example.org');

		test.done();
	},

	testAddTrackingOpen: function(test) {
		test.expect(1);

		var theMail = new Mail();
		var theRecipient = {
			id: 1
		};

		var before = '<h1>Welcome</h1>';
		var after = before + '<img border="0" src="' + theMail._getApiUrl('api/o/' + theRecipient.id + '.gif') + '" width="1" height="1">';

		var html = theMail._addTrackingOpen(before, theRecipient);

		test.strictEqual(html, after);

		test.done();
	},

	testAddTrackingLinksHtml: function(test) {
		test.expect(3);

		var theMail = new Mail();
		var recipient = {
			id: 1
		};
		var plain = 'Do not touch http://www.example.com';
		var html = 'Convert http://www.example.com';
		var htmlTracked = 'Convert ' + theMail._getApiUrl('api/l/1');

		theMail.plain = plain;
		theMail.html = html;

		theMail._addTrackingLinksHtml(theMail.html, recipient, function(err, theHtml, theRecipient) {
			test.ifError(err);
			test.strictEqual(plain, theMail.plain, 'Plain text should not be touched!');
			test.strictEqual(theHtml, htmlTracked, 'HTML tracking gone wrong!');

			test.done();
		});
	},

	testAddTrackingLinksPlain: function(test) {
		test.expect(3);

		var theMail = new Mail();
		var recipient = {
			id: 1
		};
		var plain = 'Convert http://www.example.com';
		var html = 'Do not touch http://www.example.com';
		var plainTracked = 'Convert ' + theMail._getApiUrl('api/l/1');

		theMail.plain = plain;
		theMail.html = html;

		theMail._addTrackingLinksHtml(theMail.plain, recipient, function(err, thePlain, theRecipient) {
			test.ifError(err);
			test.strictEqual(html, theMail.html, 'HTML should not be touched!');
			test.strictEqual(thePlain, plainTracked, 'Plain text tracking gone wrong!');

			test.done();
		});
	},

	testAddTrackingLinks: function(test) {
		test.expect(4);

		var theMail = new Mail();
		var recipient = {
			id: 1
		};
		var html = 'Convert http://www.example.com';
		var plain = 'Convert http://www.example.com';

		var plainTracked = 'Convert ' + theMail._getApiUrl('api/l/1');
		var htmlTracked = 'Convert ' + theMail._getApiUrl('api/l/2');

		theMail.plain = plain;
		theMail.html = html;

		theMail._addTrackingLinksPlain(theMail.plain, recipient, function(err, thePlain, plainRecipient) {
			test.ifError(err);

			theMail._addTrackingLinksHtml(theMail.html, plainRecipient, function(err, theHtml, htmlRecipient) {
				test.ifError(err);

				test.strictEqual(theHtml, htmlTracked, 'HTML tracking gone wrong!');
				test.strictEqual(theHtml, htmlTracked, 'Plain text tracking gone wrong!');

				test.done();
			});
		});
	},

	testGetTemplate: function(test) {
		test.expect(3);

		var theTemplate = new Template.factory({
			name: 'test-template'
		});
		var theMail = new Mail({
			content: {
				template: 'test-template'
			}
		});

		theTemplate.save(function(err) {
			test.ifError(err);

			theMail._getTemplate(function(err, templateFound) {
				test.ifError(err);

				test.notEqual(templateFound, null, 'No template was found!');

				test.done();
			});
		});
	},

	testGetNoTemplate: function(test) {
		test.expect(2);

		var theMail = new Mail({
			content: {}
		});

		theMail._getTemplate(function(err, templateFound) {
			test.ifError(err);

			test.strictEqual(templateFound, null, 'A template was found but shouldn\'t!');

			test.done();
		});
	},

	testInsertTags: function(test) {
		test.expect(4);

		var tag1 = new Tag.factory({
			name: 'tag1'
		});
		var tag2 = new Tag.factory({
			name: 'tag2'
		});
		var tag3 = new Tag.factory({
			name: 'tag3'
		});
		var theMail = new Mail({
			tags: [
				'tag1',
				'tag2',
				'tag3'
			]
		});
		theMail.id = 1;

		tag1.save(function(err) {
			test.ifError(err);

			tag2.save(function(err) {
				test.ifError(err);

				tag3.save(function(err) {
					test.ifError(err);

					theMail._insertTags(function(err) {
						test.ifError(err);

						test.done();
					});
				});
			});
		});
	},

	testFormatPlainTemplate: function(test) {
		test.expect(1);

		var theMail = new Mail();
		var before = '<h1>Hello #{username},</h1>\n<p>Welcome to #{appname}.</p>';
		var after = '!<h1>Hello #{username},</h1>\n!<p>Welcome to #{appname}.</p>';
		var result = theMail._formatPlainTemplate(before);

		test.strictEqual(result, after);

		test.done();
	},

	testReformatPlainTemplate: function(test) {
		test.expect(1);

		var theMail = new Mail();
		var before = '!<h1>Hello Tom Test,</h1>\n!<p>Welcome to Melone Test.</p>';
		var after = '<h1>Hello Tom Test,</h1>\n<p>Welcome to Melone Test.</p>';
		var result = theMail._reformatPlainTemplate(before);

		test.strictEqual(result, after);

		test.done();
	},

	testPrepare: function(test) {
		test.expect(5);

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

		theMail._prepare(function(err, recipients, theTemplate, contentHtml, contentPlain) {
			test.ifError(err);

			test.notStrictEqual(recipients.length, 0);
			test.strictEqual(theTemplate, null);
			test.notStrictEqual(contentHtml, null);
			test.notStrictEqual(contentPlain, null);

			test.done();
		});
	},

	testCompileHtml: function(test) {
		test.expect(2);

		var theMail = new Mail();
		var template = '<h1>Hello #{username},</h1>\n<p>Welcome to #{appname}.</p>';

		theMail._compileHtml(template, {appname: 'Melone Test'}, {username: 'Tom Test'}, function(err, html) {
			test.ifError(err);

			test.strictEqual(html, '<h1>Hello Tom Test,</h1>\n<p>Welcome to Melone Test.</p>');

			test.done();
		});
	},

	testCompilePlain: function(test) {
		test.expect(2);

		var theMail = new Mail();
		var template = theMail._formatPlainTemplate('Hello #{username},\n\nWelcome to #{appname}.');

		theMail._compilePlain(template, {appname: 'Melone Test'}, {username: 'Tom Test'}, function(err, plain) {
			test.ifError(err);

			test.strictEqual(plain, 'Hello Tom Test,\n\nWelcome to Melone Test.');

			test.done();
		});
	},

	testSend: function(test) {
		test.expect(1);

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

			test.done();
		});
	},

	tearDown: function(cb) {
		var querys = [
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
				if (err) {
					console.log(err);
					throw err;
				}

				next(null);
			});
		}, function(err) {
			if (err)
				throw err;

			cb();
		});
	}
};