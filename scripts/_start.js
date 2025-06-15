kaboom({
	inspectColor: [255,255,255],
	width: window.innerWidth,
	height: window.innerWidth * 0.6,
	letterbox: true,
	pixelDensity: 1,
	logMax: 3,
	buttons: {
        shoot: { keyboard: ["space"] },
    },
});

var UNIT = width() / 20;

const PLAYER_SPEED = 6;
const CAM_ZOOM_SPEED = 4;
const CAM_ZOOM_MAGNITUDE = 0.07;

const ARENA_DIMENSIONS = [10,6];
const ARENA_TILE_SIZE = 5;

loadBean();

loadSprite('grass', 'https://iili.io/FBe1hV1.png');
loadSprite('bullet', 'https://iili.io/FqEvP2e.png');