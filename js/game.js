/**
 * 【游戏主逻辑】
 * 核心游戏循环、战斗系统、游戏状态管理
 */

// === 全局游戏状态 ===
let gameState = "PLAYING"; // 游戏状态：PLAYING | QUESTION | GAMEOVER
let gameTimer = GAME_DURATION; // 游戏计时器
let lastTime = Date.now(); // 用于计时
let isGameOver = false; // 游戏是否结束

// === 全局效果状态 ===
let hitStopFrames = 0; // Hit Stop顿帧计数
let screenShakeTime = 0; // 屏幕震动计数

// === 答题系统状态 ===
let qCaster = null; // 释放技能的玩家
let qTarget = null; // 目标玩家
let qTimer = 0; // 答题计时器

// === 玩家对象（将在初始化中创建） ===
let player1 = null;
let player2 = null;

// === Canvas及上下文 ===
let canvas = null;
let ctx = null;

// === 按键状态 ===
const keys = {};

/**
 * 矩形碰撞检测
 */
function rectIntersect(r1, r2) {
  return !(
    r2.x > r1.x + r1.w ||
    r2.x + r2.w < r1.x ||
    r2.y > r1.y + r1.h ||
    r2.y + r2.h < r1.y
  );
}

/**
 * Check combat collision
 */
function checkCombat() {
  // P1 attack detection
  let p1Hit = player1.getHitbox();
  if (p1Hit && player1.attackTimer > player1.attackDuration - 3) {
    let p2Body = {
      x: player2.x,
      y: player2.y,
      w: player2.width,
      h: player2.height,
    };
    if (rectIntersect(p1Hit, p2Body)) {
      let dmg =
        BASE_ATTACK_DAMAGE +
        (player1.buffs.berserk > 0 ? 8 : 0) -
        (player1.buffs.silence > 0 ? 5 : 0);
      player2.hp -= dmg;
      player1.skillPoints++;
      hitStopFrames = HIT_STOP_FRAMES;
      screenShakeTime = SCREEN_SHAKE_FRAMES;
      player1.attackTimer = 0;

      if (player2.hp <= 0) {
        player2.hp = 0;
        endGame();
      }

      console.log(`P1 hit P2! Combo: ${player1.skillPoints}`);
    }
  }

  // P2 attack detection
  let p2Hit = player2.getHitbox();
  if (p2Hit && player2.attackTimer > player2.attackDuration - 3) {
    let p1Body = {
      x: player1.x,
      y: player1.y,
      w: player1.width,
      h: player1.height,
    };
    if (rectIntersect(p2Hit, p1Body)) {
      let dmg =
        BASE_ATTACK_DAMAGE +
        (player2.buffs.berserk > 0 ? 8 : 0) -
        (player2.buffs.silence > 0 ? 5 : 0);
      player1.hp -= dmg;
      player2.skillPoints++;
      hitStopFrames = HIT_STOP_FRAMES;
      screenShakeTime = SCREEN_SHAKE_FRAMES;
      player2.attackTimer = 0;

      if (player1.hp <= 0) {
        player1.hp = 0;
        endGame();
      }

      console.log(`P2 hit P1! Combo: ${player2.skillPoints}`);
    }
  }
}

/**
 * Update game timer
 */
function updateGameTimer() {
  let now = Date.now();
  if (now - lastTime >= 1000) {
    lastTime = now;
    if (!isGameOver && gameState === "PLAYING") {
      gameTimer--;
      console.log(`Time: ${gameTimer}s`);

      if (gameTimer <= 0) {
        endGame();
      }
    }
  }
}

/**
 * Draw background
 */
function drawBackground() {
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = "#111";
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
}

/**
 * Game loop
 */
function gameLoop() {
  window.requestAnimationFrame(gameLoop);

  // Update timer
  updateGameTimer();

  // Hit Stop handling
  if (hitStopFrames > 0) {
    hitStopFrames--;
    return;
  }

  // Clear canvas
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.save();

  // Screen shake
  if (screenShakeTime > 0) {
    let dx = (Math.random() - 0.5) * 10;
    let dy = (Math.random() - 0.5) * 10;
    ctx.translate(dx, dy);
    screenShakeTime--;
  }

  // Draw background
  drawBackground();

  // Update game logic
  if (!isGameOver && gameState === "PLAYING") {
    player1.update(keys);
    player2.update(keys);
    checkCombat();
  }

  // Draw players
  player1.draw(ctx);
  player2.draw(ctx);

  ctx.restore();
}

/**
 * Game over
 */
function endGame() {
  isGameOver = true;
  gameState = "GAMEOVER";
  console.log("Game Over!");
}

/**
 * Initialize game
 */
function initializeGame() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  canvas.setAttribute("tabindex", "0");
  canvas.focus();

  // Create players
  player1 = new Player(
    P1_START_X,
    P1_START_Y,
    "#ff4e50",
    CONTROLS_P1,
    true,
    "math",
  );
  player2 = new Player(
    P2_START_X,
    P2_START_Y,
    "#4e50ff",
    CONTROLS_P2,
    false,
    "english",
  );

  console.log("Game initialized!");
}

/**
 * Setup keyboard input
 */
function setupKeyboardInput() {
  window.addEventListener("keydown", (e) => {
    let key = e.key.toLowerCase();
    if (e.code === "Numpad1") key = "1";
    if (e.code === "Numpad2") key = "2";
    keys[key] = true;
  });

  window.addEventListener("keyup", (e) => {
    let key = e.key.toLowerCase();
    if (e.code === "Numpad1") key = "1";
    if (e.code === "Numpad2") key = "2";
    keys[key] = false;
  });
}

/**
 * Create floating text effect
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} text - Text to display
 * @param {string} color - Text color
 */
function createFloatingText(x, y, text, color) {
  if (!ctx) return;

  ctx.save();
  ctx.fillStyle = color;
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, x, y);
  ctx.restore();
}

/**
 * Set player buff (compatibility wrapper)
 * @param {Player} player - Player instance
 * @param {string} name - Buff name
 * @param {number} frames - Duration in frames
 */
function setPlayerBuff(player, name, frames) {
  if (player && player.setBuff) {
    player.setBuff(name, frames);
  }
}

// Make handleAnswer globally available
window.handleAnswer = handleAnswer;

/**
 * Page load
 */
document.addEventListener("DOMContentLoaded", () => {
  setupKeyboardInput();
  initializeGame();
  gameLoop();
});
