var server = require("./server");
var app = server.start();

var io = require('socket.io').listen(app);


var current_image = [];

io.sockets.on('connection', function (socket) {
	socket.emit('data', {'action': 'new_lines', 'data': current_image});

	socket.on('data', function(command) {
		var action = command["action"];

		if(action == "new_lines") {
			for(var p in command['data']) {
				var line = command['data'][p];
				current_image.push(line);
			}

			socket.broadcast.emit('data', {'action': 'new_lines', 'data': command['data']});
			console.log(current_image.length);
		} else if(action == "clear_lines") {
			console.log("Clearing image...");

			current_image = [];
			socket.broadcast.emit('data', {'action': 'clear_lines'});	
		}
	});
});