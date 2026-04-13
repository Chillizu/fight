# 📁 项目结构说明

## 目录树

```
Fight_/
├── 📄 index.html              # 主游戏页面
├── 📄 README.md               # 项目说明
├── 📄 arcade.md               # 街机风格设计指南
├── 📄 thought.txt             # 游戏设计思路
├── 📄 package.json            # 项目配置
│
├── 📁 css/                    # 样式文件
│   └── style.css              # 主样式表（街机风格）
│
├── 📁 js/                     # 游戏逻辑
│   ├── config.js              # 游戏配置常量
│   ├── subjects.js            # 学科定义（9个学科）
│   ├── player.js              # 玩家类和Sprite系统
│   ├── game.js                # 主游戏循环和战斗系统
│   ├── particles.js           # 粒子效果系统
│   ├── ui.js                  # UI和资源加载
│   └── ui_extend.js           # 扩展UI（技能、答题、AI生成）
│
├── 📁 assets/                 # 游戏资源
│   ├── backgrounds/           # 背景图片
│   ├── sprites/               # 精灵图（P1.png, P2.png）
│   └── data/
│       └── questions.json     # 题库数据
│
├── 📁 docs/                   # 文档
│   └── SPRITE_GENERATION_PROMPT.md  # AI精灵图生成提示词
│
├── 📁 openspec/               # OpenSpec配置
│   ├── changes/               # 变更记录
│   └── specs/                 # 规范文档
│
└── 📁 .claude/                # Claude Code配置
    └── CLAUDE.md              # 项目指令
```

## 核心文件说明

### 游戏逻辑 (js/)
- **config.js** - 所有游戏常量（血量、攻击、技能、Buff等）
- **subjects.js** - 9个学科定义及其技能效果
- **player.js** - 玩家类、Sprite加载、动画系统
- **game.js** - 主游戏循环、战斗检测、技能通知
- **particles.js** - 粒子和浮动文字效果
- **ui.js** - UI更新、资源加载、AI生成
- **ui_extend.js** - 答题系统、技能效果、题库管理

### 资源 (assets/)
- **sprites/** - 精灵图存放位置（支持P1.png, P2.png）
- **data/questions.json** - 9个学科的题库
- **backgrounds/** - 背景图片

### 文档 (docs/)
- **SPRITE_GENERATION_PROMPT.md** - AI生成精灵图的提示词模板

## Sprite加载优先级

```
1️⃣ assets/sprites/P1.png (P1) / assets/sprites/P2.png (P2)
   ↓ (如果不存在)
2️⃣ sprite.png (fallback)
   ↓ (如果不存在)
3️⃣ 实时导入的Sprite (用户上传)
   ↓ (如果都失败)
4️⃣ [[NULL]] 占位符
```

## 学科系统

### 9个核心学科
| 学科 | 颜色 | 技能 | 效果 |
|------|------|------|------|
| 🧬 生物 | 绿色 | 变大 | 体型增大50% \| 15秒 |
| ⚗️ 化学 | 紫色 | 毒气 | 每秒扣22伤 \| 10秒 |
| ⚡ 物理 | 蓝色 | 禁锢 | 无法移动 \| 5秒 |
| 📖 语文 | 红色 | 反转 | 操作反向 \| 15秒 |
| 📐 数学 | 橙色 | 狂暴 | 攻击+8 \| 7秒 |
| 🌍 英语 | 青色 | 无敌 | 无敌状态 \| 5秒 |
| 🏛️ 政治 | 灰色 | 沉默 | 攻击-5 \| 15秒 |
| 📜 历史 | 棕色 | 回血 | 恢复200 HP |
| 🌍 地理 | 浅绿 | 流星 | 瞬时伤害180点 |

## 关键特性

### 战斗系统
- 实时攻击碰撞检测
- 格挡减伤（20%伤害）
- 技能点积累（13点释放大招）
- 答题系统（答对释放技能）
- 伤害倍数系统（技能伤害1.0x-1.6x）

### 视觉效果
- CRT扫描线效果
- 伤害数字浮动（物理效果）
- 受伤粒子爆炸
- 技能释放全屏通知
- 屏幕震动反馈
- Hit-stop顿帧

### UI系统
- 实时血量/技能条
- 连击计数显示
- 答题倒计时
- 技能效果提示
- 底部控制面板

## 开发工作流

1. **修改游戏逻辑** → 编辑 `js/` 文件
2. **调整游戏平衡** → 修改 `js/config.js`
3. **添加新学科** → 编辑 `js/subjects.js`
4. **改进UI样式** → 修改 `css/style.css`
5. **生成精灵图** → 使用 `docs/SPRITE_GENERATION_PROMPT.md`
6. **上传精灵图** → 放入 `assets/sprites/` 或通过UI上传

## 性能优化

- 移除所有 console.log（保持控制台清洁）
- 粒子系统优化（自动清理过期粒子）
- 浮动文字独立管理
- 图片缓存和预加载
- 动画帧率优化（60fps）
