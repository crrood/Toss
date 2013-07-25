

////////////////////////////////////////////////////////
/////////////////// Global Vars ////////////////////////
////////////////////////////////////////////////////////

// HTML element to draw on, and drawing helper thing
// (still not entirely sure what exactly a context is and why you need it)
var canvas, ctx;

// starting angle of shot
var aimTheta = Math.PI / 4;

// starting velocity of shot, in px / s
var shotVelocity = 150;

// maximum shot velocity
var MAX_POWER = 250;

// redraw aimLine?
var redrawAimLine = true;

// gravitational force, in px / s ^ 2 
var gravity = 7;

// divisor is number of steps from top to bottom
var aimYSensitivity = (Math.PI / 2) / 40;

// amount to increment power per keypress
var aimXSensitivity = 6;

// array to store active balls
var activeBalls = new Array();

// variable used to set / clear timeout for rendering
var renderTimer;

// delay between time periods
var renderInterval = 50;

// is time advancing?
var timeActive = false;


////////////////////////////////////////////////////////
///////////////////// Classes //////////////////////////
////////////////////////////////////////////////////////

// class to store data on an active ball
function Ball(x, y, r, dx, dy) {
	
	// location
	this.x = x;
	this.y = y;
	
	// size
	this.r = r;
	
	// velocity
	this.dx = dx;
	this.dy = dy;
	
	output("dx: " + dx);
	output("dy: " + dy);
	
	// set location values
	this.setLocation = function(x, y) {
		this.x = x;
		this.y = y;
	};
	
	// set velocity values
	this.setVelocity = function(dx, dy) {
		this.dx = dx;
		this.dy = dy;
	};
	
	// apply velocity to location
	this.updateLocation = function(redraw) {
		// "erase" the curent ball by overwriting with a white one
		if (redraw && this.isInbounds()) {
			drawCircle(this.x, this.y, this.r + 2, "#FFFFFF");
		}
		
		this.x += this.dx;
		this.y += this.dy;
	};
	
	// apply acceleration due to gravity
	this.applyGravity = function() {
		
		this.dy += gravity * (renderInterval / 1000);
	};
	
	// render the ball at its current coordinates
	this.draw = function() {
		if (this.isInbounds()) {
			drawCircle(this.x, this.y, this.r, "#000000");
		}
	};
	
	// is the ball onscreen?
	this.isInbounds = function() {
		return (this.x + this.r > 0 && this.x - this.r < canvas.width && 
			this.y + this.r > 0 && this.y - this.r < canvas.height);
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
	
	// capture input
	document.getElementById("body").addEventListener("keydown", checkKeypress);
	
	render();
	
}

// shoot a ball
function toss() {
	
	// create a new ball
	activeBalls[activeBalls.length] = new Ball(0, canvas.height, 12, 
		// dx = cos(theta) * (velocity * (renders per second))), dy use sin
		Math.cos(aimTheta) * (shotVelocity * (renderInterval / 1000)), - Math.sin(aimTheta) * (shotVelocity * (renderInterval / 1000)));
	
	render();
}

// capture keyboard input
function checkKeypress(event) {
	
	// special case to reload page
	if (event.ctrlKey && event.keyCode == 82) {
		return;
	}
	
	// prevent keypress from moving the screen around
	event.preventDefault();
	
	// see which key was pressed
	switch (event.keyCode) {
	case 32:
		// space
		toss();
		break;
	case 37:
		// left
		if (shotVelocity - aimXSensitivity > 0) {
			moveAimLine(aimTheta, shotVelocity - aimXSensitivity);
		}
		break;
	case 38:
		// up
		if (aimTheta + aimYSensitivity < Math.PI / 2) {
			moveAimLine(aimTheta + aimYSensitivity, shotVelocity);
		}
		break;
	case 39:
		// right
		if (shotVelocity + aimXSensitivity < MAX_POWER) {
			moveAimLine(aimTheta, shotVelocity + aimXSensitivity);
		}
		break;
	case 40:
		// down
		if (aimTheta - aimYSensitivity > 0) {
			moveAimLine(aimTheta - aimYSensitivity, shotVelocity);
		}
		break;
	case 71:
		// g
		startTime();
		break;
	case 83:
		// s
		stopTime();
		break;
	}
	
}


////////////////////////////////////////////////////////
//////////////// Rendering Methods /////////////////////
////////////////////////////////////////////////////////

// draw everything onto the canvas
function render() {
	
	// the order in which these are called determines the layering
	// first --> last :: bottom --> top
	
	// aim line
	if (redrawAimLine) {
		drawAimLine();
		redrawAimLine = false;
	}
	
	// active balls
	for (var i in activeBalls) {
		activeBalls[i].draw();
	}
	
}

// move everything as it should
function advanceTime() {
	
	for (var i in activeBalls) {
		activeBalls[i].applyGravity();
		activeBalls[i].updateLocation(true);
	}
	
	render();
	
}

// activate the render timer
function startTime(event) {
	
	if (!timeActive) {
		renderTimer = setInterval(function() { advanceTime(); }, renderInterval);
	}
	timeActive = true;
	
}

// pause the render timer
function stopTime(event) {
	
	if (timeActive) {
		clearInterval(renderTimer);
	}
	timeActive = false;
	
}


////////////////////////////////////////////////////////
////////////// Drawing Helper Methods //////////////////
////////////////////////////////////////////////////////

// render the line to represent where you're aiming
// x = cos(aimTheta) * shotVelocity, y = sin(aimTheta) * shotVelocity
function drawAimLine() {
	
	// draw a new line
	ctx.beginPath();
	ctx.moveTo(0, canvas.height);
	ctx.lineTo(Math.cos(aimTheta) * shotVelocity, canvas.height - Math.sin(aimTheta) * shotVelocity);
	
	ctx.strokeStyle = "#FF4400";
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.closePath();
	
}

// overwrite the old aim line and update angle and power values
function moveAimLine(newAimTheta, newshotVelocity) {
	
	// "erase" the old line by drawing a white one over it
	// slightly larger to prevent rounding artifacts
	ctx.beginPath();
	ctx.moveTo(0, canvas.height);
	ctx.lineTo(Math.cos(aimTheta) * (shotVelocity + 2), canvas.height - Math.sin(aimTheta) * (shotVelocity + 2));
	
	ctx.strokeStyle = "#FFFFFF";
	ctx.lineWidth = 3;
	ctx.stroke();
	ctx.closePath();
	
	// set new theta and showPower values
	aimTheta = newAimTheta;
	shotVelocity = newshotVelocity;
	
	// redraw the line
	redrawAimLine = true;
	
	render();
	
}

// draw a circle at specified coordinates
// currently a filled in black circle
function drawCircle(x, y, r, color) {
	
	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.arc(x, y, r, 0, Math.PI * 2);
	
	ctx.fill();
	ctx.closePath();
	
	// re-render the aimLine in case the circle overlapped it
	redrawAimLine = true;
	
}

// output text to bottom of panel
// for debugging
function output(message) {
	
	document.getElementById("console").innerHTML = document.getElementById("console").innerHTML + "<br>" + message;
	
}

