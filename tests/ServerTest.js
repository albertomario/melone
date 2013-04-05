var config = require(__dirname + '/../lib/config.js');
var db = require(__dirname + '/../lib/db.js');
var httpTest = require(__dirname + '/../lib/httpTest.js');

var Sql = require(__dirname + '/../components/Sql.js');

var Template = require(__dirname + '/../models/Template.js');
var Tag = require(__dirname + '/../models/Tag.js');

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
			test.strictEqual(err, 404);

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

	testTemplateUpdateNotFound: function(test) {
		test.expect(1);

		httpTest.post('/templates/edit/1', {
			name: 'Template update'
		}, function(err, res) {
			test.strictEqual(err, 404);

			test.done();
		});
	},

	testTemplateUpdateNotValidated: function(test) {
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
				name: ''
			}, function(err, res) {
				test.ifError(err);

				Template.find(theTemplate.id, function(err, updatedTemplate) {
					test.ifError(err);

					test.strictEqual(updatedTemplate.id, theTemplate.id);
					test.strictEqual(updatedTemplate.name, 'Template test');

					test.done();
				});
			});
		});
	},

	testTemplateRemove: function(test) {
		test.expect(4);

		var theTemplate = Template.factory({
			name: 'Template test',
			description: '',
			html: '<h1>Test</h1>',
			plain: 'Test'
		});

		theTemplate.save(function(err) {
			test.ifError(err);

			httpTest.get('/templates/remove/' + theTemplate.id, function(err, res) {
				test.ifError(err);

				Template.findAll(function(err, templates) {
					test.ifError(err);

					test.strictEqual(templates.length, 0);

					test.done();
				});
			});
		});
	},

	testTemplateRemoveNotFound: function(test) {
		test.expect(1);

		httpTest.get('/templates/remove/1', function(err, res) {
			test.strictEqual(err, 404);

			test.done();
		});
	},

	testTagIndex: function(test) {
		test.expect(1);

		httpTest.get('/tags', function(err, res) {
			test.ifError(err);

			test.done();
		});
	},

	testTagView: function(test) {
		test.expect(2);

		var theTag = Tag.factory({
			name: 'Test Tag'
		});

		theTag.save(function(err) {
			test.ifError(err);

			httpTest.get('/tags/' + theTag.id, function(err, res) {
				test.ifError(err);

				test.done();
			});
		});
	},

	testTagViewNotFound: function(test) {
		test.expect(1);

		httpTest.get('/tags/1', function(err, res) {
			test.ifError(err);

			test.done();
		});
	},

	testTagAdd: function(test) {
		test.expect(1);

		httpTest.get('/tags/add', function(err, res) {
			test.ifError(err);

			test.done();
		});
	},

	testTagCreate: function(test) {
		test.expect(1);

		httpTest.post('/tags/add', {
			name: 'Tag 1'
		}, function(err, res) {
			test.ifError(err);

			test.done();
		});
	},

	testTagCreateError: function(test) {
		test.expect(1);

		httpTest.post('/tags/add', {
			name: ''
		}, function(err, res) {
			test.ifError(err);

			test.done();
		});
	},

	testTagEdit: function(test) {
		test.expect(2);

		var theTag = Tag.factory({
			name: 'Tag Test'
		});

		theTag.save(function(err) {
			test.ifError(err);

			httpTest.get('/tags/edit/' + theTag.id, function(err, res) {
				test.ifError(err);

				test.done();
			});
		});
	},

	testTagEditNotFound: function(test) {
		test.expect(1);

		httpTest.get('/tags/edit/1', function(err, res) {
			test.strictEqual(err, 404);

			test.done();
		});
	},

	testTagUpdate: function(test) {
		test.expect(5);

		var theTag = Tag.factory({
			name: 'Tag test',
			description: ''
		});

		theTag.save(function(err) {
			test.ifError(err);

			httpTest.post('/tags/edit/' + theTag.id, {
				name: 'Tag update'
			}, function(err, res) {
				test.ifError(err);

				Tag.find(theTag.id, function(err, updatedTag) {
					test.ifError(err);

					test.strictEqual(updatedTag.id, theTag.id);
					test.strictEqual(updatedTag.name, 'Tag update');

					test.done();
				});
			});
		});
	},

	testTagUpdateNotFound: function(test) {
		test.expect(1);

		httpTest.post('/tags/edit/1', {
			name: 'Tag update'
		}, function(err, res) {
			test.strictEqual(err, 404);

			test.done();
		});
	},

	testTagUpdateNotValidated: function(test) {
		test.expect(5);

		var theTag = Tag.factory({
			name: 'Tag test',
			description: ''
		});

		theTag.save(function(err) {
			test.ifError(err);

			httpTest.post('/tags/edit/' + theTag.id, {
				name: ''
			}, function(err, res) {
				test.ifError(err);

				Tag.find(theTag.id, function(err, updatedTag) {
					test.ifError(err);

					test.strictEqual(updatedTag.id, theTag.id);
					test.strictEqual(updatedTag.name, 'Tag test');

					test.done();
				});
			});
		});
	},

	testTagRemove: function(test) {
		test.expect(4);

		var theTag = Tag.factory({
			name: 'Tag test',
			description: ''
		});

		theTag.save(function(err) {
			test.ifError(err);

			httpTest.get('/tags/remove/' + theTag.id, function(err, res) {
				test.ifError(err);

				Tag.findAll(function(err, tags) {
					test.ifError(err);

					test.strictEqual(tags.length, 0);

					test.done();
				});
			});
		});
	},

	testTagRemoveNotFound: function(test) {
		test.expect(1);

		httpTest.get('/tags/remove/1', function(err, res) {
			test.strictEqual(err, 404);

			test.done();
		});
	},

	testReportLinks: function(test) {
		test.expect(1);

		httpTest.get('/reports/links', function(err, res) {
			test.ifError(err);

			test.done();
		});
	},

	testReportTags: function(test) {
		test.expect(1);

		httpTest.get('/reports/tags', function(err, res) {
			test.ifError(err);

			test.done();
		});
	},

	testDocIndex: function(test) {
		test.expect(1);

		httpTest.get('/docs', function(err, res) {
			test.ifError(err);

			test.done();
		});
	},

	testDocMail: function(test) {
		test.expect(1);

		httpTest.get('/docs/mail', function(err, res) {
			test.ifError(err);

			test.done();
		});
	},

	testDocTemplate: function(test) {
		test.expect(1);

		httpTest.get('/docs/templates', function(err, res) {
			test.ifError(err);

			test.done();
		});
	},

	testDocTag: function(test) {
		test.expect(1);

		httpTest.get('/docs/tags', function(err, res) {
			test.ifError(err);

			test.done();
		});
	},

	testDataIndex: function(test) {
		test.expect(1);

		httpTest.get('/data/index', function(err, res) {
			test.ifError(err);

			test.done();
		});
	},

	testDataTags: function(test) {
		test.expect(1);

		httpTest.get('/data/tags', function(err, res) {
			test.ifError(err);

			test.done();
		});
	},

	testDataLinks: function(test) {
		test.expect(1);

		httpTest.get('/data/links', function(err, res) {
			test.ifError(err);

			test.done();
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