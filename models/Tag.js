var BaseModel = require(__dirname + '/BaseModel.js');
var Validator = require(__dirname + '/Validator.js').Validator;
var Filter = require(__dirname + '/Validator.js').Filter;
var sanitize = require(__dirname + '/Validator.js').sanitize;

var db = require(__dirname + '/../lib/db.js');
var logger = require(__dirname + '/../lib/logger.js');

function TagModel(attributes, isNewRecord) {
	this._name = 'tag';
	this._table = '{{tag}}';

	this.init(attributes, isNewRecord);

	this.set({
		id: attributes.id || null,
		name: attributes.name || '',
		description: attributes.description || '',
		created: attributes.created || null
	});

	this.attributes = [
		{
			name: 'name',
			title: 'Name',
			type: 'input'
		},
		{
			name: 'description',
			title: 'Description',
			type: 'input'
		}
	];

	this.validate = function(cb) {
		if (this.name)
			this.v.check(this.name).len(4, 50);

		if (this.description)
			this.v.check(this.description).len(0, 255);

		return cb(this.afterValidate(this.v.getErrors()));
	};

	this.create = function(cb) {
		logger.debug('Adding tag to database...');

		var _this = this;

		db.query(
			'INSERT INTO {{tag}}(`name`, `description`) VALUES(:name, :description)',
			{
				name: this.name,
				description: this.description
			},
			function(err, result) {
				if (err) {
					logger.error('Could not insert tag into database!', err);
					return cb('Error while creating tag!');
				} else {
					_this.id = result.insertId;
					logger.verbose('New tag #' + result.insertId + ' created.');

					return cb(null);
				}
			}
		);
	};

	this.update = function(cb) {
		logger.debug('Updating tag in database...');

		var _this = this;

		db.query(
			'UPDATE {{tag}} SET `name` = :name, `description` = :description WHERE `id` = :id',
			{
				name: this.name,
				description: this.description,
				id: this.id
			},
			function(err, result) {
				if (err) {
					logger.error('Could not update tag in database!', err);
					return cb('Error while updating tag!');
				} else {
					logger.verbose('Tag #' + result.insertId + ' updated.');

					return cb(null);
				}
			}
		);
	};

	this.sanitize = function() {
		this.name = sanitize(this.name).trim();
		this.description = sanitize(this.description).trim();
	};
}

TagModel.prototype = new BaseModel();

var Tag = {
	factory: function(data) {
		if (data)
			return new TagModel(data);
		else
			return new TagModel({});
	},

	findAll: function(cb) {
		logger.debug('Getting all tags from database...');

		db.query(
			'SELECT * FROM {{tag}} ORDER BY `created` ASC LIMIT 100',
			function(err, tags) {
				if (err) {
					logger.error('Error while loading tags!', err);
					return cb('Error while loading tags!', null);
				} else {
					logger.debug('Got all tags.');
					return cb(null, tags);
				}
			}
		);
	},

	find: function(id, cb) {
		logger.debug('Getting tag by ID #' + id + '...');

		db.query(
			'SELECT * FROM {{tag}} WHERE `id` = :id LIMIT 1',
			{
				id: id
			},
			function(err, tags) {
				if (err) {
					logger.error('Error while getting tag by ID!', err);
					return cb('Error while getting tag!', null);
				} else if (!tags.length) {
					logger.warn('Could not find tag by ID #' + id + '!');
					return cb(null, null);
				} else {
					logger.debug('Found tag by ID #' + id + '.');
					return cb(null, new TagModel(tags[0], false));
				}
			}
		);
	}
};

module.exports = Tag;