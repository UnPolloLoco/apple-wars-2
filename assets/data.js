/*
	damage:		damage
	speed:		UNITS / sec
	size:		sprite width (px)
	scale:		in game size (UNITS)
*/

const BULLETS = {
	appleSeed: {
		damage:	10,
		speed:	12,
		size:	27,
		scale:	0.3,
	}
}

/*
	seeds:		all potential weapons	[USELESS FOR NOW]
	speed:		UNITS / sec
	health:		health
	size:		sprite width (px)
	scale:		in game size (UNITS)
	aimSkill:	attack predicts player movement (0 or 1)
*/

const ENEMIES = {
	basic: {
		seeds:		['appleSeed'],
		speed:		2,
		health:		20,
		size:		61,
		scale:		0.85,
		aimSkill:	0,
	},
}