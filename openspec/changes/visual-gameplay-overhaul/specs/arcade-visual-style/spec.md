## ADDED Requirements

### Requirement: HUD 使用街机字体
HUD 关键元素（玩家名、HITS/SKILL 文字、计时器）SHALL 使用 Press Start 2P 字体。

#### Scenario: 玩家名显示街机字体
- **WHEN** 游戏加载完成
- **THEN** .player-name 元素使用 Press Start 2P 字体渲染

#### Scenario: 计时器显示街机字体
- **WHEN** 游戏运行中
- **THEN** #timer 元素使用 Press Start 2P 字体，字号不小于 32px

#### Scenario: HITS/SKILL 文字清晰可读
- **WHEN** 游戏运行中
- **THEN** .combo-text 使用 Press Start 2P 字体，字号 8px，行高足够

### Requirement: P1/P2 使用单一区分色
P1 侧所有 HUD 元素 SHALL 使用青色 (#00f2fe)，P2 侧 SHALL 使用红色 (#ff4e50)，不使用渐变区分双方。

#### Scenario: P1 血条为纯青色
- **WHEN** P1 受到伤害
- **THEN** 血条填充色为纯 #00f2fe，无渐变

#### Scenario: P2 血条为纯红色
- **WHEN** P2 受到伤害
- **THEN** 血条填充色为纯 #ff4e50，无渐变

#### Scenario: 边框颜色与玩家对应
- **WHEN** 游戏加载
- **THEN** P1 所有边框/发光为青色，P2 所有边框/发光为红色

### Requirement: 视觉层级清晰
血条 SHALL 是最显眼的 HUD 元素，技能条次之，文字信息最小。

#### Scenario: 血条高度最大
- **WHEN** 游戏运行中
- **THEN** 血条高度 >= 24px，技能条高度 <= 12px
