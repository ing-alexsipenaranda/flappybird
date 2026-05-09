# Implementation Plan: Flappy Bird Game

## Overview

This plan breaks the Flappy Bird implementation into incremental coding tasks, each building on the previous. Tasks follow the module structure defined in the design document. Each task produces working, integrated code — no orphaned modules. Property-based tests use **fast-check** and run with **Vitest**.

Tasks marked with `*` are optional (test tasks) and can be skipped for a faster MVP.

---

## Tasks

- [ ] 1. Project scaffold and configuration
  - Create the directory structure: `/flappy-bird`, `/css`, `/js`, `/js/vendor`, `/assets/images`, `/assets/sounds`, `/tests`
  - Create `index.html` with a `<canvas id="gameCanvas">` element, links to `styles.css`, and a `<script type="module" src="js/game.js">`
  - Create `css/styles.css` with base reset, body centering, canvas styling, and responsive meta viewport
  - Create `js/game.js` with the exported `CONFIG` object containing all configurable constants (gravity, jump velocity, pipe speeds, gap sizes, delta time cap, etc.)
  - Add a `README.md` with project description and Capacitor APK export instructions (`npx cap init`, `npx cap add android`, `npx cap sync`)
  - _Requirements: 17.1, 17.2, 17.4, 18.1, 18.2, 18.4_

- [ ] 2. StorageManager module
  - [~] 2.1 Implement `StorageManager` class in `js/storage.js`
    - Implement `getHighScore()`, `setHighScore(score)` using key `flappybird_highscore`, default `0`
    - Implement `getDifficulty()`, `setDifficulty(d)` using key `flappybird_difficulty`, default `'NORMAL'`
    - Implement `getDarkMode()`, `setDarkMode(enabled)` using key `flappybird_darkmode`, default `false`
    - Implement `getVolume()`, `setVolume(level)` using key `flappybird_volume`, default `0.8`
    - Implement `resetHighScore()` to delete the high score key
    - Wrap all localStorage access in try/catch; fall back to an in-memory Map on failure
    - Serialize/deserialize all values with JSON; return defaults for missing or invalid values
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [ ]* 2.2 Write property tests for StorageManager
    - **Property 9: High Score Persistence Round Trip** — for any score value, `setHighScore(s)` then `getHighScore()` returns `s`
    - **Property 10: StorageManager Default Values** — for any missing/invalid key, getter returns correct default without throwing
    - Also test round-trips for difficulty, darkMode, and volume keys
    - Mock localStorage as unavailable; verify in-memory fallback works correctly
    - _Requirements: 10.1–10.7_

- [ ] 3. Physics module
  - [~] 3.1 Implement `Physics` class in `js/physics.js`
    - Implement `update(player, deltaTime)`: apply `GRAVITY * deltaTime` to `player.vy`; clamp player to top boundary (set `vy = 0` if `player.y <= 0`)
    - Implement `checkCollisions(player, pipes, canvasHeight)`: return `{ hit: boolean, type: 'pipe'|'floor'|null }`
    - Use AABB intersection between `player.getBounds()` (shrunk hitbox) and each pipe's upper and lower rectangles
    - Return `{ hit: true, type: 'floor' }` when `player.y + player.height >= canvasHeight`
    - _Requirements: 2.2, 2.6, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 3.2 Write property tests for Physics
    - **Property 1: Delta Time Cap** — for any timestamp gap, capped deltaTime never exceeds 0.1s (test in Game.tick logic)
    - **Property 2: Gravity Integration Monotonicity** — for any `(vy=0, dt>0)`, after `applyGravity`, `newVy > 0`
    - **Property 3: Jump Velocity Override** — for any player `vy`, after `jump()`, `player.vy === JUMP_VELOCITY`
    - **Property 7: Collision Hitbox Shrink** — for any sprite size, `getBounds()` returns `size * 0.70`
    - Test floor collision: for any `player.y >= canvasHeight`, returns `{ hit: true, type: 'floor' }`
    - Test pipe collision: for any overlapping player/pipe AABB, returns `{ hit: true, type: 'pipe' }`
    - _Requirements: 1.6, 2.2, 2.3, 4.2, 4.3, 4.4_

- [ ] 4. Player module
  - [~] 4.1 Implement `Player` class in `js/player.js`
    - Constructor accepts `(canvas, config)`; store canvas reference and config
    - Implement `reset()`: set `x = canvas.width * PLAYER_X_RATIO`, `y = canvas.height / 2`, `vy = 0`, `frameIndex = 0`, `frameTimer = 0`
    - Implement `update(deltaTime)`: advance `frameTimer`; cycle `frameIndex` through 0–2 at `SPRITE_FPS`
    - Implement `jump()`: set `this.vy = config.JUMP_VELOCITY`
    - Implement `getBounds()`: return `{ x, y, w, h }` where w/h are `spriteSize * COLLISION_SHRINK`, centered on sprite
    - Implement `render(ctx)`: draw a programmatic bird sprite using canvas 2D API (body arc, beak, eye, wing in 3 positions); apply rotation based on `vy` (clamped to ±90°) using `ctx.save/restore/rotate`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.2_

  - [ ]* 4.2 Write property tests for Player
    - **Property 3: Jump Velocity Override** — for any initial `vy`, after `jump()`, `player.vy === JUMP_VELOCITY`
    - Test `reset()` positions player at `canvas.width * 0.25` for any canvas width
    - Test animation frame cycling: for any elapsed time, `frameIndex === floor(t * SPRITE_FPS) % SPRITE_FRAMES`
    - _Requirements: 2.1, 2.3, 2.5_

- [ ] 5. PipeManager module
  - [~] 5.1 Implement `PipeManager` class in `js/pipes.js`
    - Constructor accepts `(canvas, config, difficulty)`; initialize empty pipe array, spawn timer, current speed
    - Implement `reset()`: clear pipes array, reset timer and speed to difficulty defaults
    - Implement `update(deltaTime)`: advance spawn timer; when timer >= interval, call `_spawnPipe()`; move all pipes left by `speed * deltaTime`; remove pipes where `x + PIPE_WIDTH < 0`
    - Implement `_spawnPipe()`: calculate random `gapTop` such that `gapTop >= 80` and `gapTop + gap <= canvasHeight - 80`; push `{ x: canvasWidth, gapTop, gapBottom: gapTop + gap, width: PIPE_WIDTH, passed: false }`
    - Implement `getPipes()`: return copy of active pipes array
    - Implement `incrementDifficulty(score)`: set `speed = min(initialSpeed + floor(score/10)*5, PIPE_SPEED_MAX)`
    - Implement `render(ctx)`: draw each pipe's upper and lower segments with green gradient and border
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 5.2 Write property tests for PipeManager
    - **Property 4: Pipe Gap Boundary Invariant** — for any `(canvasHeight, gap)`, generated pipe has `gapTop >= 80` and `gapBottom <= canvasHeight - 80`
    - **Property 5: Pipe Gap Size by Difficulty** — for any difficulty, all pipes have `gapBottom - gapTop === configuredGap`
    - **Property 6: Pipe Speed Progression** — for any score S, `speed === min(initialSpeed + floor(S/10)*5, MAX_SPEED)`
    - **Property 8: Score Increment on Pipe Pass** — for any pipe crossing, score increments by 1 and `pipe.passed = true`
    - Test pipe removal: for any pipe with `x + width < 0`, it is absent from `getPipes()` after update
    - Test pipe spawn position: for any canvas width, new pipe `x >= canvasWidth`
    - _Requirements: 3.1–3.7, 5.2_

- [ ] 6. InputHandler module
  - [~] 6.1 Implement `InputHandler` class in `js/input.js`
    - Constructor accepts `(canvas, config)`; initialize `lastJumpTime = 0`
    - Implement `onJump(callback)` and `onPause(callback)` to register callbacks
    - Register `keydown` listener: fire jump on Space/ArrowUp (prevent default); fire pause on Escape
    - Register `mousedown` listener: fire jump on primary button click
    - Register `touchstart` listener: fire jump on any touch contact (prevent default); record `touchStartY`
    - Register `touchend` listener: if `touchStartY - touchEndY > 50px`, fire jump (swipe-up gesture)
    - Debounce jump: only fire if `Date.now() - lastJumpTime >= INPUT_DEBOUNCE_MS`; update `lastJumpTime` on fire
    - Implement `destroy()`: remove all registered event listeners
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 15.4_

  - [ ]* 6.2 Write property tests for InputHandler
    - **Property 11: Input Debounce** — for any sequence of jump events with varying intervals, callbacks only fire when gap >= `INPUT_DEBOUNCE_MS`
    - Test Space and ArrowUp keys trigger jump callback
    - Test mousedown triggers jump callback
    - Test touchstart triggers jump callback
    - Test swipe-up gesture triggers jump callback
    - Test `destroy()` removes all listeners (no callbacks fire after destroy)
    - _Requirements: 8.1–8.8, 15.4_

- [ ] 7. AudioManager module
  - [~] 7.1 Implement `AudioManager` class in `js/audio.js`
    - Constructor: set `audioCtx = null`, `gainNode = null`, `volume = 0.8`
    - Implement `init()`: create `AudioContext`, create master `GainNode`, set `gainNode.gain.value = volume`; wrap in try/catch for unsupported browsers
    - Implement `_playTone(startFreq, endFreq, duration, type)`: create `OscillatorNode` + `GainNode`; set frequency ramp; connect to master gain; start and stop after `duration`ms
    - Implement `playJump()`: call `_playTone(400, 600, 0.1, 'sine')`
    - Implement `playPoint()`: call `_playTone(880, 880, 0.15, 'square')`
    - Implement `playCollision()`: call `_playTone(300, 100, 0.3, 'sawtooth')`
    - Implement `playGameOver()`: call `_playTone(200, 50, 0.5, 'sawtooth')`
    - Implement `setVolume(level)`: clamp `level` to [0, 1]; update `gainNode.gain.value`
    - Implement `destroy()`: call `audioCtx.close()` if context exists
    - All methods are no-ops if `audioCtx` is null (graceful degradation)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [ ]* 7.2 Write property tests for AudioManager
    - **Property 14: Volume Clamp** — for any numeric input to `setVolume()`, resulting gain is in [0.0, 1.0]
    - Test that all play methods are no-ops when AudioContext is unavailable (mock `window.AudioContext = undefined`)
    - Test `init()` creates AudioContext only once (idempotent)
    - _Requirements: 9.6, 9.7_

- [ ] 8. ParticleSystem module
  - [~] 8.1 Implement `ParticleSystem` class in `js/particles.js`
    - Constructor: initialize `particles = []`
    - Implement `emitCollision(x, y)`: push 12–16 particles with random velocities, red/orange colors, 0.5–0.8s lifetime
    - Implement `emitPoint(x, y)`: push 6–8 particles with random velocities, yellow/white colors, 0.3–0.5s lifetime
    - Implement `update(deltaTime)`: for each particle, subtract `deltaTime` from `life`, update `x += vx * deltaTime`, `y += vy * deltaTime`; apply gravity to `vy`; filter out particles where `life <= 0`
    - Implement `render(ctx)`: for each particle, draw a circle with `alpha = life / maxLife`
    - Implement `reset()`: set `particles = []`
    - _Requirements: 11.5, 11.6_

  - [ ]* 8.2 Write property tests for ParticleSystem
    - **Property 13: Particle Lifetime Decay** — for any particle, `life` strictly decreases each frame by `deltaTime`, and particle is removed when `life <= 0`
    - Test `emitCollision()` produces particles with red/orange colors
    - Test `emitPoint()` produces particles with yellow/white colors
    - Test `reset()` clears all particles
    - _Requirements: 11.5, 11.6_

- [ ] 9. Background module
  - [~] 9.1 Implement `Background` class in `js/background.js`
    - Constructor accepts `(canvas, config)`; initialize scroll offsets for 3 layers: `farOffset = 0`, `midOffset = 0`, `nearOffset = 0`
    - Implement `update(pipeSpeed, deltaTime)`: update offsets — `farOffset += pipeSpeed * 0.20 * deltaTime`, `midOffset += pipeSpeed * 0.50 * deltaTime`, `nearOffset += pipeSpeed * 0.80 * deltaTime`; wrap offsets at canvas width
    - Implement `render(ctx, darkMode)`: draw sky gradient (light blue or dark navy based on darkMode); draw far clouds at `farOffset`; draw mid clouds at `midOffset`; draw near clouds/hills at `nearOffset`; draw ground strip at bottom
    - Implement `reset()`: set all offsets to 0
    - _Requirements: 11.2, 11.3, 12.2_

  - [ ]* 9.2 Write property tests for Background
    - **Property 12: Parallax Layer Speed Ratios** — for any pipe speed value and deltaTime, verify `farOffset` increases by `speed * 0.20 * dt`, `midOffset` by `speed * 0.50 * dt`, `nearOffset` by `speed * 0.80 * dt`
    - _Requirements: 11.3_

- [ ] 10. UI module
  - [~] 10.1 Implement `UI` class in `js/ui.js`
    - Constructor accepts `(canvas, config)`; store canvas and 2D context reference
    - Implement `render(gameState, score, highScore, darkMode, difficulty, isTouchDevice)`: delegate to appropriate screen renderer based on `gameState`
    - Implement `renderHUD(score)`: draw score text at top-center, font size >= 32px, with drop shadow; draw pause button (top-right corner)
    - Implement `renderIdle(highScore, difficulty, darkMode, isTouchDevice)`: draw title, high score, difficulty selector (EASY/NORMAL/HARD buttons), dark mode toggle, settings button, touch control hints if touch device
    - Implement `renderPaused()`: draw semi-transparent overlay; draw "PAUSED" text; draw Resume, Restart, Menu buttons
    - Implement `renderGameOver(score, highScore)`: draw "GAME OVER" text; draw current score and high score; draw Restart and Menu buttons
    - Implement `renderSettings(volume, difficulty, darkMode, highScore)`: draw volume slider, difficulty selector, dark mode toggle, reset high score button, close button
    - Implement `setScale(scaleX, scaleY)`: store scale factors; apply to all element position calculations
    - All positions computed as fractions of canvas dimensions for responsive scaling
    - _Requirements: 5.3, 5.6, 5.7, 6.1, 7.1, 7.2, 7.6, 11.7, 12.1, 12.3, 13.1, 13.2, 14.1, 14.2, 15.3, 15.5_

  - [ ]* 10.2 Write unit tests for UI
    - Test `renderHUD` uses font size >= 32px
    - Test `renderIdle` renders difficulty selector with 3 options
    - Test `renderGameOver` shows both current score and high score
    - Test `setScale` correctly scales element positions
    - _Requirements: 5.3, 5.6, 5.7, 11.7_

- [~] 11. Checkpoint — Core modules complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify StorageManager, Physics, Player, PipeManager, InputHandler, AudioManager, ParticleSystem, Background, and UI modules are individually functional.

- [ ] 12. Game orchestrator — wiring all modules together
  - [~] 12.1 Complete `Game` class implementation in `js/game.js`
    - Constructor accepts `canvas`; instantiate all subsystems: `StorageManager`, `AudioManager`, `InputHandler`, `Physics`, `Player`, `PipeManager`, `ParticleSystem`, `Background`, `UI`
    - Implement `init()`: load persisted settings (difficulty, darkMode, volume, highScore); apply to subsystems; register input callbacks (`onJump`, `onPause`); register `resize` event listener; call `changeState(GameState.IDLE)`
    - Implement `start()`: call `requestAnimationFrame(this.tick.bind(this))`
    - Implement `tick(timestamp)`: calculate `deltaTime = min((timestamp - lastTime) / 1000, DELTA_TIME_CAP)`; update `lastTime`; call `update(deltaTime)` if PLAYING; call `render()`; schedule next RAF
    - Implement `update(deltaTime)`: call `physics.update(player, deltaTime)`; call `player.update(deltaTime)`; call `pipeManager.update(deltaTime)`; call `particleSystem.update(deltaTime)`; call `background.update(pipeSpeed, deltaTime)`; call `_checkCollisions()`; call `_checkScoring()`
    - Implement `_checkCollisions()`: call `physics.checkCollisions(player, pipeManager.getPipes(), canvas.height)`; if hit, play collision sound, emit collision particles, call `changeState(GAME_OVER)`
    - Implement `_checkScoring()`: for each pipe not yet `passed` where `player.x > pipe.x + pipe.width/2`, increment score, set `pipe.passed = true`, play point sound, emit point particles, call `pipeManager.incrementDifficulty(score)`
    - Implement `changeState(newState)`: update `gameState`; handle side effects (reset on PLAYING start, save high score on GAME_OVER, init AudioContext on first interaction)
    - Implement `restart()`: reset score, player, pipeManager, particleSystem, background; change state to PLAYING
    - Implement `destroy()`: cancel RAF, call `inputHandler.destroy()`, call `audioManager.destroy()`, remove resize listener
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 5.1, 5.2, 5.4, 5.5, 7.1–7.8, 17.3, 17.5, 17.6_

  - [~] 12.2 Implement canvas resize handling
    - In `init()`, add `window.addEventListener('resize', this._onResize.bind(this))`
    - Implement `_onResize()`: recalculate canvas dimensions maintaining target aspect ratio (9:16 mobile, 4:3 desktop); add letterbox bands if needed; call `ui.setScale()`; call `player.reset()` position (preserve game state)
    - _Requirements: 15.1, 15.2, 15.3_

  - [~] 12.3 Implement UI button hit detection
    - In `InputHandler` or `Game`, add `click`/`touchend` listener on canvas for button interactions
    - Map canvas-space click coordinates to UI button regions (difficulty selector, pause, restart, menu, settings, dark mode toggle, volume slider)
    - Dispatch appropriate game actions based on which button was clicked
    - _Requirements: 6.1, 6.2, 7.3, 7.5, 7.6, 7.7, 7.8, 12.1, 13.1, 13.3, 13.4, 13.5, 14.1, 14.4, 14.5_

  - [~] 12.4 Implement dark mode and settings persistence
    - When dark mode is toggled: call `storageMgr.setDarkMode(enabled)`; update `darkMode` flag; re-render
    - When difficulty is changed: call `storageMgr.setDifficulty(d)`; update `pipeManager` config
    - When volume is changed: call `audioMgr.setVolume(level)`; call `storageMgr.setVolume(level)`
    - When high score is reset: call `storageMgr.resetHighScore()`; update `highScore = 0`; re-render
    - _Requirements: 10.2, 10.3, 10.4, 12.4, 13.3, 13.4_

- [~] 13. Checkpoint — Full game loop working
  - Ensure all tests pass, ask the user if questions arise.
  - Verify the complete game loop: IDLE → PLAYING → GAME_OVER → restart → PLAYING works end-to-end.
  - Verify score increments, high score saves, difficulty progression, and pause/resume all function correctly.

- [ ] 14. PWA and Service Worker
  - [~] 14.1 Create `manifest.json`
    - Add `name`, `short_name`, `description`, `start_url`, `display: "standalone"`, `background_color`, `theme_color`
    - Add icon entries for 192×192 and 512×512 (programmatically generated PNG data URIs or inline SVG icons)
    - Link manifest in `index.html` via `<link rel="manifest">`
    - _Requirements: 16.1_

  - [~] 14.2 Implement `sw.js` Service Worker
    - Define `CACHE_NAME` with version string and list of files to cache: `index.html`, `css/styles.css`, all `js/*.js` files, `manifest.json`
    - Implement `install` event: open cache, add all files with `cache.addAll()`
    - Implement `fetch` event: respond with cached resource if available (`cache.match()`), fall back to network
    - Implement `activate` event: delete old caches that don't match current `CACHE_NAME`
    - Register service worker in `index.html` or `game.js` using `navigator.serviceWorker.register('./sw.js')` wrapped in feature detection and try/catch
    - _Requirements: 16.2, 16.3, 16.4, 16.5_

- [~] 15. Download fast-check for offline property testing
  - Download `fast-check` UMD bundle and save as `js/vendor/fast-check.js`
  - Add `package.json` with `vitest` as dev dependency and test script
  - Create `vitest.config.js` with canvas mock setup
  - Create `tests/setup.js` with lightweight canvas 2D context mock
  - _Requirements: 17.1_

- [ ] 16. Final integration tests
  - [ ]* 16.1 Write game state machine integration tests in `tests/game.test.js`
    - Test IDLE → PLAYING transition on jump input
    - Test PLAYING → PAUSED on Escape key
    - Test PAUSED → PLAYING on Escape key
    - Test PLAYING → GAME_OVER on collision
    - Test GAME_OVER → PLAYING on restart
    - Test GAME_OVER → IDLE on menu
    - Test score resets to 0 on restart
    - Test high score is saved when score > highScore
    - _Requirements: 7.1–7.8, 5.1, 5.4, 5.5_

  - [ ]* 16.2 Write responsive layout property tests in `tests/game.test.js`
    - **Property 15 (canvas resize)**: for any window dimensions, canvas aspect ratio matches target after resize
    - **Property (UI scaling)**: for any canvas scale factor, UI element positions scale proportionally
    - _Requirements: 15.1, 15.2, 15.3_

- [~] 17. Final checkpoint — All tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Open `index.html` in a browser and verify: game starts, bird jumps, pipes generate, score increments, game over triggers, restart works, high score persists, dark mode toggles, settings screen opens, pause works, PWA installs.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties using fast-check (min 100 iterations each)
- Unit tests validate specific examples, state transitions, and error conditions
- All canvas drawing is programmatic — no external image files required
- All sounds are synthesized via Web Audio API — no external audio files required
- The game runs fully offline by opening `index.html` directly
