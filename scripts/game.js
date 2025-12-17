const DATA = {
	money: 			0,
	bullets:		['appleSeed', 'strawberrySeed'],
	selectedBullet: 0,
}

// ---------------------- //
// ---   GAME SCENE   --- //
// ---------------------- //

scene('game', () => {

const LAYERS = {
	ground:  100,
	players: 200,
	pause:   300, 
	ui:      400,
}

setCamPos(0, 0);

const GAME_STATUS = {
	CHAR_OFFSCREEN: 0,
	CHAR_ONSCREEN: 0,

	GAME_TIME: 0,
	CURRENT_CAM_SHIFT: vec2(0),
	FREEZE_FRAME_UNTIL: 0,
	STATE: 'normal',
	IS_SWITCHING_BULLETS: false,

	LOCATION: 'level1',
	PHASE: {
		NAME: 't1',
		TIME: 0,
	}
}

const gameScene =	add([ z(0), timer() ]);
const pauseMenu =	add([ z(1), timer(), {opacityTween: null} ]);
const ui = 		    add([ z(2), timer(), ]);


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
			//color(rgb(55, 135, 255)),
			"grass"
		])
	}
}

// Summon player

const player = gameScene.add([
	sprite('apple_base'),
	pos(0,0),
	scale(UNIT/85 * 0.85),
	anchor('center'),
	rotate(0),
	z(LAYERS.players),
	offscreen({ distance: UNIT * OFFSCREEN_DISTANCE }),
	color(RED),
	"character",
	"ally",
	{
		nextShootTime:	0,
		health:			100,
		moveVec:		vec2(0,0),
		lastMoveVec:	vec2(1,0),
		knockbackVec:	vec2(0,0),
		lastHitTime:	-10,
		prevAngle:		0,
		poison: {
			damage:				0,
			nextTick:			0,
			ticksRemaining:		0,
		},
		state: 			'normal',
		nextDashTime:	0,
	}
])

const playerGlisten = player.add([
	sprite('apple_glisten'),
	pos(0,0),
	anchor('center'),
	z(LAYERS.players + 1),
])

const playerEyes = player.add([
	sprite('apple_eyes', { frame: 2 }),
	pos(0,0),
	anchor('top'),
	z(LAYERS.players + 2),
	{
		nextBlink: 5,
	}
])

const playerLeaf = player.add([
	sprite('apple_leaf'),
	pos(0, -UNIT/30),
	anchor(vec2(0, 0.79)), // stem position
	rotate(20),
	z(LAYERS.players + 3),
	{
		targetRotation: 0,
	}
])

addCharacterShadow(player);


// --------------------- //
// ---      UI       --- //
// --------------------- //

// Bullet Displays

const bulletDisplaySlot = ui.add([
	pos(UNIT*0.75, UNIT*0.75),
	sprite('bulletSlot_primary'),
	scale(BULLET_SLOT_STANDARD_SCALE),
	fixed(),
	z(LAYERS.ui + BULLET_SLOT_EQUIPPED_Z),
	"prim",
	{
		default: {
			slotScale: null,
			slotPos: null,
			iconScale: null,
			iconPos: null,
		}
	}
])

// NOTE, 'secondary' just means it STARTS unequipped, it will be called 'secondary' even if it's the main active bullet
const bulletDisplaySlotSecondary = ui.add([
	pos(bulletDisplaySlot.pos.add(
		UNIT * 0.525, 
		UNIT * 0.725, 
	)),
	sprite('bulletSlot_secondary'),
	scale(BULLET_SLOT_STANDARD_SCALE * BULLET_SECONDARY_DISPLAY_SCALE_MULTI),
	fixed(),
	z(LAYERS.ui + BULLET_SLOT_UNEQUIPPED_Z),
	{
		default: {
			slotScale: null,
			slotPos: null,
			iconScale: null,
			iconPos: null,
		}
	}
])

const bulletDisplayIcon = ui.add([
	pos(bulletDisplaySlot.pos.add(UNIT * 1.15/2)),
	sprite('bul_appleSeed'),
	scale(0),
	fixed(),
	z(LAYERS.ui + BULLET_ICON_EQUIPPED_Z),
	anchor('center'),
	{
		baseScale: null,
		spriteScale: null,
	}
])

const bulletDisplayIconSecondary = ui.add([
	pos(bulletDisplaySlotSecondary.pos.add(UNIT * 0.65/2)),
	sprite('bul_appleSeed'),
	scale(0),
	fixed(),
	z(LAYERS.ui + BULLET_ICON_UNEQUIPPED_Z),
	anchor('center'),
	{
		baseScale: null,
		spriteScale: null,
	}
])

// Set bullet display icon sprite/scale

let db = DATA.bullets;

bulletDisplayIcon.sprite = `bul_${db[0]}`;
bulletDisplayIcon.spriteScale = BULLETS[db[0]].size;
bulletDisplayIcon.scale = vec2(BULLET_ICON_STANDARD_SCALE / bulletDisplayIcon.spriteScale);

bulletDisplayIconSecondary.sprite = `bul_${db[1]}`;
bulletDisplayIconSecondary.spriteScale = BULLETS[db[1]].size;
bulletDisplayIconSecondary.scale = vec2(BULLET_ICON_STANDARD_SCALE * BULLET_SECONDARY_DISPLAY_SCALE_MULTI / bulletDisplayIconSecondary.spriteScale);

// Setting bullet display defaults (used for swap animation)

for (let num = 0; num <= 1; num++) {
	let bds = [bulletDisplaySlot, bulletDisplaySlotSecondary][num];
	let bdi = [bulletDisplayIcon, bulletDisplayIconSecondary][num];

	bds.default.slotScale = {...bds.scale};
	bds.default.slotPos = {...bds.pos};

	bds.default.iconScale = {...bdi.scale.scale(bdi.spriteScale)};
	bds.default.iconPos = {...bdi.pos};
}


// Ability

const abilityDisplay = ui.add([
	pos(
		bulletDisplaySlot.pos.x + UNIT * 1.3, 
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
	pos(bulletDisplaySlot.pos.add(
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
	['Settings', () => { alert('settings') }],
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
	if (start.x != undefined) {
		return (
			start.sub(
				end
			).scale(
				2 ** -(speed * dt())
			).add(
				end
			)
		);
	} else {
		return (
			(start - end) * (2 ** -(speed * dt())) + end
		);
	}
}

// Freeze frame

function setFreezeFrame(duration) {
	let newTime = time() + duration;

	if (newTime > GAME_STATUS.FREEZE_FRAME_UNTIL) {
		GAME_STATUS.FREEZE_FRAME_UNTIL = newTime;
	}
}
function isFreezeFrame() {
	return time() < GAME_STATUS.FREEZE_FRAME_UNTIL;
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

		let newEnemy = gameScene.add([
			sprite('enemy'),
			pos(player.pos.add(
				Vec2.fromAngle(spawnDir).scale(UNIT * spawnDist)
			)),
			scale(UNIT / eInfo.size * eInfo.scale),
			anchor('center'),
			rotate(0),
			offscreen({ distance: UNIT * OFFSCREEN_DISTANCE }),
			z(LAYERS.players - 5),
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

		addCharacterShadow(newEnemy);
	}
}

// Attacking

function attack(data) {
	// data = {source, type}

	let bInfo = BULLETS[data.type];
	let s = data.source;

	let bulletCount = 1;
	if (bInfo.special.count) bulletCount = bInfo.special.count;

	let pierceCount = 1;
	if (bInfo.special.pierce) pierceCount = bInfo.special.pierce;

	
	for (let n = 0; n < bulletCount; n++) {
		let relativeSpread = Math.floor(bulletCount / 2);
		let bAngle = s.angle + rand(-BULLET_SPREAD, BULLET_SPREAD);
		if (bInfo.special.count) bAngle += (n - relativeSpread) * bInfo.special.spread / relativeSpread / 2;

		let spriteName = data.type;
		if (!(spriteName == 'appleSeed' || spriteName == 'strawberrySeed')) spriteName = 'appleSeed';

		let bullet = gameScene.add([
			sprite(`bul_${spriteName}`), // e.g. bul_appleSeed
			pos(s.pos),
			scale(UNIT / bInfo.size * bInfo.scale),
			rotate(bAngle),
			anchor('center'),
			z(LAYERS.players - 6),
			timer(),
			"bullet",
			{
				source:      s,
				info:        bInfo,
				moveVec:     Vec2.fromAngle(bAngle + 90).scale(UNIT * bInfo.speed),
				isFromEnemy: s.is('enemy'),
				hasHit:      [],
				pierce:      pierceCount,
				lifeTimer:   null,
				lastPos:     s.pos,
			}
		])
	
		bullet.lifeTimer = bullet.wait(2.5, () => { destroy(bullet); });
	}

	if (s.is('enemy')) {
		s.nextShootTime = gameTime() + 0.8;
	} else {
		s.nextShootTime = gameTime() + bInfo.delay * 2;
	}
}

// Death 

function death(victim) {
	if (victim.is('superKb_entangler')) {
		destroy(victim.superKbInfo.entangle)
	}

	if (victim == player) {
		debug.log('DEAD!')
	} else {
		if (victim.is('enemy')) {
			DATA.money += 1;
			updateMoneyCounter();
		}
		destroy(victim);
		//setFreezeFrame(0.1);
	}
}

// Damage flash VFX

function damageFlash(victim, flashType) {
	let flashData = {
		'basic':  DAMAGE_FLASH,
		'poison': POISON_FLASH,
	}[flashType];

	victim.use(shader('flash', () => (flashData)));
	gameScene.wait(0.1, () => { victim.unuse('shader') })
}

// Bullet collide function

function bulletCollision(b, c) {
	if (c.is('enemy') != b.isFromEnemy && !b.hasHit.includes(c.id)) {
		// The axe remembers!?
		b.hasHit.push(c.id);
		b.pierce -= 1;
		
		// Damage victim
		if (c != player) totaldmg += Math.min(c.health, b.info.damage); // deleteme 
		c.health -= b.info.damage;
		if (c == player) updateHealthBar();

		c.lastHitTime = gameTime();

		// Super KB speed reduction
		if (b.info.special.superKb) b.moveVec = b.moveVec.scale(SUPER_KB_IMPACT_SPEED_MULTI);

		// Impact effects
		let spurtScale = 0.85;
		if (c != player) spurtScale = c.info.scale;

		let spurt = gameScene.add([
			sprite('spurt', { 
				anim: 'spurt',
				flipY: rand(0,100) < 50,
			}),
			scale(UNIT / 191 * 2.25 * spurtScale),
			pos(c.pos),
			rotate(b.angle + 90),
			anchor(vec2(-0.333, 0)),
			z(LAYERS.players - 10),
			color(255, 250, 190),
		])
		spurt.onAnimEnd(() => { destroy(spurt); });


		if (c.health <= 0) {
			// Death
			death(c);
		} else {
			// Impact effects (NON-LETHAL ONLY)
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

			// Super knockback

			if (b.info.special.superKb) {
				// Set SUPER knockback
				c.tag('superKb_victim')
	
				if (b.superKbInfo) {
					// Already hit someone with super kb
					c.superKbInfo = {
						entangle: 	null,
						maxSpeed:	b.moveVec,
						hitTime:	gameTime(),
					}
				} else {
					// First super kb hit
					b.superKbInfo = {
						entangle: 		c,
						entangleOffset:	b.lastPos.sub(c.pos).unit().scale(UNIT * c.info.scale / 2),
						firstHitTime:	gameTime(),
					}
					b.tag('superKb_bullet');
					b.lifeTimer.cancel();
					b.lifeTimer = b.wait(SUPER_KB_DURATION, () => { 
						destroy(b); 
					});
	
					c.superKbInfo = {
						entangle: 	b,
						maxSpeed:	b.moveVec,
						hitTime:	gameTime(),
					}
					c.tag('superKb_entangler');
				}
			} else {
				// Set normal knockback
				c.knockbackVec = Vec2.fromAngle(b.angle + 90).scale(UNIT * 5);
			}
		}
		
		// 'Damage' bullet
		if (b.pierce <= 0) destroy(b);
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

	// Super Knockback effects

	if (c.is('superKb_victim')) {
		let skbInfo = c.superKbInfo;

		let multi = 1 - easings.easeInQuad(Math.min(1, 2*(gameTime() - skbInfo.hitTime)));
		c.pos = c.pos.add(skbInfo.maxSpeed.scale(dt() * multi));

		if (gameTime() - skbInfo.hitTime > SUPER_KB_DURATION) {
			c.untag('superKb_victim');
			c.untag('superKb_entangler');
			c.superKbInfo = null;
		}

		if (c.is('superKb_entangler') && c.superKbInfo.entangle) {
			let entangledBullet = c.superKbInfo.entangle;
			entangledBullet.pos = c.pos.add(
				entangledBullet.superKbInfo.entangleOffset
			);
		}
	}
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
	moneyCounter.text = `\$${Math.floor(DATA.money)}`;
}

// Player glisten effect

function updatePlayerGlisten() {
	playerGlisten.angle = -player.angle;

	let a = -player.angle / 360;
	playerGlisten.frame = Math.floor(5 * (
		a - Math.floor(a)
	));
}

// Player leaf rotation

function updatePlayerLeaf() {
	let a = player.angle;
	let pa = player.prevAngle;

	if (Math.abs(a - pa) > 180) {
		if (a > pa) { pa += 360; } 
		else { pa -= 360; }
	}

	let diff = a - pa;

	//debug.log(`${Math.floor(Math.abs(diff))} ... ${Math.round(playerLeaf.targetRotation)}`);

	let maxAngle = 80;
	let topSpeed = 10;

	let newTarget = mapc(
		Math.abs(diff),
		0, topSpeed, 
		0, maxAngle,
	);
	
	newTarget *= -Math.sign(diff);
	playerLeaf.targetRotation = newTarget;
}

// Give a character a shadow

function addCharacterShadow(who) {
	who.add([
		sprite('shadow'),
		pos(0,0),
		anchor('center'),
		z(LAYERS.ground + 1),
		scale(2.3),
		opacity(0.25),
		'characterShadow',
	])
}

// Swap bullet slots

function swapSelectedBullet() {
	if (!GAME_STATUS.IS_SWITCHING_BULLETS) {
		GAME_STATUS.IS_SWITCHING_BULLETS = true;

		DATA.selectedBullet = 1 - DATA.selectedBullet;

		// Animation...

		let bs = [bulletDisplaySlot, bulletDisplaySlotSecondary];
		let bi = [bulletDisplayIcon, bulletDisplayIconSecondary];
		let spriteList = ['bulletSlot_primary', 'bulletSlot_transition', 'bulletSlot_secondary'];
		let duration = 0.2;

		// Loop over the slots— first primary, then secondary
		for (let num = 0; num <= 1; num++) {
			let willBeMainSlot = DATA.selectedBullet == num; // true if this slot is the one actively being equipped
			let initialInfo = bs[0 + willBeMainSlot].default; // { slotScale, slotPos, iconScale, iconPos }
			let targetInfo = bs[1 - willBeMainSlot].default; // { slotScale, slotPos, iconScale, iconPos }

			let thisSlot = bs[num];
			let thisIcon = bi[num];
			
			if (willBeMainSlot) {
				thisSlot.z = LAYERS.ui + BULLET_SLOT_EQUIPPED_Z;
				thisIcon.z = LAYERS.ui + BULLET_ICON_EQUIPPED_Z;
			} else {
				thisSlot.z = LAYERS.ui + BULLET_SLOT_UNEQUIPPED_Z;
				thisIcon.z = LAYERS.ui + BULLET_ICON_UNEQUIPPED_Z;
			}

			gameScene.tween(
				0, 1, duration,
				(t) => {
					// Slot
					thisSlot.pos.x = map(t,0,1, initialInfo.slotPos.x, targetInfo.slotPos.x);
					thisSlot.pos.y = map(t,0,1, initialInfo.slotPos.y, targetInfo.slotPos.y);
					thisSlot.scale.x = map(t,0,1, initialInfo.slotScale.x, targetInfo.slotScale.x);
					thisSlot.scale.y = map(t,0,1, initialInfo.slotScale.y, targetInfo.slotScale.y);
					
					// Icon
					thisIcon.pos.x = map(t,0,1, initialInfo.iconPos.x, targetInfo.iconPos.x);
					thisIcon.pos.y = map(t,0,1, initialInfo.iconPos.y, targetInfo.iconPos.y);
					thisIcon.scale.x = map(t,0,1, initialInfo.iconScale.x, targetInfo.iconScale.x) / thisIcon.spriteScale;
					thisIcon.scale.y = map(t,0,1, initialInfo.iconScale.y, targetInfo.iconScale.y) / thisIcon.spriteScale;

					if (willBeMainSlot) {
						thisSlot.sprite = spriteList[clamp(2 - Math.floor(t*3), 0,2)];
					} else {
						thisSlot.sprite = spriteList[clamp(Math.floor(t*3), 0,2)];
					}
				},
				easings.easeInOutQuad,
			)
		}

		// Revert
		gameScene.wait(duration, () => {
			GAME_STATUS.IS_SWITCHING_BULLETS = false;
		});
	}
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

gameScene.onButtonPress('dash', () => {
	if (player.nextDashTime < gameTime()) {
		player.state = 'dashing';
		player.nextDashTime = gameTime() + DASH_COOLDOWN;

		gameScene.wait(DASH_DURATION, () => {
			player.state = 'normal';
		})
	}
})

gameScene.onButtonPress('swap', () => {
	// Additional logic is within function already
	swapSelectedBullet();
})

//gameScene.onMouseDown(() => {
//	if (!isFreezeFrame()) pressButton('shoot');
//})

gameScene.onButtonDown('shoot', () => {
	if (!isFreezeFrame() && gameTime() > player.nextShootTime) attack({
		source: player,
		type:	DATA.bullets[DATA.selectedBullet],
	});
})

// Change player angle 

gameScene.onMouseMove(() => {
	if (!isFreezeFrame()) {
		player.angle = toWorld(mousePos()).angle(player.pos) - 90;
		updatePlayerGlisten();
	}
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

	// Do player blink

	if (playerEyes.nextBlink < gameTime() && !isFreezeFrame()) {
		playerEyes.play('blink');
		playerEyes.nextBlink = gameTime() + rand(4,8);

		if (player.health <= 33) playerEyes.nextBlink += 2.5;
	}
})

// ---------------------------- //
// ---  EVERY FRAME UPDATE  --- //
// ---------------------------- //


gameScene.onUpdate(() => {

	if (!isFreezeFrame()) {

		gameScene.get('enemy').forEach((c) => {

			// Enemy targetting/aiming

			let target = player.pos;
			let distanceToPlayer = c.pos.sdist(player.pos);

			if (c.info.aimSkill == 1) {
				target = target.add(
					player.moveVec.scale(
						UNIT * PLAYER_SPEED * 2 / BULLETS.appleSeed.speed
					)
				);
			}
			if (c.info.aimSkill == 2) {
				target = target.add(
					player.moveVec.scale(
						Math.sqrt(distanceToPlayer) * PLAYER_SPEED / BULLETS.appleSeed.speed
					)
				);
			}

			target = borderResolve(target);

			let angle = target.angle(c.pos) - 90;
			c.angle = angle;

			// Enemy movement

			if (!c.is('superKb_victim') && distanceToPlayer > (UNIT * c.approachDistance)**2) {
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
		
		if (player.state == 'normal') {
			let w = isButtonDown('up');
			let a = isButtonDown('left');
			let s = isButtonDown('down');
			let d = isButtonDown('right');
			
			let newMoveVec = vec2(0,0);
			
			if (w || a || s || d) {
				if (w) newMoveVec = newMoveVec.add(0, -1);
				if (a) newMoveVec = newMoveVec.add(-1, 0);
				if (s) newMoveVec = newMoveVec.add(0, 1);
				if (d) newMoveVec = newMoveVec.add(1, 0);
			}
			
			// Player movement
			
			player.moveVec = newMoveVec.unit();

			if (Math.abs(player.moveVec.x) > 0.1 || Math.abs(player.moveVec.y) > 0.1) {
				// for dashing
				player.lastMoveVec = player.moveVec;
			}
			player.pos = player.pos.add(
				player.moveVec.scale(
					UNIT * dt() * PLAYER_SPEED
				)
			);

		} else if (player.state == 'dashing') {
			// Dash movement

			player.pos = player.pos.add(
				player.lastMoveVec.scale(
					UNIT * dt() * DASH_SPEED
				)
			)
		}

		processKnockback(player);

		// Player leaf updates

		updatePlayerLeaf();
		player.prevAngle = player.angle;

		// Player border resolution

		player.pos = borderResolve(player.pos);

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

		// Player visual effects

		playerLeaf.angle = decay(playerLeaf.angle, playerLeaf.targetRotation, 20);

		
		gameScene.get('bullet').forEach((b) => {
			
			// Bullet movement

			b.lastPos = b.pos;
			b.pos = b.pos.add(b.moveVec.scale(dt()));

			// Bullet collision
			let victims;
			
			victims = gameScene.get(
				b.isFromEnemy ? 'ally' : 'enemy'
			);

			for (let i = 0; i < victims.length; i++) {
				let v = victims[i];

				let radius = b.info.scale/2 + 0.4;
				radius *= UNIT;

				if (b.pos.sdist(v.pos) < radius * radius && !b.hasHit.includes(v.id)) {
					bulletCollision(b, v);
					break;
				}

				if (b.superKbInfo) {
					let hitboxExtender = b.superKbInfo.entangle;
					let radius2 = hitboxExtender.info.scale/2 + v.info.scale/2;
					if (b.pos.sdist(hitboxExtender.pos) < radius2 * radius2 && !b.hasHit.includes(v.id)) {
						bulletCollision(b, v);
						break;
					}
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

		//debug.log(`${totaldmg}d -- ${totalPsn}p -- $${DATA.money}`)

		if (isKeyDown('z')) setCamScale(0.4);
		if (isKeyDown('x')) { summonEnemy({type: 'basic', count: 5}); };
		//if (isKeyDown('x')) { summonEnemy({type: 'test', count: 5}); };
	};
})

// End of scene
});

go('game');
