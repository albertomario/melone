var Routes = require(__dirname + '/components/Routes.js');

var config = require(__dirname + '/lib/config.js');
var logger = require(__dirname + '/lib/logger.js');

var flashify = require('flashify');
var express = require('express');
var expressValidator = require('express-validator');

var app = express();

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
	app.use(expressValidator);
	app.use(app.router);
	app.use(Routes.error);
});

app.get('/', Routes.index);

app.get('/keys', Routes.keys.index);
app.get('/keys/add', Routes.keys.add);

app.get('/templates', Routes.templates.index);
app.get('/templates/add', Routes.templates.add);
app.post('/templates/add', Routes.templates.create);
app.get('/templates/edit/:id', Routes.templates.edit);
app.post('/templates/edit/:id', Routes.templates.update);
app.get('/templates/remove/:id', Routes.templates.remove);
app.get('/templates/:id', Routes.templates.view);

app.get('/tags', Routes.tags.index);
app.get('/tags/add', Routes.tags.add);
app.post('/tags/add', Routes.tags.create);
app.get('/tags/edit/:id', Routes.tags.edit);
app.post('/tags/edit/:id', Routes.tags.update);
app.get('/tags/remove/:id', Routes.tags.remove);
app.get('/tags/:id', Routes.tags.view);

app.get('/docs', Routes.docs.index);
app.get('/docs/mail', Routes.docs.mail);
app.get('/docs/templates', Routes.docs.templates);
app.get('/docs/tags', Routes.docs.tags);

app.get('/reports/links', Routes.reports.links);
app.get('/reports/tags', Routes.reports.tags);

app.get('/data/index', Routes.data.index);
app.get('/data/links', Routes.data.links);
app.get('/data/tags', Routes.data.tags);

if (!module.parent) {
	app.listen(config.app.port, function(err) {
		if (err) {
			throw err;
		} else {
			logger.notice('Listening on port ' + config.app.port);
		}
	});
} else {
	module.exports = app;
}