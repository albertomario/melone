var db = require(__dirname + '/../lib/db.js');
var logger = require(__dirname + '/../lib/logger.js');

var Tracking = {
	open: function(id, cb) {
		logger.debug('Tracking email #' + id + ' opening event...');
		var now = new Date();

		db.query(
			'SELECT * FROM {{mail_to}} WHERE `id` = :id LIMIT 1',
			{
				id: id
			},
			function(err, recipients) {
				var theRecipient = recipients[0] || null;

				if (err || !theRecipient) {
					if (err) {
						logger.error('Could not get email recipient from database!', err);
						return cb('Error finding email recipient!');
					} else {
						logger.warn('Email recipient not found.');
						return cb('The email recipient was not found!');
					}
				} else {
					var testDate = new Date(theRecipient.opened);

					if (!isNaN(testDate.getTime())) {
						logger.debug('Email already opened.');
						return cb(null);
					} else {
						logger.debug('Saving email opening event to database...');

						db.query(
							'UPDATE {{mail_to}} SET `opened` = :opened WHERE `id` = :id',
							{
								opened: now,
								id: id
							},
							function(err, result) {
								if (err) {
									logger.warn('Could not save email opening event!', err);
									return cb('Could not save event!');
								} else {
									logger.debug('Email opening event saved.');
									return cb(null);
								}
							}
						);
					}
				}
			}
		);
	},

	click: function(id, cb) {
		logger.debug('Tracking link #' + id + ' click event...');
		var now = new Date();

		db.query(
			'SELECT * FROM {{mail_link}} WHERE `id` = :id LIMIT 1',
			{
				id: id
			},
			function(err, links) {
				var theLink = links[0] || null;

				if (err || !theLink) {
					if (err) {
						logger.error('Could not select email link from database!', err);
						return cb('Error while selecting event from database!', null);
					} else {
						logger.warn('Could not find email link #' + id + ' in database!');
						return cb('No link found with this id!', null);
					}
				} else {
					var testDate = new Date(theLink.clicked);

					if (!isNaN(testDate.getTime())) {
						logger.debug('Link already clicked.');
						return cb(null, theLink.url);
					} else {
						logger.debug('Saving link click event to database...');

						db.query(
							'UPDATE {{mail_link}} SET `clicked` = :clicked WHERE `id` = :id',
							{
								clicked: now,
								id: theLink.id
							},
							function(err, result) {
								if (err) {
									logger.warn('Could not save link click event!', err);
									return cb('Could not save event!');
								} else {
									logger.debug('Link click event saved.');
									return cb(null, theLink.url);
								}
							}
						);
					}
				}
			}
		);
	}
};

module.exports = Tracking;