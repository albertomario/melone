var config = require(__dirname + '/lib/config.js');
var logger = require(__dirname + '/lib/logger.js');
var routes = require(__dirname + '/models/Routes.js');

var flashify = require('flashify');
var express = require('express');
var app = express();
var expressValidator = require('express-validator');

app.configure(function() {
	app.use(express.static(__dirname + '/assets'));
	app.use(express.cookieParser(config.app.sessionSecret));
	app.use(express.bodyParser());
	app.use(express.session({
		cookie: {
			maxAge: 60000
		}
	}));
	app.use(flashify);
	app.use(routes.error);
	app.use(expressValidator);
	app.use(app.router);
});

app.get('/', routes.index);

app.get('/keys', routes.keys.index);
app.get('/keys/add', routes.keys.add);

app.get('/templates', routes.templates.index);
app.get('/templates/:id', routes.templates.view);
app.get('/templates/add', routes.templates.add);
app.post('/templates/add', routes.templates.create);
app.get('/templates/edit/:id', routes.templates.edit);
app.post('/templates/edit/:id', routes.templates.update);
app.get('/templates/remove/:id', routes.templates.remove);

app.get('/docs', routes.docs.index);
app.get('/docs/mail', routes.docs.mail);
app.get('/docs/templates', routes.docs.templates);

app.get('/data/mail', routes.data.mail);

app.listen(config.app.port, function(err) {
	if (err) {
		throw err;
	} else {
		logger.notice('Listening on port ' + config.app.port);
	}
});