kaboom({
	inspectColor: [255,255,255],
	width: window.innerWidth,
	height: window.innerWidth * 0.6,
	letterbox: true,
	pixelDensity: 1,
	logMax: 3,
	debugKey: 'i',
	buttons: {
        shoot: { keyboard: ["space"] },
        pause: { keyboard: ["p"] },
    },
});

var UNIT = width() / 20;

const PLAYER = {
	SPEED: 4,
};
const CAMERA = {
	ZOOM: {
		SPEED: 4,
		MAGNITUDE: 0.07,
	},
	SHIFT: {
		SPEED: 15,
		MAGNITUDE: 0.05,
	}
}
const ARENA = {
	DIMENSIONS: [10,6],
	TILE_SIZE: 5,
}

loadBean();

loadSprite('bullet', 'https://iili.io/FqEvP2e.png');

loadRoot("https://unpolloloco.github.io/apple-wars-2/assets/");

loadSprite('grass', 'sprites/grass.png', {
	sliceX: 3,
	sliceY: 3,
});
