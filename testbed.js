
var canvas, ctx;

var BALL_RADIUS = 100;

var speedL;
var thetaL;
var speedR;
var thetaR;
var thetaC;

var vCL;
var vTL;
var vCR;
var vTR;

var lX;
var lY;
var rX;
var rY;

var postCollisionSpeedL
var postCollisionSpeedR
var postCollisionThetaL;
var postCollisionThetaR;

var finalDXL;
var finalDYL;
var finalDXR;
var finalDYR;

function initialize() {

	// initialize canvas and its context
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	
	document.getElementById("dXL").addEventListener("mousemove", update);
	document.getElementById("dYL").addEventListener("mousemove", update);
	document.getElementById("dXR").addEventListener("mousemove", update);
	document.getElementById("dYR").addEventListener("mousemove", update);
	document.getElementById("thetaC").addEventListener("mousemove", update);
	
	update(null);
	
}


function update(event) {
	
	clearScreen();
	
	// horizontal velocity of left ball
	dXL = document.getElementById("dXL").value;
	// vertical velocity of left ball
	dYL = document.getElementById("dYL").value;
	// horizontal velocity of right ball
	dXR = document.getElementById("dXR").value;
	// vertical velocity of right ball
	dYR = document.getElementById("dYR").value;
	// angle of collision
	// *in the app itself this is determined from location
	thetaC = document.getElementById("thetaC").value;
	
	// draw righthand ball (fixed)
	rX = canvas.width / 2;
	rY = canvas.height / 2;
	drawCircle(rX, rY, BALL_RADIUS, "#800");
	
	// draw lefthand ball (relative)
	lX = BALL_RADIUS * 2 * Math.cos(thetaC) + rX;
	lY = BALL_RADIUS * 2 * Math.sin(thetaC) + rY;
	drawCircle(lX, lY, BALL_RADIUS, "#008");
	
	// draw collision vector
	//drawLine(lX, lY, rX, rY, "#000000");

	// calculate angle of movement prior to collision
	thetaL = Math.atan2(dXL, dYL);
	thetaR = Math.atan2(dXR, dYR);

	// calculate speed prior to collision
	speedL = Math.sqrt(dXL * dXL + dYL * dYL);
	speedR = Math.sqrt(dXR * dXR + dYR * dYR);
	
	// draw velocity vectors prior to collision
	drawLine(lX, lY, speedL * Math.sin(thetaL) + lX, speedL * Math.cos(thetaL) + lY, "#008");
	drawLine(rX, rY, speedR * Math.sin(thetaR) + rX, speedR * Math.cos(thetaR) + rY, "#800");
	
	// velocity in direction of collion
	vCL = speedL * Math.cos(thetaC - thetaL);
	vCR = speedR * Math.cos(thetaC - thetaR);

	// draw velocity vectors in direction of collision
	drawLine(lX, lY, vCL * Math.sin(Math.PI / 2 - thetaC) + lX, vCL * Math.cos(Math.PI / 2 - thetaC) + lY, "#0F0");
	drawLine(rX, rY, vCR * Math.sin(Math.PI / 2 - thetaC) + rX, vCR * Math.cos(Math.PI / 2 - thetaC) + rY, "#AA0");

	// velocity tangental to collision
	vTL = Math.abs(speedL * Math.sin(thetaC - thetaL));
	vTR = Math.abs(speedR * Math.sin(thetaC - thetaR));

	// velocity after collision
	postCollisionSpeedL = Math.sqrt(vCR * vCR + vTL * vTL);
	postCollisionSpeedR = Math.sqrt(vCL * vCL + vTR * vTR);

	postCollisionThetaL = Math.abs(thetaC) - Math.abs(Math.atan2(vTR, vCL));
	postCollisionThetaR = Math.abs(thetaC) - Math.abs(Math.atan2(vTL, vCR));
	
	// component vectors of post collision velocity
	finalDXL = postCollisionSpeedL * Math.cos(postCollisionThetaL);
	finalDYL = postCollisionSpeedL * Math.sin(postCollisionThetaL);
	
	finalDXR = postCollisionSpeedR * Math.cos(postCollisionThetaR);
	finalDYR = postCollisionSpeedR * Math.sin(postCollisionThetaR);

	// draw velocity vectors after collision
	drawLine(rX, rY, finalDXR + rX, finalDYR + rY, "#977");
	drawLine(lX, lY, finalDXL + lX, finalDYL + lY, "#779");
	
	// output variable values
	resetOutput();
	
	output("dXL: " + dXL);
	output("dYL: " + dYL);
	output("dXR: " + dXR);
	output("dYR: " + dYR);
	output("thetaC: " + thetaC);

	output("");
	output("speedL: " + speedL);
	output("thetaL: " + thetaL);
	output("speedR: " + speedR);
	output("thetaR: " + thetaR);
		
	output("");
	output("vCL: " + vCL);
	output("vTL: " + vTL);
	output("vCR: " + vCR);
	output("vTR: " + vTR);

	output("");
	output("postCollisionSpeedL: " + postCollisionSpeedL);
	output("postCollisionSpeedR: " + postCollisionSpeedR);
	output("postCollisionThetaL: " + postCollisionThetaL);
	output("postCollisionThetaR: " + postCollisionThetaR);
	
}

// draw a new line
function drawLine(startX, startY, endX, endY, color) {
	ctx.beginPath();
	ctx.moveTo(startX, startY);
	ctx.lineTo(endX, endY);
	
	ctx.strokeStyle = color;
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.closePath();
}

// draw a circle at specified coordinates
function drawCircle(x, y, r, color) {
	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = 2;
	ctx.arc(x, y, r, 0, Math.PI * 2);
	
	ctx.stroke();
	ctx.closePath();
}

function clearScreen() {
	ctx.beginPath();
	ctx.fillStyle = "#FFF";
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fill();
	ctx.closePath();
}

// output text to bottom of panel
function output(message) {
	document.getElementById("console").innerHTML = document.getElementById("console").innerHTML + "<br>" + message;
}

function resetOutput() {
	document.getElementById("console").innerHTML = "";
}