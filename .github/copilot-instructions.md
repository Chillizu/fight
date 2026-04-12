# 《校园大乱斗》AI 协作指南

## 1. 项目概览

**项目名称**: 校园大乱斗 (Campus Fighting Game)  
**类型**: 本地双人同屏 2.5D 横板网页格斗游戏  
**技术栈**: HTML5 Canvas 2D + Vanilla JavaScript  
**运行方式**: 纯前端本地化 (无需联网服务器)  
**版本**: V0.7

### 核心特性

- 🎮 **本地双人对战**: 键盘分割屏幕控制
- 🤖 **AI角色生成**: 通过照片生成玩家专属格斗角色
- 📚 **文斗+武斗**: 13连击触发学科大招 → 时停答题释放技能
- ✨ **街机美学**: 粒子特效、屏幕震动、Hit Stop 顿帧

---

## 2. 项目结构与职责

```
Fight_/
├── index.html              # 主游戏文件（Canvas 2D 渲染）
├── init.bat              # Windows 启动脚本
├── js/
│   ├── config.js        # ⭐ 统一配置中心
│   ├── game.js        # 游戏循环、碰撞检测
│   ├── player.js     # 玩家系统
│   ├── ui.js        # UI 渲染
│   ├── ui_extend.js  # AI集成、背景移除
│   ├── subjects.js # 13种学科技能
│   └── particles.js # 粒子特效
└── assets/
    ├── backgrounds/  # 游戏背景图
    └── sprites/      # 角色精灵表 (4×3 Grid)
```

---

## 3. 快速启动

### 环境要求

- Python 3.6+ 或 Node.js 12+
- 现代浏览器 (Chrome, Firefox, Edge)

### 启动方式

```bash
# Windows
双击 init.bat

# 或手动
python -m http.server 8000
```

访问: http://localhost:8000

---

## 4. 代码约定

### JavaScript 规范

- **函数**: camelCase (e.g., `calculateDamage`)
- **常量**: UPPER_SNAKE_CASE (e.g., `MAX_HP`)
- **类**: PascalCase (e.g., `Player`)
- **私有属性**: `_propertyName`

### 注释风格

```javascript
// 单行注释
/**
 * 多行 JSDoc
 * @param {type} name - 描述
 */
```

---

## 5. 配置管理

**所有参数在 js/config.js 中定义**:
- 游戏时间、血量
- 控制键配置
- AI API 配置
- 技能参数

修改 config.js 而非硬编码。

---

## 6. 常见问题

| 问题 | 解决 |
|------|------|
| 贴图不显示 | 通过 http://localhost:8000 访问 |
| API 生成失败 | 检查 config.js 中的 API_KEY |
| CORS 错误 | 运行 node proxy.js |

---

**最后更新**: 2026年4月