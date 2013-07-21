

////////////////////////////////////////////////////////
/////////////////// Global Vars ////////////////////////
////////////////////////////////////////////////////////

// HTML element to draw on, and drawing helper thing
// (still not entirely sure what exactly a context is and why you need it)
var canvas, ctx;

// starting angle of shot
var aimTheta = Math.PI / 4;

// start power of shot
var shotPower = 100;
var MAX_POWER = 250;

// divisor is steps required to get from top to bottom
var aimYSensitivity = (Math.PI / 2) / 40;

// amount to increment power by per keypress
var aimXSensitivity = 6;

// array to store active balls
var activeBalls = new Array();


////////////////////////////////////////////////////////
///////////////////// Classes //////////////////////////
////////////////////////////////////////////////////////

// class to store data on an active ball
function Ball(x, y, r) {
	
	this.x = x;
	this.y = y;
	this.r = r;
	
	this.updateLocation = function(x, y) {
		this.x = x;
		this.y = y;
	};
		
	this.draw = function() {
		drawCircle(this.x, this.y, this.r);
	};
	
}


////////////////////////////////////////////////////////
///////////// Main Application Methods /////////////////
////////////////////////////////////////////////////////

// set everything up
// called on loading
function initialize() {
	
	// initialize canvas and its context
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	
	render();
	
}

// shoot a ball
function toss() {
	
	// create a new ball
	activeBalls[activeBalls.length] = new Ball(0, canvas.height, 12);
	
	render();
}

// capture keyboard input
function checkKeypress(event) {
	
	// see which key was pressed
	switch (event.keyCode) {
	case 0:
		// space
		toss();
		break;
	case 37:
		// left
		if (shotPower - aimXSensitivity > 0) {
			moveAimLine(aimTheta, shotPower - aimXSensitivity);
		}
		break;
	case 38:
		// up
		if (aimTheta + aimYSensitivity < Math.PI / 2) {
			moveAimLine(aimTheta + aimYSensitivity, shotPower);
		}
		break;
	case 39:
		// right
		if (shotPower + aimXSensitivity < MAX_POWER) {
			moveAimLine(aimTheta, shotPower + aimXSensitivity);
		}
		break;
	case 40:
		// down
		if (aimTheta - aimYSensitivity > 0) {
			moveAimLine(aimTheta - aimYSensitivity, shotPower);
		}
		break;
	}
	
}

// draw everything onto the canvas
function render() {
	
	// the order in which these are called determines the layering
	// first --> last :: bottom --> top
	
	// aim line
	drawAimLine();
	
	// active balls
	for (i in activeBalls) {
		activeBalls[i].draw();
	}
	
}


////////////////////////////////////////////////////////
////////////// Drawing Helper Methods //////////////////
////////////////////////////////////////////////////////

// render the line to represent where you're aiming
// x = cos(aimTheta) * shotPower, y = sin(aimTheta) * shotPower
function drawAimLine() {
	
	// draw a new line
	ctx.beginPath();
	ctx.moveTo(0, canvas.height);
	ctx.lineTo(Math.cos(aimTheta) * shotPower, canvas.height - Math.sin(aimTheta) * shotPower);
	
	ctx.strokeStyle = "#FF4400";
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.closePath();
	
}

// overwrite the old aim line and update angle and power values
function moveAimLine(newAimTheta, newShotPower) {
	
	// "erase" the old line by drawing a white one over it
	ctx.beginPath();
	ctx.moveTo(0, canvas.height);
	ctx.lineTo(Math.cos(aimTheta) * shotPower, canvas.height - Math.sin(aimTheta) * shotPower);
	
	ctx.strokeStyle = "#FFFFFF";
	ctx.lineWidth = 2;
	ctx.stroke();
	ctx.closePath();
	
	// set new theta and showPower values
	aimTheta = newAimTheta;
	shotPower = newShotPower;
	
	render();
	
}

// draw a circle at specified coordinates
// currently a filled in black circle
function drawCircle(x, y, r) {
	
	ctx.beginPath();
	ctx.fillStyle = "#000000";
	ctx.arc(x, y, r, 0, Math.PI * 2);
	
	ctx.fill();
	ctx.closePath();
	
}

// output text to bottom of panel
// for debugging
function output(message) {
	
	document.getElementById("console").innerHTML = document.getElementById("console").innerHTML + "<br>" + message;
	
}

