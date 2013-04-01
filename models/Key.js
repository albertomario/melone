var BaseModel = require(__dirname + '/BaseModel.js');

var Validator = require(__dirname + '/../components/Validator.js').Validator;
var Filter = require(__dirname + '/../components/Validator.js').Filter;
var sanitize = require(__dirname + '/../components/Validator.js').sanitize;

var logger = require(__dirname + '/../lib/logger.js');
var db = require(__dirname + '/../lib/db.js');
var config = require(__dirname + '/../lib/config.js');

var crypto = require('crypto');

function KeyModel(attributes, isNewRecord) {
	this._name = 'key';
	this._table = '{{key}}';

	this.init(attributes, isNewRecord);

	this. _createRandomHashes = function() {
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
	};

	this._uniqueKey = function(cb) {
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
	};

	this.setUniqueKey = function(cb) {
		logger.debug('Create new unique api keys...');

		var _this = this;

		this._uniqueKey(function(err, theKey) {
			if (err) {
				return cb(err);
			} else {
				_this.key = theKey.key;
				_this.secret = theKey.secret;

				return cb(null);
			}
		});
	};

	this.validate = function(cb) {
		logger.debug('Validating api key...');

		var _this = this;

		Key.findByKeyAndSecret(this.key, this.secret, function(err, theKey) {
			if (err) {
				return cb(err);
			} else if (!theKey) {
				return cb(null);
			} else {
				logger.debug('Duplicate key found!');

				return cb('Duplicate key found!');
			}
		});
	};

	this.create = function(cb) {
		logger.debug('Create new api key...');

		db.query(
			'INSERT INTO {{key}}(`key`, `secret`) VALUES(:key, :secret)',
			{
				key: this.key,
				secret: this.secret
			},
			function(err, result) {
				if (err) {
					logger.error('Could not insert api key into database!', err);
					return cb('Could not insert api key into database!', null);
				} else {
					logger.verbose('New api key added to database.');
					return cb(null, result.insertId);
				}
			}
		);
	};

	this.set({
		id: attributes.id || null,
		key: attributes.key || null,
		secret: attributes.secret || null,
		created: attributes.created || null
	});
}

KeyModel.prototype = new BaseModel();

var Key = {
	factory: function(data) {
		if (data)
			return new KeyModel(data);
		else
			return new KeyModel({});
	},

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

	findByKeyAndSecret: function(key, secret, cb) {
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
					logger.verbose('No api key found.');
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

		Key.findByKeyAndSecret(key, secret, function(err, theKey) {
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
	}
};

module.exports = Key;