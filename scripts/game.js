const LAYERS = {
	ground:  100,
	players: 200,
	pause:   300, 
	ui:      400,
}

setCamPos(0, 0);

const GAME_STATUS = {
	CURRENT_CAM_SHIFT: vec2(0),
	CHAR_OFFSCREEN: 0,
	CHAR_ONSCREEN: 0,
	GAME_TIME: 0,
}

const gameScene =	add([ z(0), timer() ]);
const pauseMenu =	add([ z(1), timer(), {opacityTween: null} ]);
const ui = 			add([ z(2), timer(), ]);

const STATS = {
	'money': 0,
}


var totaldmg = 0; var totalPsn = 0;

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
		lastHitTime:	-10,
		poison: {
			damage:				0,
			nextTick:			0,
			ticksRemaining:		0,
		},
	}
])

// --------------------- //
// ---      UI       --- //
// --------------------- //

// Bullet Displays

const bulletDisplay = ui.add([
	pos(UNIT*0.75, UNIT*0.75),
	sprite('bulletSlot_primary'),
	scale(UNIT / 115 * 1.15),
	fixed(),
	z(LAYERS.ui),
])

const bulletDisplaySecondary = ui.add([
	pos(bulletDisplay.pos.add(
		UNIT * 0.4, 
		UNIT * 0.6, 
	)),
	sprite('bulletSlot_secondary'),
	scale(UNIT / 75 * 0.75),
	fixed(),
	z(LAYERS.ui - 1),
])

// Ability

const abilityDisplay = ui.add([
	pos(
		bulletDisplay.pos.x + UNIT * 1.3, 
		UNIT * 2.1),
	sprite('abilityMeter_empty'),
	anchor('botleft'),
	scale(UNIT / 150 * 1.5),
	fixed(),
	z(LAYERS.ui - 1),
])

const abilityFillingMask = ui.add([
	pos(abilityDisplay.pos),
	rect(UNIT*1.5, 0),
	color(BLUE),
	anchor('botleft'),
	opacity(0.3),
	fixed(),
	z(LAYERS.ui),
	mask(),
	{
		maxHeight: UNIT*1.58,
	}
])

// White filling
abilityFillingMask.add([
	pos(0),
	sprite('abilityMeter_filling'),
	anchor('botleft'),
	scale(UNIT / 150 * 1.5),
	fixed(),
	z(LAYERS.ui),
])

// Red full icon
const abilityFull = ui.add([
	pos(abilityDisplay.pos),
	sprite('abilityMeter_full'),
	anchor('botleft'),
	scale(UNIT / 150 * 1.5),
	fixed(),
	z(LAYERS.ui + 1),
	opacity(1),
])

// Healthbar

const emptyHealthBar = ui.add([
	pos(abilityDisplay.pos.add(
		UNIT * 1.66, UNIT * -1.35
	)),
	sprite('healthBar_empty'),
	scale(UNIT / 600 * 6),
	z(LAYERS.ui - 1),
	fixed(),
])

let o = 0.03 * UNIT; // offset
let maxWidth = UNIT*6 - 2*o; // width

// Health bar FILL

const healthBar = ui.add([
	pos(emptyHealthBar.pos.add(o)),
	rect(
		maxWidth,
		UNIT - 2*o,
	),
	color(rgb(200, 30, 30)),
	z(LAYERS.ui + 2),
	fixed(),
	mask(),
	{
		maxWidth: maxWidth,
	}
])

const healthBarFull = healthBar.add([
	pos(-o),
	sprite('healthBar_full'),
	scale(UNIT / 600 * 6),
	z(LAYERS.ui + 2),
	fixed(),
])

// Health bar FLASH

const healthBarFlashMask = ui.add([
	pos(healthBar.pos.add(
		healthBar.width,
		0
	)),
	rect(
		0,
		healthBar.height,
	),
	color(WHITE),
	z(LAYERS.ui + 1),
	fixed(),
	mask(),
	{
		tween:		null,
		lastHealth: 100,
	}
])

const healthBarFlash = healthBarFlashMask.add([
	pos(-o),
	sprite('healthBar_flash'),
	scale(UNIT / 600 * 6),
	z(LAYERS.ui + 1),
	fixed(),
])

// Health bar shadow

const healthBarShadowMask = ui.add([
	pos(healthBarFlashMask.pos),
	rect(0, healthBar.height),
	z(LAYERS.ui),
	fixed(),
	mask(),
])

const healthBarShadow = healthBarShadowMask.add([
	pos(-o),
	sprite('healthBar_flash'),
	scale(UNIT / 600 * 6),
	z(LAYERS.ui),
	fixed(),
	shader('healthBarShadow'),
])

// Money counter

const moneyCounter = ui.add([
	pos(bulletDisplay.pos.add(
		0, UNIT*1.75
	)),
	text('$0', {
		size: UNIT / 3,
	}),
	fixed(),
	z(LAYERS.ui),
])

// ------------------------ //
// ---    PAUSE MENU    --- //
// ------------------------ //

pauseMenu.add([
	pos(0),
	rect(width(), height()),
	color(BLACK),
	fixed(),
	z(LAYERS.pause - 10),
	{
		targetOpacity: 0.7,
	}
])

// "Pause" text

const pauseLabel = pauseMenu.add([
	pos(
		width() - UNIT/2,
		height() - UNIT/2,
	),
	text('PAUSED', {
		size: UNIT*2.5,
		align: 'right',
	}),
	anchor('botright'),
	z(LAYERS.pause),
	fixed(),
	{
		targetOpacity: 1,
	}
])

// Options backdrop

pauseMenu.add([
	pos(width() - UNIT*1.25, 0),
	rect(UNIT*7.5, height()),
	anchor('topright'),
	color(BLACK),
	z(LAYERS.pause - 1),
	fixed(),
	{
		targetOpacity: 0.5,
	}
])

// Options buttons

let pauseMenuOptions = [
	['Resume', () => { pressButton('pause') }],
	['Settings', () => { pressButton('pause') }],
	['Quit', () => { alert('quit') }],
]

for (let i = 0; i < pauseMenuOptions.length; i++) {
	pauseMenu.add([
		pos(
			width() - UNIT*8,
			height() - UNIT*5 - UNIT*(pauseMenuOptions.length - i - 1)*1.25
		),
		text(pauseMenuOptions[i][0], {
			size: UNIT*0.75,
			//align: 'right',
		}),
		color(rgb(200,200,200)),
		z(LAYERS.pause),
		anchor('botleft'),
		fixed(),
		{
			targetOpacity: 1,
		}
	])
}

pauseMenu.get('*').forEach((obj) => {
	obj.use(opacity(0));
})

// ----------------------- //
// ---    FUNCTIONS    --- //
// ----------------------- //

// Get game time

function gameTime() {
	return GAME_STATUS.GAME_TIME;
}

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
		eType = 'heavy';
	} else if (rand() < 0.25) {
		baseCount = 3;
		eType = 'swift';
	}

	summonEnemy({
		type:  eType, 
		count: Math.floor(baseCount * (1 + gameTime() / 75)),
	});

	let delay = 10 - Math.min(9, gameTime()/15);

	gameScene.wait(delay, summonEnemyWave);
}
summonEnemyWave();

// Summon enemy

function summonEnemy(data) {
	// data: {type, count}
	let eInfo = ENEMIES[data.type];
	let clumpSpawnDir = rand(360);

	for (let i = 0; i < data.count; i++) {
		let spawnDir = rand(360);
		let spawnDist = 18;

		if (data.type == 'swift') {
			spawnDir = clumpSpawnDir + rand(30);
			spawnDist += rand(-1, 1);
		}

		gameScene.add([
			sprite('bean'),
			pos(player.pos.add(
				Vec2.fromAngle(spawnDir).scale(UNIT * spawnDist)
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
				lastHitTime:		-10,
				poison: {
					damage:				0,
					nextTick:			0,
					ticksRemaining:		0,
				},
			}
		])
	}
}

// Attacking

function attack(data) {
	// data = {source, type}

	let bInfo = BULLETS[data.type];
	let s = data.source;

	let bulletCount = 1;
	if (bInfo.special.count) bulletCount = bInfo.special.count;
	let relativeSpread = Math.floor(bulletCount / 2);

	for (let n = 0; n < bulletCount; n++) {
		let bAngle = s.angle += rand(-BULLET_SPREAD, BULLET_SPREAD);
		if (bInfo.special.count) bAngle += (n - relativeSpread) * bInfo.special.spread / relativeSpread / 2;

		let bullet = gameScene.add([
			sprite('bullet'),
			pos(s.pos),
			scale(UNIT / bInfo.size * bInfo.scale),
			rotate(bAngle),
			move(bAngle+90, UNIT*bInfo.speed),
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
	
		bullet.wait(2.5, () => { destroy(bullet); });
	}

	if (s.is('enemy')) {
		s.nextShootTime = gameTime() + 0.8;
	} else {
		s.nextShootTime = gameTime() + 0.1;
	}
}

// Death 

function death(victim) {
	if (victim == player) {
		debug.log('DEAD!')
	} else {
		if (victim.is('enemy')) {
			STATS.money += 1;
			updateMoneyCounter();
		}
		destroy(victim);
	}
}

// Damage flash VFX

function damageFlash(victim, flashType) {
	let flashData = {
		'basic':  DAMAGE_FLASH,
		'poison': POISON_FLASH,
	}[flashType];

	victim.use(shader('flash', () => (flashData)));
	gameScene.wait(0.05, () => { victim.unuse('shader') })
}

// Bullet collide function

function bulletCollision(b, c) {
	if (c.is('enemy') != b.isFromEnemy) {
		// Set victim knockback
		c.knockbackVec = Vec2.fromAngle(b.angle + 90).scale(UNIT * 5);
		c.lastHitTime = gameTime();

		// Damage victim
		if (c != player) totaldmg += Math.min(c.health, b.info.damage); // deleteme 
		c.health -= b.info.damage;
		if (c == player) updateHealthBar();

		if (c.health <= 0) {
			// Death
			death(c);
		} else {
			// Impact effects
			damageFlash(c, 'basic');

			// Poison
			if (b.info.special.poison) {
				c.poison = {
					damage:			b.info.special.poison,
					nextTick:		gameTime() + POISON_TICK_INTERVAL,
					ticksRemaining: POISON_TICK_COUNT,
				};
				c.tag('poisoned');
			}
		}
		
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

// Border wall

function borderResolve(p) {
	let borderX = (arenaWidth - 0.15) * UNIT * ARENA_TILE_SIZE / 2;
	let borderY = (arenaHeight - 0.15) * UNIT * ARENA_TILE_SIZE / 2;
	let newPos = p;

	if (p.x > borderX) { // x
		newPos.x = borderX;
	} else if (p.x < -borderX) {
		newPos.x = -borderX;
	}

	if (p.y > borderY) { // y
		newPos.y = borderY;
	} else if (p.y < -borderY) {
		newPos.y = -borderY;
	}

	return newPos;
}

// Player healthbar

function updateHealthBar() {
	healthBar.width = healthBar.maxWidth / 100 * player.health;

	// Show shadow?
	healthBarShadow.opacity = player.health > 0 ? 1 : 0;

	// The white transition section
	if (player.health < healthBarFlashMask.lastHealth) {
		let lastPos = healthBarFlashMask.pos.x;

		// Set pre-tween size and position
		healthBarFlashMask.pos.x = healthBar.pos.x + Math.max(0, healthBar.width);
		healthBarFlashMask.width += lastPos - healthBarFlashMask.pos.x;
		
		// Masked visual positioning
		healthBarFlash.pos.x = -1 * (healthBarFlashMask.pos.x - healthBar.pos.x) - o;
		
		// Shadow copycatting
		
		healthBarShadowMask.pos = healthBarFlashMask.pos;
		healthBarShadow.pos = healthBarFlash.pos;

		// Tweeeeeen
		
		if (healthBarFlashMask.tween) healthBarFlashMask.tween.cancel();

		healthBarFlashMask.tween = gameScene.tween(
			healthBarFlashMask.width,
			0,
			0.3,
			(w) => {
				healthBarFlashMask.width = w;
				healthBarShadowMask.width = w + UNIT*0.08; // size of health bar shadow (0.14 is inner layer thickness)
			},
			easings.easeOutCubic
		);
	}
}

// Player money display

function updateMoneyCounter() {
	moneyCounter.text = `\$${Math.floor(STATS.money)}`;
}



// ---------------------------- //
// ---  EVENTS AND BUTTONS  --- //
// ---------------------------- //

onButtonPress('pause', () => {
	gameScene.paused = !gameScene.paused;

	if (pauseMenu.opacityTween) pauseMenu.opacityTween.cancel();

	pauseMenu.get('*').forEach((obj) => {
		pauseMenu.opacityTween = pauseMenu.tween(
			obj.opacity,
			obj.targetOpacity * gameScene.paused, // target if paused, 0 if unpaused
			0.08,
			(o) => {obj.opacity = o},
			easings.easeInOutQuad
		);
	})

})

gameScene.onMousePress(() => {
	pressButton('shoot');
})

gameScene.onButtonPress('shoot', () => {
	if (gameTime() > player.nextShootTime) attack({
		source: player,
		type:   'cherryPit',
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

		target = borderResolve(target);

		let angle = target.angle(c.pos) - 90;
		c.angle = angle;

		// Enemy movement

		if (distanceToPlayer > (UNIT * c.approachDistance)**2) {
			c.pos = c.pos.add(
				Vec2.fromAngle(angle + 90)
				.scale(UNIT * c.info.speed * dt())
				.scale(c.is('poisoned') ? POISON_SPEED_MULTI : 1)
			);
		}

		processKnockback(c);
		
		// Enemy attack

		if (gameTime() > c.nextShootTime && distanceToPlayer < (UNIT * 5)**2) {
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

	// Player passive regen

	if (player.health < 100) {
		let timeSinceHit = gameTime() - player.lastHitTime;

		if (timeSinceHit > PASSIVE_HEAL_DELAY) {
			// Eligible for healing
			let healAmount;

			if (timeSinceHit > PASSIVE_HEAL_DELAY + SLOW_HEAL_DURATION) {
				// Max heal rate
				healAmount = 1;
			} else {
				// Slowed heal rate
				let t = (timeSinceHit - PASSIVE_HEAL_DELAY) / SLOW_HEAL_DURATION;
				healAmount = t < 0.5 ? (4 * t**3) : (4 * (t-1)**3 + 1);
			}

			player.health = Math.min(
				100,
				player.health + healAmount * dt() * HEAL_RATE
			);
			updateHealthBar();
		}
	}

	// Player border resolution

	player.pos = borderResolve(player.pos);


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

	// Poison control (get it??)

	gameScene.get('poisoned').forEach((c) => {
		let p = c.poison;

		if (gameTime() > p.nextTick) {
			// do damage
			totalPsn += Math.min(c.health, p.damage); //deleteme
			c.health -= p.damage;
			if (c.health <= 0) {
				death(c);
			} else {
				damageFlash(c, 'poison');
			}

			// setup next tick or end poison
			p.ticksRemaining--;

			if (p.ticksRemaining > 0) {
				p.nextTick = gameTime() + POISON_TICK_INTERVAL;
			} else {
				c.untag('poisoned');
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

	// Update time

	if (!gameScene.paused) GAME_STATUS.GAME_TIME += dt();

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

	//debug.log(`${totaldmg}d -- ${totalPsn}p -- $${STATS.money}`)

	if (isKeyDown('z')) setCamScale(0.4);
	if (isKeyDown('x')) { summonEnemy({type: 'basic', count: 5}); };

})
