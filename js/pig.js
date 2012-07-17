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
