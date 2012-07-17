/**
 * Pig Pursuit
 *
 * @fileoverview Audio module.
 * @link https://github.com/stevenbenner/pig-pursuit
 * @author Steven Benner
 * @version 0
 * @license Pig Pursuit
 * <https://github.com/stevenbenner/pig-pursuit>
 * Copyright (c) 2012 Steven Benner, http://stevenbenner.com/
 */

pig.audio = {};

pig.audio.soundEffects = {
	jump: new pig.objects.sound('sounds/jump.ogg'),
	shoot: new pig.objects.sound('sounds/shoot.ogg'),
	shoot2: new pig.objects.sound('sounds/shoot2.ogg'),
	die: new pig.objects.sound('sounds/die.ogg')//,
	//bgm: new pig.objects.sound('sounds/circuits.ogg'),
};

pig.audio.loadAudio = function(callback) {
	for (var type in pig.audio.soundEffects) {
		pig.audio.soundEffects[type].audioObject = new Audio();
		pig.audio.soundEffects[type].audioObject.addEventListener('canplaythrough', (function(type) {
			return function() {
				pig.audio.soundEffects[type].audioLoaded = true;
				tryExecCallback();
			}
		})(type), false);
		pig.audio.soundEffects[type].audioObject.src = pig.audio.soundEffects[type].url;
	};

	function tryExecCallback() {
		var audioLoaded = true;
		for (var type in pig.audio.soundEffects) {
			if (!pig.audio.soundEffects[type].audioLoaded) {
				audioLoaded = false;
			}
		}

		if (audioLoaded) {
			callback();
			callback = function(){}; // stop double firing
		}
	}
};

pig.audio.play = function(type) {
	pig.audio.soundEffects[type].audioObject.pause();
	pig.audio.soundEffects[type].audioObject = new Audio(pig.audio.soundEffects[type].url);
	pig.audio.soundEffects[type].audioObject.play();
};

pig.audio.pause = function(type) {
	pig.audio.soundEffects[type].audioObject.pause();
};
