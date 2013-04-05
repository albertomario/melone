var Key = require(__dirname + '/../models/Key.js');
var Template = require(__dirname + '/../models/Template.js');
var Tag = require(__dirname + '/../models/Tag.js');

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
		res.status(err.code || 500).render('error.jade', {
			error: err.message
		}, function(renderError, html) {
			if (renderError) {
				res.send(500, 'Error while displaying the error template!');
			} else {
				res.send(err.code || 500, html);
			}
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
			var theKey = Key.factory();

			theKey.setUniqueKey(function(err) {
				if (err) {
					next(new ServerError(err));
				} else {
					theKey.save(function(err) {
						if (err) {
							next(new ServerError(err));
						} else {
							req.flash('success', 'Api key "' + theKey.key + '" successfully created.');
							res.redirect('/keys');
						}
					});
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
			var theTemplate = Template.factory();

			res.render('templates/form.jade', {
				update: false,
				form: theTemplate.toHtml()
			});
		},

		create: function(req, res, next) {
			var theTemplate = Template.factory(req.body);

			theTemplate.save(function(err) {
				if (err) {
					res.flash('error', err);

					res.render('templates/form.jade', {
						update: false,
						form: theTemplate.toHtml(),
						template: theTemplate
					});
				} else {
					req.flash('success', 'Template successfully created.');
					res.redirect('/templates/' + theTemplate.id);
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
			Template.find(req.params.id, function(err, theTemplate) {
				if (err) {
					next(new ServerError(err));
				} else if (!theTemplate) {
					next(new NotFoundError('Could not find the template!'));
				} else {
					theTemplate.set(req.body);

					theTemplate.save(function(err) {
						if (err) {
							res.flash('error', err);

							res.render('templates/form.jade', {
								update: true,
								form: theTemplate.toHtml(),
								template: theTemplate
							});
						} else {
							req.flash('success', 'Template successfully updated.');
							res.redirect('/templates/' + theTemplate.id);
						}
					});
				}
			});
		},

		remove: function(req, res, next) {
			Template.find(req.params.id, function(err, theTemplate) {
				if (err) {
					next(new ServerError(err));
				} else if (!theTemplate) {
					next(new NotFoundError('Could not find the template!'));
				} else {
					theTemplate.remove(function(err) {
						if (err) {
							next(new ServerError(err));
						} else {
							req.flash('info', 'Template successfully deleted.');
							res.redirect('/templates');
						}
					});
				}
			});
		}
	},

	tags: {
		index: function(req, res, next) {
			Tag.findAll(function(err, tags) {
				if (err) {
					next(new ServerError(err));
				} else {
					res.render('tags/index.jade', {
						tags: tags
					});
				}
			});
		},

		view: function(req, res, next) {
			Tag.find(req.params.id, function(err, theTag) {
				if (err) {
					next(new ServerError(err));
				} else {
					if (!theTag) {
						req.flash('warning', 'Could not find the tag!');
						res.redirect('/tags');
					} else {
						res.render('tags/view.jade', {
							tag: theTag
						});
					}
				}
			});
		},

		add: function(req, res, next) {
			var theTag = Tag.factory();

			res.render('tags/form.jade', {
				update: false,
				form: theTag.toHtml()
			});
		},

		create: function(req, res, next) {
			var theTag = Tag.factory(req.body);

			theTag.save(function(err) {
				if (err) {
					res.flash('error', err);

					res.render('tags/form.jade', {
						update: false,
						form: theTag.toHtml(),
						tag: theTag
					});
				} else {
					req.flash('success', 'Tag successfully created.');
					res.redirect('/tags/' + theTag.id);
				}
			});
		},

		edit: function(req, res, next) {
			Tag.find(req.params.id, function(err, theTag) {
				if (err) {
					next(new ServerError(err));
				} else if (!theTag) {
					next(new NotFoundError('Could not find the tag!'));
				} else {
					res.render('tags/form.jade', {
						update: true,
						form: theTag.toHtml(),
						tag: theTag
					});
				}
			});
		},

		update: function(req, res, next) {
			Tag.find(req.params.id, function(err, theTag) {
				if (err) {
					next(new ServerError(err));
				} else if (!theTag) {
					next(new NotFoundError('Could not find the tag!'));
				} else {
					theTag.set(req.body);

					theTag.save(function(err) {
						if (err) {
							res.flash('error', err);

							res.render('tags/form.jade', {
								update: true,
								form: theTag.toHtml(),
								tag: theTag
							});
						} else {
							req.flash('success', 'Tag successfully updated.');
							res.redirect('/tags/' + theTag.id);
						}
					});
				}
			});
		},

		remove: function(req, res, next) {
			Tag.find(req.params.id, function(err, theTag) {
				if (err) {
					next(new ServerError(err));
				} else if (!theTag) {
					next(new NotFoundError('Could not find the tag!'));
				} else {
					theTag.remove(function(err) {
						if (err) {
							next(new ServerError(err));
						} else {
							req.flash('info', 'Tag successfully deleted.');
							res.redirect('/tags');
						}
					});
				}
			});
		}
	},

	reports: {
		links: function(req, res, next) {
			res.render('reports/links.jade');
		},

		tags: function(req, res, next) {
			res.render('reports/tags.jade');
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
		},

		tags: function(req, res, next) {
			res.render('docs/tags.jade');
		}
	},

	data: {
		index: function(req, res, next) {
			Data.index(function(err, data) {
				if (err) {
					next(new ServerError(err));
				} else {
					res.json(200, data);
				}
			});
		},

		tags: function(req, res, next) {
			Data.tags(function(err, data) {
				if (err) {
					next(new ServerError(err));
				} else {
					res.json(200, data);
				}
			});
		},

		links: function(req, res, next) {
			Data.links(function(err, data) {
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