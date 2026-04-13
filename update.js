const fs = require('fs');

// 1. Update config.js
let config = fs.readFileSync('js/config.js', 'utf8');

config = config.replace(/const MAX_HP = \d+;/, 'const MAX_HP = 1000;');
config = config.replace(/const MAX_SKILL = \d+;/, 'const MAX_SKILL = 13;');
config = config.replace(/const ATTACK_COOLDOWN_NORMAL = \d+;/, 'const ATTACK_COOLDOWN_NORMAL = 30;');
// math berserk cooldown: 30 + 12 = 42
config = config.replace(/const ATTACK_COOLDOWN_BERSERK = \d+;/, 'const ATTACK_COOLDOWN_BERSERK = 42;');
config = config.replace(/const POISON_DAMAGE = \d+;/, 'const POISON_DAMAGE = 22;');

// Update BUFF_DURATION
config = config.replace(/const BUFF_DURATION = {[\s\S]*?};/, `const BUFF_DURATION = {
  giant: 15 * 60,
  poison: 10 * 60,
  root: 5 * 60,
  reverse: 15 * 60,
  berserk: 7 * 60,
  invincible: 5 * 60,
  silence: 15 * 60,
};`);

fs.writeFileSync('js/config.js', config);


// 2. Update subjects.js
let subjects = fs.readFileSync('js/subjects.js', 'utf8');

// Update math (attack +8 handled in player.js if needed, or ui_extend.js)
subjects = subjects.replace(/effect: "heal",\s*damage: -300,/, 'effect: "heal",\n    damage: -200,');
subjects = subjects.replace(/name: "地理",[\s\S]*?damage: \d+,/, 'name: "地理",\n    color: SUBJECT_COLORS.geography,\n    emoji: "🌍",\n    description: "大量伤害",\n    effect: "meteor",\n    damage: 90, // Note: damage is doubled in applySkillEffect, so 90 * 2 = 180');

fs.writeFileSync('js/subjects.js', subjects);

// 3. Update ui_extend.js
let ui = fs.readFileSync('js/ui_extend.js', 'utf8');

// Add floating text
ui = ui.replace(/case "giant":\s*caster.setBuff\("giant", BUFF_DURATION.giant\);\s*break;/g, 
  `case "giant":\n      caster.setBuff("giant", BUFF_DURATION.giant);\n      if(typeof createFloatingText === "function") createFloatingText(caster.x + caster.width/2, caster.y - 40, "GIANT! (变大)", caster.subject.color);\n      break;`);

ui = ui.replace(/case "poison":\s*target.setBuff\("poison", BUFF_DURATION.poison\);\s*break;/g, 
  `case "poison":\n      target.setBuff("poison", BUFF_DURATION.poison);\n      if(typeof createFloatingText === "function") createFloatingText(target.x + target.width/2, target.y - 40, "POISONED! (每秒扣血)", caster.subject.color);\n      break;`);

ui = ui.replace(/case "root":\s*target.setBuff\("root", BUFF_DURATION.root\);\s*break;/g, 
  `case "root":\n      target.setBuff("root", BUFF_DURATION.root);\n      if(typeof createFloatingText === "function") createFloatingText(target.x + target.width/2, target.y - 40, "ROOTED! (禁锢)", caster.subject.color);\n      break;`);

ui = ui.replace(/case "reverse":\s*target.setBuff\("reverse", BUFF_DURATION.reverse\);\s*break;/g, 
  `case "reverse":\n      target.setBuff("reverse", BUFF_DURATION.reverse);\n      if(typeof createFloatingText === "function") createFloatingText(target.x + target.width/2, target.y - 40, "CONTROLS REVERSED! (反转)", caster.subject.color);\n      break;`);

ui = ui.replace(/case "berserk":\s*caster.setBuff\("berserk", BUFF_DURATION.berserk\);\s*break;/g, 
  `case "berserk":\n      caster.setBuff("berserk", BUFF_DURATION.berserk);\n      if(typeof createFloatingText === "function") createFloatingText(caster.x + caster.width/2, caster.y - 40, "BERSERK! (+8攻 减攻速)", caster.subject.color);\n      break;`);

ui = ui.replace(/case "invincible":\s*caster.setBuff\("invincible", BUFF_DURATION.invincible\);\s*break;/g, 
  `case "invincible":\n      caster.setBuff("invincible", BUFF_DURATION.invincible);\n      if(typeof createFloatingText === "function") createFloatingText(caster.x + caster.width/2, caster.y - 40, "INVINCIBLE! (无敌)", caster.subject.color);\n      break;`);

ui = ui.replace(/case "silence":\s*target.setBuff\("silence", BUFF_DURATION.silence\);\s*break;/g, 
  `case "silence":\n      target.setBuff("silence", BUFF_DURATION.silence);\n      if(typeof createFloatingText === "function") createFloatingText(target.x + target.width/2, target.y - 40, "SILENCED! (-5攻 无法放技能)", caster.subject.color);\n      break;`);

ui = ui.replace(/case "heal":\s*caster.hp = Math.min\(caster.hp \+ 300, MAX_HP\);\s*updateHealthUI\(\);\s*break;/g, 
  `case "heal":\n      caster.hp = Math.min(caster.hp + 200, MAX_HP);\n      updateHealthUI();\n      if(typeof createFloatingText === "function") createFloatingText(caster.x + caster.width/2, caster.y - 40, "+200 HP!", caster.subject.color);\n      break;`);

fs.writeFileSync('js/ui_extend.js', ui);
console.log("Done");
