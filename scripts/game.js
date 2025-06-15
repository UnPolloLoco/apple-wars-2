setCamPos(0, 0);

const player = add([
	sprite('bean'),
	pos(0,0),
	scale(UNIT/61),
	anchor('center'),
	rotate(0),
	z(1),
])

let arena_width = ARENA_DIMENSIONS[0];
let arena_height = ARENA_DIMENSIONS[1];

for (let x = 0; x < arena_width; x++) {
	for (let y = 0; y < arena_height; y++) {
		add([
			sprite('grass'),
			color(GREEN),
			pos(
				UNIT*ARENA_TILE_SIZE * (x - arena_width/2 + 0.5),
				UNIT*ARENA_TILE_SIZE * (y - arena_height/2 + 0.5),
			),
			scale(UNIT/800 * ARENA_TILE_SIZE),
			offscreen({ 
				hide: true,
				distance: UNIT*ARENA_TILE_SIZE,
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

onMouseMove(() => {
	player.angle = toWorld(mousePos()).angle(player.pos) - 90;
})

onMouseDown(() => {
	player.pos = player.pos.add(
		Vec2.fromAngle(player.angle + 90)
		.scale(UNIT * dt() * PLAYER_SPEED)
	);

	setCamPos(player.pos);
})

onUpdate(() => {

	let target_cam_scale = 1 - isMouseDown() * CAM_ZOOM_MAGNITUDE;
	setCamScale(
		vec2(
			(getCamScale().x - target_cam_scale) 
			/ 2 ** (CAM_ZOOM_SPEED*dt()) 
			+ target_cam_scale
		)
	);

})
