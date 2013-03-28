var Key = require(__dirname + '/Key.js');
var Template = require(__dirname + '/Template.js');
var Data = require(__dirname + '/Data.js');

var util = require('util');
var forms = require('forms');

var templateCreateForm = forms.create({
	slug: forms.fields.string({
		required: true,
		errorAfterField: true
	}),
	description: forms.fields.string({
		errorAfterField: true
	}),
	html: forms.fields.string({
		widget: forms.widgets.textarea(),
		cssClasses: [
			'editor'
		],
		errorAfterField: true
	}),
	plain: forms.fields.string({
		required: true,
		widget: forms.widgets.textarea({
			cols: 10
		}),
		errorAfterField: true
	})
});

var ServerError = function(message) {
	this.code = 500;
	this.message = message;
};

util.inherits(ServerError, Error);
ServerError.name = 'ServerError';

var NotFoundError = function(message) {
	this.code = 404;
	this.message = message;
};

util.inherits(NotFoundError, Error);
NotFoundError.name = 'NotFoundError';

var Routes = {
	error: function(err, req, res, next) {
		res.render(
			'error.jade',
			{
				error: err.message
			},
			function(renderError, html) {
				if (renderError) throw renderError;

				res.send(err.code, html);
			}
		);
	},

	index: function(req, res, next) {
		res.render('index.jade');
	},

	keys: {
		index: function(req, res, next) {
			Key.findAll(function(err, keys) {
				if (err) {
					next(new ServerError(err));
				} else {
					res.render('keys/index.jade', {
						keys: keys
					});
				}
			});
		},

		add: function(req, res, next) {
			Key.create(function(err, id) {
				if (err) {
					next(new ServerError(err));
				} else {
					req.flash('success', 'Api key successfully created.');
					res.redirect('/keys');
				}
			});
		}
	},

	templates: {
		index: function(req, res, next) {
			Template.findAll(function(err, templates) {
				if (err) {
					next(new ServerError(err));
				} else {
					res.render('templates/index.jade', {
						templates: templates
					});
				}
			});
		},

		add: function(req, res, next) {
			res.render('templates/add.jade', {
				form: templateCreateForm.toHTML()
			});
		},

		create: function(req, res, next) {
			templateCreateForm.handle(req, {
				success: function(form) {
					Template.create(function(err, id) {
						if (err) {
							next(new ServerError(err));
						} else {
							res.redirect('/templates');
						}
					});
				},
				error: function(form) {
					res.render('templates/add.jade', {
						form: form.toHTML()
					});
				},
				empty: function(form) {
					res.render('templates/add.jade', {
						form: form.toHTML()
					});
				}
			});
		}
	},

	data: {
		mail: function(req, res, next) {
			Data.mail(function(err, data) {
				if (err) {
					next(new ServerError(err));
				} else {
					res.json(200, data);
				}
			});
		}
	}
};

module.exports = Routes;