var db = require(__dirname + '/db.js');

var Sql = require(__dirname + '/../components/Sql.js');

var Key = require(__dirname + '/../models/Key.js');
var Tag = require(__dirname + '/../models/Tag.js');
var Template = require(__dirname + '/../models/Template.js');

var Faker = require('Faker');
var async = require('async');

var querys = [
	Sql.truncate.mail_link_click,
	Sql.truncate.mail_link,
	Sql.truncate.mail_to,
	Sql.truncate.mail_tag,
	Sql.truncate.mail,
	Sql.truncate.template,
	Sql.truncate.tag
];

var now = new Date();
var currentYear = now.getFullYear();
var currentMonth = now.getMonth();

var maxKey = 100;
var maxTag = 100;
var maxMails = 1000;
var maxRecipients = maxMails * 10;
var maxLinks = maxRecipients * 3;
var maxClicks = maxLinks;

/**
 * Get the number of days in the specified month/year.
 *
 * @param {number} month
 * @param {number} year
 *
 * @return {number}
 */
function daysInMonth(month, year) {
	return (new Date(year, month, 0)).getDate();
}

/**
 * Get a random date for the current year.
 *
 * @return {Date}
 */
function getRandomDate() {
	var randomMonth = Faker.random.number(currentMonth) + 1;

	return new Date(
		currentYear,
		randomMonth,
		Faker.random.number(daysInMonth((randomMonth - 1), currentYear)) + 1,
		0,
		0,
		0
	);
}

async.series({
	truncateTables: function(cb) {
		async.eachSeries(querys, function(query, next) {
			db.query(query, function(err, result) {
				if (err)
					throw err;

				next(null);
			});
		}, function(err) {
			if (err)
				throw err;

			cb(null);
		});
	},
	generateKeys: function(cb) {
		/**
		 * Generate keys.
		 */
		var currentKey = 0;

		async.whilst(
			function() {
				return currentKey < maxKey;
			},
			function(next) {
				currentKey++;

				var theKey = Key.factory();

				theKey.setUniqueKey(function(err) {
					if (err) throw err;

					theKey.save(function(err) {
						next();
					});
				});
			},
			function(err) {
				console.log(currentKey + ' keys generated.');
				cb(null);
			}
		);
	},
	generateTags: function(cb) {
		/**
		 * Generate tags.
		 */
		var currentTag = 0;

		async.whilst(
			function() {
				return currentTag < maxTag;
			},
			function(next) {
				currentTag++;

				var theTag = Tag.factory({
					name: Faker.Lorem.words(Faker.random.number(4) + 1),
					description: Faker.Lorem.sentences(Faker.random.number(2))
				});

				theTag.save(function(err) {
					next();
				});
			},
			function(err) {
				console.log(currentTag + ' tags generated.');
				cb(null);
			}
		);
	},
	generateMails: function(cb) {
		/**
		 * Generate Mails.
		 */
		var currentMail = 0;

		async.whilst(
			function() {
				return currentMail < maxMails;
			},
			function(next) {
				currentMail++;

				db.query(
					'INSERT INTO {{mail}}(`subject`, `sent`) VALUES(:subject, :sent)',
					{
						subject: Faker.Lorem.sentence(),
						sent: getRandomDate()
					},
					function(err, result) {
						if (err) throw err;

						if ((currentMail % 1000) === 0)
							console.log('Generated mails ' + currentMail + '/' + maxMails);

						next();
					}
				);
			},
			function(err) {
				console.log(currentMail + ' mails generated.');
				cb(null);
			}
		);
	},
	generateRecipients: function(cb) {
		/**
		 * Generate recipients.
		 */
		var currentRecipient = 0;

		async.whilst(
			function() {
				return currentRecipient < maxRecipients;
			},
			function(next) {
				currentRecipient++;

				var opened = null;

				if (Faker.random.number(2) === 0) {
					opened = getRandomDate();
				}

				db.query(
					'INSERT INTO {{mail_to}}(`mail_id`, `email`, `name`, `opened`) VALUES(FLOOR(RAND() * ' + maxMails + ' + 1), :email, :name, :opened)',
					{
						email: Faker.Internet.email(),
						name: Faker.Name.findName(),
						opened: opened
					},
					function(err, result) {
						if (err) throw err;

						if ((currentRecipient % maxMails) === 0)
							console.log('Generated recipients ' + currentRecipient + '/' + maxRecipients);

						next();
					}
				);
			},
			function(err) {
				console.log(currentRecipient + ' recipients generated.');
				cb(null);
			}
		);
	},
	generateLinks: function(cb) {
		/**
		 * Generate links.
		 */
		var currentLink = 0;

		async.whilst(
			function() {
				return currentLink < maxLinks;
			},
			function(next) {
				currentLink++;

				db.query(
					'INSERT INTO {{mail_link}}(`mail_to_id`, `url`, `plain`) VALUES(FLOOR(RAND() * ' + maxRecipients + ' + 1), :url, FLOOR(RAND() * 2))',
					{
						url: 'http://www.' + Faker.Internet.domainName()
					},
					function(err, result) {
						if (err) throw err;

						if ((currentLink % maxRecipients) === 0)
							console.log('Generated links ' + currentLink + '/' + maxLinks);

						next();
					}
				);
			},
			function(err) {
				console.log(currentLink + ' links generated.');
				cb(null);
			}
		);
	},
	generateLinkClicks: function(cb) {
		/**
		 * Generate links.
		 */
		var currentClick = 0;

		async.whilst(
			function() {
				return currentClick < maxClicks;
			},
			function(next) {
				currentClick++;

				db.query(
					'INSERT INTO {{mail_link_click}}(`mail_link_id`, `ip_hash`, `clicked`) VALUES(FLOOR(RAND() * ' + maxLinks + ' + 1), SHA1(NOW()), :clicked)',
					{
						clicked: getRandomDate()
					},
					function(err, result) {
						if (err) throw err;

						if ((currentClick % maxLinks) === 0)
							console.log('Generated clicks ' + currentClick + '/' + maxClicks);

						next();
					}
				);
			},
			function(err) {
				console.log(currentClick + ' clicks generated.');
				cb(null);
			}
		);
	}
}, function(err) {
	if (err) throw err;

	process.exit(0);
});