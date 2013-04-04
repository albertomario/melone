var Validator = require('validator').Validator;
var Filter = require('validator').Filter;
var sanitize = require('validator').sanitize;

Validator.prototype.error = function(msg) {
	this._errors.push(msg);
	return this;
};

Validator.prototype.getErrors = function() {
	return this._errors;
};

module.exports = {
	Validator: Validator,
	Filter: Filter,
	sanitize: sanitize
};