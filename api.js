var config = require(__dirname + '/lib/config.js');
var logger = require(__dirname + '/lib/logger.js');
var routes = require(__dirname + '/models/ApiRoutes.js');

var Key = require(__dirname + '/models/Key.js');

var express = require('express');
var app = express();

app.configure(function() {
	app.use(express.bodyParser());
	app.use(routes.error);
	app.use(app.router);
});

function authenticate(req, res, next) {
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

app.post('/api/status', authenticate, routes.status);
app.post('/api/mail/send', authenticate, routes.mail.send);

app.get('/api/o/:id.gif', routes.tracking.open);
app.get('/api/l/:id', routes.tracking.click);

app.listen(config.api.port, function(err) {
	if (err) {
		throw err;
	} else {
		logger.notice('Listening on port ' + config.api.port);
	}
});