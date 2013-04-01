var Key = require(__dirname + '/../models/Key.js');

var Sql = require(__dirname + '/../components/Sql.js');

var config = require(__dirname + '/../lib/config.js');
var db = require(__dirname + '/../lib/db.js');

var async = require('async');

module.exports.key = {
	setUp: function(cb) {
		var query = '';
		query += Sql.create.key;

		db.query(query, function(err, result) {
			if (err) {
				throw err;
			}

			cb();
		});
	},

	create: function(test) {
		test.expect(2);

		var theKey = Key.factory();

		theKey.setUniqueKey(function(err) {
			test.ifError(err);

			theKey.save(function(err) {
				test.ifError(err);

				test.done();
			});
		});
	},

	duplicate: function(test) {
		test.expect(3);

		var theKey = Key.factory();

		theKey.setUniqueKey(function(err) {
			test.ifError(err);

			theKey.save(function(err) {
				test.ifError(err);

				duplicateKey = Key.factory({
					key: theKey.key,
					secret: theKey.secret
				});

				duplicateKey.save(function(err) {
					test.notStrictEqual(err, null, 'Duplicate key should not be saved!');

					test.done();
				});
			});
		});
	},

	findAll: function(test) {
		test.expect(9);

		async.waterfall([
			function(cb) {
				var theKey = Key.factory();

				theKey.setUniqueKey(function(err) {
					test.ifError(err);

					theKey.save(function(err) {
						test.ifError(err);

						cb();
					});
				});
			},
			function(cb) {
				var theKey = Key.factory();

				theKey.setUniqueKey(function(err) {
					test.ifError(err);

					theKey.save(function(err) {
						test.ifError(err);

						cb();
					});
				});
			},
			function(cb) {
				var theKey = Key.factory();

				theKey.setUniqueKey(function(err) {
					test.ifError(err);

					theKey.save(function(err) {
						test.ifError(err);

						cb();
					});
				});
			}
			], function(err) {
				test.ifError(err);

				Key.findAll(function(err, keys) {
					test.ifError(err);

					test.strictEqual(keys.length, 3, 'Not all keys were inserted!');

					test.done();
				});
		});
	},

	findNothing: function(test) {
		test.expect(2);

		Key.findAll(function(err, keys) {
			test.ifError(err);

			test.strictEqual(keys.length, 0, 'No keys should be found!');

			test.done();
		});
	},

	findByKeyAndSecret: function(test) {
		test.expect(4);

		var theKey = Key.factory();

		theKey.setUniqueKey(function(err) {
			test.ifError(err);

			theKey.save(function(err) {
				test.ifError(err);

				Key.findByKeyAndSecret(theKey.key, theKey.secret, function(err, key) {
					test.ifError(err);

					test.equal(typeof key, 'object');

					test.done();
				});
			});
		});
	},

	findNotByKeyAndSecret: function(test) {
		test.expect(2);

		Key.findByKeyAndSecret('123456', 'abcdefg', function(err, key) {
			test.strictEqual(err, null, 'No error should be submitted if no key was found!');
			test.strictEqual(key, null, 'No key should be found!');

			test.done();
		});
	},

	validateValidKey: function(test) {
		test.expect(3);

		var theKey = Key.factory();

		theKey.setUniqueKey(function(err) {
			test.ifError(err);

			theKey.save(function(err) {
				test.ifError(err);

				Key.validate(theKey.key, theKey.secret, function(err) {
					test.strictEqual(err, null, 'Api key should be valid!');

					test.done();
				});
			});
		});
	},

	validateInvalidKey: function(test) {
		test.expect(1);

		Key.validate('123456', 'abcdefg', function(err) {
			test.notStrictEqual(err, null, 'Api key should be invalid!');

			test.done();
		});
	},

	tearDown: function(cb) {
		var query = '';
		query += Sql.remove.key;

		db.query(query, function(err, result) {
			if (err)
				throw err;

			cb();
		});
	}
};