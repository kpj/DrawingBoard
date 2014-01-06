// general variables
var onthefly_handler = {};

// helper functions
function drawLines(data) {
	var ctx = canvas.getContext("2d");
	
	var oldStrokeStyle = ctx.strokeStyle;
	var oldLineWidth = ctx.lineWidth;

	for(var p in data["data"]) {
		var curLine = data["data"][p];
		var color = data["color"];
		var lineWidth = data["lineWidth"];

		ctx.beginPath();

		ctx.moveTo(curLine[0][0], curLine[0][1]);
		for(var i = 1 ; i < curLine.length ; i++) {
			var curPoint = curLine[i];

			ctx.strokeStyle = color;
			ctx.lineWidth = lineWidth;

			ctx.lineTo(curPoint[0], curPoint[1]);
			ctx.stroke();
		}

		ctx.closePath();
	}

	// restore old settings
	ctx.strokeStyle = oldStrokeStyle;
	ctx.lineWidth = oldLineWidth;
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
	socket.emit(type, {
		'action': 'new_lines', 
		'data': [line], 
		'color': $.cookie("drawingboard"), 
		'lineWidth': canvas.getContext("2d").lineWidth
	});
}


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
	$('#line_width_slider').on('change', function(){
    	canvas.getContext("2d").lineWidth = $('#line_width_slider').val();
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


		var mouseOffsetX = -5;
		var mouseOffsetY = -5;

		var isDown = false;
		
		var sentPointsNum = 0;
		var curPath = [];

		var ontheflyStep = 50; // update every 50 data entries
		var ontheflyClock = 1000; // update every 1000 milliseconds
		var onthefly_update = function() {
			var sender = curPath.slice(sentPointsNum);
			sendLine(sender, "onthefly");
			sentPointsNum += sender.length;
		};
		var onthefly_int = undefined;

		ctx.lineWidth = 5;
								 
		$("#canvas")
		.on('mousedown', function(e) {
			isDown = true;

			ctx.beginPath();
			ctx.moveTo(e.offsetX + mouseOffsetX, e.offsetY + mouseOffsetY);

			// save for other clients
			curPath = [];
			curPath.push([e.offsetX + mouseOffsetX, e.offsetY + mouseOffsetY]);

			// improved updating
			onthefly_int = window.setInterval(onthefly_update, ontheflyClock);
		})
		.on('mousemove', function(e) {
			if(isDown) {
				ctx.lineTo(e.offsetX + mouseOffsetX, e.offsetY + mouseOffsetY);
				ctx.strokeStyle = $.cookie("drawingboard");
				ctx.stroke();

				// same here
				curPath.push([e.offsetX + mouseOffsetX, e.offsetY + mouseOffsetY]);

				// updates on the fly
				if(curPath.length - sentPointsNum >= ontheflyStep) {
					onthefly_update();
				}
			}
		})
		.on('mouseup', function(e) {
			isDown = false;
			sentPointsNum = 0;

			ctx.closePath();

			// broadcast it
			sendLine(curPath, "data");

			if(onthefly_int !== undefined) {
				window.clearInterval(onthefly_int);
			}
		});
	}
});