/*
	damage:		damage
	speed:		UNITS / sec
	size:		sprite width (px)
	scale:		in game size (UNITS)
*/

const BULLETS = {
	appleSeed: {
		damage: 10,
		speed:  15,
		size:   27,
		scale:  0.3,
	}
}

/*
	seeds:		all potential weapons	[USELESS FOR NOW]
	speed:		UNITS / sec
	health:		health
	size:		sprite width (px)
	scale:		in game size (UNITS)
*/

const ENEMIES = {
	basic: {
		seeds:  ['appleSeed'],
		speed:  2,
		health: 20,
		size:   61,
		scale:  0.85,
	},
	/*swift: {
		seeds:  ['appleSeed'],
		speed:  3.75,
		health: 10,
		size:   61,
		scale:  0.65,
	}*/
}