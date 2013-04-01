var Tag = require(__dirname + '/../models/Tag.js');

var Sql = require(__dirname + '/../components/Sql.js');

var config = require(__dirname + '/../lib/config.js');
var db = require(__dirname + '/../lib/db.js');

var async = require('async');

module.exports.tag = {
	setUp: function(cb) {
		var query = '';
		query += Sql.create.tag;

		db.query(query, function(err, result) {
			if (err) {
				throw err;
			}

			cb();
		});
	},

	create: function(test) {
		test.expect(1);

		var theTag = Tag.factory({
			name: 'My Tag',
			description: 'My test tag.'
		});

		theTag.save(function(err) {
			test.ifError(err);

			test.done();
		});
	},

	update: function(test) {
		test.expect(6);

		var updateAttributes = {
			name: 'New name',
			description: 'New description.'
		};

		var theTag = Tag.factory({
			name: 'Old name',
			description: 'Old description.'
		});

		theTag.save(function(err) {
			test.ifError(err);

			theTag.name = updateAttributes.name;
			theTag.description = updateAttributes.description;

			theTag.save(function(err) {
				test.ifError(err);

				test.strictEqual(theTag.name, updateAttributes.name, 'Tag name was not updated!');
				test.strictEqual(theTag.description, updateAttributes.description, 'Tag description was not updated!');

				Tag.findAll(function(err, tags) {
					test.ifError(err);

					test.strictEqual(tags.length, 1, 'Tag was not updated but inserted again!');

					test.done();
				});
			});
		});
	},

	notValid: function(test) {
		test.expect(1);

		var theTag = Tag.factory({
			name: 'ab',
			description: 'The name is too short.'
		});

		theTag.save(function(err) {
			test.notEqual(err, null, 'Tag should not validate!');

			test.done();
		});
	},

	sanitize: function(test) {
		test.expect(3);

		var keyAttributes = {
			name: 'Trimed Name',
			description: 'Trimed description.'
		};

		var theTag = Tag.factory({
			name: ' ' + keyAttributes.name + ' ',
			description: ' ' + keyAttributes.description + ' '
		});

		theTag.save(function(err) {
			test.ifError(err);

			test.strictEqual(theTag.name, keyAttributes.name, 'Tag name was not trimed!');
			test.strictEqual(theTag.description, keyAttributes.description, 'Tag description was not trimed!');

			test.done();
		});
	},

	find: function(test) {
		test.expect(11);

		var theTag = Tag.factory({
			name: 'My Tag',
			description: 'My test tag.'
		});

		theTag.save(function(err) {
			test.ifError(err);

			Tag.find(theTag.id, function(err, foundTag) {
				test.ifError(err);

				test.notStrictEqual(foundTag, null, 'Tag could not be found!');
				test.strictEqual(foundTag.name, theTag.name, 'Saved and found tag name are not equal!');
				test.strictEqual(foundTag.description, theTag.description, 'Saved and found tag description are not equal!');

				test.strictEqual(foundTag.created.getFullYear(), theTag.created.getFullYear(), 'Saved and found tag created year are not equal!');
				test.strictEqual(foundTag.created.getMonth(), theTag.created.getMonth(), 'Saved and found tag created month are not equal!');
				test.strictEqual(foundTag.created.getDate(), theTag.created.getDate(), 'Saved and found tag created date are not equal!');
				test.strictEqual(foundTag.created.getHours(), theTag.created.getHours(), 'Saved and found tag created hour are not equal!');
				test.strictEqual(foundTag.created.getMinutes(), theTag.created.getMinutes(), 'Saved and found tag created minute are not equal!');
				test.strictEqual(foundTag.created.getSeconds(), theTag.created.getSeconds(), 'Saved and found tag created second are not equal!');

				test.done();
			});
		});
	},

	findAll: function(test) {
		test.expect(4);

		async.waterfall([
			function(cb) {
				var theTag = Tag.factory({
					name: 'My Tag',
					description: 'My test tag.'
				});

				theTag.save(function(err) {
					test.ifError(err);

					cb();
				});
			},
			function(cb) {
				var theTag = Tag.factory({
					name: 'My Tag',
					description: 'My test tag.'
				});

				theTag.save(function(err) {
					test.ifError(err);

					cb();
				});
			},
			function(cb) {
				var theTag = Tag.factory({
					name: 'My Tag',
					description: 'My test tag.'
				});

				theTag.save(function(err) {
					test.ifError(err);

					cb();
				});
			}
		], function(err) {
			test.ifError(err);

			test.done();
		});
	},

	tearDown: function(cb) {
		var query = '';
		query += Sql.remove.tag;

		db.query(query, function(err, result) {
			if (err)
				throw err;

			cb();
		});
	}
};