export const RECIPES = [
  {
    id: "warded_key_recipe",
    name: "Warded Key",
    resultItemId: "warded_key",
    resultQty: 1,
    requires: [
      { itemId: "sigil_tide", qty: 1 },
      { itemId: "sigil_shadow", qty: 1 },
      { itemId: "sigil_flame", qty: 1 },
      { itemId: "iron_ore", qty: 1 },
      { itemId: "moonleaf", qty: 1 },
      { itemId: "ember_shard", qty: 1 }
    ],
    description: "A keyed ward that can break Vexira's barrier."
  },
  {
    id: "greater_healing_potion_recipe",
    name: "Greater Healing Potion",
    resultItemId: "greater_healing_potion",
    resultQty: 1,
    requires: [
      { itemId: "healing_potion", qty: 2 },
      { itemId: "moonleaf", qty: 2 }
    ],
    description: "Concentrated healing elixir restoring 4d4+4 HP."
  },
  {
    id: "shadowsteel_dagger_recipe",
    name: "Shadowsteel Dagger",
    resultItemId: "shadowsteel_dagger",
    resultQty: 1,
    requires: [
      { itemId: "steel_dagger", qty: 1 },
      { itemId: "ember_shard", qty: 2 },
      { itemId: "iron_ore", qty: 2 }
    ],
    description: "Formidable forged blade imbued with shadow magic (+4 bonus damage)."
  }
];

