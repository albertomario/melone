var BaseModel = require(__dirname + '/BaseModel.js');

var Validator = require(__dirname + '/../components/Validator.js').Validator;
var Filter = require(__dirname + '/../components/Validator.js').Filter;
var sanitize = require(__dirname + '/../components/Validator.js').sanitize;

var db = require(__dirname + '/../lib/db.js');
var logger = require(__dirname + '/../lib/logger.js');

var _ = require('underscore');

function TemplateModel(attributes, isNewRecord) {
	this._name = 'template';
	this._table = '{{template}}';

	this.init(attributes, isNewRecord);

	this.set({
		id: attributes.id || null,
		name: attributes.name || '',
		description: attributes.description || '',
		html: attributes.html || '',
		plain: attributes.plain || '',
		created: attributes.created || null,
		updated: attributes.updated || '0000-00-00 00:00:00'
	});

	this.attributes = [
		{
			name: 'name',
			title: 'Slug',
			type: 'input'
		},
		{
			name: 'description',
			title: 'Description',
			type: 'input'
		},
		{
			name: 'html',
			title: 'HTML',
			type: 'textarea'
		},
		{
			name: 'plain',
			title: 'Plain',
			type: 'textarea'
		}
	];

	this.validate = function(cb) {
		if (this.name)
			this.v.check(this.name).len(4, 100);

		if (this.description)
			this.v.check(this.description).len(0, 255);

		return cb(this.afterValidate(this.v.getErrors()));
	};

	this.sanitize = function() {
		this.name = sanitize(this.name).trim();
		this.description = sanitize(this.description).trim();
		this.html = sanitize(this.html).trim();
		this.html = sanitize(this.html).xss();
		this.plain = sanitize(this.plain).trim();
		this.plain = sanitize(this.plain).xss();
	};

	this.create = function(cb) {
		logger.debug('Adding template to database...');

		var _this = this;

		db.query(
			'INSERT INTO {{template}}(`name`, `description`, `html`, `plain`) VALUES(:name, :description, :html, :plain)',
			{
				name: this.name,
				description: this.description,
				html: this.html,
				plain: this.plain
			},
			function(err, result) {
				if (err) {
					logger.error('Could not insert template into database!', err);
					return cb('Error while creating template!');
				} else {
					_this.id = result.insertId;
					logger.verbose('New template #' + result.insertId + ' created.');

					return cb(null);
				}
			}
		);
	},

	this.update = function(cb) {
		logger.debug('Updating template #' + this.id + ' to database...');

		var _this = this;
		var updated = new Date();

		db.query(
			'UPDATE {{template}} SET `name` = :name, `description` = :description, `html` = :html, `plain` = :plain, `created` = :created, `updated` = :updated WHERE `id` = :id',
			{
				name: this.name,
				description: this.description,
				html: this.html,
				plain: this.plain,
				created: this.created,
				updated: updated,
				id: this.id
			},
			function(err, result) {
				if (err) {
					logger.error('Could not update template in the database!', err);
					return cb('Error while updating template!');
				} else {
					logger.verbose('Template #' + _this.id + ' updated.');

					_this.updated = updated;
					return cb(null);
				}
			}
		);
	};
}

TemplateModel.prototype = new BaseModel();

var Template = {
	factory: function(data) {
		if (data)
			return new TemplateModel(data);
		else
			return new TemplateModel({});
	},

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
	},

	find: function(id, cb) {
		logger.debug('Getting template by ID #' + id + '...');

		db.query(
			'SELECT * FROM {{template}} WHERE `id` = :id LIMIT 1',
			{
				id: id
			},
			function(err, templates) {
				if (err) {
					logger.error('Error while getting template by ID!', err);
					return cb('Error while getting template!', null);
				} else if (!templates.length) {
					logger.warn('Could not find template by ID #' + id + '!');
					return cb(null, null);
				} else {
					logger.debug('Found template by ID #' + id + '.');
					return cb(null, new TemplateModel(templates[0], false));
				}
			}
		);
	},

	findByName: function(name, cb) {
		logger.debug('Getting template by name "' + name + '"...');

		db.query(
			'SELECT * FROM {{template}} WHERE `name` = :name LIMIT 1',
			{
				name: name
			},
			function(err, templates) {
				if (err) {
					logger.error('Error while getting template by name!', err);
					return cb('Error while getting template!', null);
				} else if (!templates.length) {
					logger.warn('Could not find template by name "' + name + '"!');
					return cb(null, null);
				} else {
					logger.debug('Found template by name "' + name + '".');
					return cb(null, new TemplateModel(templates[0], false));
				}
			}
		);
	}
};

module.exports = Template;