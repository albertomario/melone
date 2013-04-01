var Template = require(__dirname + '/../models/Template.js');

var Sql = require(__dirname + '/../components/Sql.js');

var config = require(__dirname + '/../lib/config.js');
var db = require(__dirname + '/../lib/db.js');

var async = require('async');

module.exports.template = {
	setUp: function(cb) {
		var query = '';
		query += Sql.create.template;

		db.query(query, function(err, result) {
			if (err)
				throw err;

			cb();
		});
	},

	create: function(test) {
		test.expect(1);

		var theTemplate = Template.factory({
			name: 'Template Name',
			description: 'Template description',
			html: '<h1>Header</h1><p>Text</p>',
			plain: 'Header\n\nText'
		});

		theTemplate.save(function(err) {
			test.ifError(err);

			test.done();
		});
	},

	update: function(test) {
		test.expect(8);

		var updateAttributes = {
			name: 'New name',
			description: 'New description.',
			html: '<p>New html</p>',
			plain: 'New plain'
		};

		var theTemplate = Template.factory({
			name: 'Old name',
			description: 'Old description.',
			html: '<p>Old html</p>',
			plain: 'Old plain'
		});

		theTemplate.save(function(err) {
			test.ifError(err);

			theTemplate.name = updateAttributes.name;
			theTemplate.description = updateAttributes.description;
			theTemplate.html = updateAttributes.html;
			theTemplate.plain = updateAttributes.plain;

			theTemplate.save(function(err) {
				test.ifError(err);

				test.strictEqual(theTemplate.name, updateAttributes.name, 'Template name was not updated!');
				test.strictEqual(theTemplate.description, updateAttributes.description, 'Template description was not updated!');
				test.strictEqual(theTemplate.html, updateAttributes.html, 'Template html was not updated!');
				test.strictEqual(theTemplate.plain, updateAttributes.plain, 'Template plain was not updated!');

				Template.findAll(function(err, templates) {
					test.ifError(err);

					test.strictEqual(templates.length, 1, 'Template was not updated but inserted again!');

					test.done();
				});
			});
		});
	},

	notValid: function(test) {
		test.expect(1);

		var theTemplate = Template.factory({
			name: '',
			description: 'The name is required.'
		});

		theTemplate.save(function(err) {
			test.notEqual(err, null, 'The template name is empty bot no error is given!');

			test.done();
		});
	},

	sanitize: function(test) {
		test.expect(5);

		var templateAttributes = {
			name: 'Trimed Name',
			description: 'Trimed description.',
			html: 'Trimed and xssed html',
			plain: 'Trimed and xssed plain'
		};

		var theTemplate = Template.factory({
			name: ' ' + templateAttributes.name + ' ',
			description: ' ' + templateAttributes.description + ' ',
			html: ' ' + templateAttributes.html + ' <script>alert("attacked")</script> ',
			plain: ' ' + templateAttributes.plain + ' '
		});

		theTemplate.save(function(err) {
			test.ifError(err);

			test.strictEqual(theTemplate.name, templateAttributes.name, 'Tag name was not trimed!');
			test.strictEqual(theTemplate.description, templateAttributes.description, 'Tag description was not trimed!');
			test.strictEqual(theTemplate.html, templateAttributes.html + ' alert&#40;"attacked"&#41;', 'Tag html was not trimed and xssed!');
			test.strictEqual(theTemplate.plain, templateAttributes.plain, 'Tag plain was not trimed and xssed!');

			test.done();
		});
	},

	find: function(test) {
		test.expect(13);

		var theTemplate = Template.factory({
			name: 'My Template',
			description: 'My test template.',
			html: '<p>html</p>',
			plain: 'plain'
		});

		theTemplate.save(function(err) {
			test.ifError(err);

			Template.find(theTemplate.id, function(err, foundTemplate) {
				test.ifError(err);

				test.notStrictEqual(foundTemplate, null, 'Template could not be found!');
				test.strictEqual(foundTemplate.name, theTemplate.name, 'Saved and found template name are not equal!');
				test.strictEqual(foundTemplate.description, theTemplate.description, 'Saved and found template description are not equal!');
				test.strictEqual(foundTemplate.html, theTemplate.html, 'Saved and found template html are not equal!');
				test.strictEqual(foundTemplate.plain, theTemplate.plain, 'Saved and found template plain are not equal!');

				test.strictEqual(foundTemplate.created.getFullYear(), theTemplate.created.getFullYear(), 'Saved and found template created year are not equal!');
				test.strictEqual(foundTemplate.created.getMonth(), theTemplate.created.getMonth(), 'Saved and found template created month are not equal!');
				test.strictEqual(foundTemplate.created.getDate(), theTemplate.created.getDate(), 'Saved and found template created date are not equal!');
				test.strictEqual(foundTemplate.created.getHours(), theTemplate.created.getHours(), 'Saved and found template created hour are not equal!');
				test.strictEqual(foundTemplate.created.getMinutes(), theTemplate.created.getMinutes(), 'Saved and found template created minute are not equal!');
				test.strictEqual(foundTemplate.created.getSeconds(), theTemplate.created.getSeconds(), 'Saved and found template created second are not equal!');

				test.done();
			});
		});
	},

	findNot: function(test) {
		test.expect(3);

		var theTemplate = Template.factory({
			name: 'My Template',
			description: 'My test template.',
			html: '<p>html</p>',
			plain: 'plain'
		});

		theTemplate.save(function(err) {
			test.ifError(err);

			Template.find(theTemplate.id + 1, function(err, foundTemplate) {
				test.ifError(err);
				test.strictEqual(foundTemplate, null, 'No template should be found!');

				test.done();
			});
		});
	},

	findByName: function(test) {
		test.expect(3);

		var theTemplate = Template.factory({
			name: 'My Template',
			description: 'My test template.',
			html: '<p>html</p>',
			plain: 'plain'
		});

		theTemplate.save(function(err) {
			test.ifError(err);

			Template.findByName(theTemplate.name, function(err, foundTemplate) {
				test.ifError(err);
				test.strictEqual(foundTemplate.id, theTemplate.id, 'The template found has not the same id as the saved one!');

				test.done();
			});
		});
	},

	findNotByName: function(test) {
		test.expect(3);

		var theTemplate = Template.factory({
			name: 'My Template',
			description: 'My test template.',
			html: '<p>html</p>',
			plain: 'plain'
		});

		theTemplate.save(function(err) {
			test.ifError(err);

			Template.findByName(theTemplate.name + '404', function(err, foundTemplate) {
				test.ifError(err);
				test.strictEqual(foundTemplate, null, 'No template should be found!');

				test.done();
			});
		});
	},

	findAll: function(test) {
		test.expect(6);

		async.waterfall([
			function(cb) {
				var theTemplate = Template.factory({
					name: 'My Template',
					description: 'My test template.'
				});

				theTemplate.save(function(err) {
					test.ifError(err);

					cb();
				});
			},
			function(cb) {
				var theTemplate = Template.factory({
					name: 'My Template',
					description: 'My test template.'
				});

				theTemplate.save(function(err) {
					test.ifError(err);

					cb();
				});
			},
			function(cb) {
				var theTemplate = Template.factory({
					name: 'My Template',
					description: 'My test template.'
				});

				theTemplate.save(function(err) {
					test.ifError(err);

					cb();
				});
			}
		], function(err) {
			test.ifError(err);

			Template.findAll(function(err, templates) {
				test.ifError(err);
				test.strictEqual(templates.length, 3, '3 templates should be found!');

				test.done();
			});
		});
	},

	findNothing: function(test) {
		test.expect(2);

		Template.findAll(function(err, templates) {
			test.ifError(err);

			test.strictEqual(templates.length, 0, 'No templates should be found!');

			test.done();
		});
	},

	tearDown: function(cb) {
		var query = '';
		query += Sql.remove.template;

		db.query(query, function(err, result) {
			if (err)
				throw err;

			cb();
		});
	}
};