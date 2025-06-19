const LAYERS = {
	ground:  100,
	players: 200,
	ui:      300,
}

setCamPos(0, 0);

const GAME_STATUS = {
	CAMERA: {
		CURRENT_SHIFT: vec2(0),
	},
	ENEMIES: {
		SUMMON_QUEUE: 0,
	}
}

const gameScene = add([ timer() ]);





// Arena set-up

let arenaWidth = ARENA.DIMENSIONS[0];
let arenaHeight = ARENA.DIMENSIONS[1];

for (let x = 0; x < arenaWidth; x++) {
	for (let y = 0; y < arenaHeight; y++) {
		let frameNum = 4;

		let isTop =   y == 0;
		let isBot =   y == arenaHeight - 1;
		let isLeft =  x == 0;
		let isRight = x == arenaWidth - 1;

		if (isTop) {
			if (isLeft) 		{ frameNum = 0 }
			else if (isRight)	{ frameNum = 2 }
			else				{ frameNum = 1 }
		} else if (isBot) {
			if (isLeft) 		{ frameNum = 6 }
			else if (isRight)	{ frameNum = 8 }
			else				{ frameNum = 7 }
		} else {
			if (isLeft) 		{ frameNum = 3 }
			else if (isRight)	{ frameNum = 5 }
			else				{ frameNum = 4 }
		}

		gameScene.add([
			sprite('grass', { frame: frameNum }),
			color(GREEN),
			pos(
				UNIT*ARENA.TILE_SIZE * (x - arenaWidth/2 + 0.5),
				UNIT*ARENA.TILE_SIZE * (y - arenaHeight/2 + 0.5),
			),
			scale(UNIT/400 * ARENA.TILE_SIZE),
			offscreen({ 
				hide: true,
				distance: UNIT*ARENA.TILE_SIZE,
			}),
			anchor('center'),
			z(LAYERS.ground)
		])
	}
}

// Player

const player = gameScene.add([
	sprite('bean'),
	pos(0,0),
	scale(UNIT/61 * 0.75),
	anchor('center'),
	rotate(0),
	z(LAYERS.players + 1),
	"character",
	{
		isEnemy: false,
	}
])

// Enemy queue and summoning

function increaseQueue() {
	GAME_STATUS.ENEMIES.SUMMON_QUEUE++;
	gameScene.wait(2, increaseQueue);
}
increaseQueue();

function summonEnemy() {
	gameScene.add([
		sprite('bean'),
		pos(player.pos.add(
			Vec2.fromAngle(rand(360)).scale(UNIT * 18)
		)),
		scale(UNIT/61 * 0.75),
		anchor('center'),
		rotate(0),
		color(RED),
		offscreen({ 
			hide: true,
			distance: UNIT*2,
		}),
		area(),
		z(LAYERS.players),
		"character",
		{
			isEnemy: true,
		}
	])
}

// Attacking

function attack(source) {
	let bullet =gameScene.add([
		sprite('bullet'),
		pos(source.pos),
		scale(UNIT/27 * 0.3),
		rotate(source.angle),
		move(source.angle + 90, UNIT*15),
		anchor('center'),
		z(LAYERS.players - 1),
		area(),
		timer(),
		"bullet",
		{
			isEnemy: source.isEnemy,
		}
	])

	bullet.wait(2.5, () => { destroy(bullet); });
}





// Buttons

onButtonPress('shoot', () => {
	attack(player);
})

onButtonPress('pause', () => {
	gameScene.paused = !gameScene.paused;
})

// Movement

onMouseMove(() => {
	player.angle = toWorld(mousePos()).angle(player.pos) - 90;
})

onMouseDown(() => {
	player.pos = player.pos.add(
		Vec2.fromAngle(player.angle + 90)
		.scale(UNIT * dt() * PLAYER.SPEED)
	);
})

// Collisions

onCollide('character', 'bullet', (c, b) => {
	if (c.isEnemy != b.isEnemy) {
		destroy(c);
		destroy(b);
	}
})





onUpdate(() => {

	// Summon enemies

	while (GAME_STATUS.ENEMIES.SUMMON_QUEUE > 0) {
		summonEnemy();
		GAME_STATUS.ENEMIES.SUMMON_QUEUE--;
	}

	// Move enemies



	// Camera zoom effect

	let targetCamScale = 1 - isMouseDown() * CAMERA.ZOOM.MAGNITUDE;
	setCamScale(
		vec2(
			(getCamScale().x - targetCamScale) 
			/ 2 ** (CAMERA.ZOOM.SPEED * dt()) 
			+ targetCamScale
		)
	);

	if (isKeyDown('z')) setCamScale(0.4);

	// Camera offset effect

	let targetCamOffset = mousePos().sub(center()).scale(CAMERA.ZOOM.MAGNITUDE);
	let nextCamOffset = (
		GAME_STATUS.CAMERA.CURRENT_SHIFT.sub(
			targetCamOffset
		).scale(
			1 / 2 ** (CAMERA.SHIFT.SPEED * dt())
		).add(
			targetCamOffset
		)
	);
	GAME_STATUS.CAMERA.CURRENT_SHIFT = nextCamOffset;
	setCamPos(player.pos.add(nextCamOffset));

	// Debug info

	if (debug.inspect) {
		debug.log(`objs: ${debug.numObjects()}  ––  draw: ${debug.drawCalls()}`)
	}

})
