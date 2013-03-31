var db = require(__dirname + '/../lib/db.js');
var logger = require(__dirname + '/../lib/logger.js');

var url = require('url');
var _ = require('underscore');

var Data = {
	_getFirstDate: function() {
		var firstDate = new Date();
		firstDate.setTime(firstDate.getTime() - (30 * 24 * 3600 * 1000));
		firstDate.setHours(0);
		firstDate.setMinutes(0);
		firstDate.setSeconds(0);

		return firstDate;
	},

	_toUtc: function(date) {
		return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
	},

	_toData: function(firstDate, results) {
		var _this = this;
		var data = [];

		for (var i = 0; i < 31; i++) {
			var date = new Date();
			date.setTime(firstDate.getTime() + (i * 24 * 3600 * 1000));

			var match = _.find(results, function(result) {
				return (result.date.getDate() === date.getDate() && result.date.getMonth() === date.getMonth());
			});

			if (match) {
				data.push([
					this._toUtc(match.date),
					match.count
				]);
			} else {
				data.push([
					this._toUtc(date),
					0
				]);
			}
		}

		return data;
	},

	_toTagData: function(firstDate, results) {
		var _this = this;
		var series = [];
		var tags = _.unique(results, function(result) {
			return result.name;
		});

		_.each(tags, function(theTag) {
			var data = {
				name: theTag.name,
				data: []
			};

			for (var i = 0; i < 31; i++) {
				var date = new Date();
				date.setTime(firstDate.getTime() + (i * 24 * 3600 * 1000));

				var match = _.find(results, function(result) {
					return (result.id === theTag.id && result.date.getDate() === date.getDate() && result.date.getMonth() === date.getMonth());
				});

				if (match) {
					data.data.push([
						_this._toUtc(match.date),
						match.count
					]);
				} else {
					data.data.push([
						_this._toUtc(date),
						0
					]);
				}
			}

			series.push(data);
		});

		return series;
	},

	_toLinkData: function(results) {
		var series = [];
		var data = [];
		var categories = [];

		_.each(results, function(result) {
			data.push([result.url, result.count]);

			var urlData = url.parse(result.url);
			var urlString = '';

			if (urlData) {
				if (urlData.host)
					urlString += urlData.host;
				if (urlData.path)
					urlString += urlData.path;
				if (urlData.hash)
					urlString += urlData.hash;
				categories.push(urlString);
			}
			else
				categories.push(result.url);
		});

		series.push({
			data: data
		});

		return {
			series: series,
			categories: categories
		};
	},

	index: function(cb) {
		logger.debug('Get index data for mails...');

		var _this = this;

		var sentData = [];
		var openedData = [];
		var clickedData = [];

		var firstDate = this._getFirstDate();

		db.query(
			'SELECT COUNT(*) AS `count`, DATE(`sent`) AS `date` ' +
				'FROM {{mail}} ' +
				'WHERE DATE(`sent`) >= :first_date ' +
				'GROUP BY YEAR(`sent`), MONTH(`sent`), DAY(`sent`) ' +
				'ORDER BY `sent` ASC',
			{
				first_date: firstDate
			},
			function(err, sent) {
				if (err) {
					logger.error('Could not get send data for mail!', err);
					return cb('Could not get send data!', null);
				} else {
					logger.debug('Got send data for mail.');

					sentData = _this._toData(firstDate, sent);

					db.query(
						'SELECT COUNT(*) AS `count`, DATE(`opened`) AS `date` FROM {{mail_to}} WHERE DATE(`opened`) >= :first_date GROUP BY YEAR(`opened`), MONTH(`opened`), DAY(`opened`) ORDER BY `opened` ASC',
						{
							first_date: firstDate
						},
						function(err, opened) {
							if (err) {
								logger.error('Could not get open data for mail!', err);
								return cb('Could not get open data!', null);
							} else {
								logger.debug('Got open data for mail.');

								openedData = _this._toData(firstDate, opened);

								db.query(
									'SELECT COUNT(*) AS `count`, DATE(`clicked`) AS `date` FROM {{mail_link_click}} WHERE DATE(`clicked`) >= :first_date GROUP BY YEAR(`clicked`), MONTH(`clicked`), DAY(`clicked`) ORDER BY `clicked` ASC',
									{
										first_date: firstDate
									},
									function(err, clicked) {
										if (err) {
											logger.error('Could not get click data for mail!', err);
											return cb('Could not get click data!', null);
										} else {
											logger.debug('Got click data for mail.');

											clickedData = _this._toData(firstDate, clicked);

											return cb(null, [
												{
													name: 'Sent',
													data: sentData,
													color: '#1F782B',
													marker: {
														symbol: 'circle'
													}
												},
												{
													name: 'Opened',
													data: openedData,
													color: '#1F2A78',
													marker: {
														symbol: 'diamond'
													}
												},
												{
													name: 'Clicked',
													data: clickedData,
													color: '#781F1F',
													marker: {
														symbol: 'triangle'
													}
												}
											]);
										}
									}
								);
							}
						}
					);
				}
			}
		);
	},

	tags: function(cb) {
		logger.log('Get tag report from database...');

		var _this = this;
		var firstDate = this._getFirstDate();

		db.query(
			'SELECT {{tag}}.`id` AS `id`, {{tag}}.`name` AS `name`, DATE({{mail}}.`sent`) AS `date`, COUNT({{mail}}.`id`) AS `count` ' +
				'FROM {{tag}}, {{mail}}, {{mail_tag}} ' +
				'WHERE {{tag}}.`id` = {{mail_tag}}.`tag_id` AND {{mail}}.`id` = {{mail_tag}}.`mail_id` AND DATE({{mail}}.`sent`) >= :first_date ' +
				'GROUP BY {{tag}}.`id`, YEAR({{mail}}.`sent`), MONTH({{mail}}.`sent`), DAY({{mail}}.`sent`) ' +
				'ORDER BY {{mail}}.`sent` ASC',
			{
				first_date: firstDate
			},
			function(err, results) {
				if (err) {
					logger.error('Could not get tag report from database!', err);
					return cb('Could not get tag report!', null);
				} else {
					logger.debug('Got tag report from database.');
					return cb(null, _this._toTagData(firstDate, results));
				}
			}
		);
	},

	links: function(cb) {
		logger.log('Get link report from database...');

		var _this = this;

		db.query(
			'SELECT {{mail_link}}.`url` AS `url`, COUNT({{mail_link_click}}.`mail_link_id`) AS `count` ' +
				'FROM  {{mail_link}}, {{mail_link_click}} ' +
				'WHERE {{mail_link}}.`id` = {{mail_link_click}}.`mail_link_id` ' +
				'GROUP BY {{mail_link}}.`url` ' +
				'LIMIT 20',
			function(err, results) {
				if (err) {
					logger.error('Could not get link report from database!', err);
					return cb('Could not get link report!', null);
				} else {

					return cb(null, _this._toLinkData(results));
				}
			}
		);
	}
};

module.exports = Data;