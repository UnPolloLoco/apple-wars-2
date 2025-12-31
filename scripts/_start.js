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
	pixelDensity: Math.min(devicePixelRatio, 2),
	logMax: 3,
	debugKey: 'i',
	texFilter: 'linear',
	buttons: {
		up:    { keyboard: ["w"] },
		left:  { keyboard: ["a"] },
		down:  { keyboard: ["s"] },
		right: { keyboard: ["d"] },
        shoot: { mouse: "left" },
        pause: { keyboard: ["p", "escape"] },
		dash:  { keyboard: ["space"], mouse: ["right"]},
		swap:  { keyboard: ["t"] },
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

const SUPER_KB_DURATION = 0.6;
const SUPER_KB_IMPACT_SPEED_MULTI = 0.8;

const DAMAGE_FLASH = { r:1, g:1, b:1, strength:0.65 };
const POISON_FLASH = { r:0.6, g:0.3, b:1, strength:0.85 };

const DASH_COOLDOWN = 2;
const DASH_DURATION = 0.2;
const DASH_SPEED = 13;

const PASSIVE_HEAL_DELAY = 1.5; // Time after taking damage until healing starts
const HEAL_RATE = 5;
const SLOW_HEAL_DURATION = 4;

const OFFSCREEN_DISTANCE = 2;

const CAMERA_ZOOM_SPEED = 4;
const CAMERA_ZOOM_MAGNITUDE = 0.07;
const CAMERA_SHIFT_SPEED = 15;
const CAMERA_SHIFT_MAGNITUDE = 0.1;

const ARENA_TILE_SIZE = 5;

const BULLET_ICON_EQUIPPED_Z = 0; // Desired z layer of a bullet slot/icon depending on if it's active or not
const BULLET_SLOT_EQUIPPED_Z = -1;
const BULLET_ICON_UNEQUIPPED_Z = -2;
const BULLET_SLOT_UNEQUIPPED_Z = -3;
const BULLET_SLOT_STANDARD_SCALE = UNIT / 115 * 1.15;
const BULLET_ICON_STANDARD_SCALE = UNIT * 0.7;
const BULLET_SECONDARY_DISPLAY_SCALE_MULTI = 65/115; // Don't mess with the magic number

const LEAF_MOVEMENT_BIAS_MULTI = 0.4;


// Sprite padding is one pixel on the border, and two pixels between sprites.
// Specify 1px padding when combining individual drawings, 0px when combining spritesheets

loadBean();

loadSprite('placeholder', 'https://iili.io/FGY2sv2.md.png');
loadSprite('bul_appleSeed', 'https://iili.io/KN8qlz7.png');
loadSprite('bul_strawberrySeed', 'https://iili.io/KtHgKzb.png');
loadSprite('enemy', 'https://iili.io/KN8fNPs.png')
loadSprite('shadow', 'https://iili.io/fCyT2Cg.png')

loadSprite('grassPath', 'https://iili.io/fXux9Qs.png', {
	sliceX: 3,
	sliceY: 3,
});

loadRoot('https://unpolloloco.github.io/apple-wars-2/assets/');

loadSpriteAtlas('sprites/apple.png', {
	'apple_base': { x: 1, y: 1, width: 85, height: 85 },
	'apple_leaf': { x: 88, y: 1, width: 30, height: 51 },

	'apple_eyes': { x: 120, y: 1, width: 170, height: 86, sliceX: 2, sliceY: 2,
		anims: { 'blink': { frames: [0, 1, 2], speed: 25 } },
	},
	
	'apple_glisten': { x: 1, y: 89, width: 320, height: 64, sliceX: 5 },
})

loadSpriteAtlas('sprites/ui.png', {
	'healthBar_empty': { x: 1, y: 1, width: 600, height: 100 },
	'healthBar_full': { x: 1, y: 103, width: 600, height: 100 },
	'healthBar_flash': { x: 1, y: 205, width: 600, height: 100 },
	'healthBar_end1': { x: 1, y: 307, width: 600, height: 100 },
	'healthBar_end2': { x: 1, y: 409, width: 600, height: 100 },
	'healthBar_end3': { x: 1, y: 511, width: 600, height: 100 },
	
	'abilityMeter_empty': { x: 1, y: 613, width: 150, height: 159 },
	'abilityMeter_full': { x: 153, y: 613, width: 150, height: 159 },
	'abilityMeter_filling': { x: 305, y: 613, width: 150, height: 159 },

	'bulletSlot_primary': { x: 1, y: 774, width: 115, height: 115 },
	'bulletSlot_transition': { x: 118, y: 774, width: 115, height: 115 },
	'bulletSlot_secondary': { x: 235, y: 774, width: 115, height: 115 },
})

loadSprite('spurt', 'sprites/spurt.png', {
	sliceY: 5,
	anims: { 'spurt': { from: 0, to: 4, speed: 25 } },
})

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

loadShader(
	'healthBarShadow', null, `

	vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
		vec4 c = def_frag();
		return vec4(0,0,0, c.a);
		//float gray = 0.1765;
		float gray = 0.0;

		if (c.r < gray && c.g < gray && c.b < gray) {
			return vec4(c.r, c.g, c.b, c.a);
		} else {
			return vec4(gray, gray, gray, c.a*0.3);
		}
	}`
);