/**
 * AI集成与背景移除
 * LMStudio/BigModel API 集成、智能背景移除
 */

// 题库
const QUESTIONS = [
  { q: "DNA的中文名称是？", a: ["脱氧核糖核酸", "核糖核酸", "蛋白质", "氨基酸"], ans: 0 },
  { q: "水的化学式是？", a: ["H2O", "CO2", "NaCl", "O2"], ans: 0 },
  { q: "牛顿第一定律又称？", a: ["惯性定律", "作用反作用定律", "万有引力定律", "动量守恒定律"], ans: 0 },
  { q: "\"床前明月光\"的作者是？", a: ["李白", "杜甫", "白居易", "王维"], ans: 0 },
  { q: "2的平方根约等于？", a: ["1.41", "1.73", "2.00", "1.5"], ans: 0 },
  { q: "\"hello\"用中文是？", a: ["你好", "再见", "谢谢", "对不起"], ans: 0 },
  // 可添加更多题目
];

/**
 * 获取随机题目
 */
function getRandomQuestion() {
  return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
}

/**
 * 处理答题
 * @param {number} answer - 答案索引
 */
function handleAnswer(answer) {
  if (gameState !== "QUESTION") return;
  
  let question = getRandomQuestion();
  let correct = answer === question.ans;
  
  if (correct) {
    // 答对，释放技能
    applySkillEffect(qCaster, qTarget);
  } else {
    // 答错，扣血
    applyDamage(qCaster, SKILL_FAIL_PENALTY);
    // 对手获得连击
    if (qTarget) {
      qTarget.skillPoints += SKILL_GAIN_ON_FAIL;
    }
  }
  
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
  let question = getRandomQuestion();
  showQuestionModal(question, caster.subject ? caster.subject.name : "学科");
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
  
  // 造成伤害
  if (damage > 0) {
    applyDamage(target, damage * 2); // 技能伤害翻倍
  }
  
  // 应用Buff
  switch (effect) {
    case "giant":
      caster.setBuff("giant", BUFF_DURATION.giant);
      break;
    case "poison":
      target.setBuff("poison", BUFF_DURATION.poison);
      break;
    case "root":
      target.setBuff("root", BUFF_DURATION.root);
      break;
    case "reverse":
      target.setBuff("reverse", BUFF_DURATION.reverse);
      break;
    case "berserk":
      caster.setBuff("berserk", BUFF_DURATION.berserk);
      break;
    case "invincible":
      caster.setBuff("invincible", BUFF_DURATION.invincible);
      break;
    case "silence":
      target.setBuff("silence", BUFF_DURATION.silence);
      break;
    case "heal":
      caster.hp = Math.min(caster.hp + 300, MAX_HP);
      updateHealthUI();
      break;
    // 可添加更多效果
  }
  
  // 技能特效
  spawnHeavyParticles(target.x + target.width / 2, target.y, caster.subject.color, 30);
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
    createFloatingText(player.x, player.y - 40, "SUPER READY!!", "#ffeb3b");
  }
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
    console.log("AI生成已禁用");
    return;
  }
  
  // 优先使用 LMStudio
  if (LMSTUDIO_CONFIG.ENABLED) {
    try {
      await generateWithLMStudio(base64, desc, isP1);
      return;
    } catch (e) {
      console.warn("LMStudio 失败，尝试 BigModel:", e);
    }
  }
  
  // 备用 BigModel
  if (BIGMODEL_CONFIG.API_KEY) {
    try {
      await generateWithBigModel(base64, desc, isP1);
      return;
    } catch (e) {
      console.error("BigModel 失败:", e);
    }
  }
  
  console.log("无可用AI，跳过生成");
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
  console.log("LMStudio 响应:", data);
  
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
function removeWhiteBackground(canvas, threshold) {
  threshold = threshold || 200;
  let ctx = canvas.getContext("2d");
  let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let data = imgData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], b = data[i + 2];
    // 白色背景检测
    if (r > threshold && g > threshold && b > threshold) {
      data[i + 3] = 0; // 透明
    }
  }
  
  ctx.putImageData(imgData, 0, 0);
  return canvas;
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