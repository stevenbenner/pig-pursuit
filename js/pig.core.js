/**
 * Pig Pursuit
 *
 * @fileoverview Core game functionality.
 * @link https://github.com/stevenbenner/pig-pursuit
 * @author Steven Benner
 * @version 0
 * @license Pig Pursuit
 * <https://github.com/stevenbenner/pig-pursuit>
 * Copyright (c) 2012 Steven Benner, http://stevenbenner.com/
 */

pig.core = {};

pig.core.init = function(level) {
	// create session
	pig.session.level = level;
	pig.session.hero = new pig.objects.hero(pig.gfx.sprites.heroLeft, pig.gfx.sprites.heroRight);
	pig.session.level.init();

	// create the canvas
	pig.gfx.createCanvas();

	pig.core.resetGame();

	// load background images
	pig.gfx.loadImages(function() {
		pig.audio.loadAudio(pig.core.execMainGameLoop);
	});


	var start = new Date();
	setInterval(function() {
		var now = new Date(),
			delta = now - start;
		pig.session.fps = pig.session.frames / delta * 1000;
		pig.session.frames = 0;
		start = now;
	}, 250);

	// attach input listeners
	addEventListener('keydown', function(event) {
		if (event.keyCode === 32 || event.keyCode === 37 || event.keyCode === 39) {
			event.preventDefault();
		}
		if (!pig.session.level.isCutscene) {
			pig.session.keysDown[event.keyCode] = true;
		}
	}, false);

	addEventListener('keyup', function(event) {
		delete pig.session.keysDown[event.keyCode];
	}, false);

	addEventListener('mousemove', function(event) {
		if (!pig.session.level.isCutscene) {
			pig.session.mouseX = event.pageX;
			pig.session.mouseY = event.pageY;
		}
	});

	addEventListener('mousedown', function(event) {
		if (!pig.session.level.isCutscene) {
			if (event.button !== 2 && !pig.session.dead && !pig.session.paused) {
				var canvasPosX = pig.session.canvas.offsetLeft,
					canvasPosY = pig.session.canvas.offsetTop,
					heroRealX = canvasPosX + pig.session.hero.x + 13 + pig.session.xOffset,
					heroRealY = canvasPosY + pig.session.hero.y + 19;

				pig.session.projectiles.push(
					new pig.objects.projectile(
						pig.session.hero.x + 13,
						pig.session.hero.y + 19,
						Math.atan2(event.pageY - heroRealY, event.pageX - heroRealX)
					)
				);

				pig.audio.play('shoot');
			}
		}
	}, false);

};

pig.core.execMainGameLoop = function() {
	var lastTime = Date.now();

	pig.session.levelStartTime = lastTime;

	var main = function() {
		var now = Date.now(),
			delta = now - lastTime;

		pig.core.updateGame(delta / 1000);
		pig.gfx.renderFrame();

		pig.session.frames++;

		lastTime = now;

		if (!pig.session.dead && !pig.session.paused) {
			window.requestAnimFrame(main);
		} else {
			pig.session.shootInterval = clearInterval(pig.session.shootInterval);
			//pig.audio.pause('bgm');
		}
	};

	pig.session.shootInterval = setInterval(function() {
		var i;
		if (!pig.session.level.isCutscene) {
			for (i = pig.session.level.monsters.length; i--;) {
				if (Math.abs(pig.session.level.monsters[i].x - pig.session.hero.x) < 512 &&
					Math.abs(pig.session.level.monsters[i].y - pig.session.hero.y) < 256 &&
					pig.session.level.monsters[i].x + pig.session.xOffset > 0 &&
					pig.session.level.monsters[i].x + pig.session.xOffset < pig.session.canvas.width) {
					pig.session.projectiles.push(
						new pig.objects.projectile(
							pig.session.level.monsters[i].x + 13,
							pig.session.level.monsters[i].y + 13,
							Math.atan2(
								pig.session.hero.y - pig.session.level.monsters[i].y,
								pig.session.hero.x - pig.session.level.monsters[i].x
							),
							128
						)
					);
					pig.audio.play('shoot2');
				}
			}
		}
	}, 250);

	//pig.audio.play('bgm');

	window.requestAnimFrame(main);
};

pig.core.pause = function() {
	if (pig.session.paused) {
		pig.session.paused = false;
		pig.core.execMainGameLoop();
	} else {
		pig.session.shootInterval = clearInterval(pig.session.shootInterval);
		pig.session.paused = true;
	}
};

pig.core.resetGame = function() {
	pig.session.paused = false;
	pig.session.dead = false;
	pig.session.xOffset = 0;
	pig.session.keysDown = {};
	pig.session.score = 0;
	pig.session.projectiles = [];
	pig.session.hero.health = 256;
	pig.session.hero.x = pig.session.level.spawnX;
	pig.session.hero.y = pig.session.level.spawnY;
};

pig.core.updateGame = function(modifier) {
	pig.core.executeEvents(modifier);

	pig.core.updateHero(modifier);
	pig.core.updateProjectiles(modifier);
	pig.core.updateMonsters(modifier);
};

var activeEvents = [];

pig.core.executeEvents = function(modifier) {
	var now = Date.now(),
		currentTime = now - pig.session.levelStartTime,
		lastTime = currentTime - (modifier*1000),
		i, distance;
	// find events that need to start
	for (i = pig.session.level.events.length; i--;) {
		if (pig.session.level.events[i].startTime >= lastTime && pig.session.level.events[i].startTime <= currentTime) {
			pig.session.level.events[i].startTime = now;
			activeEvents.push(pig.session.level.events[i]);
		}
	}
	// do events
	for (i = activeEvents.length; i--;) {
		if (activeEvents[i].duration >= 0) {
			if (activeEvents[i].type === 'move') {
				distance = activeEvents[i].action * modifier;
				activeEvents[i].object.x += distance;
				pig.session.mouseX = 10000 * activeEvents[i].action;
			} else if (activeEvents[i].type === 'say') {
				activeEvents[i].object.message = activeEvents[i].action;
			}
			activeEvents[i].duration -= (modifier*1000);
		} else {
			if (activeEvents[i].type === 'say') {
				activeEvents[i].object.message = null;
			}
			activeEvents.splice(i, 1);
		}
	}
};

pig.core.updateHero = function(modifier) {
	var pixelsTraverced = pig.session.hero.speed * modifier;

	// left arrow or 'w'
	if (37 in pig.session.keysDown || 65 in pig.session.keysDown) { 
		if (!hasLeftCollision(pig.session.hero)) {
			// move hero
			pig.session.hero.x -= pixelsTraverced;
			//pig.session.hero.x = (0.5 + pig.session.hero.x) << 0; // fast round
			// move viewport
			if (pig.session.hero.x + pig.session.xOffset < 300 && pig.session.xOffset < 0) {
				pig.session.xOffset += pixelsTraverced;
				pig.session.xOffset = Math.round(pig.session.xOffset); //(0.5 + pig.session.xOffset) << 0; // fast round
				if (pig.session.xOffset > 0) {
					pig.session.xOffset = 0;
				}
			}
		} else if (hasLeftCollision(pig.session.hero).type === 'door') {
			console.log('door');
			var nextLevel = new pig.objects.level2();
			nextLevel.imageObject = new Image();
			nextLevel.imageObject.addEventListener('load', (function(nextLevel) {
				return function() {
					pig.session.hero.x = pig.session.canvas.width / 2;
					pig.session.hero.y = pig.session.canvas.height / 2;
					pig.session.hero.health = 256;
					pig.session.xOffset = 0;
					pig.session.level = nextLevel;
				}
			})(nextLevel), false);
			nextLevel.imageObject.src = nextLevel.backgroundImage;
		}
	}

	// right arrow or 'd'
	if (39 in pig.session.keysDown || 68 in pig.session.keysDown) { 
		if (!hasRightCollision(pig.session.hero)) {
			// move hero
			pig.session.hero.x += pixelsTraverced;
			//pig.session.hero.x = (0.5 + pig.session.hero.x) << 0; // fast round
			// move viewport
			if (pig.session.hero.x + pig.session.xOffset > pig.session.canvas.width - 300 &&
				pig.session.xOffset > pig.session.canvas.width + pig.session.level.width * -32) {
				pig.session.xOffset -= pixelsTraverced;
				pig.session.xOffset = Math.round(pig.session.xOffset); //(0.5 + pig.session.xOffset) << 0; // fast round
				if (pig.session.xOffset < pig.session.canvas.width + 1 + pig.session.level.width * -32) {
					pig.session.xOffset = pig.session.canvas.width + 1 + pig.session.level.width * -32;
				}
			}
		}
	}

	// space bar
	if (32 in pig.session.keysDown) {
		if (!pig.session.hero.jumping && hasGoundCollision(pig.session.hero)) {
			pig.session.hero.jumping = true;
			pig.session.hero.jumpVelocity = pig.session.hero.speed * 3;
			pig.audio.play('jump');
			console.log(pig.session.hero.x, pig.session.hero.y)
		}
	}

	// jumping
	if (pig.session.hero.jumping) {
		pig.session.hero.jumpVelocity -= pixelsTraverced * 4;
		if (pig.session.hero.jumpVelocity > 0 && !hasUpCollision()) {
			jump(pig.session.hero, modifier);
		} else {
			pig.session.hero.jumping = false;
		}
	}

	// ground collision
	if (!hasGoundCollision(pig.session.hero) && !pig.session.hero.jumping) {
		fall(pig.session.hero, modifier);
		// if hero fell into a pit
		if (pig.session.hero.y > pig.session.canvas.height) {
			pig.session.dead = true;
			pig.audio.play('die');
		}
	}
};

pig.core.updateProjectiles = function(modifier) {
	var i, n, projectileDistance, newX, newY;

	for (i = pig.session.projectiles.length; i--;) {

		// maths
		projectileDistance = pig.session.projectiles[i].speed * modifier;
		newX = pig.session.projectiles[i].x + projectileDistance * Math.cos(pig.session.projectiles[i].angle);
		newY = pig.session.projectiles[i].y + projectileDistance * Math.sin(pig.session.projectiles[i].angle);

		// set coordinates
		pig.session.projectiles[i].x = newX;
		pig.session.projectiles[i].y = newY;

		// level collisions
		if (getLevelCollision(pig.session.projectiles[i])) {
			//getLevelCollision(pig.session.projectiles[i]).destroy();
			pig.session.projectiles.splice(i, 1);
			continue;
		}

		// monster/hero collisions
		if (pig.session.projectiles[i].isHero) {
			for (n = pig.session.level.monsters.length; n--;) {
				if (Math.abs(pig.session.level.monsters[n].x + 16 - pig.session.projectiles[i].x) < 16 &&
					Math.abs(pig.session.level.monsters[n].y + 16 - pig.session.projectiles[i].y) < 16) {
					pig.session.projectiles.splice(i, 1);
					pig.session.level.monsters[n].health -= 16;
					// if moster is dead
					if (pig.session.level.monsters[n].health <= 0) {
						pig.session.level.monsters.splice(n, 1);
						pig.session.score += 1000;
					}
					break;
				}
			}
		} else {
			if (Math.abs(pig.session.hero.x + 16 - pig.session.projectiles[i].x) < 16 &&
				Math.abs(pig.session.hero.y + 16 - pig.session.projectiles[i].y) < 16) {
				pig.session.projectiles.splice(i, 1);
				pig.session.hero.health -= 16;
				// if hero is dead
				if (pig.session.hero.health <= 0) {
					pig.session.dead = true;
					pig.audio.play('die');
				}
			}
		}
		
		// projectile hit monster or hero and was removed
		if (!pig.session.projectiles[i]) {
			continue;
		}

		// destroy off-screen projectiles
		if (pig.session.projectiles[i].x < pig.session.xOffset * -1 ||
			pig.session.projectiles[i].x > pig.session.xOffset * -1 + pig.session.canvas.width) {
			pig.session.projectiles.splice(i, 1);
		}

	}
};

pig.core.updateMonsters = function(modifier) {
	var i;
	for (i = pig.session.level.monsters.length; i--;) {
		// gravity
		if (pig.session.level.monsters[i].type === 'walker' && !hasGoundCollision(pig.session.level.monsters[i])) {
			fall(pig.session.level.monsters[i], modifier);
			// if monster fell into a pit
			if (pig.session.level.monsters[i].y > pig.session.canvas.height) {
				pig.session.level.monsters.splice(i, 1);
			}
		}
		// walkers
		if (pig.session.level.monsters[i].type === 'walker' || pig.session.level.monsters[i].type === 'flyer') {
			if (pig.session.level.monsters[i].east) {
				pig.session.level.monsters[i].x += pig.session.level.monsters[i].speed * modifier;
				if (hasRightCollision(pig.session.level.monsters[i])) {
					pig.session.level.monsters[i].east = false;
				}
			} else {
				pig.session.level.monsters[i].x -= pig.session.level.monsters[i].speed * modifier;			
				if (hasLeftCollision(pig.session.level.monsters[i])) {
					pig.session.level.monsters[i].east = true;
				}
			}
		}
	}
};

function fall(object, modifier) {
	var gridPos = getLevelGridAtCoord(object.x + 16, object.y + 16),
		floorY = 600,
		canvasRowCount = pig.session.canvas.width / GRID_SIZE,
		y;
	for (y = gridPos.y; y < canvasRowCount; y++) {
		if (pig.session.level.content[gridPos.x][y]) {
			floorY = y * GRID_SIZE;
			break;
		}
	}
	if (object.y < floorY - GRID_SIZE) { // if object is above floor
		object.y += 400 * modifier;
		//object.y = (0.5 + object.y) << 0; // fast round
		if (object.y > floorY - GRID_SIZE) {
			object.y = floorY - GRID_SIZE;
		}
	}
}

function jump(object, modifier) {
	var gridPos = getLevelGridAtCoord(object.x + 16, object.y + 16),
		roofY = -128,
		canvasRowCount = pig.session.canvas.width / GRID_SIZE,
		y;
	for (y = gridPos.y; y > 0; y--) {
		if (pig.session.level.content[gridPos.x][y]) {
			roofY = y * 32;
			break;
		}
	}
	if (object.y > roofY + 32) { // if object is below roof
		object.y -= (object.jumpVelocity * modifier) / 2;
		//object.y = (0.5 + object.y) << 0; // fast round
		if (object.y < roofY + 32) {
			object.y = roofY + 32;
			object.jumping = false;
		}
	}
}

function getLevelCollision(object) {
	var grid = getLevelGridAtCoord(object.x, object.y);
	try {
		return pig.session.level.content[grid.x][grid.y];
	} catch(e) {
		return null;
	}
}

function getLevelGridAtCoord(x, y) {
	return {
		x: Math.ceil(x / GRID_SIZE) - 1,
		y: Math.ceil(y / GRID_SIZE) - 1
	};
}


function hasGoundCollision(object) {
	var playerRow = Math.round(object.x / 32),
		playerCol = Math.round((object.y + 16) / 32);
	return pig.session.level.content[playerRow][playerCol];
}
function hasUpCollision() {
	var playerRow = Math.round((pig.session.hero.x) / 32),
		playerCol = Math.round(pig.session.hero.y / 32);
	return pig.session.level.content[playerRow][playerCol];
}
function hasLeftCollision(object) {
	var playerRow = Math.round((object.x - 16) / 32),
		playerCol = Math.round(object.y / 32);
	return pig.session.level.content[playerRow][playerCol];
}
function hasRightCollision(object) {
	var playerRow = Math.round((object.x + 16) / 32),
		playerCol = Math.round(object.y / 32);
	return pig.session.level.content[playerRow][playerCol];
}
