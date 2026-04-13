/**
 * UI系统
 * UI渲染、资源加载、技能UI
 */

// DOM元素
let p1HealthBar, p2HealthBar, timerDisplay, p1ComboText, p2ComboText;
let p1SkillFill, p2SkillFill;

let lastP1Hits = null;
let lastP2Hits = null;

// Spec modal pause state
let preSpecGameState = null;

// 背景图（可选）
let bgImg = new Image();
let hasCustomBackground = false;

/**
 * 初始化游戏UI
 */
function initializeGameUI() {
  p1HealthBar = document.getElementById("p1-health");
  p2HealthBar = document.getElementById("p2-health");
  timerDisplay = document.getElementById("timer");
  p1ComboText = document.getElementById("p1-combo-text");
  p2ComboText = document.getElementById("p2-combo-text");
  p1SkillFill = document.getElementById("p1-skill-fill");
  p2SkillFill = document.getElementById("p2-skill-fill");

  // Sync subject names in the HUD (players may be randomized)
  try {
    const p1Name = document.getElementById("p1-name");
    const p2Name = document.getElementById("p2-name");
    const p1Avatar = document.getElementById("p1-avatar-text");
    const p2Avatar = document.getElementById("p2-avatar-text");

    if (typeof player1 !== "undefined" && player1 && p1Name) {
      const nm = player1.subject ? player1.subject.name : player1.subjectKey;
      p1Name.textContent = `P1 (${nm || "?"})`;
    }
    if (typeof player2 !== "undefined" && player2 && p2Name) {
      const nm = player2.subject ? player2.subject.name : player2.subjectKey;
      p2Name.textContent = `P2 (${nm || "?"})`;
    }

    if (typeof player1 !== "undefined" && player1 && p1Avatar) {
      const nm = player1.subject ? player1.subject.name : "?";
      p1Avatar.textContent = nm ? nm[0] : "?";
    }
    if (typeof player2 !== "undefined" && player2 && p2Avatar) {
      const nm = player2.subject ? player2.subject.name : "?";
      p2Avatar.textContent = nm ? nm[0] : "?";
    }
  } catch (e) {
    // ignore
  }

  lastP1Hits = null;
  lastP2Hits = null;

  // 加载背景（硬加载 background.png；加载失败则回退到默认纯色背景）
  const bgSrc = typeof DEFAULT_BG_SRC === "string" ? DEFAULT_BG_SRC : "";
  bgImg.onload = function () {
    hasCustomBackground = true;
  };
  bgImg.onerror = function () {
    hasCustomBackground = false;
  };
  if (bgSrc) {
    bgImg.src = bgSrc;
  }
}

/**
 * 供 game.js 调用的背景绘制（如果背景未加载成功，会返回 false）
 */
function drawCustomBackground(ctx) {
  if (!hasCustomBackground) return false;
  if (!bgImg.complete || bgImg.naturalWidth <= 0) return false;

  ctx.drawImage(bgImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  return true;
}

/**
 * 更新P1血条
 * @param {number} hp - 当前血量
 */
function updateP1HealthUI(hp) {
  if (p1HealthBar) {
    let percent = (hp / MAX_HP) * 100;
    let currentWidth = parseFloat(p1HealthBar.style.width) || 100;

    if (currentWidth > percent) { // Damage taken
      let wrapper = p1HealthBar.parentElement;
      wrapper.classList.remove('shake-ui');
      void wrapper.offsetWidth; // Trigger reflow
      wrapper.classList.add('shake-ui');

      // Spawn UI particles on the health bar
      if (typeof spawnParticles === "function") {
        // Health bars are at the top, roughly 20px from left
        // p1-info is 20px from left, 15px from top
        // Health bar is roughly at y=50 in screen coords
        // We can't easily map DOM to Canvas perfectly without getBoundingClientRect,
        // but we can spawn them near the top left of the canvas as a stylistic choice.
        spawnParticles(100 + Math.random() * 100, 30, "#00f2fe", 8);
      }
    }
    p1HealthBar.style.width = percent + "%";
  }
}

/**
 * 更新P2血条
 * @param {number} hp - 当前血量
 */
function updateP2HealthUI(hp) {
  if (p2HealthBar) {
    let percent = (hp / MAX_HP) * 100;
    let currentWidth = parseFloat(p2HealthBar.style.width) || 100;

    if (currentWidth > percent) { // Damage taken
      let wrapper = p2HealthBar.parentElement;
      wrapper.classList.remove('shake-ui');
      void wrapper.offsetWidth; // Trigger reflow
      wrapper.classList.add('shake-ui');

      // Spawn UI particles on the health bar
      if (typeof spawnParticles === "function") {
        spawnParticles(CANVAS_WIDTH - 150 + Math.random() * 100, 30, "#ff4e50", 8);
      }
    }
    p2HealthBar.style.width = percent + "%";
  }
}

/**
 * 更新健康UI（统一）
 */
function updateHealthUI() {
  if (player1) updateP1HealthUI(player1.hp);
  if (player2) updateP2HealthUI(player2.hp);
}

/**
 * 更新技能UI
 * @param {Player} p - 玩家
 */
function updateSkillUI(p) {
  let comboText = p.isP1 ? p1ComboText : p2ComboText;
  let skillFill = p.isP1 ? p1SkillFill : p2SkillFill;

  const hits = p.skillPoints;
  const capped = Math.min(hits, MAX_SKILL);
  const ready = hits >= MAX_SKILL ? " - READY!!" : "";

  function getBuffText(player) {
    if (!player || !player.buffs) return "";

    const labelMap = {
      giant: "GIANT(变大)",
      poison: "POISON(中毒)",
      root: "ROOT(禁锢)",
      reverse: "REVERSE(反转)",
      berserk: "BERSERK(狂暴)",
      invincible: "INVINCIBLE(无敌)",
      silence: "SILENCE(沉默)",
    };

    const actives = Object.entries(player.buffs)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1]);

    if (actives.length === 0) return "";

    const parts = actives.slice(0, 2).map(([k, frames]) => {
      const sec = Math.ceil(frames / 60);
      return `${labelMap[k] || k} ${sec}s`;
    });

    return `BUFF: ${parts.join(" / ")}`;
  }

  const buffText = getBuffText(p);

  if (comboText) {
    comboText.textContent = `${hits} HITS | SKILL: ${capped}/${MAX_SKILL}${ready}${buffText ? " | " + buffText : ""}`;

    const lastHits = p.isP1 ? lastP1Hits : lastP2Hits;
    if (lastHits !== null && hits > lastHits) {
      comboText.classList.remove("pop-anim");
      void comboText.offsetWidth;
      comboText.classList.add("pop-anim");
    }

    if (p.isP1) lastP1Hits = hits;
    else lastP2Hits = hits;
  }

  if (skillFill) {
    const pct = (capped / MAX_SKILL) * 100;
    skillFill.style.width = pct + "%";
  }
}

/**
 * 开关 AI 生成面板（兼容 index.html 的 onclick）
 */
function toggleAIGenerationPanel() {
  const existing = document.getElementById("ai-panel");
  if (existing) {
    existing.remove();
    const canvas = document.getElementById("gameCanvas");
    if (canvas) canvas.focus();
    return;
  }

  createAIGenerationPanel();
}

/**
 * 处理上传自定义雪碧图（兼容 index.html 的 onchange）
 */
function loadCustomAsset(event, who) {
  const file = event?.target?.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const dataUrl = e?.target?.result;
    if (!dataUrl) return;

    const isP1 = who === "p1";
    const player = isP1 ? player1 : player2;
    if (!player) return;

    // Reuse the player's sprite image element so onload triggers sprite analysis.
    player.spriteImg.src = dataUrl;
  };

  reader.readAsDataURL(file);
}

/**
 * 创建AI生成面板
 */
function createAIGenerationPanel() {
  let existing = document.getElementById("ai-panel");
  if (existing) return;

  let panel = document.createElement("div");
  panel.id = "ai-panel";
  panel.innerHTML = `
    <div class="modal-content">
      <h3 style="margin-bottom: 20px; font-size: 18px;">📸 AI角色生成</h3>
      <div style="display: flex; flex-direction: column; gap: 15px; align-items: stretch;">
        <label class="upload-btn" style="justify-content: center;">
          选择参考照片 <input type="file" id="photo-input" accept="image/*">
        </label>
        <input type="text" id="char-desc" placeholder="输入角色描述 (例如: 穿校服的剑士)"
          style="background: rgba(0,0,0,0.5); border: 1px solid #00f2fe; color: #fff; padding: 10px; border-radius: 8px; font-family: inherit; font-size: 10px;">
        <button id="generate-btn" class="upload-btn" style="background: #9c27b0; border-color: #7b1fa2; justify-content: center;">开始生成</button>
        <div id="generate-status" style="font-size: 10px; color: #00f2fe;"></div>
      </div>
      <button onclick="toggleAIGenerationPanel()" style="margin-top: 20px; background: transparent; border: none; color: #aaa; cursor: pointer; font-size: 10px; font-family: inherit;">[ 取消 ]</button>
    </div>
  `;
  panel.style.cssText = ""; // Clear inline styles to use CSS classes
  panel.className = "modal show";

  let gameContainer = document.getElementById("game-container");
  if (gameContainer) {
    gameContainer.appendChild(panel);

    // 绑定事件
    let photoInput = document.getElementById("photo-input");
    let generateBtn = document.getElementById("generate-btn");

    if (generateBtn && photoInput) {
      generateBtn.onclick = function () {
        let file = photoInput.files[0];
        if (file) {
          let reader = new FileReader();
          reader.onload = function () {
            let status = document.getElementById("generate-status");
            if (status) status.textContent = "正在生成...";
            // TODO: 调用AI生成
          };
          reader.readAsDataURL(file);
        }
      };
    }
  }
}

/**
 * 显示题目
 * @param {object} question - 题目对象
 * @param {string} casterSubject - 释放者学科
 */
function showQuestionModal(question, casterSubject) {
  hideAllModals(); // Ensure no duplicates

  let modal = document.createElement("div");
  modal.id = "question-modal";
  modal.className = "modal show";
  modal.innerHTML = `
    <div class="modal-content">
      <div id="q-title">🔥 ${casterSubject} 绝招答题 🔥</div>
      <div id="q-text">${question.q}</div>
      <div class="q-options-grid">
        <div class="q-option" onclick="handleAnswer(0)">
          <span class="q-key">W</span>
          <span>${question.a[0]}</span>
        </div>
        <div class="q-option" onclick="handleAnswer(1)">
          <span class="q-key">S</span>
          <span>${question.a[1]}</span>
        </div>
        <div class="q-option" onclick="handleAnswer(2)">
          <span class="q-key">A</span>
          <span>${question.a[2]}</span>
        </div>
        <div class="q-option" onclick="handleAnswer(3)">
          <span class="q-key">D</span>
          <span>${question.a[3]}</span>
        </div>
      </div>
      <div id="q-timer-bar">
        <div id="q-timer-fill" style="width: 100%;"></div>
      </div>
    </div>
  `;

  let gameContainer = document.getElementById("game-container");
  if (gameContainer) {
    gameContainer.appendChild(modal);
  }
}

/**
 * 隐藏所有弹窗
 */
function hideAllModals() {
  const spec = document.getElementById("spec-modal");
  if (spec) spec.classList.remove("show");

  let modals = document.querySelectorAll("#question-modal, #ai-panel, #game-over-modal");
  modals.forEach(function (m) {
    m.remove();
  });
}

/**
 * 打开 AI 贴图规范弹窗
 * - 进入“暂停”态：冻结战斗与计时
 * - 关闭后恢复之前的游戏状态（通常是 PLAYING）
 */
function openSpecModal() {
  const spec = document.getElementById("spec-modal");
  if (!spec) return;

  // 如果已经打开就不重复处理
  if (spec.classList.contains("show")) return;

  // 记录并暂停
  if (typeof gameState !== "undefined") {
    preSpecGameState = gameState;
    gameState = "PAUSED";
  }

  spec.classList.add("show");

  // 清空按键状态，避免松手事件丢失导致“粘键”
  if (typeof window.clearKeys === "function") window.clearKeys();

  // 让 canvas 失焦，避免键盘操作继续触发移动/攻击
  const canvas = document.getElementById("gameCanvas");
  if (canvas) canvas.blur();
}

/**
 * 关闭 AI 贴图规范弹窗
 */
function closeSpecModal() {
  const spec = document.getElementById("spec-modal");
  if (!spec) return;

  spec.classList.remove("show");

  if (typeof gameState !== "undefined") {
    gameState = preSpecGameState || "PLAYING";
    preSpecGameState = null;
  }

  // 清空按键状态，避免关闭瞬间产生输入串扰
  if (typeof window.clearKeys === "function") window.clearKeys();

  const canvas = document.getElementById("gameCanvas");
  if (canvas) canvas.focus();
}

/**
 * 显示游戏结束画面
 */
function showGameOverScreen() {
  hideAllModals();

  let p1Win = player1.hp > player2.hp;
  let winner = p1Win
    ? `P1 (${player1.subject ? player1.subject.name : player1.subjectKey || "?"})`
    : `P2 (${player2.subject ? player2.subject.name : player2.subjectKey || "?"})`;

  let modal = document.createElement("div");
  modal.id = "game-over-modal";
  modal.className = "modal show";
  modal.innerHTML = `
    <div class="modal-content" style="border-color: #ffeb3b; box-shadow: 0 0 50px rgba(255, 235, 59, 0.4);">
      <h1 style="font-size: 40px; color: #ffeb3b; margin-bottom: 20px;">K.O.</h1>
      <p style="font-size: 18px; margin-bottom: 20px;">${winner} 获得胜利!</p>
      <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 30px;">
        <div style="text-align: center;">
          <div style="font-size: 10px; color: #aaa;">P1 HP</div>
          <div style="font-size: 18px; color: #ff4e50;">${Math.round(player1.hp)}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 10px; color: #aaa;">P2 HP</div>
          <div style="font-size: 18px; color: #4facfe;">${Math.round(player2.hp)}</div>
        </div>
      </div>
      <button class="upload-btn" onclick="location.reload()" style="background: #ffeb3b; color: #000; border: none; padding: 15px 40px;">再次挑战</button>
    </div>
  `;

  let gameContainer = document.getElementById("game-container");
  if (gameContainer) {
    gameContainer.appendChild(modal);
  }
}

