/**
 * Pig Pursuit
 *
 * @fileoverview Base code.
 * @link https://github.com/stevenbenner/pig-pursuit
 * @author Steven Benner
 * @version 0
 * @license Pig Pursuit
 * <https://github.com/stevenbenner/pig-pursuit>
 * Copyright (c) 2012 Steven Benner, http://stevenbenner.com/
 */

var pig = {};

var GRID_SIZE = 32, // 32px grid
	PROJECTILE_SIZE = 6; // 6px

pig.session = {
	paused: false,
	dead: false,
	canvas: null,
	ctx: null,
	level: null,
	xOffset: 0,
	hero: null,
	monsters: null,
	keysDown: {},
	score: 0,
	projectiles: [],
	shootInterval: null,
	mouseX: 0,
	mouseY: 0,
	frames: 0,
	fps: 0,
	levelStartTime: null
};

window.requestAnimFrame = (function() {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / 60);
		};
})();
