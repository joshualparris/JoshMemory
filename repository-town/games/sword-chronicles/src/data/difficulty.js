export const DIFFICULTIES = [
  {
    id: "easy",
    name: "Easy",
    description: "Weaker foes, extra gear, cheaper rest, easier escapes, gentler defeat.",
    enemyHpMult: 0.72,
    enemyAcDelta: -1,
    enemyAttackDelta: -2,
    enemyDamageMult: 0.82,
    startingGoldBonus: 22,
    extraPotions: 2,
    playerHpBonus: 6,
    restCost: 4,
    fleeDc: 11,
    defeatGoldMax: 8,
    defeatHpFraction: 0.55
  },
  {
    id: "medium",
    name: "Medium",
    description: "Default balance — the intended experience.",
    enemyHpMult: 1,
    enemyAcDelta: 0,
    enemyAttackDelta: 0,
    enemyDamageMult: 1,
    startingGoldBonus: 0,
    extraPotions: 0,
    playerHpBonus: 0,
    restCost: 8,
    fleeDc: 13,
    defeatGoldMax: 15,
    defeatHpFraction: 0.5
  },
  {
    id: "hard",
    name: "Hard",
    description: "Tougher enemies, tighter purse, costly rest, harder escapes, harsher defeat.",
    enemyHpMult: 1.28,
    enemyAcDelta: 1,
    enemyAttackDelta: 2,
    enemyDamageMult: 1.14,
    startingGoldBonus: -12,
    extraPotions: -1,
    playerHpBonus: 0,
    restCost: 12,
    fleeDc: 15,
    defeatGoldMax: 22,
    defeatHpFraction: 0.45
  }
];

const byId = DIFFICULTIES.reduce((acc, d) => {
  acc[d.id] = d;
  return acc;
}, {});

export function getDifficulty(id) {
  return byId[id] || byId.medium;
}

/** Returns scaled combat stats; keeps id, name, damage string, xp, gold, loot. */
export function scaleEnemyForDifficulty(template, difficultyId) {
  const d = getDifficulty(difficultyId);
  const hp = Math.max(1, Math.round(template.hp * d.enemyHpMult));
  return {
    hp,
    maxHp: hp,
    ac: Math.max(8, template.ac + d.enemyAcDelta),
    attackBonus: template.attackBonus + d.enemyAttackDelta,
    enemyDamageMult: d.enemyDamageMult
  };
}
