// init socket io
var socket = io.connect('http://localhost:4242');
socket.on('data', function(command) {
	var action = command["action"];

	if(action == "new_lines") {
		console.log("Got new lines");

		for(var color in command['data']) {
			// translate list into lines
			var ctx = canvas.getContext("2d");
			for(var p in command["data"][color]) {
				var curLine = command["data"][color][p];

				ctx.beginPath();

				ctx.moveTo(curLine[0][0], curLine[0][1]);
				for(var i = 1 ; i < curLine.length ; i++) {
					var curPoint = curLine[i];

					ctx.lineTo(curPoint[0], curPoint[1]);
					ctx.strokeStyle = color;
					ctx.stroke();
				}

				ctx.closePath();
			}
		}
	} else if(action == "clear_lines") {
		console.log("Got clear command");
		document.getElementById("canvas").getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
	}
});
socket.on('counter', function(data) {
	var num = data["number"];
	console.log("Client count: " + num);
	document.getElementById("client_num").innerHTML = num;
});

// init all stuff
$(document).ready(function() {
	// init other elements
	$("#clear_canvas").on('click', function() {
		document.getElementById("canvas").getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
		socket.emit('data', {'action': 'clear_lines'});
	});
	$("#color_change").on('click', function() {
		$.cookie("drawingboard", getRandomColor());
		ctx.strokeStyle = $.cookie("drawingboard");
	});

	var canvas = document.getElementById("canvas");
	// innit canvas
	if(canvas) {
		console.log("Initializing canvas...");

		var ctx = canvas.getContext("2d");


		// set canvas attributes
		$(canvas).attr("width", "500px");
		$(canvas).attr("height", "500px");
		$(canvas).css("width", "500px");
		$(canvas).css("height", "500px");

		if($.cookie("drawingboard") == undefined)
			$.cookie("drawingboard", getRandomColor());


		var isDown = false;

		ctx.lineWidth = 5;
								 
		$("#canvas")
		.on('mousedown', function(e) {
			isDown = true;

			ctx.beginPath();
			ctx.moveTo(e.offsetX, e.offsetY);

			// save for other clients
			curPath = [];
			curPath.push([e.offsetX, e.offsetY]);
		})
		.on('mousemove', function(e) {
			if(isDown) {
				ctx.lineTo(e.offsetX, e.offsetY);
				ctx.strokeStyle = $.cookie("drawingboard");
				ctx.stroke();

				// same here
				curPath.push([e.offsetX, e.offsetY]);
			}
		})
		.on('mouseup', function(e) {
			isDown = false;

			ctx.closePath();

			// broadcast it
			socket.emit('data', {'action': 'new_lines', 'data': [curPath], 'color': $.cookie("drawingboard")});
		});
	}
});