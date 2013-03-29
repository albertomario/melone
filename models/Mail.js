var config = require(__dirname + '/../lib/config.js');
var logger = require(__dirname + '/../lib/logger.js');
var db = require(__dirname + '/../lib/db.js');

var Template = require(__dirname + '/Template.js');

var jade = require('jade');
var _ = require('underscore');
var nodemailer = require('nodemailer');

var Mail = function(params) {
	this._id = null;

	if (params) {
		this._to = params.to || [];
		this._subject = params.subject || null;
		this._content = params.content || null;
		this._tracking = params.tracking || null;
	}

	this._insertRecipients = function(cb) {
		logger.debug('Insert recipients into database...');
		var _this = this;
		var recipientsCount = this._to.length;
		var recipientCurrent = 0;
		var recipients = [];

		_.each(this._to, function(theRecipient) {
			logger.debug('Insert recipient ' + recipientCurrent + 1 + '/' + recipientsCount);
			db.query(
				'INSERT INTO {{mail_to}}(`mail_id`, `email`, `name`) VALUES(:mail_id, :email, :name)',
				{
					mail_id: _this._id,
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
			str = str + theRecipient.name;
		if (theRecipient.name && theRecipient.email)
			str = str + ' ';
		if (theRecipient.email)
			str = str + '<' + theRecipient.email + '>';

		return str;
	};

	this._addTrackingOpen = function(text, theRecipient) {
		logger.debug('Add open tracking to the mail...');

		var trackingUrl = config.url + 'api/o/' + theRecipient.id + '.gif';
		return text + '<img border="0" src="' + trackingUrl + '" width="1" height="1">';
	};

	this._addTrackingLinksHtml = function(plain, html, theRecipient, cb) {
		logger.debug('Add tracking links to html...');
		var links = html.match(/(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?/gm);
		links = _.uniq(links);

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
							return cb('Could not insert link into database!', null, null, null);
						} else {
							logger.debug('Replaced link ' + (linkCurrent + 1) + '/' + linkCount);

							html = html.replace(theLink, config.url + 'api/l/' + result.insertId);

							linkCurrent++;
							if (linkCurrent >= linkCount) {
								return cb(null, plain, html, theRecipient);
							}
						}
					}
				);
			});
		} else {
			return cb(null, plain, html, theRecipient);
		}
	};

	this._addTrackingLinksPlain = function(plain, html, theRecipient, cb) {
		logger.debug('Add tracking links to plain text...');

		var _this = this;
		var links = plain.match(/(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?/gm);
		links = _.uniq(links);

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
							return cb('Could not insert link into database!', null, null, null);
						} else {
							logger.debug('Replaced link ' + (linkCurrent + 1) + '/' + linkCount);

							plain = plain.replace(theLink, config.url + 'api/l/' + result.insertId);

							linkCurrent++;
							if (linkCurrent >= linkCount) {
								_this._addTrackingLinksHtml(plain, html, theRecipient, cb);
							}
						}
					}
				);
			});
		} else {
			_this._addTrackingLinksHtml(plain, html, theRecipient, cb);
		}
	};

	this._addTrackingLinks = function(plain, html, theRecipient, cb) {
		if (this._tracking && this._tracking.links) {
			logger.debug('Add tracking links to the mail...');
			this._addTrackingLinksPlain(plain, html, theRecipient, cb);
		} else {
			return cb(null, plain, html, theRecipient);
		}
	};

	this.getTemplate = function(cb) {
		logger.debug('Get template for mail...');

		if (this._content && this._content.template) {
			Template.findBySlug(this._content.template, function(err, theTemplate) {
				return cb(err, theTemplate);
			});
		} else {
			return cb(null, null);
		}
	};

	this.send = function(cb) {
		logger.verbose('Sending email...');
		var _this = this;

		if (!_.isArray(this._to) || !this._to.length || !this._to[0].email) {
			return cb('The mail has to be sent to at least one recipient!');
		}

		if (!this._subject) {
			return cb('A subject must be provided!');
		}

		db.query(
			'INSERT INTO {{mail}}(`subject`, `sent`) VALUES(:subject, :sent)',
			{
				subject: this._subject,
				sent: this._sent
			},
			function(err, result) {
				if (err) {
					logger.error('Could not insert mail into database!', err);
					return cb('Could not insert mail into database!');
				} else {
					_this._id = result.insertId;

					_this._insertRecipients(function(err, recipients) {
						if (err) {
							return cb(err);
						} else {
							var html = '';
							var plain = '';
							var compiler = null;

							var mailVars = {};
							var userVars = {};
							var staticVars = {};
							var templateVars = {};
							var globalVars = _this._content.vars || {};

							var sentCount = recipients.length;
							var sentCurrent = 0;

							var mailTransport = nodemailer.createTransport(config.api.type, config.api.mailer);
							var mailOptions = _.extend(config.api.mailOptions, {
								subject: _this._subject
							});

							var errors = [];
							var contentHtml = '';
							var contentPlain = '';

							_this.getTemplate(function(err, theTemplate) {
								if (err) {
									return cb(err);
								} else {
									if (theTemplate) {
										contentHtml = theTemplate.html;
										contentPlain = theTemplate.plain;
									}
									else if (_this._content) {
										if (_this._content.html && _this._content.html.text)
											contentHtml = _this._content.html.text;
										if (_this._content.plain && _this._content.plain.text)
											contentPlain = _this._content.plain.text;
									}

									_.each(recipients, function(recipient) {
										if (contentHtml) {
											mailVars = _this._content.html.vars || {};
											staticVars = _.extend(mailVars, globalVars);

											userVars = recipient.vars;
											templateVars = _.extend(staticVars, userVars);

											compiler = jade.compile(contentHtml);

											try {
												html = compiler(templateVars);
											} catch (e) {
												logger.warn('Error while rendering the html template!', e);
												return cb('Error while rendering the html template: ' + e.message);
											}
										}

										if (contentPlain) {
											mailVars = _this._content.plain.vars || {};
											staticVars = _.extend(mailVars, globalVars);

											userVars = recipient.vars;
											templateVars = _.extend(staticVars, userVars);

											compiler = jade.compile(contentPlain.replace(/^/gm, '!'));

											try {
												plain = compiler(templateVars);
												plain = plain.replace(/^!/gm, '');
											} catch (e) {
												logger.warn('Error while rendering the plain text template!', e);
												return cb('Error while rendering the plain text template: ' + e.message);
											}
										} else if (this._content && _this._content.html && this._content.html.convertToPlain) {
											//Convert html to plain text
										}

										_this._addTrackingLinks(plain, html, recipient, function(err, thePlain, theHtml, theRecipient) {
											if (err) {
												return cb(err);
											} else {
												if (_this._tracking) {
													if (_this._tracking.open) {
														html = _this._addTrackingOpen(html, recipient);
													}
												}

												logger.debug('Sending mail to recepient ' + (sentCurrent + 1) + '/' + sentCount);
												mailTransport.sendMail(_.extend(mailOptions, {
														to: _this._convertRecipient(theRecipient),
														text: thePlain,
														html: theHtml
													}),
													function(err, response) {
														if (err) {
															logger.error('Error while sending mail to recepient ' + (sentCurrent + 1) + '/' + sentCount, err);

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
										});
									});
								}
							});
						}
					});
				}
			}
		);
	};
};

module.exports = Mail;