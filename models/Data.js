var db = require(__dirname + '/../lib/db.js');
var logger = require(__dirname + '/../lib/logger.js');

var _ = require('underscore');

var Data = {
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

	mail: function(cb) {
		logger.debug('Get data for mail...');

		var _this = this;

		var sentData = [];
		var openedData = [];
		var clickedData = [];

		var firstDate = new Date();
		firstDate.setTime(firstDate.getTime() - (30 * 24 * 3600 * 1000));

		db.query(
			'SELECT COUNT(*) AS `count`, DATE(`sent`) AS `date` FROM {{mail}} WHERE DATE(`sent`) >= :first_date GROUP BY YEAR(`sent`), MONTH(`sent`), DAY(`sent`) ORDER BY `sent` ASC',
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
						'SELECT COUNT(*) AS `count`, DATE(`opened`) AS `date` FROM {{mail_to}} WHERE DATE(`opened`) > :first_date GROUP BY YEAR(`opened`), MONTH(`opened`), DAY(`opened`) ORDER BY `opened` ASC',
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
									'SELECT COUNT(*) AS `count`, DATE(`clicked`) AS `date` FROM {{mail_link}} WHERE DATE(`clicked`) > :first_date GROUP BY YEAR(`clicked`), MONTH(`clicked`), DAY(`clicked`) ORDER BY `clicked` ASC',
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
													data: sentData
												},
												{
													name: 'Opened',
													data: openedData
												},
												{
													name: 'Clicked',
													data: clickedData
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
	}
};

module.exports = Data;