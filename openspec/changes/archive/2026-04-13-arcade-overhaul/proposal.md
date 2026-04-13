## Why

The current character sprite rendering has inconsistent sizes between animations (idle, run, attack), causing visual jumping/segmentation. Additionally, the UI needs a more authentic and immersive "Arcade" (街机) feel to match the game's core theme.

## What Changes

- **Sprite Stabilization**: Implement a fixed-anchor, global-scale normalization algorithm for sprite sheet analysis and rendering.
- **Visual Overhaul**: Transform the UI into a Neo-Retro Arcade style with sharp corners, high-contrast colors, and bold typography.
- **Default Content**: Set a high-quality AI-generated sprite as the default P1 character.
- **Impact Feedback**: Enhance the combat feel with stronger hit-stop and screen shake effects.

## Capabilities

### New Capabilities
- `sprite-normalization`: Logic for ensuring consistent character scale and ground alignment across different animation frames.
- `arcade-ui-system`: A design system for arcade-style HUD, borders, and typography.

### Modified Capabilities
- None

## Impact

- `js/ui_extend.js`: Core sprite analysis logic.
- `js/player.js`: Character rendering and positioning.
- `js/config.js`: Default asset paths and game constants.
- `css/style.css`: All UI styling.
- `js/game.js`: Combat feedback effects.
