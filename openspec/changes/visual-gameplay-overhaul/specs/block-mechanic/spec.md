## ADDED Requirements

### Requirement: 格挡操作在控制说明中明确显示
控制说明 SHALL 包含格挡键位（P1: S键格挡，P2: ↓键格挡）。

#### Scenario: 底部控制说明包含格挡
- **WHEN** 游戏加载
- **THEN** .controls-info 显示 "S 格" 和 "↓ 格" 字样

### Requirement: 格挡视觉反馈明显
格挡激活时 SHALL 有明显的视觉反馈，让对手能看出对方在格挡。

#### Scenario: 格挡时角色有护盾效果
- **WHEN** 玩家按住格挡键
- **THEN** 角色周围出现发光护盾效果，透明度脉冲动画

#### Scenario: 格挡减伤显示
- **WHEN** 格挡状态下受到攻击
- **THEN** 显示 "BLOCK!" 浮动文字，伤害数字颜色不同（灰色）
