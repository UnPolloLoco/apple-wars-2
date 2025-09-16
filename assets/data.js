/*
	name:		pretty title
	damage:		damage
	speed:		UNITS / sec
	size:		sprite width (px)
	scale:		in game width (UNITS)
	delay:		time between manual shots (sec)
	special:
		count:		seeds per shot
		spread:		volley spread (use with count)
		poison:		damage / sec (repeated 3 times)
		superKb:	powerful momentum? (use with pierce)
		pierce:		amount of enemies it can hit
*/
		
const BULLETS = {
	appleSeed: {
		name: 'Apple Seed',
		damage:	10,
		speed:	10,
		size:	27,
		scale:	0.28,
		delay:	0.1,
		special: {}
	},
	strawberrySeed: {
		name: 'Strawberry Seed',
		damage:	6,
		speed:	12,
		size:	27,
		scale:	0.2,
		delay:	0.1,
		special: {
			count:  3,
			spread: 20,
		}
	},
	cherryPit: {
		name: 'Cherry Pit',
		damage:	12,
		speed:	10,
		size:	27,
		scale:	0.3,
		delay:	0.2,
		special: {
			poison: 2, // 20
		}
	},
	test1: {
		name: 'Knockback',
		damage:	15,
		speed:	12,
		size:	27,
		scale:	0.36,
		delay:	0.2,
		special: {
			superKb: true,
			pierce: 8,
		}
	},
	test2: {
		name: 'Pierce',
		damage:	10,
		speed:	10,
		size:	27,
		scale:	0.28,
		delay:	0.2,
		special: {
			pierce: 3,
		}
	},
}

/*
	seeds:		all potential weapons	[USELESS FOR NOW]
	speed:		UNITS / sec
	health:		health
	size:		sprite width (px)
	scale:		in game width (UNITS)
	aimSkill:	attack predicts player movement (0, 1, or 2)
	kbMulti:	knockback multiplyer 
*/

const ENEMIES = {
	basic: {
		seeds:		['appleSeed'],
		speed:		2,
		health:		20,
		size:		61,
		scale:		0.85,
		aimSkill:	0,
		kbMulti:	1,
	},
	heavy: {
		seeds:		['appleSeed'],
		speed:		1.5,
		health:		60,
		size:		61,
		scale:		1.25,
		aimSkill:	1,
		kbMulti:	0.2,
	},
	swift: {
		seeds:		['appleSeed'],
		speed:		3.5,
		health:		10,
		size:		61,
		scale:		0.7,
		aimSkill:	1,
		kbMulti:	1.2,
	},
	test: {
		seeds:		['appleSeed'],
		speed:		0,
		health:		10000000,
		size:		61,
		scale:		0.85,
		aimSkill:	0,
		kbMulti:	1,
	},
}