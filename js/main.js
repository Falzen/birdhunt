/* * * * * * * * * * * * * * * * * * * * * * * * * * * 
utils: 
https://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow
https://patorjk.com/software/taag/#p=display&f=Doom
http://keycode.info/

BACKLOG:
- score : fired / hit / wrong color / miss 
- collisions with player (and invincibility period)
- player health and dash energy
- infinite background effect
- enemies trajectories
	- bouncing off sides
- rename methods with prefixes (get rid of 'adjust' prefix):
	- manage...	when sequencing inputs
	- move... 	when changing object's coordinates
	- draw...	when adding to canvas


TODO:
- 
- 



* * * * * * * * * * * * * * * * * * * * * * * * * * */

const FRAMERATE = 60;
var mainTimerInSeconds=  0, frameCount = 0;
var canvas, ctx, CANVAS_HEIGHT, CANVAS_WIDTH, canvasMinX, canvasMaxX, canvasMinY, canvasMaxY, intervalId, player, backgroundColor;
var bordersPadding = 6;
var leftDown, upDown, rightDown, downDown; // TODO one variable in player.directions
var isFiring, isDashing;
var settings = {
	enemySpawnRate: 30,
	enemySpawnRateCpt: 0,
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

var thresholdSettings = {
	coords : {
		x: 0,
		y: 300
	},
	h: 4,
	w: CANVAS_WIDTH,
	color: 'red'
}

var enemies = [];
var enemyStats = {
	r: 25,
	mysticalColor: 'rgba(128,0,128,0.3)',
	physicalColor: 'rgba(128,128,128,0.5)',
	speeds: [
		0.5,
		0.90,
		1.00,
		1.10,
		1.00,
		0.90,
		1.00,
		1.10,
		1.00,
		0.90,
		1.00,
		1.10,
		1.00,
		0.90,
		2
	]
};


// will position the Threshold
var mostAdvancedEnemyY = 0;

var missiles = [
	// will contains all missiles objects
];

// TODO trop compliqué
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

// TODO trop compliqué
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

var cheatMode = false;
var beastMode = false;

function makeEnemy() {
	let enemyType = Math.random() > 0.5 ? 'physical' : 'mystical';
	let enemyData = {
		x: getRandomInt(enemyStats.r, (canvasMaxX) - enemyStats.r),
		y: 30,
		r: enemyStats.r,
		speed: enemyStats.speeds[getRandomInt(0, enemyStats.speeds.length-1)],
		type: {
			name: enemyType
		},
		color: enemyType == 'physical' ? enemyStats.physicalColor : enemyStats.mysticalColor
	};
	if(beastMode) upEnemiesSpawnrate();
	if(!beastMode) downEnemiesSpawnrate();
	return enemyData;
}
function upNewEnemiesSpeed() {
	enemyData.speed = enemyData.speed * 2;
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
	ctx.globalAlpha = 1;
	CANVAS_HEIGHT = canvas.height;
	CANVAS_WIDTH = canvas.width;
	backgroundColor = '#303030';

	// canvas left edges
	canvasMinX = 0;
	canvasMaxX = canvasMinX + CANVAS_WIDTH;
	canvasMinY = 0;
	canvasMaxY = canvasMinY + CANVAS_HEIGHT;

	// adjust variables that need it
	thresholdSettings.w = CANVAS_WIDTH;

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
function drawThreshold() {
	ctx.globalAlpha = 0.1;
	drawRectangle(
		thresholdSettings.coords.x, 
		thresholdSettings.coords.y, 
		thresholdSettings.w, 
		thresholdSettings.h, 
		thresholdSettings.color
	);
	ctx.globalAlpha = 1;
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



function drawEnemy(data) {
	drawCircle(data.x, data.y, data.r, data.color);
}
function drawEnemies() {
	for (let i = 0; i < enemies.length; i++) {
		const data = enemies[i];
		drawEnemy(data);
	}
}


function drawAll() {
	ctx.globalAlpha = 1;
	drawPlayer();
	ctx.globalAlpha = 1;
	drawEnemies();
	drawThreshold();
	drawMissiles();
	detectMissilesCollisions();
	
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
function switchPlayerArmor() {
	thePlayer.currentArmorType = thePlayer.currentArmorType == 'physical' ? 'mystical' : 'physical';
}
function switchPlayerMissileType() {
	thePlayer.currentMissileType = thePlayer.currentMissileType == 'physical' ? 'mystical' : 'physical';
}
function onKeyDown(evt) {
	if(directionsBykeyCodes.hasOwnProperty(evt.keyCode)) {
		managePlayerMovement(directionsBykeyCodes[evt.keyCode], true);
	}
	else if(acionsBykeyCodes.hasOwnProperty(evt.keyCode)) {
		managePlayerAction(acionsBykeyCodes[evt.keyCode], true);
	}

	if(evt.keyCode == 75) { // k
		switchPlayerArmor();
		switchPlayerMissileType();
	}

	if(evt.keyCode == 76) { // l
		cheatMode = !cheatMode;
		if(cheatMode) upPlayerFirerate();
		if(!cheatMode) downPlayerFirerate();
	}

	if(evt.keyCode == 77) { // m
		beastMode = !beastMode;
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

// TODO refaire en propre avec un joli écouteur d'event, pas en vrac sur le bouton
document.getElementById('doStart').addEventListener('click', function() {
	document.getElementById('beginning').remove();
	setTimeout(function() {
		pleaseStart();
	}, 500);
});


function onMouseMove(evt) {
}






function upEnemiesSpawnrate() {
	settings.enemySpawnRate = 10;
}
function downEnemiesSpawnrate() {
	settings.enemySpawnRate = 30;
}

function upPlayerFirerate() {
	thePlayer.fireCooldown = 2;
}
function downPlayerFirerate() {
	thePlayer.fireCooldown = (FRAMERATE / 10);
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
		case 'fire': isFiring = isPress; break;
		case 'speed': isDashing = isPress; break;
	}
}



function manageEnemies() {
	if(settings.enemySpawnRateCpt < settings.enemySpawnRate) {
		settings.enemySpawnRateCpt++;
	} else {
		enemies.push(makeEnemy());
		settings.enemySpawnRateCpt = 0;
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
 █████╗ ██████╗      ██╗██╗   ██╗███████╗████████╗███████╗
██╔══██╗██╔══██╗     ██║██║   ██║██╔════╝╚══██╔══╝██╔════╝
███████║██║  ██║     ██║██║   ██║███████╗   ██║   ███████╗
██╔══██║██║  ██║██   ██║██║   ██║╚════██║   ██║   ╚════██║
██║  ██║██████╔╝╚█████╔╝╚██████╔╝███████║   ██║   ███████║
╚═╝  ╚═╝╚═════╝  ╚════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚══════╝
*/

function adjustFromInputs() {
	adjustPlayerPosition();
	adjustPlayerActions();
}

function adjustAnimations() {
	manageEnemies();
	moveMissiles();
	moveEnemies();
	moveThreshold();
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
	if(thePlayer.y < (thresholdSettings.coords.y + 4)){
		thePlayer.y = thresholdSettings.coords.y + 4;
	}
}



// TODO redécouper putain
function adjustPlayerActions() {
	if(isFiring && thePlayer.fireCooldownCpt == 0) {
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
		if(cheatMode) {
			switchPlayerArmor();
			switchPlayerMissileType();

			// add another missile of the opposite type
			let anotherMissile = JSON.parse(JSON.stringify(oneMissile));
			oneMissile.coords.x -= 8;
			anotherMissile.coords.x += 8;
			anotherMissile.type = thePlayer.currentMissileType == 'physical' ? missileTypes['mystical'] : missileTypes['physical'];
			missiles.push(anotherMissile);
		}
		missiles.push(oneMissile);
		thePlayer.fireCooldownCpt = thePlayer.fireCooldown;
	}
	else if(thePlayer.fireCooldownCpt != 0) {
		thePlayer.fireCooldownCpt--;
	}
	
	if(isDashing && thePlayer.dashEnergy >= 0) {
		thePlayer.speed = thePlayer.originalSpeed * 1.5;
		thePlayer.dashEnergy -= (thePlayer.dashRefreshRate * 3);
	}
	else if(!isDashing && thePlayer.dashEnergy < thePlayer.dashEnergyMax){
		thePlayer.speed = thePlayer.originalSpeed;
		thePlayer.dashEnergy += thePlayer.dashRefreshRate;
		if(thePlayer.dashEnergy > thePlayer.dashEnergyMax) {
			thePlayer.dashEnergy = thePlayer.dashEnergyMax;
		}
	}
	document.getElementById('dashEnergy').innerHTML = thePlayer.dashEnergy;

}




/*
███╗   ███╗ ██████╗ ██╗   ██╗███████╗███╗   ███╗███████╗███╗   ██╗████████╗███████╗
████╗ ████║██╔═══██╗██║   ██║██╔════╝████╗ ████║██╔════╝████╗  ██║╚══██╔══╝██╔════╝
██╔████╔██║██║   ██║██║   ██║█████╗  ██╔████╔██║█████╗  ██╔██╗ ██║   ██║   ███████╗
██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██╔══╝  ██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║   ╚════██║
██║ ╚═╝ ██║╚██████╔╝ ╚████╔╝ ███████╗██║ ╚═╝ ██║███████╗██║ ╚████║   ██║   ███████║
╚═╝     ╚═╝ ╚═════╝   ╚═══╝  ╚══════╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝
*/

function moveEnemies() {
	let indexesToRemove = [];
	for (let i = 0; i < enemies.length; i++) {
		let oneEnemy = enemies[i];
		oneEnemy.y += oneEnemy.speed;
		if(mostAdvancedEnemyY < oneEnemy.y) mostAdvancedEnemyY = oneEnemy.y;
		if(oneEnemy.y > CANVAS_HEIGHT + (oneEnemy.r * 2)) {
			indexesToRemove.push(i);
			continue;
		}
	}

	for (let i = 0; i < indexesToRemove.length; i++) {
		enemies.splice(indexesToRemove[i], 1);
	}

	if(enemies.length < 5 && !beastMode) {
		triggerBeastmodeForXSeconds(1);
	}
}



function moveThreshold() {
	let enemyCoord = getMostAdvancedEnemyPosition();
	if(enemyCoord.y >= thresholdSettings.coords.y) {
		thresholdSettings.coords.y = mostAdvancedEnemyY;
		return;
	}
	if(thePlayer.y - 10 <= thresholdSettings.coords.y) {
		thresholdSettings.coords.y -= 1;
		mostAdvancedEnemyY = thresholdSettings.coords.y;
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

// (re)starts main loop
function pleaseStart() {
	init();
  }
  
  // stops main loop
  function pleaseStop() {
	clearInterval(mainLoop);
  }
  

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
	frameCount++;
	if(frameCount % FRAMERATE == 0) {
		mainTimerInSeconds++;
		console.log('mainTimerInSeconds : ', mainTimerInSeconds);
	}
}
function getMostAdvancedEnemyPosition() {
	let most = {x: 0, y: 0};
	for (let i = 0; i < enemies.length; i++) {
		let oneEnemy = enemies[i];
		most.y = most.y < oneEnemy.y ? oneEnemy.y : most.y;
	}
	return most;
}
function triggerBeastmodeForXSeconds(secs) {
	beastMode = true;
	setTimeout(function() {
		beastMode = false;
	}, 1000*secs);
}








