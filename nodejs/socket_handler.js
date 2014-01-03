// general variables
var current_image = {};
var client_count = 0;


// executed on socket connection
function onConnection(socket) {
	// update counter
	client_count++;
	io.sockets.emit('counter', {'number': client_count});

	// send current state
	socket.emit('data', {'action': 'new_lines', 'data': current_image});

	// handle canvas updates
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

	// handle disconnects
	socket.on('disconnect', function() {
        console.log('Client disconnected');
        client_count--;
        socket.broadcast.emit('counter', {'number': client_count});
    });
}


function implement(ios) {
	io = ios;
	io.sockets.on('connection', onConnection);
}

exports.implement = implement;