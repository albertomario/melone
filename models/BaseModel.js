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
			return null;
	};

	this.toHtml = function() {
		var html = '';

		for (var i = 0; i < this.attributes.length; i++) {
			if (_.isUndefined(this[this.attributes[i].name])) {
				this[this.attributes[i].name] = '';
			} else {
				//Code coverage
				this[this.attributes[i].name] = this[this.attributes[i].name];
			}

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
		var _this = this;

		this.errors = this.v.getErrors();
		_.each(errors, function(err) {
			_this.errors.push(err);
		});

		return (this.errors && this.errors.length > 0) ? this.getFirstError() : null;
	};

	this.save = function(cb) {
		logger.debug('Save model ' + this._name);

		var _this = this;

		this.validate(function(err) {
			if (err) {
				return cb(err);
			} else {
				if (_this._isNewRecord) {
					_this.create(function(err) {
						_this._isNewRecord = false;

						return cb(err);
					});
				} else {
					_this.update(function(err) {
						return cb(err);
					});
				}
			}
		});
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