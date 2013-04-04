var Sql = require(__dirname + '/../components/Sql.js');
var Data = require(__dirname + '/../components/Data.js');

var config = require(__dirname + '/../lib/config.js');
var db = require(__dirname + '/../lib/db.js');

var async = require('async');

module.exports.data = {
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

	testGetFirstDate: function(test) {
		var firstDate = Data._getFirstDate();

		test.strictEqual(firstDate.getHours(), 0);
		test.strictEqual(firstDate.getMinutes(), 0);
		test.strictEqual(firstDate.getSeconds(), 0);

		test.done();
	},

	testToUtc: function(test) {
		var now = new Date();
		var utc = Data._toUtc(now);

		test.strictEqual(typeof utc, 'number');

		test.done();
	},

	testToData: function(test) {
		var firstDate = new Date(2013, 3, 5, 0, 0, 0);
		var date1 = new Date(2013, 3, 5, 12, 4, 20);
		var date2 = new Date(2013, 3, 19, 8, 59, 40);
		var date3 = new Date(2013, 4, 5, 23, 20, 5);

		var testData = [
			{
				date: date1,
				count: 10
			},
			{
				date: date2,
				count: 4
			},
			{
				date: date3,
				count: 1
			}
		];

		var results = Data._toData(firstDate, testData);

		test.strictEqual(results.length, 31);

		test.strictEqual(results[0][0], Data._toUtc(date1));
		test.strictEqual(results[0][1], 10);

		test.strictEqual(results[14][0], Data._toUtc(date2));
		test.strictEqual(results[14][1], 4);

		test.strictEqual(results[30][0], Data._toUtc(date3));
		test.strictEqual(results[30][1], 1);

		test.done();
	},

	testToTagData: function(test) {
		var firstDate = new Date(2013, 3, 5, 0, 0, 0);
		var date1 = new Date(2013, 3, 5, 12, 4, 20);
		var date2 = new Date(2013, 3, 19, 8, 59, 40);
		var date3 = new Date(2013, 4, 5, 23, 20, 5);

		var testData = [
			{
				id: 1,
				name: 'Tag 1',
				date: date1,
				count: 10
			},
			{
				id: 2,
				name: 'Tag 2',
				date: date2,
				count: 4
			},
			{
				id: 3,
				name: 'Tag 3',
				date: date3,
				count: 1
			}
		];

		var results = Data._toTagData(firstDate, testData);

		test.strictEqual(results.length, 3);
		test.strictEqual(results[0].data.length, 31);
		test.strictEqual(results[1].data.length, 31);
		test.strictEqual(results[2].data.length, 31);

		test.strictEqual(results[0].name, 'Tag 1');
		test.strictEqual(results[0].data[0][0], Data._toUtc(date1));
		test.strictEqual(results[0].data[0][1], 10);

		test.strictEqual(results[1].name, 'Tag 2');
		test.strictEqual(results[1].data[14][0], Data._toUtc(date2));
		test.strictEqual(results[1].data[14][1], 4);

		test.strictEqual(results[2].name, 'Tag 3');
		test.strictEqual(results[2].data[30][0], Data._toUtc(date3));
		test.strictEqual(results[2].data[30][1], 1);

		test.done();
	},

	testToLinkData: function(test) {
		var links = [
			{
				url: 'http://www.example.com',
				count: 5
			},
			{
				url: 'http://test.com',
				count: 2
			},
			{
				url: 'http://example.com/path/to#hash',
				count: 19
			},
			{
				url: 'localhost',
				count: 4
			}
		];

		var results = Data._toLinkData(links);

		test.strictEqual(results.categories.length, 4);
		test.strictEqual(results.series[0].data.length, 4);

		test.strictEqual(results.categories[0], 'www.example.com/');
		test.strictEqual(results.series[0].data[0][0], 'http://www.example.com');
		test.strictEqual(results.series[0].data[0][1], 5);

		test.strictEqual(results.categories[1], 'test.com/');
		test.strictEqual(results.series[0].data[1][0], 'http://test.com');
		test.strictEqual(results.series[0].data[1][1], 2);

		test.strictEqual(results.categories[2], 'example.com/path/to#hash');
		test.strictEqual(results.series[0].data[2][0], 'http://example.com/path/to#hash');
		test.strictEqual(results.series[0].data[2][1], 19);

		test.strictEqual(results.categories[3], 'localhost');
		test.strictEqual(results.series[0].data[3][0], 'localhost');
		test.strictEqual(results.series[0].data[3][1], 4);

		test.done();
	},

	testIndex: function(test) {
		test.expect(2);

		Data.index(function(err, results) {
			test.ifError(err);

			test.strictEqual(results.length, 3);

			test.done();
		});
	},

	testTags: function(test) {
		test.expect(2);

		Data.tags(function(err, results) {
			test.ifError(err);

			test.strictEqual(results.length, 0);

			test.done();
		});
	},

	testLinks: function(test) {
		test.expect(4);

		Data.links(function(err, results) {
			test.ifError(err);

			test.strictEqual(results.series.length, 1);
			test.strictEqual(results.series[0].data.length, 0);
			test.strictEqual(results.categories.length, 0);

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