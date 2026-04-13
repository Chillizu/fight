/**
 * 学科选择UI系统
 */

// 全局学科选择状态
let selectedP1Subject = null;
let selectedP2Subject = null;
let isGameStarted = false;

/**
 * 初始化学科选择界面
 */
function initSubjectSelector() {
  // 如果游戏已经开始，不再显示
  if (isGameStarted) return;

  const gameContainer = document.getElementById("game-container");
  if (!gameContainer) return;

  // 创建选择器模态
  const modal = document.createElement("div");
  modal.id = "subject-selector-modal";
  modal.className = "modal show";
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
      <h2 style="color: #00f2fe; margin-bottom: 30px; font-size: 24px; text-align: center;">选择你的学科武器 ⚔️</h2>
      
      <div class="subject-selector-container">
        <!-- P1选择区 -->
        <div class="player-selector-section">
          <div class="selector-title" style="color: #00f2fe;">P1 (WASD控制) - 请选择学科</div>
          <div class="subject-grid" id="p1-subject-grid">
            <!-- 动态生成 -->
          </div>
          <div class="selected-display" id="p1-selected">未选择</div>
        </div>

        <!-- 中央分割线 -->
        <div class="selector-divider"></div>

        <!-- P2选择区 -->
        <div class="player-selector-section">
          <div class="selector-title" style="color: #ff4e50;">P2 (↑↓←→控制) - 请选择学科</div>
          <div class="subject-grid" id="p2-subject-grid">
            <!-- 动态生成 -->
          </div>
          <div class="selected-display" id="p2-selected">未选择</div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <button class="upload-btn" id="start-game-btn" disabled style="opacity: 0.5; cursor: not-allowed;">
          开始战斗
        </button>
      </div>
    </div>
  `;

  gameContainer.appendChild(modal);

  // 填充学科选择按钮
  populateSubjectButtons();
}

/**
 * 生成学科按钮
 */
function populateSubjectButtons() {
  const subjects = Object.values(SUBJECTS);

  // P1 学科网格
  const p1Grid = document.getElementById("p1-subject-grid");
  if (p1Grid) {
    subjects.forEach((subject) => {
      const btn = createSubjectButton(subject, "p1");
      p1Grid.appendChild(btn);
    });
  }

  // P2 学科网格
  const p2Grid = document.getElementById("p2-subject-grid");
  if (p2Grid) {
    subjects.forEach((subject) => {
      const btn = createSubjectButton(subject, "p2");
      p2Grid.appendChild(btn);
    });
  }
}

/**
 * 创建单个学科按钮
 */
function createSubjectButton(subject, player) {
  const btn = document.createElement("button");
  btn.className = "subject-btn";
  btn.innerHTML = `
    <div style="font-size: 28px; margin-bottom: 6px;">${subject.emoji}</div>
    <div style="font-size: 14px; font-weight: bold;">${subject.name}</div>
    <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">${subject.description}</div>
  `;
  btn.style.borderColor = subject.color;
  btn.style.color = subject.color;

  btn.onclick = () => selectSubject(subject.key, player);

  // 保存对应的player值以便后续查询
  btn.dataset.subjectKey = subject.key;
  btn.dataset.player = player;

  return btn;
}

/**
 * 选择学科
 */
function selectSubject(subjectKey, player) {
  if (player === "p1") {
    selectedP1Subject = subjectKey;
    updateSubjectDisplay("p1");
    // 移除其他选中状态
    const p1Grid = document.getElementById("p1-subject-grid");
    if (p1Grid) {
      p1Grid.querySelectorAll(".subject-btn").forEach((btn) => {
        btn.classList.remove("selected");
        if (btn.dataset.subjectKey === subjectKey) {
          btn.classList.add("selected");
        }
      });
    }
  } else if (player === "p2") {
    selectedP2Subject = subjectKey;
    updateSubjectDisplay("p2");
    // 移除其他选中状态
    const p2Grid = document.getElementById("p2-subject-grid");
    if (p2Grid) {
      p2Grid.querySelectorAll(".subject-btn").forEach((btn) => {
        btn.classList.remove("selected");
        if (btn.dataset.subjectKey === subjectKey) {
          btn.classList.add("selected");
        }
      });
    }
  }

  // 检查是否都选了
  checkBothSelected();
}

/**
 * 更新学科显示
 */
function updateSubjectDisplay(player) {
  const displayId = player === "p1" ? "p1-selected" : "p2-selected";
  const subjectKey = player === "p1" ? selectedP1Subject : selectedP2Subject;
  const display = document.getElementById(displayId);

  if (display && subjectKey && SUBJECTS[subjectKey]) {
    const subject = SUBJECTS[subjectKey];
    display.innerHTML = `✓ 已选择: <strong style="color: ${subject.color}; font-size: 16px;">${subject.emoji} ${subject.name}</strong>`;
    display.style.color = subject.color;
  }
}

/**
 * 检查两个玩家是否都选了
 */
function checkBothSelected() {
  const btn = document.getElementById("start-game-btn");
  if (btn) {
    if (selectedP1Subject && selectedP2Subject) {
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    } else {
      btn.disabled = true;
      btn.style.opacity = "0.5";
      btn.style.cursor = "not-allowed";
    }
  }
}

/**
 * 开始游戏
 */
function startGameWithSelectedSubjects() {
  if (!selectedP1Subject || !selectedP2Subject) {
    alert("请选择两个学科");
    return;
  }

  // 关闭选择器
  const modal = document.getElementById("subject-selector-modal");
  if (modal) modal.remove();

  isGameStarted = true;

  // 初始化游戏
  initializeGame();

  // 开始游戏循环
  gameLoop();
}

// 监听开始按钮
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const btn = document.getElementById("start-game-btn");
    if (btn) {
      btn.addEventListener("click", startGameWithSelectedSubjects);
    }
  }, 100);
});
