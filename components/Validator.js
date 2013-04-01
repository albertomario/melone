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

Filter.prototype.nl2br = function() {
	this.modify(this.str.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2'));
	return this.str;
};

module.exports = {
	Validator: Validator,
	Filter: Filter,
	sanitize: sanitize
};