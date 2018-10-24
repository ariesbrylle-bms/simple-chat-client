var room = 'chat';
var users = [];

exports.connect = function (req) {
	req.io.join(room);
	req.session.username = req.data.username;
	req.session.save(function() {
		var user = { username: req.data.username, socket_id: req.io.socket.id }
		users.push(user);
		req.io.respond({ users: users, current_user_data : user });
		req.io.room('chat').broadcast('user connected', user);
		req.io.room('chat').broadcast('new user', { username: req.data.username, socket_id: req.io.socket.id });
	});
}

exports.disconnect = function (req) {
	var socket_id = req.socket.id;

	for (var i = 0; i < users.length; i++) {
		if (users[i].socket_id == socket_id) {
			req.io.room(room).broadcast('user disconnected', users.splice(i, 1)[0]);
			break;
		}
	}
}