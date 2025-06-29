const LAYERS = {
	ground:  100,
	players: 200,
	ui:      300,
}

setCamPos(0, 0);

const GAME_STATUS = {
	CURRENT_CAM_SHIFT: vec2(0),
	CHAR_OFFSCREEN: 0,
	CHAR_ONSCREEN: 0,
}

const gameScene = add([ timer() ]);





// ------------------------- //
// ---   INITIAL SETUP   --- //
// ------------------------- //

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

// Grass tiles

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

// Summon player

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
		nextShootTime:	0,
		health:			100,
		movementVec:	vec2(0,0),
		knockbackVec:	vec2(0,0),
	}
])

// ----------------------- //
// ---    FUNCTIONS    --- //
// ----------------------- //

// Decay by time

function decay(start, end, speed) {
	return (
		start.sub(
			end
		).scale(
			2 ** -(speed * dt())
		).add(
			end
		)
	);
}

// Enemy waves

function summonEnemyWave() {
	let baseCount = 5;
	let eType = 'basic';
	
	if (rand() < 0.2) {
		baseCount = 2;
		eType = 'tank';
	}

	summonEnemy({
		type:  eType, 
		count: Math.floor(baseCount * (1 + time() / 75)),
	});

	let delay = 10 - Math.min(9, time()/15);

	gameScene.wait(delay, summonEnemyWave);
}
summonEnemyWave();

// Summon enemy

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
				approachDistance:	rand(3,4.5),
				nextShootTime:		0,
				health:				eInfo.health,
				info:				eInfo,
				knockbackVec:		vec2(0,0),
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
		// Set victim knockback
		c.knockbackVec = Vec2.fromAngle(b.angle + 90).scale(UNIT * 5);

		// Damage victim
		c.health -= b.info.damage;
		if (c.health <= 0) death(c);
		
		// 'Damage' bullet
		destroy(b);
	}
}

// Knockback

function processKnockback(c) {
	if (c.is('enemy')) {
		c.pos = c.pos.add(c.knockbackVec.scale(dt() * c.info.kbMulti));
	} else {
		c.pos = c.pos.add(c.knockbackVec.scale(dt()));
	}
	c.knockbackVec = decay(c.knockbackVec, vec2(0,0), KB_DECAY_RATE);
}




// ---------------------------- //
// ---  EVENTS AND BUTTONS  --- //
// ---------------------------- //

onButtonPress('pause', () => {
	gameScene.paused = !gameScene.paused;
})

gameScene.onMousePress(() => {
	pressButton('shoot');
})

gameScene.onButtonPress('shoot', () => {
	if (time() > player.nextShootTime) attack({
		source: player,
		type:   'appleSeed',
	});
})

// Change player angle 

gameScene.onMouseMove(() => {
	player.angle = toWorld(mousePos()).angle(player.pos) - 90;
})


// ---------------------------- //
// ---  SPARSE 1/5s UPDATE  --- //
// ---------------------------- //

gameScene.loop(0.2, () => {
	// Check for offscreen 

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

	GAME_STATUS.CHAR_ONSCREEN = on;
	GAME_STATUS.CHAR_OFFSCREEN = off;

})

// ---------------------------- //
// ---  EVERY FRAME UPDATE  --- //
// ---------------------------- //


gameScene.onUpdate(() => {

	gameScene.get('enemy').forEach((c) => {

		// Enemy targetting/aiming

		let target = player.pos;
		let distanceToPlayer = c.pos.sdist(player.pos);

		if (c.info.aimSkill == 1) {
			target = target.add(
				player.movementVec.scale(
					UNIT * PLAYER_SPEED * 2 / BULLETS.appleSeed.speed
				)
			);
		}
		if (c.info.aimSkill == 2) {
			target = target.add(
				player.movementVec.scale(
					Math.sqrt(distanceToPlayer) * PLAYER_SPEED / BULLETS.appleSeed.speed
				)
			);
		}

		let angle = target.angle(c.pos) - 90;
		c.angle = angle;

		// Enemy movement

		if (distanceToPlayer > (UNIT * c.approachDistance)**2) {
			c.pos = c.pos.add(
				Vec2.fromAngle(angle + 90)
				.scale(UNIT * c.info.speed * dt())
			);
		}

		processKnockback(c);
		
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
	
	player.movementVec = newMovementVec.unit();
	player.pos = player.pos.add(
		player.movementVec.scale(
			UNIT * dt() * PLAYER_SPEED
		)
	);

	processKnockback(player);


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
	let nextCamOffset = decay(
		GAME_STATUS.CURRENT_CAM_SHIFT,
		targetCamOffset,
		CAMERA_SHIFT_SPEED,
	);
	GAME_STATUS.CURRENT_CAM_SHIFT = nextCamOffset;
	setCamPos(player.pos.add(nextCamOffset));

	// Debug info

	if (debug.inspect) {
		let on = GAME_STATUS.CHAR_ONSCREEN;
		let onOffTotal = GAME_STATUS.CHAR_ONSCREEN + GAME_STATUS.CHAR_OFFSCREEN;

		debug.clearLog();
		debug.log(`
			objs:  ${debug.numObjects()} (${on}/${onOffTotal})
			draw:  ${debug.drawCalls()}
		`);
	}

	if (isKeyDown('z')) setCamScale(0.4);
	if (isKeyDown('x')) { summonEnemy({type: 'basic', count: 5}); };

})
