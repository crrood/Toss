

// HTML element to draw on, and drawing helper thing
// (still not entirely sure what exactly a context is and why you need it)
var canvas, ctx;

// starting angle of shot
var aimTheta = Math.PI / 4;

// start power of shot
var shotPower = 100;
var MAX_POWER = 250;

// divisor is steps required to get from top to bottom
var aimYSensitivity = (Math.PI / 2) / 20;

// amount to increment power by per keypress
var aimXSensitivity = 4;

// set everything up
// called on loading
function initialize() {
	
	// start initialize method
	output("init method begin");
	
	// initialize canvas and its context
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	output("canvas initialized");
	
	// render aiming line
	drawAimLine(aimTheta, shotPower);
	
	// initialize method complete
	output("init method end");
	
}

// render the line to represent where you're aiming
// x = cos(aimTheta) * shotPower, y = sin(aimTheta) * shotPower
function drawAimLine(newAimTheta, newShotPower) {
	
	// switch globalCompositeOperation to overwrite previous image
	ctx.globalCompositeOperation = "copy";
	
	// "erase" the old line by drawing a white one over it
	ctx.beginPath();
	ctx.moveTo(0, canvas.height);
	ctx.lineTo(Math.cos(aimTheta) * shotPower, canvas.height - Math.sin(aimTheta) * shotPower);
	
	ctx.strokeStyle = "#000000";
	ctx.stroke();
	ctx.closePath();
	
	// draw a new line
	ctx.beginPath();
	ctx.moveTo(0, canvas.height);
	ctx.lineTo(Math.cos(newAimTheta) * newShotPower, canvas.height - Math.sin(newAimTheta) * newShotPower);
	
	ctx.strokeStyle = "#FF4400";
	ctx.stroke();
	ctx.closePath();
	
	// set new theta and showPower values
	aimTheta = newAimTheta;
	shotPower = newShotPower;
	
}

// capture keyboard input
function checkKeypress(event) {
	
	// see which key was pressed
	switch (event.keyCode) {
	case 37:
		// left
		if (shotPower - aimXSensitivity > 0) {
			drawAimLine(aimTheta, shotPower - aimXSensitivity);
		}
		break;
	case 38:
		// up
		if (aimTheta + aimYSensitivity < Math.PI / 2) {
			drawAimLine(aimTheta + aimYSensitivity, shotPower);
		}
		break;
	case 39:
		// right
		if (shotPower + aimXSensitivity < MAX_POWER) {
			drawAimLine(aimTheta, shotPower + aimXSensitivity);
		}
		break;
	case 40:
		// down
		if (aimTheta - aimYSensitivity > 0) {
			drawAimLine(aimTheta - aimYSensitivity, shotPower);
		}
		break;
	}
	
}

// output text to bottom of panel
// for debugging
function output(message) {
	document.getElementById("console").innerHTML = document.getElementById("console").innerHTML + "<br>" + message;
}

