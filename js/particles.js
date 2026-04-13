/**
 * 粒子特效系统
 * 用于打击火花、技能特效等
 */

// 粒子数组
let particles = [];
// 浮动文字数组
let floatingTexts = [];

/**
 * 创建粒子
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @param {string} color - 颜色
 * @param {number} count - 粒子数量
 */
function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * PARTICLE_SPEED_NORMAL * 2,
      vy: (Math.random() - 0.5) * PARTICLE_SPEED_NORMAL * 2 - 2,
      life: 30 + Math.random() * 20,
      maxLife: 50,
      color: color,
      size: 2 + Math.random() * 3,
    });
  }
}

/**
 * 创建重型粒子（技能特效）
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @param {string} color - 颜色
 * @param {number} count - 粒子数量
 */
function spawnHeavyParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * PARTICLE_SPEED_HEAVY * 2,
      vy: (Math.random() - 0.5) * PARTICLE_SPEED_HEAVY * 2 - 5,
      life: 60 + Math.random() * 40,
      maxLife: 100,
      color: color,
      size: 4 + Math.random() * 6,
    });
  }
}

/**
 * 创建浮动文字（带物理效果）
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @param {string} text - 文字内容
 * @param {string} color - 颜色
 * @param {boolean} isCrit - 是否暴击（影响大小和速度）
 */
function spawnFloatingText(x, y, text, color, isCrit = false) {
  floatingTexts.push({
    x: x,
    y: y,
    text: text,
    color: color,
    vx: (Math.random() - 0.5) * 2,
    vy: isCrit ? -8 : -6,
    life: 60,
    maxLife: 60,
    size: isCrit ? 32 : 24,
    isCrit: isCrit,
  });
}

/**
 * 更新所有粒子
 */
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.3; // 重力
    p.life--;

    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

/**
 * 更新所有浮动文字
 */
function updateFloatingTexts() {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    let t = floatingTexts[i];
    t.x += t.vx;
    t.y += t.vy;
    t.vy += 0.2; // 重力
    t.life--;

    if (t.life <= 0) {
      floatingTexts.splice(i, 1);
    }
  }
}

/**
 * 绘制所有粒子
 * @param {CanvasRenderingContext2D} ctx
 */
function drawParticles(ctx) {
  for (let p of particles) {
    let alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;
}

/**
 * 绘制所有浮动文字
 * @param {CanvasRenderingContext2D} ctx
 */
function drawFloatingTexts(ctx) {
  for (let t of floatingTexts) {
    let alpha = t.life / t.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = t.color;
    ctx.font = `bold ${t.size}px Arial`;
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // 暴击时添加缩放效果
    if (t.isCrit) {
      let scale = 1 + (1 - alpha) * 0.3;
      ctx.translate(t.x, t.y);
      ctx.scale(scale, scale);
      ctx.fillText(t.text, 0, 0);
    } else {
      ctx.fillText(t.text, t.x, t.y);
    }

    ctx.restore();
  }
}

/**
 * 清除所有粒子
 */
function clearParticles() {
  particles = [];
  floatingTexts = [];
}