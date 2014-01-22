// helper functions
function drawLines(data) {
	var ctx = canvas.getContext("2d");

	for(var p in data) {
		var curEntry = data[p];

		// create backup
		var backup = {};
		for(var key in curEntry["properties"]) {
			backup[key] = ctx[key];
		}

		var curLine = curEntry["line"];
		if(curLine.length == 0)
			continue;

		var props = {};
		for(var key in curEntry["properties"]) {
			props[key] = curEntry["properties"][key];
		}

		var path = new paper.Path();

		ctx.moveTo(curLine[0][0], curLine[0][1]);
		for(var i = 1 ; i < curLine.length ; i++) {
			var curPoint = curLine[i];

			// set properties
			for(var key in curEntry["properties"]) {
				//path[key] = props[key];
			}

			path.add(new paper.Point(curPoint[0], curPoint[1]));
		}

		path.simplify(10);
		path.smooth();

		// restore old settings
		for(var key in curEntry["properties"]) {
			ctx[key] = backup[key];
		}
	}
}

// image data
socket.on('data', function(command) {
	var action = command["action"];

	if(action == "new_lines") {
		console.log("Got new lines");
		drawLines(command["data"]);
	} else if(action == "clear_lines") {
		console.log("Got clear command");
		document.getElementById("canvas").getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
	}
});

// handle client counter
socket.on('counter', function(data) {
	var num = data["number"];
	console.log("Client count: " + num);
	document.getElementById("client_num").innerHTML = num;
});

// handle reconnect
socket.on('reconnecting', function() {
	console.log("Lost connection, trying to reconnect");
});

// handle life updates
socket.on('onthefly', function(command) {
	var id = command["owner"];

	// draw line
	drawLines(command["data"]);
});


// helper functions
function sendLine(line, type) {
	if(type == "data") {
		var path = new paper.Path();
		path.strokeColor = $.cookie("drawingboard");
		path.strokeWidth = $("#canvas")[0].getContext("2d").lineWidth;

		for(var p in line) {
			var point = line[p];
			path.add(new paper.Point(point[0], point[1]));
		}

		path.simplify(10);
		path.smooth();
	}

	socket.emit(type, {
		'action': 'new_lines',
		'data': [line],
		'properties': {
			'strokeStyle': $.cookie("drawingboard"), 
			'lineWidth': $("#canvas")[0].getContext("2d").lineWidth,
		}
	});
}
