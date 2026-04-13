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
    this.spriteMeta = null;
    this.frameIndex = 0;

    this.spriteImg.onload = () => {
      // Pre-process sprite sheet: remove background if detected
      if (typeof analyzeSpriteSheet === "function") {
        const meta = analyzeSpriteSheet(this.spriteImg, {
          cols: SPRITE_GRID_COLS,
          rows: SPRITE_GRID_ROWS,
        });

        if (meta && meta.bgColor) {
          // Create temp canvas to process transparency
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = this.spriteImg.naturalWidth;
          tempCanvas.height = this.spriteImg.naturalHeight;
          const tempCtx = tempCanvas.getContext("2d");
          tempCtx.drawImage(this.spriteImg, 0, 0);

          removeBackgroundTransparent(tempCanvas, meta.bgColor, 50); // Higher threshold for arcade transparency

          // Use the processed canvas as the sprite image
          this.spriteImg = new Image();
          this.spriteImg.src = tempCanvas.toDataURL();
          this.spriteImg.onload = () => {
            this.hasCustomSprite = true;
            this.spriteMeta = analyzeSpriteSheet(this.spriteImg, {
              cols: SPRITE_GRID_COLS,
              rows: SPRITE_GRID_ROWS,
            });
          };
        } else {
          this.hasCustomSprite = true;
          this.spriteMeta = meta;
        }
      }
    };

    this.spriteImg.onerror = () => {
      this.hasCustomSprite = false;
      this.spriteMeta = null;
    };

    // Set default sprite sheet source (optional)
    const defaultSpriteSrc = isP1 ? DEFAULT_SPRITE_P1_SRC : DEFAULT_SPRITE_P2_SRC;
    if (defaultSpriteSrc) {
      this.spriteImg.src = defaultSpriteSrc;
    }

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
      this.skillCooldown = SKILL_COOLDOWN_FRAMES;
      this.skillPoints = 0;
      if (typeof updateSkillUI === "function") updateSkillUI(this);

      if (typeof triggerQuestionMode === "function") {
        triggerQuestionMode(this);
      } else {
        console.log("Skill triggered! Question mode: " + this.subjectKey);
      }
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

  /**
   * Draw player
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    // Try to use sprite if available
    if (this.hasCustomSprite && this.spriteMeta && this.spriteImg.complete && this.spriteImg.naturalHeight > 0) {
      this._drawSpriteSheetDynamic(ctx);
    } else {
      // Fallback: draw simple stickman
      this._drawStickman(ctx);
    }
  }

  /**
   * Draw stickman fallback
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  _drawStickman(ctx) {
    ctx.save();

    // Flip if facing left
    if (!this.facingRight) {
      ctx.translate(this.x + this.width, 0);
      ctx.scale(-1, 1);
      ctx.translate(-this.x, 0);
    }

    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;

    // Subtle shadow
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, GROUND_Y + 6, w * 0.45, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Torso
    ctx.fillStyle = this.color;
    const torsoW = w * 0.45;
    const torsoH = h * 0.52;
    const torsoX = x + (w - torsoW) / 2;
    const torsoY = y + h * 0.28;
    ctx.fillRect(torsoX, torsoY, torsoW, torsoH);

    // Head
    ctx.fillStyle = "#f2c9a0";
    const headR = Math.min(w, h) * 0.16;
    const headCX = x + w / 2;
    const headCY = y + h * 0.18;
    ctx.beginPath();
    ctx.arc(headCX, headCY, headR, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#111";
    const eyeOffsetX = headR * 0.45;
    const eyeY = headCY - headR * 0.15;
    const eyeR = Math.max(1, headR * 0.12);
    ctx.beginPath();
    ctx.arc(headCX - eyeOffsetX, eyeY, eyeR, 0, Math.PI * 2);
    ctx.arc(headCX + eyeOffsetX, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();

    // Arms
    ctx.strokeStyle = this.color;
    ctx.lineWidth = Math.max(3, w * 0.08);
    ctx.lineCap = "round";

    const shoulderY = torsoY + torsoH * 0.2;
    const shoulderLeftX = torsoX + torsoW * 0.1;
    const shoulderRightX = torsoX + torsoW * 0.9;

    const armSwing = Math.sin(Date.now() / 120) * (this.isGrounded ? 10 : 4);

    // Left arm
    ctx.beginPath();
    ctx.moveTo(shoulderLeftX, shoulderY);
    ctx.lineTo(x + w * 0.18, y + h * 0.62 + armSwing);
    ctx.stroke();

    // Right arm (punch extends)
    let punchExt = 0;
    if (this.isAttacking) punchExt = w * 0.22;

    ctx.beginPath();
    ctx.moveTo(shoulderRightX, shoulderY);
    ctx.lineTo(x + w * 0.82 + punchExt, y + h * 0.62 - armSwing);
    ctx.stroke();

    // Fist
    if (this.isAttacking) {
      ctx.fillStyle = "#f2c9a0";
      ctx.beginPath();
      ctx.arc(x + w * 0.84 + punchExt, y + h * 0.62 - armSwing, headR * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // Legs
    ctx.strokeStyle = "#2c3e50";
    const hipY = torsoY + torsoH;
    const hipLeftX = torsoX + torsoW * 0.3;
    const hipRightX = torsoX + torsoW * 0.7;

    const run = Math.abs(this.velocityX) > 0.1 ? 1 : 0;
    const legSwing = Math.sin(Date.now() / 90) * (run ? 14 : 4);

    ctx.beginPath();
    ctx.moveTo(hipLeftX, hipY);
    ctx.lineTo(x + w * 0.38, y + h * 0.98 + legSwing);
    ctx.moveTo(hipRightX, hipY);
    ctx.lineTo(x + w * 0.62, y + h * 0.98 - legSwing);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw using sprite sheet
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  _drawSpriteSheetDynamic(ctx) {
    const frame = getSpriteFrame(this.spriteMeta, {
      isAttacking: this.isAttacking,
      velocityX: this.velocityX,
      frameIndex: this.frameIndex,
    });

    if (!frame) {
      this._drawStickman(ctx);
      return;
    }

    ctx.save();

    // Flip if facing left
    if (!this.facingRight) {
      ctx.translate(this.x + this.width, 0);
      ctx.scale(-1, 1);
      ctx.translate(-this.x, 0);
    }

    // DRAWING STRATEGY:
    // We treat the 'frame' as the source.
    // To fix segmentation, we should NOT scale the character up/down too aggressively if it was tightly cropped.
    // Instead, we center it and preserve a reasonable aspect ratio.

    // Fit the cropped source rect into the player's box.
    // Using a consistent "fit" scale + bottom alignment reduces jitter when crops vary.
    const scale = Math.min(this.width / frame.sw, this.height / frame.sh);
    const drawWidth = frame.sw * scale;
    const drawHeight = frame.sh * scale;

    const drawX = this.x + (this.width - drawWidth) / 2;
    const drawY = this.y + (this.height - drawHeight); // ground-align

    ctx.imageSmoothingEnabled = false; // PIXEL ART VIBE

    ctx.drawImage(
      this.spriteImg,
      frame.sx, frame.sy, frame.sw, frame.sh,
      drawX, drawY, drawWidth, drawHeight
    );

    ctx.restore();

    // Update frame counter
    this.frameIndex += 0.2;
  }
}
