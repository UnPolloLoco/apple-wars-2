kaboom({
	inspectColor: [255,255,255],
	width: window.innerWidth,
	height: window.innerWidth * 0.6,
	letterbox: true,
	pixelDensity: 1.2,
	crisp: true,
	logMax: 3,
	debugKey: 'i',
	buttons: {
		up:    { keyboard: ["w"] },
		left:  { keyboard: ["a"] },
		down:  { keyboard: ["s"] },
		right: { keyboard: ["d"] },
        shoot: { keyboard: ["space"] },
        pause: { keyboard: ["p"] },
    },
});

var UNIT = width() / 20;

const PLAYER_SPEED = 4;
const ENEMY_SPEED = 2;

const KB_DECAY_RATE = 30;
const BULLET_SPREAD = 2;

const DAMAGE_FLASH = { r:1, g:1, b:1, strength:0.65 };

const OFFSCREEN_DISTANCE = 2;

const CAMERA_ZOOM_SPEED = 4;
const CAMERA_ZOOM_MAGNITUDE = 0.07;
const CAMERA_SHIFT_SPEED = 15;
const CAMERA_SHIFT_MAGNITUDE = 0.1;

const ARENA_DIMENSIONS = [8,6];
const ARENA_TILE_SIZE = 5;


loadBean();

loadSprite('placeholder', 'https://iili.io/FGY2sv2.md.png');
loadSprite('bullet', 'https://iili.io/FqEvP2e.png');

loadRoot('https://unpolloloco.github.io/apple-wars-2/assets/');

loadSprite('grass', 'sprites/grass.png', {
	sliceX: 3,
	sliceY: 3,
});


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