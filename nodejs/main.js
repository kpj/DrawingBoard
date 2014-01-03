var server = require("./server");
var app = server.start();

var io = require('socket.io').listen(app);


var current_image = {};

io.sockets.on('connection', function (socket) {
	socket.emit('data', {'action': 'new_lines', 'data': current_image});

	socket.on('data', function(command) {
		var action = command["action"];

		if(action == "new_lines") {
			var col = command['color'];

			for(var p in command['data']) {
				var line = command['data'][p];

				if(current_image[col] === undefined)
					current_image[col] = [];
				current_image[col].push(line);
			}

			var sendMe = {};
			sendMe[col] = command['data'];
			socket.broadcast.emit('data', {'action': 'new_lines', 'data': sendMe});
		} else if(action == "clear_lines") {
			console.log("Clearing image...");

			current_image = {};
			socket.broadcast.emit('data', {'action': 'clear_lines'});	
		}
	});
});