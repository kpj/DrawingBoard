function setupCanvas() {
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