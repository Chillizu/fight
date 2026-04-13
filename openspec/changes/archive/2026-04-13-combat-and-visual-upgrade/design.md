## Technical Design: Combat and Visual Upgrade

### 1. High-Clarity Visuals
- **Solid Colors**: Remove gradients from player-specific UI. P1 uses `#00f2fe`, P2 uses `#ff4e50`.
- **Typography**: Force `Fira Sans 900` for all statistics (HITS, SKILLS). Increase size to 14px and add translucent black background to labels.

### 2. Combat Mechanics: Guard System
- **Input**: Add `down` to `CONTROLS_P1` and `CONTROLS_P2`.
- **State**: `Player.isBlocking` is true when the player is on the ground and holding the down key.
- **Effect**: Damage reduction factor of `0.2` (80% reduction). `checkCombat` in `game.js` skips `skillPoints++` if the target is blocking.
- **Visuals**: `_drawSpriteSheetDynamic` applies `shadowBlur` and `globalAlpha` when `isBlocking` is active.

### 3. Combat Rebalance
- **Timing**: `ATTACK_COOLDOWN_NORMAL` reduced to 14 frames for faster pacing.
- **Collision Window**: Expand detection to `attackTimer > attackDuration - 6`.

### 4. Input Orchestration
- **Context Lock**: `setupKeyboardInput` early returns if `gameState === 'QUESTION'`, preventing characters from moving or attacking during the quiz.
