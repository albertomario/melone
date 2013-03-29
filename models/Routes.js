var Key = require(__dirname + '/Key.js');
var Template = require(__dirname + '/Template.js');
var Data = require(__dirname + '/Data.js');

var logger = require(__dirname + '/../lib/logger.js');

var util = require('util');

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
		res.render('error.jade', {
			error: err.message
		});
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

		view: function(req, res, next) {
			Template.find(req.params.id, function(err, theTemplate) {
				if (err) {
					next(new ServerError(err));
				} else {
					if (!theTemplate) {
						req.flash('warning', 'Could not find the template!');
						res.redirect('/templates');
					} else {
						res.render('templates/view.jade', {
							template: theTemplate
						});
					}
				}
			});
		},

		add: function(req, res, next) {
			var templateForm = forms.create(templateFormOptions);

			res.render('templates/form.jade', {
				update: false,
				form: templateForm.toHTML()
			});
		},

		create: function(req, res, next) {
			var templateForm = forms.create(templateFormOptions);

			templateForm.handle(req, {
				success: function(form) {
					Template.create(form.data, function(err, id) {
						if (err) {
							next(new ServerError(err));
						} else {
							req.flash('success', 'Template successfully created.');
							res.redirect('/templates');
						}
					});
				},
				error: function(form) {
					res.render('templates/form.jade', {
						update: false,
						form: form.toHTML()
					});
				},
				empty: function(form) {
					res.render('templates/form.jade', {
						update: false,
						form: form.toHTML()
					});
				}
			});
		},

		edit: function(req, res, next) {
			Template.find(req.params.id, function(err, theTemplate) {
				if (err) {
					next(new ServerError(err));
				} else if (!theTemplate) {
					next(new NotFoundError('Could not find the template!'));
				} else {
					res.render('templates/form.jade', {
						update: true,
						form: theTemplate.toHtml(),
						template: theTemplate
					});
				}
			});
		},

		update: function(req, res, next) {
			console.log(req.body);
			Template.find(req.params.id, function(err, theTemplate) {
				if (err) {
					next(new ServerError(err));
				} else if (!theTemplate) {
					next(new NotFoundError('Could not find the template!'));
				} else {
					theTemplate.set(req.body);

					if (theTemplate.validate()) {
						Template.update(theTemplate, function(err, theTemplate) {
							if (err) {
								next(new ServerError(err));
							} else {
								req.flash('success', 'Template successfully updated.');
								res.redirect('/templates/' + theTemplate.id);
							}
						});
					} else {
						console.log('error', theTemplate.getErrors());
						res.flash('error', theTemplate.firstError());

						res.render('templates/form.jade', {
							update: true,
							form: theTemplate.toHtml(),
							template: theTemplate
						});
					}
				}
			});
		},

		remove: function(req, res, next) {
			Template.remove(req.params.id, function(err) {
				if (err) {
					next(new ServerError(err));
				} else {
					req.flash('info', 'Template successfully deleted.');
					res.redirect('/templates');
				}
			});
		}
	},

	docs: {
		index: function(req, res, next) {
			res.render('docs/index.jade');
		},

		mail: function(req, res, next) {
			res.render('docs/mail.jade');
		},

		templates: function(req, res, next) {
			res.render('docs/templates.jade');
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