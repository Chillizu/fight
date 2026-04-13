## Implementation Tasks: Arcade Visual Overhaul and Sprite Stability

### Phase 1: Sprite Normalization

- [x] **Task 1: Add Sprite Analysis Logic**
  - **File:** `js/ui_extend.js`
  - **Action:** Update the `analyzeSpriteSheet` function (or equivalent parsing logic).
  - **Details:** Add logic to iterate over all valid frames in the sprite sheet to calculate `canonicalW` (maximum width) and `canonicalH` (maximum height). Also, determine `globalBottomRel` (the lowest non-transparent pixel relative to the frame top) to establish a consistent ground anchor. Return these values in the parsed sprite data object.

- [x] **Task 2: Update Dynamic Drawing Logic**
  - **File:** `js/player.js`
  - **Action:** Modify the `_drawSpriteSheetDynamic` method.
  - **Details:** Update the rendering logic to utilize `canonicalW`, `canonicalH`, and `globalBottomRel` if they exist. Calculate a universal `drawScale` based on the character's height and `canonicalH`. Use this scale to determine the drawing dimensions and position the sprite such that the `globalBottomRel` aligns with the character's baseline/ground position. Fall back to frame-specific dimensions if canonical data is absent.

### Phase 2: Arcade Visual Overhaul (CSS)

- [x] **Task 3: Implement Arcade Typography**
  - **File:** `index.html` (and/or `css/style.css`)
  - **Action:** Import the 'Fira Sans' font from Google Fonts (weights 400, 700, 900).
  - **Details:** Add `<link>` tags to `index.html` or an `@import` in `style.css`. Update the CSS font-family declarations to use 'Fira Sans', particularly setting headings, UI text, and health bars to bold/black weights, possibly with `text-transform: uppercase` for the arcade feel.

- [x] **Task 4: Remove Rounded Corners (Square UI)**
  - **File:** `css/style.css`
  - **Action:** Remove `border-radius` properties globally.
  - **Details:** Search for all instances of `border-radius` in `style.css` (affecting `.health-bar`, `.energy-bar`, `.character-card`, `.action-button`, `.dialog-box`, `.key`, inputs, etc.) and remove them or set them to `0` to enforce sharp, square corners.

- [x] **Task 5: Maximize Screen Fill**
  - **File:** `css/style.css`
  - **Action:** Adjust container sizing for `#game-wrapper` and `#game-container`.
  - **Details:** Modify CSS rules to ensure the game area maximizes the available viewport space. This might involve setting `width: 100vw; height: 100vh; max-width: none;` or adjusting flex/grid layouts to minimize empty margins.

### Phase 3: Polish (Optional / Follow-up)

- [x] **Task 6: Update Default Assets & Feedback**
  - **File:** `js/config.js`, `js/game.js`
  - **Action:** Update default P1 sprite path and add hit feedback.
  - **Details:** Change the default character asset to the new AI-generated sprite. Implement screen shake and hit-stop logic in the combat loop.
