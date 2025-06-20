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
	},
	DEBUG: {
		CHAR_OFFSCREEN: 0,
		CHAR_ONSCREEN: 0,
	}
}

const gameScene = add([ timer() ]);





// Arena set-up

let arenaWidth = ARENA_DIMENSIONS[0];
let arenaHeight = ARENA_DIMENSIONS[1];

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
			color(WHITE),
			pos(
				UNIT*ARENA_TILE_SIZE * (x - arenaWidth/2 + 0.5),
				UNIT*ARENA_TILE_SIZE * (y - arenaHeight/2 + 0.5),
			),
			scale(UNIT/400 * ARENA_TILE_SIZE),
			offscreen({ 
				hide: true,
				distance: UNIT * ARENA_TILE_SIZE,
			}),
			anchor('center'),
			z(LAYERS.ground),
			"grass"
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
	offscreen({ distance: UNIT * OFFSCREEN_DISTANCE }),
	"character",
	"ally",
	{
		nextShootTime: 0,
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
		offscreen({ distance: UNIT * OFFSCREEN_DISTANCE }),
		z(LAYERS.players),
		"character",
		"enemy",
		{
			approachDistance: rand(4,5),
			nextShootTime: 0,
		}
	])
}

// Attacking

function attack(source) {
	let bullet = gameScene.add([
		sprite('bullet'),
		pos(source.pos),
		scale(UNIT/27 * 0.3),
		rotate(source.angle),
		move(source.angle + 90, UNIT*10),
		anchor('center'),
		z(LAYERS.players - 1),
		timer(),
		"bullet",
		{
			isFromEnemy: source.is('enemy'), 
		}
	])

	bullet.wait(2.5, () => { destroy(bullet); });
}

// Death 

function death(victim) {
	if (victim == player) {
		debug.log('DEAD!')
	} else {
		destroy(victim);
	}
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
		.scale(UNIT * dt() * PLAYER_SPEED)
	);
})

// Collisions

function bulletCollision(b, c) {
	if (c.is('enemy') != b.isFromEnemy) {
		death(c);
		destroy(b);
	}
}


// Check for offscreen 

gameScene.loop(0.2, () => {
	let off = 0;
	let on = 0;
	gameScene.get('character').forEach((c) => {
		if (c.is('enemy') && c.isOffScreen()) {
			c.hidden = true;
			c.paused = true;
			off++;
		} else {
			c.hidden = false;
			c.paused = false;
			on++;
		}

	})
	GAME_STATUS.DEBUG.CHAR_ONSCREEN = on;
	GAME_STATUS.DEBUG.CHAR_OFFSCREEN = off;
})





onUpdate(() => {

	// Summon enemies

	while (GAME_STATUS.ENEMIES.SUMMON_QUEUE > 0) {
		summonEnemy();
		GAME_STATUS.ENEMIES.SUMMON_QUEUE--;
	}

	// Enemy movement

	gameScene.get('enemy').forEach((c) => {
		let angle = player.pos.angle(c.pos) - 90;
		c.angle = angle;

		let distanceToPlayer = c.pos.sdist(player.pos);

		if (distanceToPlayer > (UNIT * c.approachDistance)**2) {
			c.pos = c.pos.add(
				Vec2.fromAngle(angle + 90)
				.scale(UNIT * ENEMY_SPEED * dt())
			);

			// Enemy attack

			if (time() > c.nextShootTime && distanceToPlayer < (UNIT * 5)**2) {
				attack(c);
				c.nextShootTime = time() + 1;
			}
		}

	})

	// Bullet collision

	gameScene.get('bullet').forEach((b) => {
		let victims;
		
		victims = gameScene.get(
			b.isFromEnemy ? 'ally' : 'enemy'
		);

		for (let i = 0; i < victims.length; i++) {
			let v = victims[i];

			let radius = UNIT * 0.4;
			if (b.pos.sdist(v.pos) < radius * radius) {
				bulletCollision(b, v);
				break;
			}
		}
	})

	// Camera zoom effect

	let targetCamScale = 1 - isMouseDown() * CAMERA_ZOOM_MAGNITUDE;
	setCamScale(
		vec2(
			(getCamScale().x - targetCamScale) 
			/ 2 ** (CAMERA_ZOOM_SPEED * dt()) 
			+ targetCamScale
		)
	);
	
	// Camera offset effect

	let targetCamOffset = mousePos().sub(center()).scale(CAMERA_ZOOM_MAGNITUDE);
	let nextCamOffset = (
		GAME_STATUS.CAMERA.CURRENT_SHIFT.sub(
			targetCamOffset
		).scale(
			1 / 2 ** (CAMERA_SHIFT_SPEED * dt())
		).add(
			targetCamOffset
		)
	);
	GAME_STATUS.CAMERA_CURRENT_SHIFT = nextCamOffset;
	setCamPos(player.pos.add(nextCamOffset));

	// Debug info

	if (debug.inspect) {
		let on = GAME_STATUS.DEBUG.CHAR_ONSCREEN;
		let onOffTotal = GAME_STATUS.DEBUG.CHAR_ONSCREEN + GAME_STATUS.DEBUG.CHAR_OFFSCREEN;

		debug.clearLog();
		debug.log(`
			objs:  ${debug.numObjects()} (${on}/${onOffTotal})
			draw:  ${debug.drawCalls()}
		`);
	}

	if (isKeyDown('z')) setCamScale(0.4);
	if (isKeyDown('x')) { summonEnemy(); summonEnemy(); summonEnemy(); };

})