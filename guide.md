# AI角色生成指南

## 1. 快速开始

### 方式一：游戏中自动生成（推荐）

1. 打开游戏 `http://localhost:8000`
2. 点击 "🤖 AI生成角色" 按钮
3. 上传照片
4. 输入角色描述（可选）
5. 等待生成完成
6. 自动加载到游戏

### 方式二：手动生成

使用 Midjourney、DALL-E 等AI生成精灵表，手动放入 `assets/sprites/`

---

## 2. 精灵表规格

### 必须要求

| 规格 | 值 |
|------|-----|
| 格式 | 4列 × 3行 PNG |
| 分辨率 | 768 × 1024 像素 |
| 单帧大小 | 192 × 341 像素 |
| 背景 | 纯白色 RGB(255,255,255) |

### 帧结构

```
Row 0: 待机/呼吸动画 (4帧)
Row 1: 跑动/移动动画 (4帧)  
Row 2: 攻击/出拳动画 (4帧)
```

### 示例提示词

```
Create a pixel art game character sprite sheet, 4 columns x 3 rows grid:
- Row 1: Idle breathing animation (4 frames standing still)
- Row 2: Running movement animation (4 frames running right)
- Row 3: Punch attack animation (4 frames punching)
- Style: 2D pixel art similar to Street Fighter II
- Background: Pure white for easy cutout
- Character: Human fighter, clear limbs, distinctive pose
```

---

## 3. API配置

### LMStudio (推荐 - 免费)

1. 下载 LMStudio: https://lmstudio.ai/
2. 下载模型: google/gemma-4-2b
3. 启动本地服务器 (默认端口 1234)
4. 运行 `node proxy.js` 解决 CORS
5. 在 config.js 中设置:
```javascript
LMSTUDIO_CONFIG.ENABLED = true;
```

### BigModel API (备用)

1. 获取 API Key: https://bigmodel.cn/usercenter/apikeys
2. 在 config.js 中填入:
```javascript
const BIGMODEL_CONFIG = {
  API_KEY: "your-key-here",
  GLM_MODEL: "glm-4.6v-flash",
  IMAGE_MODEL: "cogview-3-flash"
};
```

---

## 4. 背景移除

游戏内置自动背景移除算法：

1. 检测白色背景 (RGB > 200)
2. 边缘检测 (Sobel)
3. 边界扫描优化
4. 输出透明PNG

### 手动移除

使用移除工具：
```bash
python tools/sprite_processor.py remove assets/sprites/p1_sprite.png
```

---

## 5. 文件命名

- P1角色: `assets/sprites/p1_sprite.png`
- P2角色: `assets/sprites/p2_sprite.png`
- 背景: `assets/backgrounds/bg_*.jpg`

---

## 6. 调试

控制台查看生成日志：
```
✅ P1 精灵表已加载
📐 Frame bounds 分析完成: 12 frames
```

如有问题，调低 bgThreshold (默认200)

---

**版本**: V0.7