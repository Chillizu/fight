/**
 * AI集成与图像处理
 * - LMStudio/BigModel API（实验性）
 * - Sprite sheet 标准化与动态裁剪（重点）
 * - 背景移除（可选）
 */

// =============================================================================
// Sprite sheet analysis + robust grid slicing
// =============================================================================

/**
 * Analyze a sprite sheet and compute per-cell crop rectangles.
 *
 * Strategy:
 * 1. Fixed-grid division (Strictly 4x3)
 * 2. Find content bounds within EACH grid cell independently
 * 3. Use the cell's center for drawing to avoid segmentation
 * 4. Apply a safe "max-crop" per row to keep size uniform
 */
function analyzeSpriteSheet(img, opts = {}) {
  const cols = opts.cols ?? 4;
  const rows = opts.rows ?? 3;
  const bgTol = opts.bgTol ?? 45;
  const minAlpha = opts.minAlpha ?? 10;
  const pad = opts.pad ?? 3;

  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const bgColor = opts.bg || _sampleBackgroundColor(data, w, h);

  const cellW = w / cols;
  const cellH = h / rows;

  // First pass: scan each cell, capture raw content bounds and row-level stats (relative coords).
  const raw = [];
  const rowStats = Array.from({ length: rows }, () => ({
    lefts: [],
    rights: [],
    tops: [],
    bottoms: [],
    has: false,
  }));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x0 = Math.floor(c * cellW);
      const y0 = Math.floor(r * cellH);
      const x1 = Math.floor((c + 1) * cellW);
      const y1 = Math.floor((r + 1) * cellH);

      const cw = Math.max(1, x1 - x0);
      const ch = Math.max(1, y1 - y0);

      const b = _findContentBoundsInRect(
        data,
        w,
        h,
        x0,
        y0,
        x1,
        y1,
        bgColor,
        bgTol,
        minAlpha,
      );

      if (!b) {
        raw.push({ row: r, col: c, x0, y0, x1, y1, cw, ch, empty: true, bounds: null });
        continue;
      }

      const rel = {
        left: (b.left - x0) / cw,
        right: (b.right - x0) / cw,
        top: (b.top - y0) / ch,
        bottom: (b.bottom - y0) / ch,
      };

      const rs = rowStats[r];
      rs.has = true;
      rs.lefts.push(rel.left);
      rs.rights.push(rel.right);
      rs.tops.push(rel.top);
      rs.bottoms.push(rel.bottom);

      raw.push({ row: r, col: c, x0, y0, x1, y1, cw, ch, empty: false, bounds: b, rel });
    }
  }

  // Robust per-row boxes via quantiles (avoid noisy outliers)
  let rowBoxes = rowStats.map((rs) => {
    if (!rs.has) {
      return { left: 0, top: 0, right: 1, bottom: 1, empty: true };
    }

    const left = _quantile(rs.lefts, 0.1);
    const right = _quantile(rs.rights, 0.9);
    const top = _quantile(rs.tops, 0.1);
    const bottom = _quantile(rs.bottoms, 0.9);

    return { left, right, top, bottom, empty: false };
  });

  // Unify baseline (foot) across rows to prevent bouncing
  const validBottoms = rowBoxes.filter((b) => !b.empty).map((b) => b.bottom);
  const globalBottomRel = validBottoms.length > 0 ? Math.max(...validBottoms) : 1.0;

  rowBoxes = rowBoxes.map((b) => (b.empty ? b : { ...b, bottom: globalBottomRel }));

  const frames = raw.map((rf) => {
    const rb = rowBoxes[rf.row];

    const leftPx = clampInt(Math.floor(rb.left * rf.cw) - pad, 0, rf.cw - 1);
    const topPx = clampInt(Math.floor(rb.top * rf.ch) - pad, 0, rf.ch - 1);

    const rightPx = clampInt(Math.ceil(rb.right * rf.cw) + pad, leftPx + 1, rf.cw);
    const bottomPx = clampInt(Math.ceil(rb.bottom * rf.ch) + pad, topPx + 1, rf.ch);

    const sw = Math.max(1, rightPx - leftPx);
    const sh = Math.max(1, bottomPx - topPx);

    return {
      row: rf.row,
      col: rf.col,
      sx: rf.x0 + leftPx,
      sy: rf.y0 + topPx,
      sw,
      sh,
      empty: rf.empty,
    };
  });

  // Global Canonical Size for scale stability
  const canonicalW = Math.max(...frames.map((f) => f.sw));
  const canonicalH = Math.max(...frames.map((f) => f.sh));

  return { cols, rows, width: w, height: h, bgColor, frames, canonicalW, canonicalH, globalBottomRel };
}

function _quantile(arr, q) {
  if (!arr || arr.length === 0) return 0;
  const a = [...arr].sort((x, y) => x - y);
  const pos = (a.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return a[base + 1] !== undefined ? a[base] + rest * (a[base + 1] - a[base]) : a[base];
}

/** Get frame crop rect from spriteMeta and player state. */
function getSpriteFrame(spriteMeta, state) {
  if (!spriteMeta || !spriteMeta.frames || spriteMeta.frames.length === 0) return null;

  let row = 0;
  if (state.isAttacking) row = 2;
  else if (Math.abs(state.velocityX) > 0) row = 1;

  const col = Math.floor(state.frameIndex) % 4;
  const idx = row * 4 + col;
  return spriteMeta.frames[idx] || null;
}

function clampInt(v, min, max) {
  v = Math.round(v);
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

function _trimmedMean(arr, trimPct) {
  if (!arr || arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const n = sorted.length;
  const k = Math.floor(n * trimPct);
  const slice = sorted.slice(k, Math.max(k + 1, n - k));
  let sum = 0;
  for (const v of slice) sum += v;
  return sum / slice.length;
}

function _sampleBackgroundColor(data, w, h) {
  const points = [
    { x: 2, y: 2 },
    { x: w - 3, y: 2 },
    { x: 2, y: h - 3 },
    { x: w - 3, y: h - 3 },
  ];

  const samples = [];
  for (const p of points) {
    let r = 0, g = 0, b = 0, c = 0;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const x = Math.min(w - 1, Math.max(0, p.x + dx));
        const y = Math.min(h - 1, Math.max(0, p.y + dy));
        const i = (y * w + x) * 4;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        c++;
      }
    }
    samples.push({ r: r / c, g: g / c, b: b / c });
  }

  let R = 0, G = 0, B = 0;
  for (const s of samples) {
    R += s.r;
    G += s.g;
    B += s.b;
  }

  return { r: R / samples.length, g: G / samples.length, b: B / samples.length };
}

function _colorDistSq(r, g, b, bg) {
  const dr = r - bg.r;
  const dg = g - bg.g;
  const db = b - bg.b;
  return dr * dr + dg * dg + db * db;
}

function _findContentBoundsInRect(data, w, h, x0, y0, x1, y1, bg, bgTol, minAlpha) {
  const tolSq = bgTol * bgTol;
  let left = x1, right = x0, top = y1, bottom = y0;
  let found = false;

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * w + x) * 4;
      const a = data[i + 3];
      if (a < minAlpha) continue;

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (_colorDistSq(r, g, b, bg) <= tolSq) continue;

      found = true;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }

  if (!found) return null;
  return { left, right: right + 1, top, bottom: bottom + 1 };
}

/**
 * 移除背景（改进版：边缘平滑与智能填充）
 * 用于处理 AI 生成图片的白底或噪点背景。
 */
function removeBackgroundTransparent(canvas, bg = { r: 255, g: 255, b: 255 }, threshold = 50) {
  const ctx = canvas.getContext("2d");
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const tolSq = threshold * threshold;

  // 1. First pass: strict color removal
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const distSq = (r - bg.r) ** 2 + (g - bg.g) ** 2 + (b - bg.b) ** 2;

    if (distSq < tolSq) {
      data[i + 3] = 0;
    } else if (distSq < tolSq * 1.5) {
      // 2. Second pass: semi-transparency for edges
      const ratio = (distSq - tolSq) / (tolSq * 0.5);
      data[i + 3] = Math.floor(255 * ratio);
    }
  }

  // 3. Simple edge refinement (denoising small isolated pixels)
  // (Optional: can add basic erosion/dilation if needed)

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}


// =============================================================================
// Quiz System (Decoupled & Subject-based)
// =============================================================================

// 当前正在答的题（进入 QUESTION 状态时设置，答题结束清空）
let currentQuestion = null;

// 题库（从 questions.json 加载）
let QUESTION_BANK = {};

/**
 * 从 JSON 加载题库
 */
async function loadQuestions() {
  try {
    const response = await fetch("assets/data/questions.json");
    QUESTION_BANK = await response.json();
  } catch (e) {
    QUESTION_BANK = {
      default: [
        { q: "DNA的中文名称是？", a: ["脱氧核糖核酸", "核糖核酸", "蛋白质", "氨基酸"], ans: 0 },
        { q: "水的化学式是？", a: ["H2O", "CO2", "NaCl", "O2"], ans: 0 }
      ]
    };
  }
}

// 立即加载
loadQuestions();

/**
 * 获取随机题目
 * @param {string} subjectKey - 学科标识
 */
function getRandomQuestion(subjectKey) {
  const bank = QUESTION_BANK[subjectKey] || QUESTION_BANK["default"] || [];
  if (bank.length === 0) {
    // Fallback if specific bank is empty
    const allKeys = Object.keys(QUESTION_BANK);
    const randomKey = allKeys[Math.floor(Math.random() * allKeys.length)];
    const fallbackBank = QUESTION_BANK[randomKey] || [];
    return fallbackBank[Math.floor(Math.random() * fallbackBank.length)];
  }
  return bank[Math.floor(Math.random() * bank.length)];
}

/**
 * 处理答题
 * @param {number} answer - 答案索引
 */
function handleAnswer(answer) {
  if (gameState !== "QUESTION") return;

  // Use the question shown when entering QUESTION state.
  const question = currentQuestion;
  if (!question) {
    gameState = "PLAYING";
    hideAllModals();
    return;
  }

  const correct = answer === question.ans;

  // Timeout case: answer = -1 treated as wrong
  const isTimeout = answer === -1;

  if (correct) {
    // 答对，释放技能
    applySkillEffect(qCaster, qTarget);
  } else {
    // 答错/超时，扣血
    applyDamage(qCaster, SKILL_FAIL_PENALTY);
    if (typeof createFloatingText === "function") {
      createFloatingText(
        qCaster.x + qCaster.width / 2,
        qCaster.y - 40,
        isTimeout ? "TIME UP! (超时扣血)" : "SKILL FAILED! (答错扣血)",
        "#ff4e50",
      );
    }
    // 对手获得连击
    if (qTarget) {
      qTarget.skillPoints += SKILL_GAIN_ON_FAIL;
      if (typeof updateSkillUI === "function") updateSkillUI(qTarget);
    }
  }

  currentQuestion = null;
  gameState = "PLAYING";
  hideAllModals();
}

/**
 * 触发答题模式
 * @param {Player} caster - 释放者
 */
function triggerQuestionMode(caster) {
  if (gameState !== "PLAYING") return;

  qCaster = caster;
  qTarget = caster === player1 ? player2 : player1;
  gameState = "QUESTION";
  qTimer = Q_MAX_TIME;

  // 显示题目
  currentQuestion = getRandomQuestion(caster.subjectKey);
  const subjectLabel = caster.subject
    ? `${caster.subject.name}「${caster.subject.description || ""}」`
    : "学科";
  showQuestionModal(currentQuestion, subjectLabel);
}

/**
 * 应用技能效果
 * @param {Player} caster - 释放者
 * @param {Player} target - 目标
 */
function applySkillEffect(caster, target) {
  if (!caster.subject) return;

  let effect = caster.subject.effect;
  let damage = caster.subject.damage || 0;
  const color = caster.subject.color;
  const skillName = caster.subject.name;
  const playerName = caster.isP1 ? "P1" : "P2";

  // 显示全屏技能通知
  if (typeof showSkillNotification === "function") {
    showSkillNotification(skillName, playerName, color);
  }

  // 造成伤害
  if (damage > 0) {
    applyDamage(target, damage * 2); // 技能伤害翻倍
  }

  // 应用Buff + 独特视觉特效
  switch (effect) {
    case "giant":
      caster.setBuff("giant", BUFF_DURATION.giant);
      // 向上喷射绿色粒子
      for(let i=0; i<3; i++) {
        if(typeof spawnParticles === "function") spawnParticles(caster.x + caster.width/2, caster.y, color, 20);
      }
      break;
    case "poison":
      target.setBuff("poison", BUFF_DURATION.poison);
      // 紫色毒气螺旋
      for(let i=0; i<2; i++) {
        if(typeof spawnParticles === "function") spawnParticles(target.x + target.width/2 + Math.cos(i*Math.PI)*20, target.y + target.height/2, color, 25);
      }
      break;
    case "root":
      target.setBuff("root", BUFF_DURATION.root);
      // 蓝色冰冻效果（向下）
      for(let i=0; i<4; i++) {
        if(typeof spawnParticles === "function") spawnParticles(target.x + target.width/2 + (Math.random()-0.5)*40, target.y + target.height, color, 15);
      }
      break;
    case "reverse":
      target.setBuff("reverse", BUFF_DURATION.reverse);
      // 红色旋转特效
      for(let i=0; i<8; i++) {
        const angle = (i/8) * Math.PI * 2;
        if(typeof spawnParticles === "function") spawnParticles(target.x + target.width/2 + Math.cos(angle)*30, target.y + target.height/2 + Math.sin(angle)*30, color, 12);
      }
      break;
    case "berserk":
      caster.setBuff("berserk", BUFF_DURATION.berserk);
      // 橙色爆炸环
      for(let i=0; i<6; i++) {
        const angle = (i/6) * Math.PI * 2;
        if(typeof spawnParticles === "function") spawnParticles(caster.x + caster.width/2 + Math.cos(angle)*25, caster.y + Math.sin(angle)*25, color, 30);
      }
      break;
    case "invincible":
      caster.setBuff("invincible", BUFF_DURATION.invincible);
      // 青色护盾光环
      for(let i=0; i<12; i++) {
        const angle = (i/12) * Math.PI * 2;
        if(typeof spawnParticles === "function") spawnParticles(caster.x + caster.width/2 + Math.cos(angle)*35, caster.y + caster.height/2 + Math.sin(angle)*35, color, 8);
      }
      break;
    case "silence":
      target.setBuff("silence", BUFF_DURATION.silence);
      // 灰色禁止符号粒子
      for(let i=0; i<5; i++) {
        if(typeof spawnParticles === "function") spawnParticles(target.x + target.width/2 + (Math.random()-0.5)*30, target.y + (Math.random()-0.5)*30, color, 18);
      }
      break;
    case "heal":
      caster.hp = Math.min(caster.hp + 200, MAX_HP);
      updateHealthUI();
      // 棕色治疗光芒（向上）
      for(let i=0; i<5; i++) {
        if(typeof spawnParticles === "function") spawnParticles(caster.x + caster.width/2 + (Math.random()-0.5)*20, caster.y - i*15, color, 20);
      }
      break;
    case "meteor":
      // 浅绿色陨石雨
      for(let i=0; i<8; i++) {
        if(typeof spawnParticles === "function") spawnParticles(target.x + target.width/2 + (Math.random()-0.5)*60, target.y - 50 - Math.random()*40, color, 35);
      }
      break;
    case "speed":
      caster.setBuff("speed", BUFF_DURATION.berserk);
      // 黄色速度线
      for(let i=0; i<6; i++) {
        if(typeof spawnParticles === "function") spawnParticles(caster.x + caster.width/2 + i*10, caster.y + caster.height/2, color, 25);
      }
      break;
    case "hack":
      // 粉色数字雨
      for(let i=0; i<10; i++) {
        if(typeof spawnParticles === "function") spawnParticles(target.x + target.width/2 + (Math.random()-0.5)*50, target.y + (Math.random()-0.5)*50, color, 20);
      }
      break;
    case "stun":
      target.setBuff("root", BUFF_DURATION.root);
      // 紫色星星旋转
      for(let i=0; i<8; i++) {
        const angle = (i/8) * Math.PI * 2;
        if(typeof spawnParticles === "function") spawnParticles(target.x + target.width/2 + Math.cos(angle)*25, target.y + Math.sin(angle)*25, color, 15);
      }
      break;
    case "illusion":
      // 深橙色闪烁幻象
      for(let i=0; i<12; i++) {
        if(typeof spawnParticles === "function") spawnParticles(target.x + target.width/2 + (Math.random()-0.5)*40, target.y + (Math.random()-0.5)*40, color, 12);
      }
      break;
  }

  // 基础技能特效
  spawnHeavyParticles(target.x + target.width / 2, target.y, color, 30);
  screenShakeTime = SCREEN_SHAKE_FRAMES * 2;
}

/**
 * 获得技能点数
 * @param {Player} player - 玩家
 * @param {number} points - 点数
 */
function gainSkill(player, points) {
  player.skillPoints += points;
  updateSkillUI(player);

  if (player.skillPoints >= MAX_SKILL) {
    if (typeof spawnFloatingText === "function") {
      spawnFloatingText(player.x, player.y - 40, "SUPER READY!!", "#ffeb3b", true);
    }
  }
}

function applyDamage(target, amount) {
  if (!target || !amount) return;

  // invincible: no damage
  if (target.buffs && target.buffs.invincible > 0) return;

  target.hp -= amount;
  if (target.hp < 0) target.hp = 0;

  if (typeof updateHealthUI === "function") updateHealthUI();
  if (target.hp <= 0 && typeof endGame === "function") endGame();
}

// ============================================================================
// AI 角色生成
// ============================================================================

const PHOTO_CACHE = { p1: null, p2: null };

/**
 * 拍照并生成角色
 * @param {string} base64 - 照片base64
 * @param {string} desc - 描述
 * @param {boolean} isP1 - 是否P1
 */
async function generateCharacter(base64, desc, isP1) {
  if (!AI_GENERATION_PARAMS.ENABLED) {
    return;
  }
  
  // 优先使用 LMStudio
  if (LMSTUDIO_CONFIG.ENABLED) {
    try {
      await generateWithLMStudio(base64, desc, isP1);
      return;
    } catch (e) {
    }
  }
  
  // 备用 BigModel
  if (BIGMODEL_CONFIG.API_KEY) {
    try {
      await generateWithBigModel(base64, desc, isP1);
      return;
    } catch (e) {
    }
  }
  
}

/**
 * LMStudio 本地生成
 */
async function generateWithLMStudio(photoBase64, desc, isP1) {
  let prompt = AI_GENERATION_PROMPTS.default.replace("{CHARACTER_DESCRIPTION}", desc || "一个街机格斗游戏角色");
  
  let response = await fetch(LMSTUDIO_CONFIG.BASE_URL + "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: LMSTUDIO_CONFIG.VISION_MODEL,
      messages: [
        { role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: photoBase64 } }] }
      ],
      max_tokens: 1024,
    }),
  });
  
  let data = await response.json();
  
  // TODO: 解析响应并生成图片
}

/**
 * BigModel 云端生成
 */
async function generateWithBigModel(photoBase64, desc, isP1) {
  let apiKey = BIGMODEL_CONFIG.API_KEY;
  if (!apiKey) throw new Error("未配置 API Key");
  
  let response = await fetch(BIGMODEL_CONFIG.BASE_URL + "/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + apiKey,
    },
    body: JSON.stringify({
      model: BIGMODEL_CONFIG.IMAGE_MODEL,
      prompt: desc || "像素游戏角色精灵表，4x3网格",
      size: BIGMODEL_CONFIG.IMAGE_SIZE,
      quality: BIGMODEL_CONFIG.IMAGE_QUALITY,
    }),
  });
  
  let data = await response.json();
  // TODO: 下载图片并处理
}

// ============================================================================
// 智能背景移除
// ============================================================================

/**
 * 移除白色背景
 * @param {HTMLCanvasElement} canvas - 画布
 * @param {number} threshold - 阈值
 */
// Back-compat alias used by other code paths
function removeWhiteBackground(canvas, threshold) {
  return removeWhiteBackground_v2(canvas, threshold);
}

// v2 implementation: route to generic color-based remover (white by default)
function removeWhiteBackground_v2(canvas, threshold = 50) {
  return removeBackgroundTransparent(canvas, { r: 255, g: 255, b: 255 }, threshold);
}

/**
 * 使用Sobel边缘检测优化背景移除
 * @param {HTMLCanvasElement} canvas - 画布
 */
function removeBackgroundWithEdge(canvas) {
  let ctx = canvas.getContext("2d");
  let width = canvas.width;
  let height = canvas.height;
  let imgData = ctx.getImageData(0, 0, width, height);
  let data = imgData.data;
  
  // 创建灰度图
  let gray = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    gray[i / 4] = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
  }
  
  // 简化处理：检测边缘并保留
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let idx = y * width + x;
      let g = gray[idx];
      let gLeft = gray[idx - 1];
      let gRight = gray[idx + 1];
      let gTop = gray[idx - width];
      let gBottom = gray[idx + width];
      
      // 边缘检测
      let edge = Math.abs(g - gLeft) + Math.abs(g - gRight) + Math.abs(g - gTop) + Math.abs(g - gBottom);
      
      // 背景区域设为透明
      if (g > 200 && edge < 40) {
        data[idx * 4 + 3] = 0;
      }
    }
  }
  
  ctx.putImageData(imgData, 0, 0);
  return canvas;
}