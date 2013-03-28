var config = require(__dirname + '/lib/config.js');
var logger = require(__dirname + '/lib/logger.js');
var routes = require(__dirname + '/models/Routes.js');

var flashify = require('flashify');
var express = require('express');
var app = express();

app.configure(function() {
	app.use(express.static(__dirname + '/assets'));
	app.use(express.cookieParser(config.app.sessionSecret));
	app.use(express.session({
		cookie: {
			maxAge: 60000
		}
	}));
	app.use(flashify);
	app.use(routes.error);
	app.use(app.router);
});

app.get('/', routes.index);

app.get('/keys', routes.keys.index);
app.get('/keys/add', routes.keys.add);

app.get('/templates', routes.templates.index);
app.get('/templates/add', routes.templates.add);
app.post('/templates/add', routes.templates.create);

app.get('/data/mail', routes.data.mail);

app.listen(config.app.port, function(err) {
	if (err) {
		throw err;
	} else {
		logger.notice('Listening on port ' + config.app.port);
	}
});