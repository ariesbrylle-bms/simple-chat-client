var express		= require('express.io'),
	path        = require('path'),
	expressPath = require('express-path');

var app = express().http().io();
var socketRoutes = require('./socketMap');

var PUBLIC_DIR = path.join(__dirname, 'public');

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set(express.static(PUBLIC_DIR));
app.use('/bower', express.static(__dirname + '/bower_components'));
app.use(express.cookieParser());
app.use(express.session({secret: 'monkey'}));

for (var i in socketRoutes) {
	var socketRoute = socketRoutes[i];

	var controllerPath = './controllers/';
	var controller = require(controllerPath + (socketRoute[1] ? socketRoute[1] : socketRoute[0]));

	app.io.route(socketRoute[0], controller);
}

app.io.route('broadcast message', function (req) {
	var data = {
		user: {
			username: req.session.username,
			socket_id: req.socket.id
		},
		message: req.data.message
	};
	app.io.room('chat').broadcast('message from server', data);
});

app.io.route('disconnect', function (req) {
	req.io.route('users:disconnect');
});

expressPath(app, 'routeMap');

app.listen(7000);
console.log('Listening to port 7000');