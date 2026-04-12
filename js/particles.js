/**
 * 粒子特效系统
 * 用于打击火花、技能特效等
 */

// 粒子数组
let particles = [];

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
 * 清除所有粒子
 */
function clearParticles() {
  particles = [];
}