## ADDED Requirements

### Requirement: P1 和 P2 攻击判定范围对称
getHitbox() SHALL 对 P1 和 P2 返回相同宽度的攻击盒，仅 x 方向镜像。

#### Scenario: P1 面朝右攻击
- **WHEN** P1 facingRight=true 且处于攻击状态
- **THEN** hitbox.x = player1.x + player1.width * 0.8，hitbox.w = attackHitbox.width

#### Scenario: P2 面朝左攻击
- **WHEN** P2 facingRight=false 且处于攻击状态
- **THEN** hitbox.x = player2.x - attackHitbox.width * 0.8，hitbox.w = attackHitbox.width

#### Scenario: 双方攻击范围等效
- **WHEN** P1 和 P2 站在相同距离
- **THEN** 双方命中概率相同，无一方明显优势
