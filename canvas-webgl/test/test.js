function test_webgl(test) {
	var canvas = document.createElement('canvas');
	canvas.setAttribute("style", "border-style: solid; border-width: 5px; margin:5px");
	canvas.width = 300;
	canvas.height = 300;
	ctx = canvas.getContext('webgl-2d');
	document.body.appendChild(canvas);
	test(ctx, canvas);
}

function test_canvas(test) {
	var canvas = document.createElement('canvas');
	canvas.setAttribute("style", "border-style: solid; border-width: 5px; margin:5px");
	canvas.width = 300;
	canvas.height = 300;
	ctx = canvas.getContext('2d');
	document.body.appendChild(canvas);
	test(ctx, canvas);
}

function do_test(test) {
	test_canvas(test);
	test_webgl(test);
	document.body.appendChild(document.createElement('br'));
}

window.onload = function() {
	do_test(function(ctx, canvas) {
		var image = document.getElementById("source");
		ctx.drawImage(image, 0, 0, 100, 100, 0, 0, 100, 100);
		
		var data = ctx.getImageData(0,0,100,100);
		ctx.putImageData(data, 100, 100);
		
	});	
}