## Implementation Tasks: Combat and Visual Upgrade

- [x] **Task 1: UI Visual Clarity & Solid Colors**
  - **File:** `css/style.css`, `js/ui.js`
  - **Action:** Switch P1/P2 colors to solid `#00f2fe` and `#ff4e50`.
  - **Details:** Updated `.health-bar-fill`, `.player-name`, and `.avatar-box` colors. Enhanced `.combo-text` font weight to 900 and improved background contrast.

- [x] **Task 2: Guard System Implementation**
  - **File:** `js/player.js`
  - **Action:** Add `isBlocking` state and downward input detection.
  - **Details:** Map `controls.down` to `isBlocking`. Added visual feedback (alpha + glow) during guard stance.

- [x] **Task 3: Combat Rebalance & Detection**
  - **File:** `js/config.js`, `js/game.js`
  - **Action:** Reduce CD and expand hit window.
  - **Details:** `ATTACK_COOLDOWN_NORMAL` set to 14. Hit window expanded to last 6 frames. Implemented 80% damage reduction and blocked skill point gain in `checkCombat`.

- [x] **Task 4: Quiz Input Fix**
  - **File:** `js/game.js`
  - **Action:** Lock movement keys during `QUESTION` state.
  - **Details:** Added state check in `setupKeyboardInput` to prevent input leakage.

- [x] **Task 5: Stylish [[NULL]] Placeholder**
  - **File:** `js/player.js`
  - **Action:** Add glitch animation.
  - **Details:** Improved `_drawPlaceholder` with time-based glitching and shield effects.
