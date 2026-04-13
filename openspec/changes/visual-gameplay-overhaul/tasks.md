## 1. 视觉风格 - 字体统一

- [ ] 1.1 在 `css/style.css` 中将 `.combo-text` 字体改为 `'Press Start 2P'`，字号 8px
- [ ] 1.2 将 `.player-name` 字体改为 `'Press Start 2P'`，字号 10px
- [ ] 1.3 将 `#timer` 字体改为 `'Press Start 2P'`，字号 32px
- [ ] 1.4 将 `.vs-text` 字体改为 `'Press Start 2P'`，字号 10px

## 2. 视觉风格 - 颜色方案简化

- [ ] 2.1 将 `#p1-info .health-bar-fill` 背景改为纯色 `#00f2fe`（去除渐变）
- [ ] 2.2 将 `#p2-info .health-bar-fill` 背景改为纯色 `#ff4e50`（去除渐变）
- [ ] 2.3 检查并去除 `.bottom-panel`、`.player-info` 等区域中用于区分 P1/P2 的渐变，改为纯色 + box-shadow
- [ ] 2.4 确保 P1 所有边框/发光统一为 `#00f2fe`，P2 统一为 `#ff4e50`

## 3. 键盘输入修复

- [ ] 3.1 在 `js/ui_extend.js` 的 `triggerSkillQuestion()` 中，确保执行顺序为：`currentQuestion = ...` → `gameState = "QUESTION"` → `showQuestionModal()`
- [ ] 3.2 验证 `handleAnswer` 在 `game.js` 加载后已挂载到 `window`（检查 `window.handleAnswer` 赋值时机）

## 4. 攻击判定修复

- [ ] 4.1 在 `js/player.js` 的 `getHitbox()` 中，统一 P1/P2 的 hitbox x 偏移计算，确保对称性
- [ ] 4.2 测试：P1 和 P2 在相同距离下攻击命中率一致

## 5. 格挡功能完善

- [ ] 5.1 在 `index.html` 的 `.controls-info` 中添加格挡说明（P1: S格挡，P2: ↓格挡）
- [ ] 5.2 在 `js/game.js` 的 `checkCombat()` 中，格挡受击时调用 `spawnFloatingText` 显示灰色 "BLOCK!" 文字
- [ ] 5.3 验证格挡护盾视觉效果（player.js 中已有脉冲动画，确认正常工作）

## 6. 验证

- [ ] 6.1 启动本地服务器，测试 P1/P2 字体和颜色显示正确
- [ ] 6.2 触发技能答题，测试 WASD 和方向键均能正确响应
- [ ] 6.3 测试 P1 和 P2 攻击判定范围对称性
- [ ] 6.4 测试格挡功能：按 S/↓ 格挡，确认减伤和 BLOCK! 文字显示
