# Campus Fighting Game

A local multiplayer 2.5D fighting game with knowledge trivia.

## Quick Start

### Windows (Recommended)

Double-click `init.bat`

### Manual Start

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server -p 8080 -c-1
```

Access: http://localhost:8000

## Project Structure

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
├── tools/
│   ├── verify_system.py    # System checker
│   └── sprite_processor.py # Sprite batch processor
└── AGENTS.md               # AI development guidelines
```

## Technical Stack

- **Frontend**: HTML5 Canvas 2D (vanilla JavaScript)
- **Backend**: None (100% client-side)
- **AI**: LMStudio (local) or BigModel API (cloud)
- **Tools**: Python 3.6+ (Pillow), Node.js 12+

## License

MIT License
