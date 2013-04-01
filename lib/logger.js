var util = require('util');
var winston = require('winston');

var silent = process.env.MELONE_TEST || false;

module.exports = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({
			silent: silent,
			timestamp: true,
			colorize: true,
			level: 'debug'
		})
	],
	levels: {
		debug: 0,
		verbose: 1,
		info: 2,
		notice: 3,
		warn: 4,
		error: 5,
		critical: 6
	},
	colors: {
		debug: 'grey',
		verbose: 'cyan',
		info: 'green',
		notice: 'blue',
		warn: 'yellow',
		error: 'magenta',
		critical: 'red'
	}
});