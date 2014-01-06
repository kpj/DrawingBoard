// general variables
var onthefly_handler = {};

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
		setupCanvas();
	}
});