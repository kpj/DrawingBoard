function setupCanvas(canvas) {
	var ctx = canvas.getContext("2d");

	// transmitter functions
	function pointerDown(ctx, offsetX, offsetY) {
		isDown = true;
	
		ctx.beginPath();
		ctx.moveTo(offsetX + mouseOffsetX, offsetY + mouseOffsetY);
	
		// save for other clients
		curPath = [];
		curPath.push([offsetX + mouseOffsetX, offsetY + mouseOffsetY]);
	
		// improved updating
		onthefly_int = window.setInterval(onthefly_update, ontheflyClock);
	}
	
	function pointerMove(ctx, offsetX, offsetY) {
		if(isDown) {
			ctx.lineTo(offsetX + mouseOffsetX, offsetY + mouseOffsetY);
			ctx.strokeStyle = $.cookie("drawingboard");
			ctx.stroke();
	
			// same here
			curPath.push([offsetX + mouseOffsetX, offsetY + mouseOffsetY]);
	
			// updates on the fly
			if(curPath.length - sentPointsNum >= ontheflyStep) {
				onthefly_update();
			}
		}
	}
	
	function pointerUp(ctx) {
		isDown = false;
		sentPointsNum = 0;
	
		ctx.closePath();
	
		// broadcast it
		sendLine(curPath, "data");
	
		if(onthefly_int !== undefined) {
			window.clearInterval(onthefly_int);
		}
	}

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
	
	// handle mouse events						 
	$("#canvas")
	.on('mousedown', function(e) { pointerDown(ctx, e.offsetX, e.offsetY) })
	.on('mousemove', function(e) { pointerMove(ctx, e.offsetX, e.offsetY) })
	.on('mouseup', function(e) { pointerUp(ctx) });

	// handle touch events
	$("#canvas")
	.on('touchstart', function(e) {
		e.preventDefault();
		var touch = e.originalEvent.changedTouches[0];
		var offset = $('#canvas').offset();
		pointerDown(ctx, touch.clientX - offset.left, touch.clientY - offset.top);
	})
	.on('touchmove', function(e) {
		e.preventDefault();
		var touch = e.originalEvent.changedTouches[0];
		var offset = $('#canvas').offset();
		pointerMove(ctx, touch.clientX - offset.left, touch.clientY - offset.top);
	})
	.on('touchend', function(e) { pointerUp(ctx) })
	.on('touchcancel', function(e) { pointerUp(ctx) });
}
