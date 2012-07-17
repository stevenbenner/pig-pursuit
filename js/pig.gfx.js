/**
 * Pig Pursuit
 *
 * @fileoverview Graphics module.
 * @link https://github.com/stevenbenner/pig-pursuit
 * @author Steven Benner
 * @version 0
 * @license Pig Pursuit
 * <https://github.com/stevenbenner/pig-pursuit>
 * Copyright (c) 2012 Steven Benner, http://stevenbenner.com/
 */

pig.gfx = {};

pig.gfx.sprites = {
	// level sprites
	block: new pig.objects.sprite('images/block.png'),
	blockTop: new pig.objects.sprite('images/block-top.png'),
	blockTopRight: new pig.objects.sprite('images/block-top-right.png'),
	blockTopLeft: new pig.objects.sprite('images/block-top-left.png'),
	blockEarth: new pig.objects.sprite('images/block-earth.png'),
	blockEarthRight: new pig.objects.sprite('images/block-earth-right.png'),
	blockEarthLeft: new pig.objects.sprite('images/block-earth-left.png'),
	door: new pig.objects.sprite('images/door.png'),

	// hero sprites
	heroLeft: new pig.objects.sprite('images/hero-left.png'),
	heroRight: new pig.objects.sprite('images/hero.png'),
	pig: new pig.objects.sprite('images/pig.png'),

	// monster sprites
	mobRoller: new pig.objects.sprite('images/roller.png'),
	mobFlyer: new pig.objects.sprite('images/flyer.png')
};

pig.gfx.createCanvas = function() {
	pig.session.canvas = document.createElement('canvas');
	pig.session.ctx = pig.session.canvas.getContext('2d');
	pig.session.canvas.width = 864;
	pig.session.canvas.height = 512;
	//pig.session.ctx.scale(1.5, 1.5);
	document.getElementById('game').insertBefore(pig.session.canvas, document.getElementById('game').firstChild);
};

pig.gfx.loadImages = function(callback) {
	var bgReady = false;
	pig.session.level.imageObject = new Image();
	pig.session.level.imageObject.onload = function() {
		bgReady = true;
		tryExecCallback();
	}
	pig.session.level.imageObject.src = pig.session.level.backgroundImage;

	for (var type in pig.gfx.sprites) {
		pig.gfx.sprites[type].imageObject = new Image();
		pig.gfx.sprites[type].imageObject.addEventListener('load', (function(type) {
			return function() {
				pig.gfx.sprites[type].imageLoaded = true;
				tryExecCallback();
			}
		})(type), false);
		pig.gfx.sprites[type].imageObject.src = pig.gfx.sprites[type].imageUrl;
	};

	function tryExecCallback() {
		var spritesLoaded = true;
		for (var type in pig.gfx.sprites) {
			if (!pig.gfx.sprites[type].imageLoaded) {
				spritesLoaded = false;
			}
		}
		if (bgReady && spritesLoaded) {
			callback();
		}
	}
};

pig.gfx.renderFrame = function renderFrame() {
	pig.gfx.drawBackground();
	pig.gfx.drawLevelBlocks();
	pig.gfx.drawMonsters();
	pig.gfx.drawHero();
	if (pig.session.hero.isArmed) {
		pig.gfx.drawWeapon();
	}
	pig.gfx.drawProjectiles();
	if (!pig.session.level.isCutscene) {
		pig.session.ctx.drawImage(pig.gfx.drawInfoText(), 16, 16);
		pig.gfx.drawHealthBar();
	}
	if (pig.session.dead) {
		pig.gfx.drawStopText('Game Over');
	} else if (pig.session.paused) {
		pig.gfx.drawStopText('Paused');
	}
	pig.session.ctx.fillStyle = 'rgb(0, 0, 255)';
	pig.session.ctx.font = 'bold 16px Helvetica';
	pig.session.ctx.textAlign = 'left';
	pig.session.ctx.textBaseline = 'bottom';
	pig.session.ctx.fillText('FPS: ' + ((0.5 + pig.session.fps) << 0), 16, pig.session.canvas.height - 16);
};

pig.gfx.drawBackground = function drawBackground() {
	pig.session.ctx.drawImage(pig.session.level.imageObject, pig.session.xOffset / 10, 0);
};

pig.gfx.drawLevelBlocks = function drawLevelBlocks() {
	var firstColToDraw = Math.abs(Math.ceil(pig.session.xOffset / GRID_SIZE)),
		lastColToDraw = Math.ceil(pig.session.canvas.width / GRID_SIZE) + firstColToDraw,
		x, y, element;
	if (lastColToDraw >= pig.session.level.width) {
		lastColToDraw = pig.session.level.width - 1;
	}
	for (x = firstColToDraw; x <= lastColToDraw; x++) {
		for (y = pig.session.level.height; y--;) {
			element = pig.session.level.content[x][y];
			if (element) {
				pig.session.ctx.drawImage(
					pig.gfx.sprites[element.type].imageObject,
					(x * GRID_SIZE) + pig.session.xOffset,
					y * GRID_SIZE
				);
			}
		}
	}
};

pig.gfx.drawHero = function drawHero() {
	var heroRealX = pig.session.canvas.offsetLeft + pig.session.hero.x + 13 + pig.session.xOffset,
		width;
	pig.session.ctx.drawImage(
		pig.session.mouseX <= heroRealX ? pig.session.hero.leftSprite.imageObject : pig.session.hero.rightSprite.imageObject,
		pig.session.hero.x + pig.session.xOffset,
		pig.session.hero.y
	);
	if (pig.session.hero.message) {
		width = (pig.session.hero.message.length * 8) + 20;
		pig.session.ctx.fillStyle = 'rgb(0,0,0)';
		pig.session.ctx.fillRect(
			pig.session.hero.x + pig.session.xOffset - (width / 2) + 16 - 1,
			pig.session.hero.y - 64 - 1,
			width + 2,
			32 + 2
		);
		pig.session.ctx.fillStyle = 'rgb(255,255,255)';
		pig.session.ctx.fillRect(
			pig.session.hero.x + pig.session.xOffset - (width / 2) + 16,
			pig.session.hero.y - 64,
			width,
			32
		);
		pig.session.ctx.fillStyle = 'rgb(0, 0, 0)';
		pig.session.ctx.font = 'bold 16px Helvetica';
		pig.session.ctx.textAlign = 'center';
		pig.session.ctx.textBaseline = 'top';
		pig.session.ctx.fillText(
			pig.session.hero.message,
			pig.session.hero.x + pig.session.xOffset + 16,
			pig.session.hero.y - 64 + 10
		);
	}
};

pig.gfx.drawWeapon = function drawWeapon() {
	var canvasPosX = pig.session.canvas.offsetLeft,
		canvasPosY = pig.session.canvas.offsetTop,
		heroRealX = canvasPosX + pig.session.hero.x + 13 + pig.session.xOffset,
		heroRealY = canvasPosY + pig.session.hero.y + 23,
		angle = Math.atan2(pig.session.mouseY - heroRealY, pig.session.mouseX - heroRealX),
		startX = pig.session.hero.x + 13 + pig.session.xOffset - 10 * Math.cos(angle),
		startY = pig.session.hero.y + 23 - 10 * Math.sin(angle),
		endX = pig.session.hero.x + 13 + pig.session.xOffset + 24 * Math.cos(angle),
		endY = pig.session.hero.y + 23 + 24 * Math.sin(angle);
	pig.session.ctx.beginPath();
	pig.session.ctx.lineWidth = 4;
	pig.session.ctx.moveTo(startX, startY);
	pig.session.ctx.lineTo(endX, endY);
	pig.session.ctx.stroke();
};

pig.gfx.drawMonsters = function drawMonsters() {
	var i;
	for (i = pig.session.level.monsters.length; i--;) {
		pig.session.ctx.drawImage(
			pig.session.level.monsters[i].sprite.imageObject,
			pig.session.level.monsters[i].x + pig.session.xOffset,
			pig.session.level.monsters[i].y
		);

		if (pig.session.level.monsters[i].message) {
			width = (pig.session.level.monsters[i].message.length * 8) + 20;
			pig.session.ctx.fillStyle = 'rgb(0,0,0)';
			pig.session.ctx.fillRect(
				pig.session.level.monsters[i].x + pig.session.xOffset - (width / 2) + 16 - 1,
				pig.session.level.monsters[i].y - 64 - 1,
				width + 2,
				32 + 2
			);
			pig.session.ctx.fillStyle = 'rgb(255,255,255)';
			pig.session.ctx.fillRect(
				pig.session.level.monsters[i].x + pig.session.xOffset - (width / 2) + 16,
				pig.session.level.monsters[i].y - 64,
				width,
				32
			);
			pig.session.ctx.fillStyle = 'rgb(0, 0, 0)';
			pig.session.ctx.font = 'bold 16px Helvetica';
			pig.session.ctx.textAlign = 'center';
			pig.session.ctx.textBaseline = 'top';
			pig.session.ctx.fillText(
				pig.session.level.monsters[i].message,
				pig.session.level.monsters[i].x + pig.session.xOffset + 16,
				pig.session.level.monsters[i].y - 64 + 10
			);
		}
	}
};

pig.gfx.drawProjectiles = function drawProjectiles() {
	var i;
	for (i = pig.session.projectiles.length; i--;) {
		pig.session.ctx.fillStyle = pig.session.projectiles[i].isHero ? 'rgb(0,0,0)' : 'rgb(255,0,0)';
		pig.session.ctx.fillRect(
			pig.session.projectiles[i].x + pig.session.xOffset,
			pig.session.projectiles[i].y,
			PROJECTILE_SIZE,
			PROJECTILE_SIZE
		);
	}
};

var preRenderText = null;
var lastScore = null;

pig.gfx.drawInfoText = function drawInfoText() {
	if (pig.session.score === lastScore) {
		return preRenderText;
	}
	lastScore = pig.session.score;
var m_canvas = document.createElement('canvas');
m_canvas.width = 128;
m_canvas.height = 64;
var m_context = m_canvas.getContext('2d');
	// draw info text
	m_context.fillStyle = 'rgb(250, 250, 250)';
	m_context.font = 'bold 18px courier new';
	m_context.textAlign = 'left';
	m_context.textBaseline = 'top';
	m_context.fillText('Score: ' + pig.session.score, 0, 0);

	preRenderText = m_canvas;
	return preRenderText;
};

pig.gfx.drawHealthBar = function drawHealthBar() {
	var color;
	pig.session.ctx.fillStyle = 'rgb(0,0,0)';
	pig.session.ctx.fillRect(
		pig.session.canvas.width - 267,
		15,
		258,
		18
	);
	if (pig.session.hero.health > 160) {
		color = 'rgb(0,255,0)'
	} else if (pig.session.hero.health > 96) {
		color = 'rgb(255,255,0)'
	} else {
		color = 'rgb(255,0,0)'
	}
	pig.session.ctx.fillStyle = color;
	pig.session.ctx.fillRect(
		pig.session.canvas.width - 266,
		16,
		pig.session.hero.health,
		16
	);
};

pig.gfx.drawStopText = function drawStopText(text) {
	pig.session.ctx.fillStyle = 'rgb(255, 255, 255)';
	pig.session.ctx.font = 'bold 51px courier new';
	pig.session.ctx.textAlign = 'center';
	pig.session.ctx.textBaseline = 'middle';
	pig.session.ctx.lineWidth = 6;
	pig.session.ctx.strokeStyle = '#000000';
	pig.session.ctx.strokeText(text, pig.session.canvas.width / 2, pig.session.canvas.height / 2);
	pig.session.ctx.fillText(text, pig.session.canvas.width / 2, pig.session.canvas.height / 2);
};
