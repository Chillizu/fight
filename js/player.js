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
    this.subject = typeof getSubject === "function" ? getSubject(subjectKey) : null;

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

    // === State flags ===
    this.isBlocking = false;

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

    // Poison logic: deal damage over time
    if (this.buffs.poison > 0 && this.buffs.poison % POISON_INTERVAL === 0) {
      if (typeof applyDamage === "function") {
        applyDamage(this, POISON_DAMAGE);
        if (typeof spawnParticles === "function") {
          spawnParticles(this.x + this.width / 2, this.y + this.height / 2, "#4caf50", 5);
        }
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
    this.isBlocking = false;

    // Movement restrictions
    let canMove =
      !(this.isGrounded && this.isAttacking) && this.buffs.root === 0;

    // Blocking (Down key)
    if (this.isGrounded && keys[this.controls.down] && !this.isAttacking) {
      this.isBlocking = true;
      canMove = false;
    }

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
      // berserk adds to cooldown, making it slower (30 + 12 = 42 for normal 60fps)
      this.attackCooldown = this.buffs.berserk > 0 ? ATTACK_COOLDOWN_BERSERK : ATTACK_COOLDOWN_NORMAL;
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
      // Fallback: draw stylish placeholder
      this._drawPlaceholder(ctx);
    }
  }

  /**
   * Draw stylish placeholder
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  _drawPlaceholder(ctx) {
    ctx.save();

    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;

    // Glitch effect based on time
    const time = Date.now() / 150;
    const glitchX = Math.sin(time * 2) * 3;
    const glitchW = w + Math.cos(time * 3) * 6;

    // Glowing rect
    ctx.strokeStyle = this.isP1 ? "#00f2fe" : "#ff4e50";
    ctx.lineWidth = 3;

    // Shield-like pulsing during block
    if (this.isBlocking) {
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.4 + Math.sin(time * 5) * 0.2;
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fillRect(x - 5, y - 5, w + 10, h + 10);
      ctx.globalAlpha = 1.0;
    } else {
      ctx.setLineDash([8, 4]);
      ctx.lineDashOffset = -time * 10;
    }

    ctx.strokeRect(x + glitchX, y, glitchW, h);

    // [NULL] Text
    ctx.fillStyle = ctx.strokeStyle;
    ctx.font = "900 22px 'Fira Sans'";
    ctx.textAlign = "center";
    ctx.shadowBlur = 15;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.fillText("[[NULL]]", x + w / 2, y + h / 2 + 8);

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
    // Use canonical scaling for stability across states if available
    const cw = this.spriteMeta?.canonicalW || frame.sw;
    const ch = this.spriteMeta?.canonicalH || frame.sh;
    const scale = Math.min(this.width / cw, this.height / ch);

    const drawWidth = frame.sw * scale;
    const drawHeight = frame.sh * scale;

    const drawX = this.x + (this.width - drawWidth) / 2;
    const drawY = this.y + (this.height - drawHeight); // ground-align

    ctx.imageSmoothingEnabled = false; // PIXEL ART VIBE

    // Visual feedback for blocking
    if (this.isBlocking) {
      ctx.globalAlpha = 0.7;
      // Add a subtle glow/shield effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.isP1 ? "#00f2fe" : "#ff4e50";
    }

    ctx.drawImage(
      this.spriteImg,
      frame.sx, frame.sy, frame.sw, frame.sh,
      drawX, drawY, drawWidth, drawHeight
    );

    ctx.restore();

    // Update frame counter (faster animation = snappier feel)
    this.frameIndex += 0.3;
  }
}
