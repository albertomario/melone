var db = require(__dirname + '/../lib/db.js');
var logger = require(__dirname + '/../lib/logger.js');

var Template = {
	findAll: function(cb) {
		logger.debug('Getting all templates from database...');

		db.query(
			'SELECT * FROM {{template}} ORDER BY `created` ASC LIMIT 100',
			function(err, templates) {
				if (err) {
					logger.error('Error while loading templates!', err);
					return cb('Error while loading templates!', null);
				} else {
					logger.debug('Got all templates.');
					return cb(null, templates);
				}
			}
		);
	}
};

module.exports = Template;