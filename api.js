var Key = require(__dirname + '/models/Key.js');

var Routes = require(__dirname + '/components/ApiRoutes.js');

var config = require(__dirname + '/lib/config.js');
var logger = require(__dirname + '/lib/logger.js');

var express = require('express');
var app = express();

app.configure(function() {
	app.use(express.cookieParser(config.app.sessionSecret));
	app.use(express.bodyParser());
	app.use(express.session({
		cookie: {
			maxAge: 60000
		}
	}));
	app.use(app.router);
	app.use(Routes.error);
});

function authenticate(req, res, next) {
	logger.warn('authenticate');
	if (req.body && req.body.key && req.body.secret) {
		Key.validate(req.body.key, req.body.secret, function(err) {
			if (err) {
				res.json(401, {
					error: 'Wrong api key or secret!'
				});
			} else {
				next();
			}
		});
	} else {
		res.json(400, {
			error: 'No api key or secret given!'
		});
	}
}

app.post('/api/status', authenticate, Routes.status);
app.post('/api/mail/send', authenticate, Routes.mail.send);

app.get('/api/o/:id.gif', Routes.tracking.open);
app.get('/api/l/:id', Routes.tracking.click);

if (!module.parent) {
	app.listen(config.api.port, function(err) {
		if (err) {
			throw err;
		} else {
			logger.notice('Listening on port ' + config.api.port);
		}
	});
} else {
	module.exports = app;
}