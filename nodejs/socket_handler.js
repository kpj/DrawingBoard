var fs = require("fs");


// general variables
var current_image = [];
var client_count = 0;

// handle shutdown
function gracefulExit() {
	// clean up, save data
	if(!fs.existsSync("tmp"))
		fs.mkdirSync("tmp");
	fs.writeFileSync("tmp/data.drb", JSON.stringify(current_image));

	console.log("Saved data, exiting...");

	// handle actual exit
	process.removeListener('exit', gracefulExit);
	process.exit();
};
process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit).on('exit', gracefulExit);


// sends data to clients
function tell_clients(socket, command) {
	var res = [];
	for(var p in command['data']) {
		var sendMe = {};

		sendMe['line'] = command['data'][p];
		sendMe['properties'] = command['properties'];

		res.push(sendMe);
	}
	socket.broadcast.emit('onthefly', {'action': 'new_lines', 'data': res, 'owner': socket.id});
}

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
			// save to own data structure
			for(var p in command['data']) {
				// command['data'] == list of lines
				var line = command['data'][p];

				var entry = {};
				entry['line'] = line;
				entry['properties'] = command['properties'];
				current_image.push(entry);
			}

			// broadcast changes
			tell_clients(socket, command);
		} else if(action == "clear_lines") {
			console.log("Clearing image...");

			current_image = [];
			socket.broadcast.emit('data', {'action': 'clear_lines'});	
		}
	});

	// smoother drawing (onthefly)
	socket.on('onthefly', function(command) {
		tell_clients(socket, command);
	});

	// handle disconnects
	socket.on('disconnect', function() {
        console.log('Client disconnected');
        client_count--;
        socket.broadcast.emit('counter', {'number': client_count});
    });
}


function implement(ios) {
	if(fs.existsSync("tmp/data.drb"))
		current_image = JSON.parse(fs.readFileSync("tmp/data.drb"));

	io = ios;
	io.sockets.on('connection', onConnection);
}

exports.implement = implement;