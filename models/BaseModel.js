var db = require(__dirname + '/../lib/db.js');
var logger = require(__dirname + '/../lib/logger.js');

var _ = require('underscore');
var Validator = require('validator').Validator;

function BaseModel() {
	this.init = function(attributes, isNewRecord) {
		if (!_.isUndefined(isNewRecord))
			this._isNewRecord = isNewRecord;
		else
			this._isNewRecord = true;

		this.errors = [];
		this.v = new Validator();
	};

	this.getErrors = function() {
		return this.errors;
	};

	this.getFirstError = function() {
		if (this.errors.length)
			return this.errors[0];
		else
			return false;
	};

	this.toHtml = function() {
		var html = '';

		for (var i = 0; i < this.attributes.length; i++) {
			html += '<div class="row">';
			html += '<div class="large-12 columns">';
			html += '<label for="' + this.attributes[i].name + '">' + this.attributes[i].title + '</label>';
			switch (this.attributes[i].type) {
				case 'input':
					html += '<input type="text" name="' + this.attributes[i].name + '" id="' + this.attributes[i].name + '" value="' + this[this.attributes[i].name] + '">';
					break;
				case 'textarea':
					html += '<textarea name="' + this.attributes[i].name + '" id="' + this.attributes[i].name + '">' + this[this.attributes[i].name] + '</textarea>';
					break;
			}
			html += '</div>';
			html += '</div>';
		}

		return html;
	};

	this.set = function(data) {
		var _this = this;

		_.each(data, function(value, key) {
			_this[key] = value;
		});

		if (_.isFunction(this.sanitize))
			this.sanitize();
	};

	this.afterValidate = function(errors) {
		this.errors = errors;

		return (this.errors.length === 0) ? null : this.getFirstError();
	};

	this.save = function(cb) {
		if (this.validate) {
			if (this._isNewRecord) {
				this.create(function(err) {
					return cb(err);
				});
			} else {
				this.update(function(err) {
					return cb(err);
				});
			}
		} else {
			return cb(this.getFirstError());
		}
	};

	this.remove = function(cb) {
		logger.debug('Remove ' + this._name + ' #' + this.id);

		var _this = this;

		db.query(
			'DELETE FROM ' + this._table + ' WHERE `id` = :id',
			{
				id: this.id
			},
			function(err) {
				if (err) {
					logger.error('Error while deleting ' + _this._name + ' #' + _this.id + '!', err);
					return cb('Error while deleting the ' + _this._name + ' #' + _this.id + '!');
				} else {
					return cb(null);
				}
			}
		);
	};
}

module.exports = BaseModel;