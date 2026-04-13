const fs = require('fs');

let player = fs.readFileSync('js/player.js', 'utf8');

player = player.replace(
  /if \(keys\[this.controls.attack\] && this.attackCooldown === 0 && !this.isAttacking && this.buffs.root === 0\) \{\s*this.isAttacking = true;\s*this.attackTimer = this.attackDuration;\s*this.attackCooldown = ATTACK_COOLDOWN_NORMAL;\s*\}/g,
  `if (keys[this.controls.attack] && this.attackCooldown === 0 && !this.isAttacking && this.buffs.root === 0) {
      this.isAttacking = true;
      this.attackTimer = this.attackDuration;
      // berserk adds to cooldown, making it slower (30 + 12 = 42 for normal 60fps)
      this.attackCooldown = this.buffs.berserk > 0 ? ATTACK_COOLDOWN_BERSERK : ATTACK_COOLDOWN_NORMAL;
    }`
);

fs.writeFileSync('js/player.js', player);
console.log("Done");
