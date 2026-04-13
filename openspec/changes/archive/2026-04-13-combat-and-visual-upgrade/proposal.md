## Why

The game's visual clarity and combat depth need improvement. Small UI text (HITS/SKILLS) is blurry, the color distinction between players is weak due to overlapping gradients, and the combat feels sluggish with imprecise hit detection. Additionally, the downward input is currently underutilized, and the question system has input conflicts.

## What Changes

- **UI High-Clarity Overhaul**: Switch from gradients to high-contrast solid colors for P1 (#00f2fe) and P2 (#ff4e50). Use bold Fira Sans (900 weight) for all key HUD stats.
- **Combat Mechanics - Guard System**: Implement a block/guard mechanic mapped to the "Down" input (S/ArrowDown). Blocking reduces incoming damage by 80% and prevents the attacker from gaining skill points.
- **Numerical Rebalance**: Reduce attack cooldowns (from 22 to 14 frames) and expand the hit detection window (last 6 frames instead of 3).
- **Question System Fix**: Implement an input lock during the `QUESTION` state to ensure keyboard inputs are correctly mapped to answers and don't leak into player movement.

## Capabilities

### New Capabilities
- `guard-system`: Logic for damage reduction and stance change during downward input.
- `input-orchestrator`: Global management of input contexts (PLAYING vs QUESTION).

### Modified Capabilities
- `arcade-ui-system`: Updated for clarity and solid color distinction.
- `combat-engine`: Rebalanced timings and hitboxes.

## Impact

- `js/player.js`: Implementation of guard stance and damage reduction.
- `js/game.js`: Balance changes, input handling overhaul, and combat logic.
- `css/style.css`: UI visual clarity updates.
- `js/ui.js`: HUD updates for better visibility.
- `js/config.js`: Global constant updates.
