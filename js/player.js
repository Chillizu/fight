/**
 * Player system
 * Defines player class and behavior logic
 */

class Player {
  constructor(x, y, color, controls, isP1, subjectKey) {
    // === Basic attributes ===
    this.baseWidth = PLAYER_BASE_WIDTH;
    this.baseHeight = PLAYER_BASE_HEIGHT;
    this.x = x;
    this.y = y;
    this.width = this.baseWidth;
    this.height = this.baseHeight;
    this.color = color;
    this.isP1 = isP1;

    // === Subject-related ===
    this.subjectKey = subjectKey;
    this.subject = null;

    // === Sprite system ===
    this.spriteImg = new Image();
    this.hasCustomSprite = false;
    this.frameBounds = null;
    this.spriteImg.src = isP1 ? "assets/sprites/p1_sprite.png" : "assets/sprites/p2_sprite.png";

    // === Physical attributes ===
    this.velocityX = 0;
    this.velocityY = 0;
    this.speed = PLAYER_SPEED;
    this.jumpPower = PLAYER_JUMP_POWER;

    // === Combat attributes ===
    this.hp = MAX_HP;
    this.skillPoints = 0;
    this.skillCooldown = 0;
    this.isGrounded = false;
    this.facingRight = isP1;

    // === Attack attributes ===
    this.isAttacking = false;
    this.attackDuration = ATTACK_DURATION;
    this.attackCooldown = 0;
    this.attackTimer = 0;
    this.attackHitbox = {
      width: ATTACK_HITBOX_WIDTH,
      height: ATTACK_HITBOX_HEIGHT,
    };

    // === Control configuration ===
    this.controls = controls;

    // === Buff system ===
    this.buffs = {
      giant: 0,
      poison: 0,
      root: 0,
      reverse: 0,
      berserk: 0,
      invincible: 0,
      silence: 0,
    };
  }

  /**
   * Set buff effect
   * @param {string} name - Buff name
   * @param {number} frames - Duration in frames
   */
  setBuff(name, frames) {
    if (this.buffs.hasOwnProperty(name)) {
      this.buffs[name] = frames;
    }
  }

  /**
   * Update player state
   * @param {object} keys - Key state object
   */
  update(keys) {
    // Update buff state
    for (let buff in this.buffs) {
      if (this.buffs[buff] > 0) {
        this.buffs[buff]--;
      }
    }

    // Skill cooldown
    if (this.skillCooldown > 0) {
      this.skillCooldown--;
    }

    // Apply buff effects
    if (this.buffs.giant > 0) {
      this.width = this.baseWidth * GIANT_BUFF_SCALE;
      this.height = this.baseHeight * GIANT_BUFF_SCALE;
    } else {
      this.width = this.baseWidth;
      this.height = this.baseHeight;
    }

    // Attack cooldown
    if (this.attackCooldown > 0) this.attackCooldown--;

    // Reset velocity
    this.velocityX = 0;

    // Movement restrictions
    let canMove =
      !(this.isGrounded && this.isAttacking) && this.buffs.root === 0;

    // Left/right movement
    if (canMove) {
      let kLeft = this.buffs.reverse > 0 ? this.controls.right : this.controls.left;
      let kRight = this.buffs.reverse > 0 ? this.controls.left : this.controls.right;

      if (keys[kLeft]) {
        this.velocityX = -this.speed;
        this.facingRight = false;
      } else if (keys[kRight]) {
        this.velocityX = this.speed;
        this.facingRight = true;
      }
    }

    // Jump
    if (this.buffs.reverse === 0 && keys[this.controls.up] && this.isGrounded && canMove) {
      this.velocityY = this.jumpPower;
      this.isGrounded = false;
    }

    // Normal attack
    if (keys[this.controls.attack] && this.attackCooldown === 0 && !this.isAttacking && this.buffs.root === 0) {
      this.isAttacking = true;
      this.attackTimer = this.attackDuration;
      this.attackCooldown = ATTACK_COOLDOWN_NORMAL;
    }

    if (this.isAttacking) {
      this.attackTimer--;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
      }
    }

    // Skill trigger
    if (keys[this.controls.skill] && this.skillPoints >= MAX_SKILL && this.buffs.silence === 0 && this.skillCooldown <= 0) {
      // Trigger question mode
      console.log("Skill triggered! Question mode: " + this.subjectKey);
    }

    // Physical update
    this.velocityY += GRAVITY;
    this.x += this.velocityX;
    this.y += this.velocityY;

    // Ground collision
    if (this.y + this.height >= GROUND_Y) {
      this.y = GROUND_Y - this.height;
      this.velocityY = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    // Boundary detection
    if (this.x < 10) this.x = 10;
    if (this.x + this.width > CANVAS_WIDTH - 10) this.x = CANVAS_WIDTH - this.width - 10;
  }

  /**
   * Get attack hitbox (for collision detection)
   * @returns {object|null} Hitbox object or null
   */
  getHitbox() {
    if (!this.isAttacking) return null;

    return {
      x: this.facingRight ? this.x + this.width : this.x - this.attackHitbox.width,
      y: this.y + this.height * 0.35,
      w: this.attackHitbox.width,
      h: this.attackHitbox.height,
    };
  }
}
