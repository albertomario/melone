var config = require(__dirname + '/../lib/config.js');
var logger = require(__dirname + '/../lib/logger.js');
var db = require(__dirname + '/../lib/db.js');

var Template = require(__dirname + '/Template.js');

var jade = require('jade');
var _ = require('underscore');
var nodemailer = require('nodemailer');

var Mail = function(params) {
	this.id = null;

	if (params) {
		this.to = params.to || [];
		this.subject = params.subject || null;
		this.content = params.content || null;
		this.tags = params.tags || null;
		this.tracking = params.tracking || null;
	}

	this._getApiUrl = function(path) {
		if (!path)
			path = '';

		return config.url + ':' + config.api.port + '/' + path;
	};

	this._getLinks = function(str) {
		var exp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!-\/]))?/gi;
		var urlReg = new RegExp(exp);
		var links = str.match(urlReg);

		return _.uniq(links);
	};

	this._insertRecipients = function(to, cb) {
		logger.debug('Insert recipients into database...');

		var _this = this;
		var recipientsCount = to.length;
		var recipientCurrent = 0;
		var recipients = [];

		_.each(to, function(theRecipient) {
			logger.debug('Insert recipient ' + recipientCurrent + 1 + '/' + recipientsCount);

			db.query(
				'INSERT INTO {{mail_to}}(`mail_id`, `email`, `name`) VALUES(:mail_id, :email, :name)',
				{
					mail_id: _this.id,
					email: theRecipient.email,
					name: theRecipient.name
				},
				function(err, result) {
					if (err) {
						logger.error('Could not add recipient to database!', err);
						return cb('Could not add recipient to database!', null);
					} else {
						logger.debug('Recipient added.');
						recipientCurrent++;

						recipients.push({
							id: result.insertId,
							email: theRecipient.email,
							name: theRecipient.name,
							vars: theRecipient.vars || {}
						});

						if (recipientCurrent >= recipientsCount) {
							logger.debug('All recipients added to database.');
							return cb(null, recipients);
						}
					}
				}
			);
		});
	};

	this._convertRecipient = function(theRecipient) {
		var str = '';

		if (theRecipient.name)
			str += theRecipient.name;
		if (theRecipient.name && theRecipient.email)
			str += ' <';

		str += theRecipient.email;

		if (theRecipient.name && theRecipient.email)
			str += '>';

		return str;
	};

	this._addTrackingOpen = function(text, theRecipient) {
		logger.debug('Add open tracking to the mail...');

		return text + '<img border="0" src="' + this._getApiUrl('api/o/' + theRecipient.id + '.gif') + '" width="1" height="1">';
	};

	this._addTrackingLinksHtml = function(html, theRecipient, cb) {
		logger.debug('Add tracking links to html...');

		var _this = this;
		var links = this._getLinks(html);
		var linkCount = links.length;
		var linkCurrent = 0;

		if (linkCount > 0) {
			_.each(links, function(theLink) {
				db.query(
					'INSERT INTO {{mail_link}}(`mail_to_id`, `url`, `plain`) VALUES(:mail_to_id, :url, :plain)',
					{
						mail_to_id: theRecipient.id,
						url: theLink,
						plain: false
					},
					function(err, result) {
						if (err) {
							logger.error('Could not insert link into database!', err);
							return cb('Could not insert link into database!', null, theRecipient);
						} else {
							logger.debug('Replaced link ' + (linkCurrent + 1) + '/' + linkCount);

							html = html.replace(theLink, _this._getApiUrl('api/l/' + result.insertId));

							linkCurrent++;
							if (linkCurrent >= linkCount) {
								return cb(null, html, theRecipient);
							}
						}
					}
				);
			});
		} else {
			return cb(null, html, theRecipient);
		}
	};

	this._addTrackingLinksPlain = function(plain, theRecipient, cb) {
		logger.debug('Add tracking links to plain text...');

		var _this = this;
		var links = this._getLinks(plain);
		var linkCount = links.length;
		var linkCurrent = 0;

		if (linkCount > 0) {
			_.each(links, function(theLink) {
				db.query(
					'INSERT INTO {{mail_link}}(`mail_to_id`, `url`, `plain`) VALUES(:mail_to_id, :url, :plain)',
					{
						mail_to_id: theRecipient.id,
						url: theLink,
						plain: true
					},
					function(err, result) {
						if (err) {
							logger.error('Could not insert link into database!', err);
							return cb('Could not insert link into database!', null, theRecipient);
						} else {
							logger.debug('Replaced link ' + (linkCurrent + 1) + '/' + linkCount);

							plain = plain.replace(theLink, _this._getApiUrl('api/l/' + result.insertId));

							linkCurrent++;
							if (linkCurrent >= linkCount) {
								return cb(null, plain, theRecipient);
							}
						}
					}
				);
			});
		} else {
			return cb(null, plain, theRecipient);
		}
	};

	this._addTrackingLinks = function(plain, html, recipient, cb) {
		var _this = this;

		if (this.tracking && this.tracking.links) {
			logger.debug('Add tracking links to the mail...');
			this._addTrackingLinksPlain(plain, recipient, function(err, plainTracked, recipientPlain) {
				if (err) {
					return cb(err, plain, html, recipient);
				} else {
					_this._addTrackingLinksHtml(html, recipient, function(err, htmlTracked, recipientHtml) {
						if (err) {
							return cb(err, plainTracked, html, recipient);
						} else {
							return cb(null, plainTracked, htmlTracked, recipientHtml);
						}
					});
				}
			});
		} else {
			return cb(null, plain, html, recipient);
		}
	};

	this._getTemplate = function(cb) {
		logger.debug('Get template for mail...');

		if (this.content && this.content.template) {
			Template.findByName(this.content.template, function(err, theTemplate) {
				if (err) {
					logger.error('Could not find template "' + this.content.template + '"!');
					return cb(err, null);
				} else {
					return cb(null, theTemplate);
				}
			});
		} else {
			return cb(null, null);
		}
	};

	this._insertTags = function(cb) {
		if (!this.id) {
			logger.error('Could not insert tags, mail not created yet!');
			return cb('Could not insert tags, mail not created yet!');
		}

		var _this = this;

		if (_.isArray(this.tags) && this.tags.length > 0) {
			logger.debug('Get and insert tags for the mail...');

			var sql = 'SELECT `id` FROM {{tag}} WHERE ';
			var params = {};
			for (var i = 0; i < this.tags.length; i++) {
				if (i > 0)
					sql += ' OR ';

				sql += '`name` = :' + i;
				params[i] = this.tags[i];
			}

			db.query(sql, params, function(err, tags) {
				if (err) {
					logger.error('Could not get the tags from database!', err);
					return cb('Could not get the tags from database!');
				} else {
					if (tags.length) {
						sql = 'INSERT INTO {{mail_tag}}(`mail_id`, `tag_id`) VALUES ';
						params = {
							mail_id: _this.id
						};

						for (var i = 0; i < tags.length; i++) {
							sql += '(:mail_id, :' + i + ')';
							params[i] = tags[i].id;

							if (i < (tags.length - 1))
								sql += ',';
						}

						db.query(sql, params, function(err, result) {
							if (err) {
								logger.error('Could not save tags for this mail!', err);
								return cb('Could not save tags for this mail!');
							} else {
								return cb(null);
							}
						});
					} else {
						logger.warn('Got no tags from database!');
						return cb(null);
					}
				}
			});
		} else {
			return cb(null);
		}
	};

	this._formatPlainTemplate = function(plain) {
		return '!' + plain.replace(/\n/g, '\n!');
	};

	this._reformatPlainTemplate = function(plain) {
		return plain.substr(1).replace(/\n!/g, '\n');
	};

	this._prepare = function(cb) {
		logger.debug('Preparing mail to send...');

		var _this = this;

		db.query(
			'INSERT INTO {{mail}}(`subject`, `sent`) VALUES(:subject, :sent)',
			{
				subject: this.subject,
				sent: this._sent
			},
			function(err, result) {
				if (err) {
					logger.error('Could not insert mail into database!', err);
					return cb('Could not insert mail into database!', null, null, null, null);
				} else {
					_this.id = result.insertId;

					_this._insertRecipients(_this.to, function(err, recipients) {
						if (err) {
							return cb(err, null, null, null, null);
						} else {
							var contentHtml = '';
							var contentPlain = '';

							_this._getTemplate(function(err, theTemplate) {
								if (err) {
									return cb(err, null, null, null, null);
								} else {
									if (theTemplate) {
										logger.debug('Send mail with template.');

										contentHtml = theTemplate.html;
										contentPlain = theTemplate.plain;
									} else if (_this.content) {
										logger.debug('Send mail without template.');

										if (_this.content.html && _this.content.html.text)
											contentHtml = _this.content.html.text;
										if (_this.content.plain && _this.content.plain.text)
											contentPlain = _this.content.plain.text;
									}

									_this._insertTags(function(err) {
										if (err) {
											return cb(err, null, null, null, null);
										} else {
											contentPlain = _this._formatPlainTemplate(contentPlain);
											return cb(null, recipients, theTemplate, contentHtml, contentPlain);
										}
									});
								}
							});
						}
					});
				}
			}
		);
	};

	this._compileHtml = function(htmlTemplate, staticVars, userVars, cb) {
		logger.log('Compiling html message...');

		var html = null;
		var _this = this;
		var templateVars = {};

		templateVars = _.extend(staticVars, userVars);

		compiler = jade.compile(htmlTemplate);

		try {
			html = compiler(templateVars);
		} catch (e) {
			logger.warn('Error while rendering the html template!', e);
			return cb('Error while rendering the html template: ' + e.message, null);
		}

		return cb(null, html);
	};

	this._compilePlain = function(plainTemplate, staticVars, userVars, cb) {
		logger.log('Compiling plain message...');

		var plain = null;
		var _this = this;
		var templateVars = {};

		templateVars = _.extend(staticVars, userVars);

		compiler = jade.compile(plainTemplate);

		try {
			plain = compiler(templateVars);
		} catch (e) {
			logger.warn('Error while rendering the plain template!', e);
			return cb('Error while rendering the plain template: ' + e.message, null);
		}

		plain = this._reformatPlainTemplate(plain);

		return cb(null, plain);
	};

	this.send = function(cb) {
		logger.verbose('Sending email...');

		var _this = this;

		//Todo: Validate fields
		if (!_.isArray(this.to) || !this.to.length || !this.to[0].email) {
			return cb('The mail has to be sent to at least one recipient!');
		}

		if (!this.subject) {
			return cb('A subject must be provided!');
		}

		this._prepare(function(err, recipients, theTemplate, contentHtml, contentPlain) {
			if (err) {
				return cb(err);
			} else {
				var compiler = null;

				var htmlVars = _this.content.html.vars || {};
				var plainVars = _this.content.plain.vars || {};
				var staticHtmlVars = {};
				var staticPlainVars = {};
				var userVars = {};
				var globalVars = _this.content.vars || {};

				var sentCount = recipients.length;
				var sentCurrent = 0;

				var mailTransport = nodemailer.createTransport(config.api.type, config.api.mailer);
				var mailOptions = _.extend(config.api.mailOptions, {
					subject: _this.subject
				});

				var errors = [];

				_.each(recipients, function(recipient) {
					userVars = recipient.vars || {};

					staticHtmlVars = _.extend(htmlVars, globalVars);
					staticPlainVars = _.extend(plainVars, globalVars);

					_this._compileHtml(contentHtml, staticHtmlVars, userVars, function(err, html) {
						if (err) {
							return cb(err);
						} else {
							_this._compilePlain(contentPlain, staticPlainVars, userVars, function(err, plain) {
								if (err) {
									return cb(err);
								} else {
									_this._addTrackingLinks(plain, html, recipient, function(err, thePlain, theHtml, theRecipient) {
										if (err) {
											return cb(err);
										} else {
											if (_this.tracking) {
												if (_this.tracking.open) {
													theHtml = _this._addTrackingOpen(theHtml, recipient);
												}
											}

											logger.debug('Sending mail to recepient ' + (sentCurrent + 1) + '/' + sentCount + '...');

											if (process.env.MELONE_TEST) {
												if (!errors.length)
													errors = null;

												return cb(errors);
											} else {
												mailTransport.sendMail(_.extend(mailOptions, {
														to: _this._convertRecipient(theRecipient),
														text: thePlain,
														html: theHtml
													}),
													function(err, response) {
														if (err) {
															logger.error('Error while sending mail to recepient ' + (sentCurrent + 1) + '/' + sentCount + '!', err);

															errors.push({
																recipient: theRecipient,
																error: err
															});
														} else {
															logger.debug('Mail sent to recepient ' + (sentCurrent + 1) + '/' + sentCount);
														}

														sentCurrent++;

														if (sentCurrent >= sentCount) {
															if (!errors.length)
																errors = null;

															return cb(errors);
														}
													}
												);
											}
										}
									});
								}
							});
						}
					});
				});
			}
		});
	};
};

module.exports = Mail;