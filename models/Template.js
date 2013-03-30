var BaseModel = require(__dirname + '/BaseModel.js');

var db = require(__dirname + '/../lib/db.js');
var logger = require(__dirname + '/../lib/logger.js');

var _ = require('underscore');
var Validator = require('validator').Validator;
var Filter = require('validator').Filter;
var sanitize = require('validator').sanitize;

Validator.prototype.error = function (msg) {
	this._errors.push(msg);
	return this;
};

Validator.prototype.getErrors = function () {
	return this._errors;
};

Filter.prototype.nl2br = function() {
    this.modify(this.str.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2'));
    return this.str;
};

function TemplateModel(attributes) {
	this._name = 'template';
	this._table = '{{template}}';

	this.attributes = [
		{
			name: 'slug',
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

	this.validate = function() {
		if (this.slug)
			this.v.check(this.slug).len(4, 100);

		if (this.description)
			this.v.check(this.description).len(0, 255);

		return this.afterValidate(this.v.getErrors());
	};

	this.sanitize = function() {
		this.slug = sanitize(this.slug).trim();
		this.description = sanitize(this.description).trim();
		this.html = sanitize(this.html).trim();
		this.html = sanitize(this.html).xss();
		this.plain = sanitize(this.plain).trim();
		this.plain = sanitize(this.plain).xss();
		this.plain = sanitize(this.plain).nl2br();
	};

	this.set({
		id: attributes.id || null,
		slug: attributes.slug || null,
		description: attributes.description || null,
		html: attributes.html || null,
		plain: attributes.plain || null,
		created: attributes.created || null,
		updated: attributes.updated || '0000-00-00 00:00:00'
	});
}

TemplateModel.prototype = new BaseModel();

var Template = {
	factory: function() {
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
					return cb(null, new TemplateModel(templates[0]));
				}
			}
		);
	},

	findBySlug: function(slug, cb) {
		logger.debug('Getting template by slug "' + slug + '"...');

		db.query(
			'SELECT * FROM {{template}} WHERE `slug` = :slug LIMIT 1',
			{
				slug: slug
			},
			function(err, templates) {
				if (err) {
					logger.error('Error while getting template by slug!', err);
					return cb('Error while getting template!', null);
				} else if (!templates.length) {
					logger.warn('Could not find template by slug "' + slug + '"!');
					return cb(null, null);
				} else {
					logger.debug('Found template by slug "' + slug + '".');
					return cb(null, new TemplateModel(templates[0]));
				}
			}
		);
	},

	create: function(theTemplate, cb) {
		logger.debug('Adding template to database...');

		var _this = this;

		db.query(
			'INSERT INTO {{template}}(`slug`, `description`, `html`, `plain`) VALUES(:slug, :description, :html, :plain)',
			{
				slug: theTemplate.slug,
				description: theTemplate.description,
				html: theTemplate.html,
				plain: theTemplate.plain
			},
			function(err, result) {
				if (err) {
					logger.error('Could not insert template into database!', err);
					return cb('Error while creating template!', null);
				} else {
					logger.verbose('New template #' + result.insertId + ' created.');

					_this.find(result.insertId, function(err, theTemplate) {
						return cb(err, theTemplate);
					});
				}
			}
		);
	},

	update: function(theTemplate, cb) {
		logger.debug('Updating template #' + theTemplate.id + ' to database...');

		var updated = new Date();

		db.query(
			'UPDATE {{template}} SET `slug` = :slug, `description` = :description, `html` = :html, `plain` = :plain, `updated` = :updated WHERE `id` = :id',
			{
				slug: theTemplate.slug,
				description: theTemplate.description,
				html: theTemplate.html,
				plain: theTemplate.plain,
				updated: updated,
				id: theTemplate.id
			},
			function(err, result) {
				if (err) {
					logger.error('Could not update template in the database!', err);
					return cb('Error while updating template!', null);
				} else {
					logger.verbose('Template #' + theTemplate.id + ' updated.');

					theTemplate.updated = updated;
					return cb(null, theTemplate);
				}
			}
		);
	}
};

module.exports = Template;