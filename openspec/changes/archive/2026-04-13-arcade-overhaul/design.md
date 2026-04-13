## Technical Design: Arcade Visual Overhaul and Sprite Stability

### 1. Sprite Normalization (Sprite Stability)
To solve the visual jumping and character scaling issues across different animations (idle, run, attack), we will implement a global normalization algorithm in `js/ui_extend.js` and `js/player.js`.

**Concept**:
Instead of scaling each animation frame individually based on its own dimensions, we calculate a single global scale based on the largest frame across the entire sprite sheet.

**Algorithm details**:
1. **Analyze Sprite Sheet (`js/ui_extend.js`)**:
   - Parse the uploaded sprite sheet and analyze all non-empty frames across all rows.
   - Calculate `canonicalW` (max width across all valid frames) and `canonicalH` (max height across all valid frames).
   - Find `globalBottomRel`: the maximum relative vertical offset of the visible pixel data from the top of the frame. This represents the "ground" line.
   - Return these canonical properties along with the analyzed sprite data.

2. **Render Sprite Sheet (`js/player.js`)**:
   - In `_drawSpriteSheetDynamic`, check if `canonicalW`, `canonicalH`, and `globalBottomRel` are available.
   - Determine `drawScale` based on the character's designated height (`this.height`) relative to `canonicalH`, ensuring consistent scaling for all frames.
   - Calculate `drawW` and `drawH` based on `canonicalW` and `canonicalH` multiplied by `drawScale`.
   - Ensure the character's feet align correctly with the ground by adjusting the `y` coordinate drawing offset using `globalBottomRel` multiplied by `drawScale`.
   - Default to the current frame-based dimension logic if canonical data is missing to ensure backward compatibility.

### 2. Arcade Visual Overhaul
The UI will be updated to a Neo-Retro Arcade style.

**UI Adjustments (`css/style.css`)**:
1. **Square Corners**: 
   - Remove `border-radius` from all UI elements (`.character-card`, `.health-bar`, `.energy-bar`, `.controls-hint`, `.key`, `.action-button`, `.dialog-box`, buttons, inputs, etc.).
   - This creates a sharper, blockier arcade cabinet feel.

2. **Typography**:
   - Change the primary font to a bold, striking arcade-style font. We will use 'Fira Sans', specifically the 'Black' (900) or 'Bold' (700) weight for headings/UI elements, often styled in all caps.
   - Add Google Fonts import for `Fira Sans:wght@400;700;900` to `index.html` or `style.css`.
   - Update CSS variables for fonts if they exist, or globally apply to `.arcade-title`, `.score-text`, `.player-name`, etc.

3. **Screen Fill / Container Sizing**:
   - Adjust `#game-wrapper` and `#game-container` in `css/style.css`.
   - Ensure `#game-wrapper` utilizes maximum available screen space, minimizing dead margins or letterboxing unless aspect-ratio constraints mandate it.
   - Make the canvas container tightly bound to the viewport or a large arcade monitor ratio (like 16:9 or 4:3).

### 3. Default Content and Impact Feedback
*These are mentioned in the proposal but not strictly assigned files in the prompt. For completeness, they would involve:*
- `js/config.js`: Setting a default P1 character sprite path.
- `js/game.js`: Adding screen shake functions and applying hit-stop (pause execution for a few frames) upon successful hits.
