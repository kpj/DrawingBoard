var server = require("./server");
var app = server.start();

var io = require('socket.io').listen(app);


var current_image = [];

io.sockets.on('connection', function (socket) {
	socket.emit('new_lines', current_image);

	socket.on('new_line', function (data) {
		current_image.push(data["line"]);
		socket.broadcast.emit('new_lines', [data["line"]]);

		console.log(current_image.length);
	});

	socket.on('clear_lines', function (data) {
		console.log("Clearing image...");

		current_image = [];
		socket.broadcast.emit('clear_lines', {});
	});
});