var config = require(__dirname + '/../lib/config.js');
var db = require(__dirname + '/../lib/db.js');
var httpTest = require(__dirname + '/../lib/httpTest.js');

var Sql = require(__dirname + '/../components/Sql.js');

var Template = require(__dirname + '/../models/Template.js');

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

	testIndex: function(test) {
		test.expect(1);

		httpTest.get('', function(err, res) {
			test.ifError(err);

			test.done();
		});
	},

	testKeyIndex: function(test) {
		test.expect(1);

		httpTest.get('/keys', function(err, res) {
			test.ifError(err);

			test.done();
		});
	},

	testKeyAdd: function(test) {
		test.expect(1);

		httpTest.get('/keys/add', function(err, res) {
			test.ifError(err);

			test.done();
		});
	},

	testTemplateIndex: function(test) {
		test.expect(1);

		httpTest.get('/templates', function(err, res) {
			test.ifError(err);

			test.done();
		});
	},

	testTemplateView: function(test) {
		test.expect(2);

		var theTemplate = Template.factory({
			name: 'Template test',
			description: '',
			html: '<h1>Test</h1>',
			plain: 'Test'
		});

		theTemplate.save(function(err) {
			test.ifError(err);

			httpTest.get('/templates/' + theTemplate.id, function(err, res) {
				test.ifError(err);

				test.done();
			});
		});
	},

	testTemplateViewNotFound: function(test) {
		test.expect(2);

		httpTest.get('/templates/1', function(err, res) {
			test.ifError(err);
			test.strictEqual(res.request.path, '/templates');

			test.done();
		});
	},

	testTemplateAdd: function(test) {
		test.expect(1);

		httpTest.get('/templates/add', function(err, res) {
			test.ifError(err);

			test.done();
		});
	},

	testTemplateCreate: function(test) {
		test.expect(1);

		httpTest.post('/templates/add', {
			name: 'Template test',
			description: '',
			html: '<h1>Test</h1>',
			plain: 'Test'
		}, function(err, res) {
			test.ifError(err);

			test.done();
		});
	},

	testTemplateEdit: function(test) {
		test.expect(2);

		var theTemplate = Template.factory({
			name: 'Template test',
			description: '',
			html: '<h1>Test</h1>',
			plain: 'Test'
		});

		theTemplate.save(function(err) {
			test.ifError(err);

			httpTest.get('/templates/edit/' + theTemplate.id, function(err, res) {
				test.ifError(err);

				test.done();
			});
		});
	},

	testTemplateEditNotFound: function(test) {
		test.expect(1);

		httpTest.get('/templates/edit/1', function(err, res) {
			test.notStrictEqual(err, null);

			test.done();
		});
	},

	testTemplateUpdate: function(test) {
		test.expect(5);

		var theTemplate = Template.factory({
			name: 'Template test',
			description: '',
			html: '<h1>Test</h1>',
			plain: 'Test'
		});

		theTemplate.save(function(err) {
			test.ifError(err);

			httpTest.post('/templates/edit/' + theTemplate.id, {
				name: 'Template update'
			}, function(err, res) {
				test.ifError(err);

				Template.find(theTemplate.id, function(err, updatedTemplate) {
					test.ifError(err);

					test.strictEqual(updatedTemplate.id, theTemplate.id);
					test.strictEqual(updatedTemplate.name, 'Template update');

					test.done();
				});
			});
		});
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