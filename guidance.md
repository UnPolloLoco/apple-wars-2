# Code Guidance Document

For when memory fails...

&nbsp;


## Main Terminology

- *"Applesauced/sauced"*: killed
- *"Trickle"*: Low-level enemies spawning over time

&nbsp;


## Code Terminology

- *"Bullet display"*: Bullet selector/indicator on game UI
- *"Bullet display slot"*: Background disc on bullet display
- *"Bullet display icon"*: Bullet sprite on bullet display

&nbsp;


## Tags

- `character`: Any living thing
- `ally`: Will not attack player; includes player
- `enemy`: Will attack player
- `bullet`: Is a bullet

&nbsp;


## *character*.state

- `normal`: All as usual
- `dashing`: Actively dashing

&nbsp;


## GAME_STATUS

**`STATE`**: Current state of the game
- *String*
- `normal`: All as usual
- `cutscene`: Active cutscene; player inputs should be blocked
- `death`: Death animation or end screen

&nbsp;

**`LOCATION`**: Where the player is
- *String*
- `camp`: At camp; no enemies spawn
- `level#`: In battle (ex. 'level1')

&nbsp;

**`PHASE`**: Where the player is
- `NAME`
	- *String*
	- `t#`: Trickle; normal enemy spawn (ex. 't1')
	- `b#`: Bossfight; happens after trickle of same number (ex. 'b1')
	- `final`: Final boss, only after level3 b3
- `TIME`
	- *Number*
	- Tracks which enemies spawn when during trickle
	- Unused during bosses
	- Counts up the same speed as GAME_TIME, but can be skipped forward if enemies are sauced fast enough