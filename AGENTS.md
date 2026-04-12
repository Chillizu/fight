# AGENTS.md - AI Development Guidelines

## Project Overview

**Project**: Campus Fighting Game (校园大乱斗) - Local multiplayer 2.5D fighting game with knowledge trivia
**Version**: 0.7
**Tech Stack**: Vanilla JavaScript + HTML5 Canvas (no build tools), Python 3.6+ for utilities

## Build & Development Commands

### Start Development Server

```bash
# Windows (recommended)
npm start  # runs init.bat

# Python
npm run server:python  # python -m http.server 8000

# Node.js
npm run server:node    # npx http-server -p 8080 -c-1
```

**Access Game**: http://localhost:8000 (or :8080)

### Testing & Verification

```bash
# Verify system integrity
npm run verify  # tools/verify_system.py

# Process sprite sheets (batch)
npm run process:sprites  # tools/sprite_processor.py batch

# Generate test sprite sheet
npm run test:gen  # tools/gen_test_image.py
```

### Project Structure

```
Fight_/
├── index.html              # Main game file
├── js/
│   ├── config.js           # ⭐ Central config (all parameters)
│   ├── game.js             # Game loop, collision detection
│   ├── player.js           # Player class, animation, attacks
│   ├── ui.js               # UI rendering, resources
│   ├── ui_extend.js        # AI integration, background removal
│   ├── subjects.js         # 13 skill definitions
│   └── particles.js        # Particle effects
├── assets/
│   ├── backgrounds/        # Game backgrounds
│   └── sprites/            # Character sprite sheets (4x3 grid)
└── tools/
    ├── verify_system.py    # System checker
    └── sprite_processor.py # Sprite batch processor
```

## Code Style Guidelines

### Naming Conventions

- **Functions**: `camelCase` (e.g., `calculateDamage`, `handleAttack`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_HEALTH`, `COMBO_TRIGGER_COUNT`)
- **Classes/Objects**: `PascalCase` (e.g., `Player`, `GameState`)
- **Private properties**: `_propertyName` (underscore prefix)
- **File names**: lowercase for HTML, camelCase for JS files
- **Markdown docs**: `UPPERCASE.md` (e.g., `README.md`, `DEVELOPMENT.md`)

### JavaScript Best Practices

```javascript
// ✅ Good: camelCase functions
function updateGameTimer() { }

// ✅ Good: UPPER_SNAKE_CASE constants
const MAX_HP = 1000;
const GAME_DURATION = 60;

// ✅ Good: PascalCase classes
class Player {
  constructor(x, y, color) { }
}

// ✅ Good: JSDoc comments
/**
 * Apply damage to player
 * @param {Player} target - Target player
 * @param {number} amount - Damage amount
 * @returns {void}
 */
function applyDamage(target, amount) { }

// ✅ Good: Private methods with underscore
_player.drawStickman(ctx) { }
_analyzeFrameBounds() { }

// ❌ Bad: Uppercase function names
function UpdateGameTimer() { }

// ❌ Bad: mixed case constants
const maxHp = 1000;
```

### Error Handling

```javascript
// ✅ Check properties before accessing
if (this.buffs.hasOwnProperty(name)) {
  this.buffs[name] = frames;
}

// ✅ Defensive programming with null checks
if (this.frameBounds && this.frameBounds.length > 0) {
  this._drawSpriteSheetDynamic(ctx);
}

// ✅ Console warnings for debugging
console.warn(`Frame ${frameIndex} 没有bounds信息`);

// ✅ Graceful degradation
if (!bgImg.complete || bgImg.naturalHeight === 0) {
  // Fallback to solid background
}
```

### Comments & Documentation

```javascript
// Single-line comments for inline explanations
// === Global game state ===

/**
 * Multi-line JSDoc for functions/classes
 * @param {type} paramName - description
 * @returns {type} description
 */
function rectIntersect(r1, r2) {
  // Detailed logic
}
```

### JSDoc Standards

- Always document function parameters and return values
- Use `@param {type} name - description`
- Use `@returns {type} description`
- Document public methods with `@public` when appropriate
- Private methods can omit full documentation

```javascript
/**
 * Get player attack hitbox for collision
 * @public
 * @returns {object|null} Hitbox object or null
 */
getHitbox() {
  if (!this.isAttacking) return null;
  return {
    x: this.facingRight ? this.x + this.width : this.x - this.width,
    y: this.y + this.height * 0.35,
    w: this.attackHitbox.width,
    h: this.attackHitbox.height,
  };
}
```

### Code Organization

- **Game State**: Global variables at top of files (e.g., `gameState`, `player1`, `player2`)
- **Constants**: All game parameters in `config.js`
- **Classes**: Place class definitions first, followed by functions
- **Private methods**: Mark with `_` prefix and place after public methods
- **Logical sections**: Use `// === Section Name ===` comments

```javascript
// === Global game state ===
let gameState = "PLAYING";
let player1 = null;

// === Constants ===
const MAX_HP = 1000;

// === Class definition ===
class Player { }

// === Helper functions ===
function rectIntersect(r1, r2) { }

// === Private methods ===
Player.prototype._privateMethod = function() { }
```

### Import/Export Style

This project uses vanilla JavaScript with no bundler, so imports are done via HTML `<script>` tags:

```html
<script src="js/config.js"></script>
<script src="js/game.js"></script>
<script src="js/player.js"></script>
<script src="js/ui.js"></script>
<script src="js/ui_extend.js"></script>
<script src="js/subjects.js"></script>
<script src="js/particles.js"></script>
```

Order matters: config → game → player → ui → ui_extend → subjects → particles

### Code Formatting

- **Indentation**: 2 spaces (no tabs)
- **Semicolons**: Required at end of statements
- **Line length**: Keep lines under 100 characters when possible
- **Spacing**: Single space after commas, no spaces after colons

```javascript
// ✅ Good
if (x > 0 && y < 10) {
  return x + y;
}

// ❌ Bad
if(x>0 && y<10){
  return x+y;
}
```

### Type Annotations

Use JSDoc for type hints, but avoid TypeScript syntax:

```javascript
// ✅ Use JSDoc
/**
 * @param {number} x - X coordinate
 * @returns {boolean} True if collision detected
 */
function checkCollision(x) { }

// ❌ Avoid TypeScript syntax
function checkCollision(x: number): boolean { }
```

## Testing & Quality Assurance

### Testing Approach

This project uses **manual testing** and **system verification**:

1. **System Verification** (`npm run verify`):
   - Checks Python/Node.js installation
   - Verifies required libraries (Pillow)
   - Validates directory structure
   - Tests sprite processor

2. **Manual Testing Checklist**:
   - Start server without errors
   - Load game in browser
   - Verify P1/P2 controls work
   - Test combat collision
   - Verify skill combo system
   - Check UI updates correctly
   - Test AI generation flow (if applicable)

### Debugging

- Open browser DevTools (F12)
- Check Console for game logs (combat counts, trigger events)
- Monitor Network tab for resource loading issues
- Clear browser cache (Ctrl+Shift+Delete) when testing changes

### Code Review Checklist

- [ ] Follows naming conventions (camelCase, UPPER_SNAKE_CASE, PascalCase)
- [ ] Private methods prefixed with `_`
- [ ] JSDoc comments for public functions
- [ ] Defensive null/undefined checks
- [ ] Proper error handling with fallbacks
- [ ] Constants defined in config.js when applicable
- [ ] Code organized with logical sections
- [ ] No unused variables or commented-out code
- [ ] Consistent formatting (2 spaces, semicolons)

## Additional Rules

### Copilot Instructions

See `.github/copilot-instructions.md` for detailed AI collaboration guidelines including:
- Project structure and responsibilities
- Quick start instructions
- Skill system design
- Common troubleshooting
- Asset handling

### Configuration Management

**IMPORTANT**: All game parameters should be defined in `js/config.js`:
- Game time constants
- Player stats
- Combat mechanics
- Visual effects
- Skill configurations

Modify `config.js` instead of hardcoding values in other files.

### File-Specific Responsibilities

- **config.js**: ⭐ All game parameters
- **game.js**: Game loop, state management, combat
- **player.js**: Player class, movement, attacks
- **ui.js**: UI rendering, DOM manipulation
- **ui_extend.js**: AI integration, advanced features
- **subjects.js**: Skill definitions and effects

## When Adding New Features

1. **First**, update `config.js` with new constants
2. **Second**, create or modify appropriate class/function
3. **Third**, add JSDoc documentation
4. **Fourth**, implement defensive checks and error handling
5. **Finally**, test manually and verify no regressions

## Continuous Improvement

- Add unit tests when adding complex logic
- Document new features in `docs/` directory
- Update this file when adopting new conventions
- Keep `config.js` as the single source of truth for parameters
