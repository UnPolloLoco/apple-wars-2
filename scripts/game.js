setCamPos(0, 0);

const player = add([
	sprite('bean'),
	pos(0,0),
	scale(UNIT/61),
	anchor('center'),
	rotate(0),
	z(1),
])

let arenaWidth = ARENA.DIMENSIONS[0];
let arenaHeight = ARENA.DIMENSIONS[1];

for (let x = 0; x < arenaWidth; x++) {
	for (let y = 0; y < arenaHeight; y++) {
		add([
			sprite('grass'),
			color(GREEN),
			pos(
				UNIT*ARENA.TILE_SIZE * (x - arenaWidth/2 + 0.5),
				UNIT*ARENA.TILE_SIZE * (y - arenaHeight/2 + 0.5),
			),
			scale(UNIT/800 * ARENA.TILE_SIZE),
			offscreen({ 
				hide: true,
				distance: UNIT*ARENA.TILE_SIZE,
			}),
			anchor('center'),
		])
	}
}





onButtonPress('shoot', () => {
	add([
		sprite('bullet'),
		pos(player.pos),
		scale(UNIT/27 * 0.3),
		rotate(player.angle),
		move(player.angle + 90, UNIT*10),
		opacity(1),
		lifespan(3),
	])
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





onUpdate(() => {

	// Camera zoom effect

	let targetCamScale = 1 - isMouseDown() * CAMERA.ZOOM.MAGNITUDE;
	setCamScale(
		vec2(
			(getCamScale().x - targetCamScale) 
			/ 2 ** (CAMERA.ZOOM.SPEED * dt()) 
			+ targetCamScale
		)
	);

	// Camera offset effect

	let targetCamOffset = mousePos().sub(center()).scale(CAMERA.ZOOM.MAGNITUDE);
	let nextCamOffset = (
		CAMERA.SHIFT.CURRENT_SHIFT.sub(
			targetCamOffset
		).scale(
			1 / 2 ** (CAMERA.SHIFT.SPEED * dt())
		).add(
			targetCamOffset
		)
	);
	CAMERA.SHIFT.CURRENT_SHIFT = nextCamOffset;
	setCamPos(player.pos.add(nextCamOffset));

})
