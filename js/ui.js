/**
 * UI系统
 * UI渲染、资源加载、技能UI
 */

// DOM元素
let p1HealthBar, p2HealthBar, timerDisplay, p1ComboText, p2ComboText;

// 背景图
let bgImg = new Image();

/**
 * 初始化游戏UI
 */
function initializeGameUI() {
  p1HealthBar = document.getElementById("p1-health");
  p2HealthBar = document.getElementById("p2-health");
  timerDisplay = document.getElementById("timer");
  p1ComboText = document.getElementById("p1-combo-text");
  p2ComboText = document.getElementById("p2-combo-text");

  // 加载背景
  bgImg.src = "assets/backgrounds/bg_default.jpg";
  bgImg.onerror = function() {
    console.log("背景加载失败，使用默认背景");
  };
}

/**
 * 更新P1血条
 * @param {number} hp - 当前血量
 */
function updateP1HealthUI(hp) {
  if (p1HealthBar) {
    let percent = (hp / MAX_HP) * 100;
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
  if (comboText) {
    let hits = p.skillPoints;
    let ready = hits >= MAX_SKILL ? "SUPER READY!!" : "";
    comboText.textContent = `HITS: ${hits} | SKILL: ${Math.min(hits, MAX_SKILL)}/13 ${ready}`;
  }
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
    <h3>AI角色生成</h3>
    <input type="file" id="photo-input" accept="image/*">
    <input type="text" id="char-desc" placeholder="角色描述（可选）">
    <button id="generate-btn">生成</button>
    <div id="generate-status"></div>
  `;
  panel.style.cssText = "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;padding:20px;border-radius:8px;color:#fff;";
  
  let gameContainer = document.getElementById("game-container");
  if (gameContainer) {
    gameContainer.appendChild(panel);
    
    // 绑定事件
    let photoInput = document.getElementById("photo-input");
    let generateBtn = document.getElementById("generate-btn");
    
    if (generateBtn && photoInput) {
      generateBtn.onclick = function() {
        let file = photoInput.files[0];
        if (file) {
          let reader = new FileReader();
          reader.onload = function(e) {
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
  // 创建答题弹窗
  let modal = document.createElement("div");
  modal.id = "question-modal";
  modal.style.cssText = "position:absolute;top:20%;left:50%;transform:translateX(-50%);background:#2a2a4e;padding:30px;border-radius:12px;color:#fff;text-align:center;min-width:400px;";
  modal.innerHTML = `
    <h2>${casterSubject} 大招答题</h2>
    <p style="font-size:24px;margin:20px 0;">${question.q}</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      <button class="answer-btn" onclick="handleAnswer(0)">A. ${question.a[0]}</button>
      <button class="answer-btn" onclick="handleAnswer(1)">B. ${question.a[1]}</button>
      <button class="answer-btn" onclick="handleAnswer(2)">C. ${question.a[2]}</button>
      <button class="answer-btn" onclick="handleAnswer(3)">D. ${question.a[3]}</button>
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
  let modals = document.querySelectorAll("#question-modal, #ai-panel, #game-over-modal");
  modals.forEach(function(m) {
    m.remove();
  });
}

/**
 * 显示游戏结束画面
 */
function showGameOverScreen() {
  let p1Win = player1.hp > player2.hp;
  let winner = p1Win ? "P1" : "P2";
  
  let modal = document.createElement("div");
  modal.id = "game-over-modal";
  modal.style.cssText = "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;padding:40px;border-radius:12px;color:#fff;text-align:center;";
  modal.innerHTML = `
    <h1 style="font-size:48px;color:#ffeb3b;">游戏结束</h1>
    <p style="font-size:32px;margin:20px 0;">${winner} 获胜！</p>
    <p>P1: ${player1.hp} HP | P2: ${player2.hp} HP</p>
    <button onclick="location.reload()" style="margin-top:20px;padding:10px 30px;font-size:18px;cursor:pointer;">再来一局</button>
  `;
  
  let gameContainer = document.getElementById("game-container");
  if (gameContainer) {
    gameContainer.appendChild(modal);
  }
}