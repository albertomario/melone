var logger = require(__dirname + '/../lib/logger.js');
var db = require(__dirname + '/../lib/db.js');
var config = require(__dirname + '/../lib/config.js');

var crypto = require('crypto');

var Key = {
	findAll: function(cb) {
		logger.debug('Get all api keys from database...');
		db.query('SELECT * FROM {{key}} LIMIT 100', function(err, keys) {
			if (err) {
				logger.error('Could not get api keys from database!', err);
				return cb('Could not get api keys!', null);
			} else {
				logger.verbose('Got api keys from database.');
				return cb(null, keys);
			}
		});
	},

	find: function(key, secret, cb) {
		logger.debug('Finding api key...');
		db.query(
			'SELECT * FROM {{key}} WHERE `key` = :key AND `secret` = :secret LIMIT 1',
			{
				key: key,
				secret: secret
			},
			function(err, theKey) {
				if (err) {
					logger.error('Error while finding api key', err);
					return cb('Error while finding the api key!', null);
				} else if(!theKey.length) {
					logger.warn('Could not find the api key!');
					return cb(null, null);
				} else {
					logger.verbose('Api key found.');
					return cb(null, theKey[0]);
				}
			}
		);
	},

	validate: function(key, secret, cb) {
		logger.debug('Validating api key...');
		this.find(key, secret, function(err, theKey) {
			if (err) {
				return cb(err);
			} else if (!theKey) {
				logger.warn('Invalid api key given!');
				return cb('Invalid api key!');
			} else {
				logger.debug('Api key validated.');
				return cb(null);
			}
		});
	},

	_createRandomHashes: function() {
		logger.debug('Creating random hash...');

		var key = '';
		var secret = '';
		var date = new Date();

		var time = date.getTime() + '';
		key = crypto.createHash('md5').update(time, 'utf8').digest('hex');
		secret = crypto.createHash('md5').update(key + config.app.hash, 'utf8').digest('hex');

		return {
			key: key,
			secret: secret
		};
	},

	_uniqueKey: function(cb) {
		logger.debug('Create unique api key...');
		var _this = this;
		var theKey = this._createRandomHashes();

		db.query(
			'SELECT * FROM {{key}} WHERE `key` = :key AND `secret` = :secret LIMIT 1',
			{
				key: theKey.key,
				secret: theKey.secret
			},
			function(err, result) {
				if (err) {
					logger.error('Could not generate a unique api key', err);
					return cb('Could not generate a unique api key!', null);
				} else {
					if (result.length) {
						logger.debug('Duplicate key found, generating new key...');
						_this._uniqueKey(cb);
					} else {
						logger.verbose('Unique api key generated.');
						return cb(null, theKey);
					}
				}
			}
		);
	},

	create: function(cb) {
		logger.debug('Create new api key...');
		var theKey = this._createRandomHashes();

		this._uniqueKey(function(err, theKey) {
			if (err) {
				return cb(err, null);
			} else {
				db.query(
					'INSERT INTO {{key}}(`key`, `secret`) VALUES(:key, :secret)',
					{
						key: theKey.key,
						secret: theKey.secret
					},
					function(err, result) {
						if (err) {
							logger.error('Could not insert api key into database', key, err);
							return cb('Could not insert api key into database!', null);
						} else {
							logger.verbose('New api key added to database.');
							return cb(null, result.insertId);
						}
					}
				);
			}
		});
	}
};

module.exports = Key;