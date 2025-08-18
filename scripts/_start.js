let wiw = window.innerWidth;
let wih = window.innerHeight;
let kaWidth, kaHeight;

if (wih < wiw * 0.6) {
	kaWidth = window.innerHeight / 0.6;
	kaHeight = window.innerHeight;
} else {
	kaWidth = window.innerWidth;
	kaHeight = window.innerWidth * 0.6;
}

// KABOOM!!

kaboom({
	inspectColor: [255,255,255],
	width: kaWidth,
	height: kaHeight,
	letterbox: true,
	pixelDensity: 1,
	logMax: 3,
	debugKey: 'i',
	buttons: {
		up:    { keyboard: ["w"] },
		left:  { keyboard: ["a"] },
		down:  { keyboard: ["s"] },
		right: { keyboard: ["d"] },
        shoot: { keyboard: ["space"] },
        pause: { keyboard: ["p", "escape"] },
    },
});

var UNIT = width() / 20;

const PLAYER_SPEED = 4;
const ENEMY_SPEED = 2;

const KB_DECAY_RATE = 30;
const BULLET_SPREAD = 2;

const POISON_SPEED_MULTI = 0.7;
const POISON_TICK_COUNT = 10;
const POISON_TICK_INTERVAL = 0.333;

const DAMAGE_FLASH = { r:1, g:1, b:1, strength:0.65 };
const POISON_FLASH = { r:0.6, g:0.3, b:1, strength:0.85 };

const PASSIVE_HEAL_DELAY = 1.5; // Time after taking damage until healing starts
const HEAL_RATE = 5;
const SLOW_HEAL_DURATION = 4;

const OFFSCREEN_DISTANCE = 2;

const CAMERA_ZOOM_SPEED = 4;
const CAMERA_ZOOM_MAGNITUDE = 0.07;
const CAMERA_SHIFT_SPEED = 15;
const CAMERA_SHIFT_MAGNITUDE = 0.1;

const ARENA_DIMENSIONS = [8,6];
const ARENA_TILE_SIZE = 5;

// Sprite padding is one pixel on the border, and two pixels between sprites.

loadBean();

loadSprite('placeholder', 'https://iili.io/FGY2sv2.md.png');
loadSprite('bullet', 'https://iili.io/FqEvP2e.png');


loadRoot('https://unpolloloco.github.io/apple-wars-2/assets/');

loadSprite('grass', 'sprites/grass.png', {
	sliceX: 3,
	sliceY: 3,
});

loadSpriteAtlas('sprites/ui.png', {
	'abilityMeter_full': { x: 1, y: 1, width: 150, height: 159 },
	'abilityMeter_empty': { x: 153, y: 1, width: 150, height: 159 },
	'abilityMeter_filling': { x: 305, y: 1, width: 150, height: 159 },

	'bulletSlot_primary': { x: 457, y: 1, width: 100, height: 130 },
	'bulletSlot_secondary': { x: 559, y: 1, width: 100, height: 130 },
	
	'healthBar_full': { x: 1, y: 162, width: 600, height: 100 },
	'healthBar_empty': { x: 1, y: 264, width: 600, height: 100 },
	'healthBar_flash': { x: 1, y: 366, width: 600, height: 100 },
})


loadShader(
	'flash', null, `

	uniform float r;
	uniform float g;
	uniform float b;
	uniform float strength;

	vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
		vec4 c = def_frag();

		if (c.r < 0.2 && c.g < 0.2 && c.b < 0.2) {
			return vec4(c.r, c.g, c.b, c.a);
		} else {
			return mix(
				c,
				vec4(r, g, b, c.a),
				strength
			);
		}
	}`
);

loadShader(
	'healthBarShadow', null, `

	vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
		vec4 c = def_frag();
		//float gray = 0.1765;
		float gray = 0.0;

		if (c.r < gray && c.g < gray && c.b < gray) {
			return vec4(c.r, c.g, c.b, c.a);
		} else {
			return vec4(gray, gray, gray, c.a*0.3);
		}
	}`
);