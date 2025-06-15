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

const PLAYER = {
	SPEED: 6,
};
const CAMERA = {
	ZOOM: {
		SPEED: 4,
		MAGNITUDE: 0.07,
	},
	SHIFT: {
		SPEED: 15,
		MAGNITUDE: 0.05,
		CURRENT_SHIFT: vec2(0),
	}
}
const ARENA = {
	DIMENSIONS: [10,6],
	TILE_SIZE: 5,
}

loadBean();

loadSprite('grass', 'https://iili.io/FBe1hV1.png');
loadSprite('bullet', 'https://iili.io/FqEvP2e.png');