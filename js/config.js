/**
 * 【游戏配置常量】
 * 集中管理游戏的所有常量参数
 */

// === 游戏世界常量 ===
const GRAVITY = 0.85;
const GROUND_Y = 390;

// === 游戏时间常量 ===
const GAME_DURATION = 60;
const Q_MAX_TIME = 240;

// === 玩家常量 ===
const MAX_HP = 1000;
const MAX_SKILL = 13;
const PLAYER_BASE_WIDTH = 60;
const PLAYER_BASE_HEIGHT = 100;
const PLAYER_SPEED = 6.5;
const PLAYER_JUMP_POWER = -15;

// === 攻击常量 ===
const ATTACK_DURATION = 12;
const ATTACK_COOLDOWN_NORMAL = 12;
const ATTACK_COOLDOWN_BERSERK = 16;
const ATTACK_HITBOX_WIDTH = 60;
const ATTACK_HITBOX_HEIGHT = 30;
const BASE_ATTACK_DAMAGE = 25;
const DAMAGE_VARIANCE = 5;

// === 技能伤害倍数 ===
const SKILL_DAMAGE_MULTIPLIER = {
  giant: 1.3,      // 变大：伤害增加30%
  poison: 0.8,     // 中毒：伤害减少20%（但有持续伤害）
  root: 0.9,       // 根植：伤害减少10%（控制技能）
  reverse: 1.0,    // 反向：伤害不变
  berserk: 1.6,    // 狂暴：伤害增加60%
  invincible: 0.5, // 无敌：伤害减少50%（防守技能）
  silence: 1.1,    // 沉默：伤害增加10%
  heal: 0.0,       // 治疗：无伤害
  meteor: 1.4,     // 流星：伤害增加40%
};

// === 特效常量 ===
const HIT_STOP_FRAMES = 3;
const SCREEN_SHAKE_FRAMES = 8;
const SKILL_COOLDOWN_FRAMES = 300;
const POISON_DAMAGE = 22;
const POISON_INTERVAL = 60;
const SKILL_FAIL_PENALTY = 30;
const SKILL_GAIN_ON_FAIL = 3;

// === Buff 持续时间（单位：帧） ===
const BUFF_DURATION = {
  giant: 15 * 60,
  poison: 10 * 60,
  root: 5 * 60,
  reverse: 15 * 60,
  berserk: 7 * 60,
  invincible: 5 * 60,
  silence: 15 * 60,
};

// === 尺寸常数 ===
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;
const GIANT_BUFF_SCALE = 1.5;

// === 粒子效果常数 ===
const PARTICLE_COUNT_NORMAL = 15;
const PARTICLE_COUNT_HEAVY = 50;
const PARTICLE_SPEED_NORMAL = 5;
const PARTICLE_SPEED_HEAVY = 12;

// === 玩家初始位置 ===
const P1_START_X = 150;
const P1_START_Y = 200;
const P2_START_X = 600;
const P2_START_Y = 200;

// === 控制键配置 ===
const CONTROLS_P1 = {
  left: "a",
  right: "d",
  up: "w",
  down: "s",
  attack: "j",
  skill: "k",
};

const CONTROLS_P2 = {
  left: "arrowleft",
  right: "arrowright",
  up: "arrowup",
  down: "arrowdown",
  attack: "1",
  skill: "2",
};

// === UI 元素配置 ===
const SPRITE_GRID_COLS = 4;
const SPRITE_GRID_ROWS = 3;
const SPRITE_FRAME_DURATION = 150;
const SPRITE_ANIM_ROWS = {
  idle: 0,
  run: 1,
  attack: 2,
};

// === 默认资源（可选；为空则不会请求，避免 404）===
// 默认背景：硬加载根目录的 background.png（存在则自动显示）
const DEFAULT_BG_SRC = "background.png";
// Sprite加载优先级：
// 1. assets/sprites/P1.png (P1) / assets/sprites/P2.png (P2)
// 2. sprite.png (fallback)
// 3. 实时导入
// 4. [[NULL]] 占位符
const DEFAULT_SPRITE_P1_ASSETS = "assets/sprites/P1.png";
const DEFAULT_SPRITE_P2_ASSETS = "assets/sprites/P2.png";
const DEFAULT_SPRITE_P1_SRC = "sprite.png";
const DEFAULT_SPRITE_P2_SRC = "sprite.png";

// === 智谱 AI (BigModel) 配置 ===
const BIGMODEL_CONFIG = {
  API_KEY: "", // 从 https://bigmodel.cn/usercenter/apikeys 获取
  BASE_URL: "https://open.bigmodel.cn/api/paas/v4",
  GLM_MODEL: "glm-4.6v-flash",
  IMAGE_MODEL: "cogview-3-flash",
  IMAGE_SIZE: "1024x1024",
  IMAGE_QUALITY: "standard",
};

// === LMStudio 本地 API 配置 ===
const LMSTUDIO_CONFIG = {
  BASE_URL: "http://127.0.0.1:1234/v1",
  VISION_MODEL: "google/gemma-4-2b",
  ENABLED: false,
};

// === OpenRouter API 配置（备用）===
const OPENROUTER_CONFIG = {
  API_KEY: "",
  BASE_URL: "https://openrouter.ai/api/v1",
  MODEL: "black-forest-labs/flux.2-klein-4b",
  MAX_TOKENS: 2048,
  TEMPERATURE: 0.7,
  TOP_P: 0.9,
  TIMEOUT_MS: 60000,
};

// === AI 角色生成提示词模板 ===
const AI_GENERATION_PROMPTS = {
  default: `生成一张游戏角色精灵表（Sprite Sheet）：

【必须要求】
1. 输出格式：4列 x 3行的网格（共12帧）
2. 总分辨率：768 x 1024 像素
3. 每帧大小：192 x 341 像素
4. 背景色：纯白色 RGB(255,255,255)
5. 角色风格：2D 像素画风格

【帧结构说明】
- 第1行（Row 0）：待机/呼吸动画 - 4帧
- 第2行（Row 1）：跑动/移动动画 - 4帧
- 第3行（Row 2）：攻击/出拳动画 - 4帧

【角色描述】
{CHARACTER_DESCRIPTION}

【风格参考】
- Pixel Art 和 Street Fighter 风格`,
};

// === AI 生成参数 ===
const AI_GENERATION_PARAMS = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  ENABLED: true,
  AUTO_DOWNLOAD: false,
  AUTO_LOAD_TO_GAME: true,
};