

////////////////////////////////////////////////////////
/////////////////// Global Vars ////////////////////////
////////////////////////////////////////////////////////

// HTML element to draw on, and drawing helper thing
// (still not entirely sure what exactly a context is and why you need it)
var canvas, ctx;

// starting angle of shot: 0 = flat, pi / 2 = straight up
var aimTheta = Math.PI / 4;

// starting velocity of shot, in px / s
var shotVelocity = 150;

// multiply base velocity by this to speed everything up
var VELOCITY_MODIFIER = 1.7;

// maximum shot velocity
var MAX_POWER = 250;

// redraw aimLine?
var redrawAimLine = true;

// divisor is number of steps from top to bottom
var aimYSensitivity = (Math.PI / 2) / 40;

// amount to increment power per keypress
var aimXSensitivity = 6;

// does gravity have an effect
var gravityOn = true;

// gravitational force, in px / s ^ 2
var gravity = 170;

// array to store active balls
var activeBalls = new Array();

// size of balls
var BALL_RADIUS = 12;

// balls bounce off the walls
var ballBounce = true;

// balls bounce off each other
var wallBounce = true;

// how bouncy are the balls
var elasticity = .6;

// is time advancing?
var timeActive = false;

// variable used to set / clear timeout for rendering
var renderTimer;

// delay between redraws / evaluations, in ms
// this is adjusted for the keep speed constant per second
// = 1000 / fps
var renderInterval = 15;


////////////////////////////////////////////////////////
///////////////////// Classes //////////////////////////
////////////////////////////////////////////////////////

// class to store data on an active ball
function Ball(x, y, r, dx, dy, index) {
	
	// location
	this.x = x;
	this.y = y;
	
	// size
	this.r = r;
	
	// velocity
	this.dx = dx * VELOCITY_MODIFIER;
	this.dy = dy * VELOCITY_MODIFIER;
	
	// location in array
	this.index = index;
	
	// set location values
	this.setLocation = function(x, y) {
		this.x = x;
		this.y = y;
	};
	
	// set velocity values
	this.setComponentVelocity = function(dx, dy) {
		this.dx = dx;
		this.dy = dy;
	};
	
	// calculate non-directional speed
	this.speed = function() {
		return Math.sqrt(this.dx * this.dx + this.dy * this.dy);
	};
	
	// calculate 
	
	// apply velocity to location
	this.updateLocation = function(redraw) {
		// "erase" the curent ball by overwriting with a white one
		if (redraw) {
			drawCircle(this.x, this.y, this.r + 2, "#FFFFFF");
		}
		
		// update x and y, accounting for length time between renders
		this.x += this.dx * (renderInterval / 1000);
		this.y += this.dy * (renderInterval / 1000);
		
		// make sure the ball is still onscreen
		if (this.x + this.r < 0 || this.x - this.r > canvas.width || this.y + this.r < 0 || this.y - this.r > canvas.height) {
			this.remove();
		}
		
	};
	
	// apply acceleration due to gravity
	this.applyGravity = function() {
		this.dy += gravity * (renderInterval / 1000);
	};
	
	// render the ball at its current coordinates
	this.draw = function() {
		drawCircle(this.x, this.y, this.r, "#000000");
	};
	
	// reverse direction at borders of canvas
	this.checkWallBounce = function() {
		if (this.x - this.r < 0) {
			this.dx = -this.dx * elasticity;
			this.x = this.r;
		}
		else if(this.x + this.r > canvas.width) {
			this.dx = -this.dx * elasticity;
			this.x = canvas.width - this.r;
		}
		
		if (this.y - this.r < 0) {
			this.dy = -this.dy * elasticity;
			this.y = this.r;
		}
		else if( this.y + this.r > canvas.height) {
			this.dy = -this.dy * elasticity;
			this.y = canvas.height - this.r;
		}
	};
	
	// calculate distance (in px) to another Ball using Pythagorean theorem
	this.distanceTo = function(otherBall) {
		var xDiff = Math.abs(this.x - otherBall.x);
		var yDiff = Math.abs(this.y - otherBall.y);
		return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
	};
	
	// remove reference from activeBalls array
	this.remove = function() {
		// special case for only ball in array
		if (activeBalls.length == 1) {
			activeBalls[0] = null;
		}
		else {
			// shift all the other balls down one, over the ball getting removed
			for (var i = this.index; i < activeBalls.length - 1; i++) {
				activeBalls[i] = activeBalls[i + 1];
				activeBalls[i].index = i;
			}
			// set the final reference to null
			activeBalls[activeBalls.length - 1] = null;
		}
		// update array length property
		activeBalls.length--;
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
	
	// capture keyboard input
	document.getElementById("body").addEventListener("keydown", checkKeypress);
	
	// set up event listeners for simulation parameters
	document.getElementById("toggleWallBounce").addEventListener("change", toggleWallBounce);
	document.getElementById("toggleBallBounce").addEventListener("change", toggleBallBounce);
	document.getElementById("startTime").addEventListener("click", startTime);
	document.getElementById("stopTime").addEventListener("click", stopTime);
	document.getElementById("toggleGravity").addEventListener("click", toggleGravity);
	document.getElementById("elasticityParam").addEventListener("change", updateElasticity);
	
	// initialize parameter values
	gravityOn = document.getElementById("toggleGravity").checked;
	wallBounce = document.getElementById("toggleWallBounce").checked;
	ballBounce = document.getElementById("toggleBallBounce").checked;
	elasticity = document.getElementById("elasticityParam").value;
	
	render();
	
}

// shoot a ball
function toss() {
	
	// create a new ball
	activeBalls[activeBalls.length] = new Ball(BALL_RADIUS, canvas.height - BALL_RADIUS, BALL_RADIUS, 
		// dx = cos(theta) * velocity, dy = sin(theta) * velocity
		Math.cos(aimTheta) * shotVelocity, - Math.sin(aimTheta) * shotVelocity, activeBalls.length);
	
	render();
	
}


////////////////////////////////////////////////////////
///////////////// HTML Input Methods ///////////////////
////////////////////////////////////////////////////////

// capture keyboard input
function checkKeypress(event) {
	
	// don't capture keypress if the control key is down
	// so that you can execute browser commands like reloading
	if (event.ctrlKey) {
		return;
	}
	
	// don't capture input when a parameter input field is focused
	if (document.activeElement.id.indexOf("Param") != -1) {
		
		// prevent return key from reloading page
		if (event.keyCode == 13) {
			event.preventDefault();
		}
		
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
	case 84:
		// t
		stopBalls();
		break;
	}
	
}

function toggleGravity(event) {
	gravityOn = !gravityOn;
	
	// reset focus to prevent keyboard input from toggling parameter
	document.getElementById("toggleGravity").blur();
}

function toggleWallBounce(event) {
	wallBounce = !wallBounce;
	
	// reset focus to prevent keyboard input from toggling parameter
	document.getElementById("toggleWallBounce").blur();
}

function toggleBallBounce(event) {
	ballBounce = !ballBounce;
	
	// reset focus to prevent keyboard input from toggling parameter
	document.getElementById("toggleBallBounce").blur();
}

function updateElasticity(event) {
	elasticity = document.getElementById("elasticityParam").value;
}


////////////////////////////////////////////////////////
//////////////// Debugging Methods /////////////////////
////////////////////////////////////////////////////////
function stopBalls() {
	for (var i in activeBalls) {
		activeBalls[i].setComponentVelocity(0, 0);
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
	
	// render balls
	for (var i in activeBalls) {
		activeBalls[i].draw();
	}
	
}

// move everything as it should
function advanceTime() {
	
	// HACK to keep from counting collisions twice
	collided = false;
	
	for (var i in activeBalls) {
		
		// account for acceleration due to gravity
		if (gravityOn) {
			activeBalls[i].applyGravity();
		}
				
		// check for balls bouncing off the walls
		if (wallBounce) {
			activeBalls[i].checkWallBounce();
		}
		
		
		// check for balls bouncing off each other
		if (ballBounce) {
			for (var j in activeBalls) {
				// HACK HACK HACK
				if (!collided && i != j && activeBalls[i].distanceTo(activeBalls[j]) < activeBalls[i].r + activeBalls[j].r) {
					
					// TODO change the timer architecture to make sure collisions don't get counted twice
					
					// HACK HACK HACK
					collided = true;
					
					// find leftmost and rightmost balls to guarantee quadrants
					var leftmostX = Math.min(activeBalls[i].x, activeBalls[j].x);
					
					// pointers to Ball objects
					var ballL, ballR;
					if (activeBalls[i].x == leftmostX) {
						ballL = activeBalls[i];
						ballR = activeBalls[j];
					}
					else {
						ballL = activeBalls[j];
						ballR = activeBalls[i];
					}
					
					output("speedL: " + ballL.speed());
					output("ballL.dx: " + ballL.dx);
					output("ballL.dy: " + ballL.dy);
					output("speedR: " + ballR.speed());
					output("ballR.dx: " + ballR.dx);
					output("ballR.dy: " + ballR.dy);
					output("");
					
					// angle of incoming velocity vector
					/*
					output("isNaN preCollisionTheta: " + isNaN(ballL.dy / ballL.dx) || isNaN(ballR.dy / ballR.dx));
					var thetaL = isNaN(ballL.dy / ballL.dx) ? 0 : Math.atan(ballL.dy / ballL.dx);
					var thetaR = isNaN(ballR.dy / ballR.dx) ? 0 : Math.atan(ballR.dy / ballR.dx);
					*/
					// negative to adjust for fucked up JS coordinate system
					var thetaL = Math.atan2(ballL.dx, -ballL.dy);
					var thetaR = Math.atan2(ballR.dx, -ballR.dy);
					output("thetaL: " + thetaL);
					output("thetaR: " + thetaR);
					
					// angle of collision
					//var thetaC = Math.atan((ballL.y - ballR.y) / (ballL.x - ballR.x));
					// reversed to adjust for fucked up JS coordinate system
					var thetaC = Math.atan2(ballR.x - ballL.x, ballL.y - ballR.y);
					output("thetaC: " + thetaC);
					
					// velocity in direction of collion
					var vCR = ballR.speed() * Math.cos(thetaC - thetaR);
					var vCL = ballL.speed() * Math.cos(thetaC - thetaL);
					
					// velocity tangental to collision
					var vTL = Math.abs(ballL.speed() * Math.sin(thetaC - thetaL));
					var vTR = Math.abs(ballR.speed() * Math.sin(thetaC - thetaR));
					
					output("");
					output("vCL: " + vCL);
					output("vTL: " + vTL);
					output("vCR: " + vCR);
					output("vTR: " + vTR);
					
					// calculate outgoing speed
					var postCollisionSpeedL = Math.sqrt(vCR * vCR + vTL * vTL);
					var postCollisionSpeedR = Math.sqrt(vCL * vCL + vTR * vTR);
					
					output("postCollisionSpeedL: " + postCollisionSpeedL);
					output("postCollisionSpeedR: " + postCollisionSpeedR);
					output("");
					
					// outgoing angle
					/*
					output("isNaN(postCollisionTheta): " + (isNaN(vCL / vTR) || isNaN(vCR / vTL)));
					var postCollisionThetaL = isNaN(vCL / vTR) ? thetaC : Math.abs(thetaC) - Math.abs(Math.atan(vCL / vTR));
					var postCollisionThetaR = isNaN(vCR / vTL) ? thetaC : Math.abs(thetaC) - Math.abs(Math.atan(vCR / vTL));
					*/
					var postCollisionThetaL = thetaC - Math.atan2(vTR, vCL);
					var postCollisionThetaR = thetaC - Math.atan2(vTL, vCR);

					output("postCollisionThetaL: " + postCollisionThetaL);
					output("postCollisionThetaR: " + postCollisionThetaR);
					
					// component vectors of post collision velocity
					var finalDXL = postCollisionSpeedL * Math.cos(postCollisionThetaL);
					var finalDYL = postCollisionSpeedL * Math.sin(postCollisionThetaL);
					
					var finalDXR = postCollisionSpeedR * Math.cos(postCollisionThetaR);
					var finalDYR = postCollisionSpeedR * Math.sin(postCollisionThetaR);
					
					// if (postCollisionThetaL > 0 && postCollisionThetaL < Math.PI / 2) {
						// finalDXL = Math.abs(finalDXL);
						// finalDYL = -Math.abs(finalDYL);
					// }
					// else if (postCollisionThetaL < 0 && postCollisionThetaL > - Math.PI / 2) {
						// finalDXL = Math.abs(finalDXL);
						// finalDYL = Math.abs(finalDYL);
					// }
					// else if (postCollisionThetaL > 0 && postCollisionThetaL > Math.PI / 2) {
						// finalDXL = -Math.abs(finalDXL);
						// finalDYL = Math.abs(finalDYL);
					// }
					// else if (postCollisionThetaL < 0 && postCollisionThetaL < - Math.PI / 2) {
						// finalDXL = -Math.abs(finalDXL);
						// finalDYL = -Math.abs(finalDYL);
					// }
					
					// if (postCollisionThetaR > 0 && postCollisionThetaR < Math.PI / 2) {
						// finalDXR = Math.abs(finalDXR);
						// finalDYR = -Math.abs(finalDYR);
					// }
					// else if (postCollisionThetaR < 0 && postCollisionThetaR > - Math.PI / 2) {
						// finalDXR = Math.abs(finalDXR);
						// finalDYR = Math.abs(finalDYR);
					// }
					// else if (postCollisionThetaR > 0 && postCollisionThetaR > Math.PI / 2) {
						// finalDXR = -Math.abs(finalDXR);
						// finalDYR = Math.abs(finalDYR);
					// }
					// else if (postCollisionThetaR < 0 && postCollisionThetaR < - Math.PI / 2) {
						// finalDXR = -Math.abs(finalDXR);
						// finalDYR = -Math.abs(finalDYR);
					// }
					
					output("");
					
					output("finalDXL: " + finalDXL);
					output("finalDYL: " + finalDYL);
					output("Math.atan(vCL / vTR): " + Math.atan(vCL / vTR));
					output("");
					output("finalDXR: " + finalDXR);
					output("finalDYR: " + finalDYR);
					output("Math.atan(vCR / vTL): " + Math.atan(vCR / vTL));
					output("");
					
					// update the ball values
					ballL.setComponentVelocity(finalDXL, finalDYL);
					ballR.setComponentVelocity(finalDXR, finalDYR);
					
					//ballL.updateLocation(false);
					//ballR.updateLocation(false);
					
					output("finalSpeedL: " + ballL.speed());
					output("finalSpeedR: " + ballR.speed());
					
					output("-------------------------------------");
					
				}
			}
		}
		
		// update ball's x and y values and redraw
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
	
	// reset focus to prevent keyboard input from toggling parameter
	document.getElementById("startTime").blur();
	
}

// pause the render timer
function stopTime(event) {
	
	if (timeActive) {
		clearInterval(renderTimer);
	}
	timeActive = false;
	
	// reset focus to prevent keyboard input from toggling parameter
	document.getElementById("stopTime").blur();
	
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

