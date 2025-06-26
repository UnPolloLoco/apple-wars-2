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

// Backing rectangle

gameScene.add([
	pos(center()),
	rect(width(), height()),
	color(rgb(35, 105, 25)),
	scale(1.23),
	anchor('center'),
	fixed(),
	z(LAYERS.ground - 1),
])

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
	scale(UNIT/61 * 0.85),
	anchor('center'),
	rotate(0),
	z(LAYERS.players + 1),
	offscreen({ distance: UNIT * OFFSCREEN_DISTANCE }),
	color(RED),
	"character",
	"ally",
	{
		nextShootTime: 0,
		health: 100,
		movementVec: vec2(0,0),
		dash: {
			lastDashTime: 0,
			isDashing: false,
		},
	}
])

// Enemy queue and summoning

function increaseQueue() {
	GAME_STATUS.ENEMIES.SUMMON_QUEUE += 5;
	gameScene.wait(10, increaseQueue);
}
increaseQueue();

function summonEnemy(data) {
	// data: {type, count}
	let eInfo = ENEMIES[data.type];

	for (let i = 0; i < data.count; i++) {
		gameScene.add([
			sprite('bean'),
			pos(player.pos.add(
				Vec2.fromAngle(rand(360)).scale(UNIT * 18)
			)),
			scale(UNIT / eInfo.size * eInfo.scale),
			anchor('center'),
			rotate(0),
			offscreen({ distance: UNIT * OFFSCREEN_DISTANCE }),
			z(LAYERS.players),
			"character",
			"enemy",
			{
				approachDistance: rand(3,4.5),
				nextShootTime:    0,
				health:           eInfo.health,
				info:             eInfo,
			}
		])
	}
}

// Attacking

function attack(data) {
	// data = {source, type}

	let bInfo = BULLETS[data.type];
	let s = data.source;

	let bullet = gameScene.add([
		sprite('bullet'),
		pos(s.pos),
		scale(UNIT / bInfo.size * bInfo.scale),
		rotate(s.angle),
		move(s.angle + 90, UNIT*bInfo.speed),
		anchor('center'),
		z(LAYERS.players - 1),
		timer(),
		"bullet",
		{
			source:      s,
			info:        bInfo,
			isFromEnemy: s.is('enemy'),
		}
	])

	if (s.is('enemy')) {
		s.nextShootTime = time() + 0.8;
	} else {
		s.nextShootTime = time() + 0.1;
	}

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

// Bullet collide function

function bulletCollision(b, c) {
	if (c.is('enemy') != b.isFromEnemy) {
		// Victim bounces back
		c.pos = c.pos.add(
			Vec2.fromAngle(b.angle + 90).scale(UNIT / 8)
		);

		// Damage victim
		c.health -= b.info.damage;
		if (c.health <= 0) death(c);
		
		// 'Damage' bullet
		destroy(b);
	}
}




// Buttons

onMousePress(() => {
	pressButton('shoot');
})

onButtonPress('shoot', () => {
	if (time() > player.nextShootTime) attack({
		source: player,
		type:   'appleSeed',
	});
})

onButtonPress('pause', () => {
	gameScene.paused = !gameScene.paused;
})

onButtonPress('dash', () => {
	if (time() > player.dash.lastDashTime + 2) {
		player.dash.lastDashTime = time();
		player.dash.isDashing = true;
		
		gameScene.wait(0.2, () => {
			player.dash.isDashing = false;
		})
	}
})

// Change player angle 

onMouseMove(() => {
	if (!player.dash.isDashing) {
		player.angle = toWorld(mousePos()).angle(player.pos) - 90;
	}
})




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

	let eType = 'basic';
	//if (rand() < 0.25) eType = 'swift';
	
	summonEnemy({
		type: eType,
		count: GAME_STATUS.ENEMIES.SUMMON_QUEUE,
	});
	
	GAME_STATUS.ENEMIES.SUMMON_QUEUE = 0;

	// Enemy movement

	gameScene.get('enemy').forEach((c) => {
		let angle = player.pos.angle(c.pos) - 90;
		c.angle = angle;

		let distanceToPlayer = c.pos.sdist(player.pos);

		if (distanceToPlayer > (UNIT * c.approachDistance)**2) {
			c.pos = c.pos.add(
				Vec2.fromAngle(angle + 90)
				.scale(UNIT * c.info.speed * dt())
			);
		}
		
		// Enemy attack

		if (time() > c.nextShootTime && distanceToPlayer < (UNIT * 5)**2) {
			attack({
				source: c,
				type:   'appleSeed',
			});
		}
	})
	
	// Player movement controls
	
	let w = isButtonDown('up');
	let a = isButtonDown('left');
	let s = isButtonDown('down');
	let d = isButtonDown('right');
	
	let newMovementVec = vec2(0,0);
	
	if (w || a || s || d) {
		if (w) newMovementVec = newMovementVec.add(0, -1);
		if (a) newMovementVec = newMovementVec.add(-1, 0);
		if (s) newMovementVec = newMovementVec.add(0, 1);
		if (d) newMovementVec = newMovementVec.add(1, 0);
	}
	
	// Player movement
	
	if (player.dash.isDashing) {
		// Dash
		player.pos = player.pos.add(
			player.movementVec.scale(
				UNIT * dt() * DASH_SPEED
			)
		);
	} else {
		// No dash
		player.movementVec = newMovementVec.unit();
		player.pos = player.pos.add(
			player.movementVec.scale(
				UNIT * dt() * PLAYER_SPEED
			)
		);
	}

	// Bullet collision

	gameScene.get('bullet').forEach((b) => {
		let victims;
		
		victims = gameScene.get(
			b.isFromEnemy ? 'ally' : 'enemy'
		);

		for (let i = 0; i < victims.length; i++) {
			let v = victims[i];

			let radius = b.info.scale/2 + 0.4;
			radius *= UNIT;

			if (b.pos.sdist(v.pos) < radius * radius) {
				bulletCollision(b, v);
				break;
			}
		}
	})

	// Camera effects

	let targetCamScale = 1 - isMouseDown() * CAMERA_ZOOM_MAGNITUDE;
	let targetCamOffset = mousePos().sub(center()).scale(CAMERA_SHIFT_MAGNITUDE);

	// Zoom
	setCamScale(
		vec2(
			(getCamScale().x - targetCamScale) 
			/ 2 ** (CAMERA_ZOOM_SPEED * dt()) 
			+ targetCamScale
		)
	);

	// Offset
	let nextCamOffset = (
		GAME_STATUS.CAMERA.CURRENT_SHIFT.sub(
			targetCamOffset
		).scale(
			2 ** -(CAMERA_SHIFT_SPEED * dt())
		).add(
			targetCamOffset
		)
	);
	GAME_STATUS.CAMERA.CURRENT_SHIFT = nextCamOffset;
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
	if (isKeyDown('x')) { GAME_STATUS.ENEMIES.SUMMON_QUEUE += 5; };

})
