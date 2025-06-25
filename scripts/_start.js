kaboom({
	inspectColor: [255,255,255],
	width: window.innerWidth,
	height: window.innerWidth * 0.6,
	letterbox: true,
	pixelDensity: 1,
	crisp: true,
	logMax: 3,
	debugKey: 'i',
	buttons: {
        shoot: { keyboard: ["space"] },
        pause: { keyboard: ["p"] },
    },
});

var UNIT = width() / 20;

const PLAYER_SPEED = 4;

const ENEMY_SPEED = 2;

const OFFSCREEN_DISTANCE = 2;

const CAMERA_ZOOM_SPEED = 4;
const CAMERA_ZOOM_MAGNITUDE = 0.07;
const CAMERA_SHIFT_SPEED = 15;
const CAMERA_SHIFT_MAGNITUDE = 0.1;

const ARENA_DIMENSIONS = [8,6];
const ARENA_TILE_SIZE = 5;


loadBean();

loadSprite('bullet', 'https://iili.io/FqEvP2e.png');

loadRoot('https://unpolloloco.github.io/apple-wars-2/assets/');

loadSprite('grass', 'sprites/grass.png', {
	sliceX: 3,
	sliceY: 3,
});
