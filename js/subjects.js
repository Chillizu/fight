/**
 * 13种学科技能定义
 * 每个技能包含：名称、颜色、效果描述、触发函数
 */

// 学科颜色映射
const SUBJECT_COLORS = {
  biology: "#4caf50",   // 生物 - 绿色
  chemistry: "#9c27b0", // 化学 - 紫色
  physics: "#2196f3",  // 物理 - 蓝色
  chinese: "#f44336", // 语文 - 红色
  math: "#ff9800",     // 数学 - 橙色
  english: "#00bcd4", // 英语 - 青色
  politics: "#607d8b", // 政治 - 灰色
  history: "#795548",   // 历史 - 棕色
  geography: "#8bc34a", // 地理 - 浅绿
  pe: "#ffeb3b",      // 体育 - 黄色
  info: "#e91e63",    // 信息 - 粉色
  music: "#9c27b0",   // 音乐 - 紫色
  art: "#ff5722"       // 美术 - 深橙
};

// 学科定义
const SUBJECTS = {
  biology: {
    key: "biology",
    name: "生物",
    color: SUBJECT_COLORS.biology,
    emoji: "🧬",
    description: "变大",
    effect: "giant",
    damage: 32,
  },
  chemistry: {
    key: "chemistry",
    name: "化学",
    color: SUBJECT_COLORS.chemistry,
    emoji: "⚗️",
    description: "毒气",
    effect: "poison",
    damage: 15,
  },
  physics: {
    key: "physics",
    name: "物理",
    color: SUBJECT_COLORS.physics,
    emoji: "⚡",
    description: "禁锢",
    effect: "root",
    damage: 25,
  },
  chinese: {
    key: "chinese",
    name: "语文",
    color: SUBJECT_COLORS.chinese,
    emoji: "📖",
    description: "反转",
    effect: "reverse",
    damage: 20,
  },
  math: {
    key: "math",
    name: "数学",
    color: SUBJECT_COLORS.math,
    emoji: "📐",
    description: "狂暴",
    effect: "berserk",
    damage: 35,
  },
  english: {
    key: "english",
    name: "英语",
    color: SUBJECT_COLORS.english,
    emoji: "🌍",
    description: "无敌",
    effect: "invincible",
    damage: 0,
  },
  politics: {
    key: "politics",
    name: "政治",
    color: SUBJECT_COLORS.politics,
    emoji: "🏛️",
    description: "沉默",
    effect: "silence",
    damage: 20,
  },
  history: {
    key: "history",
    name: "历史",
    color: SUBJECT_COLORS.history,
    emoji: "📜",
    description: "回血",
    effect: "heal",
    damage: -300,
  },
  geography: {
    key: "geography",
    name: "地理",
    color: SUBJECT_COLORS.geography,
    emoji: "🌍",
    description: "陨石",
    effect: "meteor",
    damage: 50,
  },
  pe: {
    key: "pe",
    name: "体育",
    color: SUBJECT_COLORS.pe,
    emoji: "🏃",
    description: "加速",
    effect: "speed",
    damage: 20,
  },
  info: {
    key: "info",
    name: "信息",
    color: SUBJECT_COLORS.info,
    emoji: "💻",
    description: "黑客",
    effect: "hack",
    damage: 25,
  },
  music: {
    key: "music",
    name: "音乐",
    color: SUBJECT_COLORS.music,
    emoji: "🎵",
    description: "眩晕",
    effect: "stun",
    damage: 30,
  },
  art: {
    key: "art",
    name: "美术",
    color: SUBJECT_COLORS.art,
    emoji: "🎨",
    description: "幻象",
    effect: "illusion",
    damage: 20,
  },
};

// 学科键列表（排除指定学科）
function getSubjectKeys(excludeKey) {
  return Object.keys(SUBJECTS).filter((k) => k !== excludeKey);
}

// ���机获取学科
function getRandomSubject(excludeKey) {
  const keys = getSubjectKeys(excludeKey);
  return keys[Math.floor(Math.random() * keys.length)];
}

// 获取学科对象
function getSubject(key) {
  return SUBJECTS[key] || SUBJECTS.biology;
}

// 获取所有学科
function getAllSubjects() {
  return Object.values(SUBJECTS);
}