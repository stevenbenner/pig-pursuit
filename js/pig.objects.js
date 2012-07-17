/**
 * Pig Pursuit
 *
 * @fileoverview Common objects.
 * @link https://github.com/stevenbenner/pig-pursuit
 * @author Steven Benner
 * @version 0
 * @license Pig Pursuit
 * <https://github.com/stevenbenner/pig-pursuit>
 * Copyright (c) 2012 Steven Benner, http://stevenbenner.com/
 */

pig.objects = {};

pig.objects.sprite = function(url) {
	this.imageUrl = url;
	this.imageObject = null;
	this.imageLoaded = false;
};

pig.objects.sound = function(url) {
	this.url = url;
	this.audioObject = null;
	this.audioLoaded = false;
};

pig.objects.hero = function(leftSprite, rightSprite) {
	this.speed = 256;
	this.jumping = false;
	this.jumpVelocity = 0;
	this.leftSprite = leftSprite;
	this.rightSprite = rightSprite;
	this.health = 256;
	this.isArmed = true;
};

pig.objects.monster = function(type, speed, sprite, health, x, y) {
	this.type = type;
	this.speed = speed;
	this.sprite = sprite;
	this.health = health;
	this.x = x;
	this.y = y;
	this.east = !!Math.round(Math.random() * 1);
};

pig.objects.level = function(width, height) {
	this.backgroundImage = 'images/level1-background.gif';
	this.width = width;
	this.height = height;
	this.isCutscene = false;
	this.events = [];
	this.spawnX = 64;
	this.spawnY = 384;
	this.init = function() {};
	this.monsters = [];
	this.content = []
};

pig.objects.gridElement = function(type, x, y) {
	this.type = type;
	this.x = x;
	this.y = y;
	this.destroy = function() {
		pig.session.level.content[x][y] = null;
	}
}

pig.objects.projectile = function(x, y, angle, speed) {
	this.speed = speed || 512;
	this.x = x;
	this.y = y;
	this.angle = angle;
	this.isHero = !speed;
};

pig.objects.event = function(object, type, startTime, action, duration) {
	this.object = object;
	this.type = type;
	this.startTime = startTime;
	this.action = action;
	this.duration = duration;
	this.inProgress = false;
	this.isComplete = false;
};
