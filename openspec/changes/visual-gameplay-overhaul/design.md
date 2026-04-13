## Context

游戏使用纯 HTML5 Canvas + DOM 混合渲染。Canvas 负责角色/粒子/背景，DOM 负责 HUD（血条、技能条、文字）。当前视觉问题根源：字体未使用已导入的 Press Start 2P，颜色方案在 CSS 中混用渐变与纯色，键盘输入在 QUESTION 状态下存在时序竞争。

## Goals / Non-Goals

**Goals:**
- 统一 HUD 字体为 Press Start 2P，提升街机感
- 简化颜色方案：P1 青色系、P2 红色系、中立黄色，去除渐变
- 修复答题键盘输入时序问题（确保 gameState 切换先于 DOM 渲染）
- 修正 P1/P2 hitbox 对称性
- 在控制说明中明确格挡操作

**Non-Goals:**
- 不重构 Canvas 渲染管线
- 不修改粒子系统
- 不添加新技能或学科

## Decisions

**D1: 字体应用范围**
仅对 HUD 关键元素（.combo-text, .player-name, #timer, .vs-text）应用 Press Start 2P，正文/按钮保留 Fira Sans。原因：Press Start 2P 可读性差，大段文字不适用；街机感只需在关键数字/标签上体现。

**D2: 颜色简化策略**
去除所有 `linear-gradient` 用于区分 P1/P2 的场景，改用纯色 + box-shadow glow。渐变仅保留背景装饰用途。原因：纯色 + 发光效果在街机风格中更有辨识度，渐变反而显得"现代感"过强。

**D3: 键盘输入修复**
在 `triggerSkillQuestion()` 中，先设置 `gameState = "QUESTION"` 和 `currentQuestion`，再调用 `showQuestionModal()`。当前顺序可能导致 keydown 在 modal 渲染前触发但 gameState 已切换，或反之。确保顺序：state → data → DOM。

**D4: Hitbox 对称性**
当前 `getHitbox()` 对 facingRight 和 facingLeft 使用相同宽度，但 x 偏移计算可能不对称。统一为：攻击盒宽度 = `attackHitbox.width`，x 位置 = facingRight ? `x + width * 0.8` : `x - attackHitbox.width * 0.8`。

## Risks / Trade-offs

- [Press Start 2P 字体较小时可读性差] → 对 .combo-text 适当增大 font-size（从 14px 到 10px Press Start 2P 等效）
- [颜色简化可能影响按钮区分度] → 保留 AI生成按钮的紫色作为第三色，其余统一双色

## Migration Plan

纯前端修改，无数据迁移。刷新页面即生效。
