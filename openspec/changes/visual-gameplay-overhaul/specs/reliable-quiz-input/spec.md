## ADDED Requirements

### Requirement: 答题键盘输入可靠响应
当 gameState 为 QUESTION 时，WASD 和方向键 SHALL 立即触发对应答案，不受 DOM 渲染时序影响。

#### Scenario: W 键选择答案 0
- **WHEN** gameState === "QUESTION" 且用户按下 W 键
- **THEN** handleAnswer(0) 被调用，gameState 切回 PLAYING

#### Scenario: 方向键选择答案
- **WHEN** gameState === "QUESTION" 且用户按下 ArrowUp/ArrowDown/ArrowLeft/ArrowRight
- **THEN** 对应 handleAnswer(0/1/2/3) 被调用

#### Scenario: 答题期间移动键无效
- **WHEN** gameState === "QUESTION"
- **THEN** 角色不移动，keys 对象中移动键状态被清除

### Requirement: 答题状态初始化顺序正确
triggerSkillQuestion SHALL 按顺序执行：设置 currentQuestion → 设置 gameState = "QUESTION" → 渲染 modal DOM。

#### Scenario: 状态先于 DOM 设置
- **WHEN** 技能触发答题
- **THEN** gameState 在 showQuestionModal() 调用前已为 "QUESTION"
