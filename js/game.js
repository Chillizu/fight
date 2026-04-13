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
// Expose a safe key-clear hook for UI modals (let/const not on window by default)
window.clearKeys = function clearKeys() {
  for (const k in keys) {
    if (Object.prototype.hasOwnProperty.call(keys, k)) delete keys[k];
  }
};

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
  let didHit = false;

  // P1 attack detection
  let p1Hit = player1.getHitbox();
  if (p1Hit && player1.attackTimer > player1.attackDuration - 6) {
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

      // 应用技能伤害倍数
      let skillMultiplier = 1.0;
      for (let buff in player1.buffs) {
        if (player1.buffs[buff] > 0 && SKILL_DAMAGE_MULTIPLIER[buff]) {
          skillMultiplier = SKILL_DAMAGE_MULTIPLIER[buff];
          break; // 只应用第一个活跃buff的倍数
        }
      }
      dmg *= skillMultiplier;

      // Guard reduction
      if (player2.isBlocking) {
        dmg *= 0.2;
        if (typeof spawnParticles === "function") {
          spawnParticles(player2.x + player2.width / 2, player2.y + player2.height / 2, "#fff", 5);
        }
      } else {
        player1.skillPoints++;
        // Impact particles at hit position
        if (typeof spawnParticles === "function") {
          const hitX = player1.facingRight ? player2.x : player2.x + player2.width;
          spawnParticles(hitX, player2.y + player2.height / 2, player1.color, 10);
        }
      }

      player2.hp -= dmg;
      if (player2.hp < 0) player2.hp = 0;

      // 伤害数字浮动效果
      if (typeof createFloatingText === "function") {
        createFloatingText(player2.x + player2.width / 2, player2.y - 20, `-${Math.floor(dmg)}`, "#ff4444");
      }

      // 受伤粒子效果
      if (typeof spawnParticles === "function") {
        spawnParticles(player2.x + player2.width / 2, player2.y + player2.height / 2, "#ff6666", 15);
      }

      hitStopFrames = HIT_STOP_FRAMES;
      screenShakeTime = SCREEN_SHAKE_FRAMES;
      player1.attackTimer = 0;
      didHit = true;

      if (player2.hp <= 0) {
        player2.hp = 0;
        endGame();
      }
    }
  }

  // P2 attack detection
  let p2Hit = player2.getHitbox();
  if (p2Hit && player2.attackTimer > player2.attackDuration - 6) {
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

      // 应用技能伤害倍数
      let skillMultiplier = 1.0;
      for (let buff in player2.buffs) {
        if (player2.buffs[buff] > 0 && SKILL_DAMAGE_MULTIPLIER[buff]) {
          skillMultiplier = SKILL_DAMAGE_MULTIPLIER[buff];
          break; // 只应用第一个活跃buff的倍数
        }
      }
      dmg *= skillMultiplier;

      // Guard reduction
      if (player1.isBlocking) {
        dmg *= 0.2;
        if (typeof spawnParticles === "function") {
          spawnParticles(player1.x + player1.width / 2, player1.y + player1.height / 2, "#fff", 5);
        }
      } else {
        player2.skillPoints++;
        // Impact particles at hit position
        if (typeof spawnParticles === "function") {
          const hitX = player2.facingRight ? player1.x : player1.x + player1.width;
          spawnParticles(hitX, player1.y + player1.height / 2, player2.color, 10);
        }
      }

      player1.hp -= dmg;
      if (player1.hp < 0) player1.hp = 0;

      // 伤害数字浮动效果
      if (typeof createFloatingText === "function") {
        createFloatingText(player1.x + player1.width / 2, player1.y - 20, `-${Math.floor(dmg)}`, "#ff4444");
      }

      // 受伤粒子效果
      if (typeof spawnParticles === "function") {
        spawnParticles(player1.x + player1.width / 2, player1.y + player1.height / 2, "#ff6666", 15);
      }

      hitStopFrames = HIT_STOP_FRAMES;
      screenShakeTime = SCREEN_SHAKE_FRAMES;
      player2.attackTimer = 0;
      didHit = true;

      if (player1.hp <= 0) {
        player1.hp = 0;
        endGame();
      }
    }
  }

  if (didHit) {
    if (typeof updateHealthUI === "function") updateHealthUI();
    if (typeof updateSkillUI === "function") {
      updateSkillUI(player1);
      updateSkillUI(player2);
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

      // Sync UI timer
      if (typeof timerDisplay !== "undefined" && timerDisplay) {
        timerDisplay.textContent = String(gameTimer);
      }

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
  // Prefer custom background if UI layer loaded one
  if (typeof drawCustomBackground === "function" && drawCustomBackground(ctx)) {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
    return;
  }

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

  // Question countdown (runs every frame while answering)
  if (!isGameOver && gameState === "QUESTION") {
    if (qTimer > 0) qTimer--;

    const fill = document.getElementById("q-timer-fill");
    if (fill) {
      const pct = Math.max(0, Math.min(100, (qTimer / Q_MAX_TIME) * 100));
      fill.style.width = pct + "%";
    }

    if (qTimer <= 0) {
      // Timeout counts as wrong answer
      if (typeof handleAnswer === "function") handleAnswer(-1);
    }
  }

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

  // Draw players (even when paused/question/gameover, keep last frame visible)
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

  if (typeof showGameOverScreen === "function") {
    showGameOverScreen();
  }
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
  const p1SubjectKey =
    typeof getRandomSubject === "function" ? getRandomSubject() : "biology";
  const p2SubjectKey =
    typeof getRandomSubject === "function"
      ? getRandomSubject(p1SubjectKey)
      : "chemistry";

  player1 = new Player(
    P1_START_X,
    P1_START_Y,
    "#00f2fe", // Matching neon cyan
    CONTROLS_P1,
    true,
    p1SubjectKey,
  );
  player2 = new Player(
    P2_START_X,
    P2_START_Y,
    "#ff4e50", // Matching neon red
    CONTROLS_P2,
    false,
    p2SubjectKey,
  );

  // Expose for debugging / UI integration
  window.player1 = player1;
  window.player2 = player2;
  if (typeof initializeGameUI === "function") initializeGameUI();
  if (typeof updateHealthUI === "function") updateHealthUI();
  if (typeof updateSkillUI === "function") {
    updateSkillUI(player1);
    updateSkillUI(player2);
  }
  // 不在这里自动创建 AI 面板，由用户点击按钮调用 toggleAIGenerationPanel()
}

/**
 * Setup keyboard input
 */
function setupKeyboardInput() {
  window.addEventListener("keydown", (e) => {
    let key = e.key.toLowerCase();
    if (e.code === "Numpad1") key = "1";
    if (e.code === "Numpad2") key = "2";

    // Handle quiz input separately and prioritize it
    if (gameState === "QUESTION") {
      // Prevent movement keys from being tracked during quiz
      if (Object.prototype.hasOwnProperty.call(keys, key)) delete keys[key];

      // Map WASD and Arrows to 0, 1, 2, 3
      if (key === "w" || key === "arrowup" || key === "1") {
        if (typeof handleAnswer === "function") handleAnswer(0);
        e.preventDefault();
      } else if (key === "s" || key === "arrowdown" || key === "2") {
        if (typeof handleAnswer === "function") handleAnswer(1);
        e.preventDefault();
      } else if (key === "a" || key === "arrowleft") {
        if (typeof handleAnswer === "function") handleAnswer(2);
        e.preventDefault();
      } else if (key === "d" || key === "arrowright") {
        if (typeof handleAnswer === "function") handleAnswer(3);
        e.preventDefault();
      }
      return;
    }

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
if (typeof handleAnswer === "function") {
  window.handleAnswer = handleAnswer;
}

/**
 * Page load
 */
document.addEventListener("DOMContentLoaded", () => {
  setupKeyboardInput();
  initializeGame();
  gameLoop();
});
