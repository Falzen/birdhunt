/* * * * * * * * * * * * * * * * * * * * * * * * * * * 
utils: 
https://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow
https://patorjk.com/software/taag/#p=display&f=Doom
http://keycode.info/

BACKLOG:
- 
- 

TODO:
- 
- 



* * * * * * * * * * * * * * * * * * * * * * * * * * */

const FRAMERATE = 60;
var canvas, ctx, CANVAS_HEIGHT, CANVAS_WIDTH, canvasMinX, canvasMaxX, canvasMinY, canvasMaxY, intervalId, player, backgroundColor;
var bordersPadding = 6;
var leftDown, upDown, rightDown, downDown;
var isFire, isSpeed;
var settings = {
	enemySpawnRate: 30,
	enemySpawnRateCpt: 0
}
var thePlayer = {
	x : 200,
	y : 250,
	w : 35,
	h : 35,
	speed: 6,
	originalSpeed: 6,
	originalColor: 'aquamarine',
	color: 'aquamarine',
	fireCooldown: (FRAMERATE / 10),
	fireCooldownCpt: 0,
	shieldColor: 'green',
	dashEnergyMax: 500,
	dashEnergy: 400,
	dashRefreshRate: 1,
	currentMissileType: 'physical',
	currentArmorType: 'physical'
};
var directionsBykeyCodes = {
	90: 'up', // z
	81: 'left', // q
	83: 'down', // s
	68: 'right', // d
	//
	38: 'up', // arrow up
	37: 'left', // arrow left
	40: 'down', // arrow down
	39: 'right', // arrow right
}
var acionsBykeyCodes = {
	79: 'fire', // o
	32: 'speed', // SPACEBAR
}

var enemies = [];
var enemyStats = {
	r: 25,
	mysticalColor: 'rgba(128,0,128,0.3)',
	physicalColor: 'rgba(128,128,128,0.5)',
	speeds: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,4]

}

function makeEnemy() {
	let enemyType = Math.random() > 0.5 ? 'physical' : 'mystical';
	return enemyData = {
		x: getRandomInt(enemyStats.r, (canvasMaxX) - enemyStats.r),
		y: 30,
		r: enemyStats.r,
		speed: enemyStats.speeds[getRandomInt(0, enemyStats.speeds.length-1)],
		type: {
			name: enemyType
		},
		color: enemyType == 'physical' ? enemyStats.physicalColor : enemyStats.mysticalColor
	}
}
function drawEnemy(data) {
	drawCircle(data.x, data.y, data.r, data.color);
}
function drawEnemies() {
	for (let i = 0; i < enemies.length; i++) {
		const data = enemies[i];
		drawEnemy(data);
	}
}


/*
██╗  ███╗   ██╗  ██╗ ████████╗
██║  ████╗  ██║  ██║ ╚══██╔══╝
██║  ██╔██╗ ██║  ██║    ██║   
██║  ██║╚██╗██║  ██║    ██║   
██║  ██║ ╚████║  ██║    ██║   
╚═╝  ╚═╝  ╚═══╝  ╚═╝    ╚═╝   
*/

function init() {
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	CANVAS_HEIGHT = canvas.height;
	CANVAS_WIDTH = canvas.width;
	backgroundColor = '#303030';

	// canvas left edges
	canvasMinX = 0;
	canvasMaxX = canvasMinX + CANVAS_WIDTH;
	canvasMinY = 0;
	canvasMaxY = canvasMinY + CANVAS_HEIGHT;

	// main loop
	mainLoop();

	// events listeners
	document.addEventListener('keydown', onKeyDown);
	document.addEventListener('keyup', onKeyUp);
	// canvas.addEventListener('mousemove', onMouseMove);



}



/*
██████╗ ██████╗  █████╗ ██╗    ██╗
██╔══██╗██╔══██╗██╔══██╗██║    ██║
██║  ██║██████╔╝███████║██║ █╗ ██║
██║  ██║██╔══██╗██╔══██║██║███╗██║
██████╔╝██║  ██║██║  ██║╚███╔███╔╝
╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚══╝╚══╝ 
*/

function drawCircle(x,y,r,color) {
	if (color == null || color == '') {
		color = 'white';
	}

	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI*2, true);
	ctx.closePath();
	ctx.fill();
	ctx.fillStyle = null;
}
function drawRectangle(x,y,w,h,color) {
	if (color == null || color == '') {
		color = 'white';
	}
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.rect(x,y,w,h);
	ctx.closePath();
	ctx.fill();
	ctx.fillStyle = null;
}
function pleaseClear() {
	drawRectangle(0,0,CANVAS_WIDTH,CANVAS_HEIGHT, backgroundColor);
}





/*
 █████╗ ███╗   ██╗██╗███╗   ███╗ █████╗ ████████╗██╗ ██████╗ ███╗   ██╗███████╗
██╔══██╗████╗  ██║██║████╗ ████║██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝
███████║██╔██╗ ██║██║██╔████╔██║███████║   ██║   ██║██║   ██║██╔██╗ ██║███████╗
██╔══██║██║╚██╗██║██║██║╚██╔╝██║██╔══██║   ██║   ██║██║   ██║██║╚██╗██║╚════██║
██║  ██║██║ ╚████║██║██║ ╚═╝ ██║██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║███████║
╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝
*/

function moveMissiles() {
	let indexesToRemove = [];
	for (let i = 0; i < missiles.length; i++) {
		let oneMissile = missiles[i];
		moveMissile(oneMissile);
		if(oneMissile.coords.y < - oneMissile.type.h) {
			indexesToRemove.push(i);
			continue;
		}
	}
	for (let i = 0; i < indexesToRemove.length; i++) {
		missiles.splice(indexesToRemove[i], 1);
	}
}
function moveMissile(data) {
	data.coords.y -= 12;
}



/*
███████╗██╗   ██╗███████╗███╗   ██╗████████╗███████╗
██╔════╝██║   ██║██╔════╝████╗  ██║╚══██╔══╝██╔════╝
█████╗  ██║   ██║█████╗  ██╔██╗ ██║   ██║   ███████╗
██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║╚██╗██║   ██║   ╚════██║
███████╗ ╚████╔╝ ███████╗██║ ╚████║   ██║   ███████║
╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝
*/

function onKeyDown(evt) {
	if(directionsBykeyCodes.hasOwnProperty(evt.keyCode)) {
		managePlayerMovement(directionsBykeyCodes[evt.keyCode], true);
	}
	else if(acionsBykeyCodes.hasOwnProperty(evt.keyCode)) {
		managePlayerAction(acionsBykeyCodes[evt.keyCode], true);
	}

	if(evt.keyCode == 75) { // k
		thePlayer.currentMissileType = thePlayer.currentMissileType == 'physical' ? 'mystical' : 'physical';
		thePlayer.currentArmorType = thePlayer.currentArmorType == 'physical' ? 'mystical' : 'physical';
	}

	if(evt.keyCode == 76) { // l
		
	}

	if(evt.keyCode == 77) { // m
		thePlayer.currentArmorType = thePlayer.currentArmorType == 'physical' ? 'mystical' : 'physical';
	}

	
}

function onKeyUp(evt) {
	if(directionsBykeyCodes.hasOwnProperty(evt.keyCode)) {
		managePlayerMovement(directionsBykeyCodes[evt.keyCode], false);
	}
	else if(acionsBykeyCodes.hasOwnProperty(evt.keyCode)) {
		managePlayerAction(acionsBykeyCodes[evt.keyCode], false);
	}
}

function onMouseMove(evt) {
}



/*
███╗   ███╗ █████╗ ███╗   ██╗ █████╗  ██████╗ ███████╗██████╗ ███████╗
████╗ ████║██╔══██╗████╗  ██║██╔══██╗██╔════╝ ██╔════╝██╔══██╗██╔════╝
██╔████╔██║███████║██╔██╗ ██║███████║██║  ███╗█████╗  ██████╔╝███████╗
██║╚██╔╝██║██╔══██║██║╚██╗██║██╔══██║██║   ██║██╔══╝  ██╔══██╗╚════██║
██║ ╚═╝ ██║██║  ██║██║ ╚████║██║  ██║╚██████╔╝███████╗██║  ██║███████║
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝
*/

function managePlayerMovement(direction, isPress) {
	switch(direction) {
		case 'left': leftDown = isPress; break;
		case 'up': upDown = isPress; break;
		case 'right': rightDown = isPress; break;
		case 'down': downDown = isPress; break;
	}
}

function managePlayerAction(actionName, isPress) {
	switch(actionName) {
		case 'fire': isFire = isPress; break;
		case 'speed': isSpeed = isPress; break;
	}
}

function detectMissilesCollisions() {
	for (let i = 0; i < missiles.length; i++) {
		const oneMissile = missiles[i];
		for (let j = 0; j < enemies.length; j++) {
			const oneEnemy = enemies[j];
			let isCollision = isRectangleCircleTouching(oneEnemy, oneMissile.coords);
			if(isCollision) {
				if(oneEnemy.type.name != oneMissile.type.name)
				enemies.splice(j, 1);
				missiles.splice(i, 1);
				return;
			}
		}
	}
}





/*
 ██████╗ ██████╗ ██████╗ ███████╗    ███╗   ███╗███████╗████████╗██╗  ██╗ ██████╗ ██████╗ ███████╗
██╔════╝██╔═══██╗██╔══██╗██╔════╝    ████╗ ████║██╔════╝╚══██╔══╝██║  ██║██╔═══██╗██╔══██╗██╔════╝
██║     ██║   ██║██████╔╝█████╗      ██╔████╔██║█████╗     ██║   ███████║██║   ██║██║  ██║███████╗
██║     ██║   ██║██╔══██╗██╔══╝      ██║╚██╔╝██║██╔══╝     ██║   ██╔══██║██║   ██║██║  ██║╚════██║
╚██████╗╚██████╔╝██║  ██║███████╗    ██║ ╚═╝ ██║███████╗   ██║   ██║  ██║╚██████╔╝██████╔╝███████║
 ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝    ╚═╝     ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝
*/

function mainLoop() {
	//setTimeout(function() {
		requestAnimationFrame(mainLoop);
		
		// prepare variables from inputs
		adjustFromInputs();

		// prepare anything that will move
		adjustAnimations();

		// cover everything
		pleaseClear();

		// draw everything
		drawAll();

	//}, 1000 / FRAMERATE);
}

function manageEnemies() {
	if(settings.enemySpawnRateCpt < settings.enemySpawnRate) {
		settings.enemySpawnRateCpt++;
	} else {
		enemies.push(makeEnemy());
		settings.enemySpawnRateCpt = 0;
	}
}

function adjustAnimations() {
	moveMissiles();
	manageEnemies();
	moveEnemies();
}

function moveEnemies() {
	let indexesToRemove = [];
	for (let i = 0; i < enemies.length; i++) {
		let oneEnemy = enemies[i];
		oneEnemy.y += oneEnemy.speed;
		if(oneEnemy.y > CANVAS_HEIGHT + (oneEnemy.r * 2)) {
			indexesToRemove.push(i);
			continue;
		}
	}

	for (let i = 0; i < indexesToRemove.length; i++) {
		enemies.splice(indexesToRemove[i], 1);
	}
}

function adjustPlayerPosition() {
	if(leftDown) {
		thePlayer.x -= thePlayer.speed;
		if(thePlayer.x < canvasMinX + bordersPadding) {
			thePlayer.x = canvasMinX + bordersPadding;
		}
	}
	if(upDown) {
		thePlayer.y -= thePlayer.speed;
		if(thePlayer.y < canvasMinY + bordersPadding) {
			thePlayer.y = canvasMinY + bordersPadding;
		}
	}
	if(rightDown) {
		thePlayer.x += thePlayer.speed;
		if(thePlayer.x > (canvasMaxX - thePlayer.w - bordersPadding)) {
			thePlayer.x = (canvasMaxX - thePlayer.w - bordersPadding);
		}
	}
	if(downDown) {
		thePlayer.y += thePlayer.speed;
		if(thePlayer.y > (canvasMaxY - thePlayer.h - bordersPadding) ) {
			thePlayer.y = (canvasMaxY - thePlayer.h - bordersPadding) ;
		}
	}
}

function adjustPlayerActions() {
	if(isFire && thePlayer.fireCooldownCpt == 0) {
		let missileType = missileTypes[thePlayer.currentMissileType];
		let missileInfo = {
			x: thePlayer.x + (thePlayer.w / 2) - (missileType.w / 2),
			y: thePlayer.y,
			w: missileType.w,
			h: missileType.h
		}
		let oneMissile = {
			coords: missileInfo,
			type: missileType,
			isFromPlayer: true
		}
		missiles.push(oneMissile);
		thePlayer.fireCooldownCpt = thePlayer.fireCooldown;
	}
	else if(thePlayer.fireCooldownCpt != 0) {
		thePlayer.fireCooldownCpt--;
	}
	
	if(isSpeed && thePlayer.dashEnergy >= 0) {
		thePlayer.speed = thePlayer.originalSpeed * 1.5;
		thePlayer.dashEnergy -= (thePlayer.dashRefreshRate * 3);
	}
	else if(!isSpeed && thePlayer.dashEnergy < thePlayer.dashEnergyMax){
		thePlayer.speed = thePlayer.originalSpeed;
		thePlayer.dashEnergy += thePlayer.dashRefreshRate;
		if(thePlayer.dashEnergy > thePlayer.dashEnergyMax) {
			thePlayer.dashEnergy = thePlayer.dashEnergyMax;
		}
	}
	document.getElementById('dashEnergy').innerHTML = thePlayer.dashEnergy;

}

function adjustFromInputs() {
	adjustPlayerPosition();
	adjustPlayerActions();
}
var missiles = [

];
var missileTypes = {
	physical: {
		name: 'physical',
		color: 'white',
		w: 4,
		h: 8
	},
	mystical: {
		name: 'mystical',
		color: 'deeppink',
		w: 4,
		h: 8
	},
}
var armorTypes = {
	physical: {
		name: 'physical',
		color: 'grey',
		w: 4,
		h: 8
	},
	mystical: {
		name: 'mystical',
		color: 'purple',
		w: 4,
		h: 8
	},
}
function drawMissile(data) {
	// data.isFromPlayer
	drawRectangle(data.coords.x, data.coords.y, data.type.w, data.type.h, data.type.color);
}
function drawMissiles() {
	for (let i = 0; i < missiles.length; i++) {
		let oneMissile = missiles[i];
		drawMissile(oneMissile);
	}
}

function drawPlayer() {
	let armorType = armorTypes[thePlayer.currentArmorType];
	drawRectangle(thePlayer.x, thePlayer.y, thePlayer.w, thePlayer.h, armorType.color);
}
function drawAll() {
	drawPlayer();
	drawEnemies();
	drawMissiles();
	detectMissilesCollisions();
	
}


// (re)starts main loop
function pleaseStart() {
  init();
}

// stops main loop
function pleaseStop() {
  clearInterval(mainLoop);
}


// pleaseStart();
document.getElementById('doStart').addEventListener('click', function() {
	document.getElementById('beginning').remove();
	setTimeout(function() {
		pleaseStart();
	}, 500);
});






