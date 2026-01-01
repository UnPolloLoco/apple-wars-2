// ----------------------------------------------- BULLETS -----------------------------------------------

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
		size:	28,
		scale:	0.28,
		delay:	0.1,
		special: {}
	},
	strawberrySeed: {
		name: 'Strawberry Seed',
		damage:	6,
		speed:	12,
		size:	22,
		scale:	0.22,
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
		size:	28,
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
		size:	28,
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
		size:	28,
		scale:	0.28,
		delay:	0.2,
		special: {
			pierce: 3,
		}
	},
}

// ----------------------------------------------- ENEMIES -----------------------------------------------

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
		size:		85,
		scale:		0.85,
		aimSkill:	0,
		kbMulti:	1,
	},
	heavy: {
		seeds:		['appleSeed'],
		speed:		1.5,
		health:		60,
		size:		85,
		scale:		1.25,
		aimSkill:	1,
		kbMulti:	0.2,
	},
	swift: {
		seeds:		['appleSeed'],
		speed:		3.5,
		health:		10,
		size:		85,
		scale:		0.7,
		aimSkill:	1,
		kbMulti:	1.2,
	},
	test: {
		seeds:		['appleSeed'],
		speed:		0,
		health:		10000000,
		size:		85,
		scale:		0.85,
		aimSkill:	0,
		kbMulti:	1,
	},
}

// ----------------------------------------------- ZONES -----------------------------------------------

/*
	bounds:		[ 
					[ [pos], [size] ],		(ARENA TILES)
					... 
				]

	spawn:		[pos] (ARENA TILES)

	deco:		[
					{
						sprite:		which sprite gets placed
						all:		default settings for everything in this section
										same subitems as 'list'
						list:		per-object settings such as position
									[
										{
											pos:		[x, y] (ARENA TILES)
											angle:		rotation (degrees) OR 'random' for *seeded* random
											scale:		scale factor (UNITS)
										},
										...
									]
					},
					...
				]
*/

const ZONES = {
	// -------------- CAMP --------------
	camp: {
		spawn:		[2,2],
		bounds:		[
			[[0,0], [4,4]],
		],
		deco: [
			{ 
				sprite: 'tree',
				all: {
					angle: 'random',
					scale: 7 / 200,
				},
				list: [
					{ pos: [0,0] },
					{ pos: [2,4] },
				]
			},
			{ 
				sprite: 'tent',
				all: {
					scale: 6 / 200,
				},
				list: [
					{ pos: [-2,0], angle: 0 },
				]
			},
			{ 
				sprite: 'altar',
				all: {},
				list: [
					{ 
						pos: [3,0], 
						angle: 0, 
						scale: 4.5 / 200
					},
				]
			},	
		],
	},
	// -------------- ARENA 1 --------------
	arena1: {
		spawn:		[4,3],
		bounds:		[
			[[0,0], [8,6]],
		],
		deco: [

		],
	},
}