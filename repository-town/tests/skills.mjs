// Skills rules (src/world/skills.js): the RuneScape XP curve, buying tools from the hardware store's
// till, chopping (levels, stumps, a 28-slot bag), lighting fires, selling logs, and saving it all.
//   node tests/skills.mjs
import assert from 'node:assert/strict';
import { TownLife } from '../src/world/life.js';
import { xpForLevel, levelForXp, level, addXp, skillsReport, TREES, swing, canChop, isStump, lightFire, liveFires,
  buyTool, sellLogs, bagUsed, BAG_SLOTS, takeRackTools, canCook, cookFood } from '../src/world/skills.js';
import { hasItem, equippedType } from '../src/world/inventory.js';

assert.deepEqual([xpForLevel(1), xpForLevel(2), xpForLevel(15), xpForLevel(30), xpForLevel(99)], [0, 83, 2411, 13363, 13034431]);
assert.equal(levelForXp(82), 1); assert.equal(levelForXp(83), 2); assert.equal(levelForXp(2e8), 99);

const homes = Array.from({ length: 188 }, (_, i) => ({ coordinate: String.fromCharCode(65 + i % 26) + (1 + Math.floor(i / 26)), name: 'Home ' + i, door: { x: (i % 26 - 12.5) * 26, z: Math.floor(i / 26) * 46 - 157 } }));
const t = new TownLife({ homes, minute: 10 * 60, seed: 3 }), me = t.civic.player, till = { cash: 0 };
const always = () => 0, never = () => 0.999;
const tree = { id: 'woodlot:tree-1', type: 'tree' }, oak = { id: 'woodlot:oak-1', type: 'oak' };

// No hatchet, no chopping; tools come from the till, with the money moving.
assert.match(canChop(t, me, tree), /hatchet/);
me.wallet = 40;
assert(buyTool(me, 'hatchet', till).ok); assert(buyTool(me, 'tinderbox', till).ok);
assert.equal(me.wallet, 9); assert.equal(till.cash, 31); assert(hasItem(me, 'hatchet') && hasItem(me, 'tinderbox'));
assert(!buyTool(me, 'hatchet', till).ok, 'one hatchet is enough');

// A miss gives nothing; a hit gives logs and XP, and a normal tree falls to a stump that grows back.
assert.equal(swing(t, me, tree, never).log, undefined);
const hit = swing(t, me, tree, always);
assert(hit.log === 'logs' && hit.felled && hit.stop); assert.equal(me.logs.logs, 1); assert.equal(me.skills.woodcutting.xp, 25);
assert(isStump(t, tree.id)); assert.match(canChop(t, me, tree), /stump/);
t.minute += TREES.tree.respawn + 1; assert(!isStump(t, tree.id), 'the tree grows back');

// Oaks need level 15; reaching it says so.
assert.match(canChop(t, me, oak), /level 15/);
const up = addXp(me, 'woodcutting', xpForLevel(15) - me.skills.woodcutting.xp);
assert(up.levelUp && up.level === 15 && /You can now chop oak/.test(up.message));
assert.equal(canChop(t, me, oak), null);

// A 28-slot bag: two tools plus 26 logs is full.
me.logs.logs = BAG_SLOTS - 2 - (me.logs.oak_logs || 0);
assert.equal(bagUsed(me), BAG_SLOTS); assert.match(canChop(t, me, oak), /bag is full/);

// Fires: a tinderbox and logs light a fire that burns out; oak logs need Firemaking 15.
const logs = me.logs.logs, fire = lightFire(t, me, 'logs', { x: 5, z: -210 }, always);
assert(fire.lit); assert.equal(me.logs.logs, logs - 1); assert.equal(me.skills.firemaking.xp, 40);
assert.equal(liveFires(t).length, 1);
t.minute += 31; assert.equal(liveFires(t).length, 0, 'the fire burns out');
me.logs.oak_logs = 1; assert.match(lightFire(t, me, 'oak_logs', { x: 0, z: 0 }, always).message, /level 15/);
assert(!lightFire(t, me, 'logs', { x: 0, z: 0 }, never).lit, 'sometimes the tinderbox fails');

// The yard buys logs out of its till, never with money it does not have.
const wallet = me.wallet, cash = till.cash, n = me.logs.logs, sold = sellLogs(me, 'logs', till);
assert(sold.ok); assert.equal(me.logs.logs, n - Math.min(n, Math.floor(cash / 4)));
assert.equal(Math.round((me.wallet + till.cash) * 100), Math.round((wallet + cash) * 100), 'money conserved');
const broke = { cash: 1 }; me.logs.logs = 3; assert(!sellLogs(me, 'logs', broke).ok);

// The Woodlot rack hands out free starter tools at any hour (even with every shop shut), once.
const night = new TownLife({ homes, minute: 23 * 60, seed: 5 }), nightMe = night.civic.player, cash0 = nightMe.wallet;
const rack = takeRackTools(nightMe);
assert(rack.ok, rack.message); assert(hasItem(nightMe, 'hatchet') && hasItem(nightMe, 'tinderbox'));
assert.equal(equippedType(nightMe), 'hatchet', 'the rack hatchet is in hand, ready to chop');
assert.equal(nightMe.wallet, cash0, 'rack tools cost nothing and create no money');
assert(!takeRackTools(nightMe).ok, 'one of each: the rack cannot be farmed');

// Everything saves and restores with the town.
const u = new TownLife({ homes, minute: 10 * 60, seed: 3 });
assert(u.restore(JSON.parse(JSON.stringify(t.snapshot()))));
assert.deepEqual(skillsReport(u.civic.player).map((s) => [s.id, s.level]), skillsReport(me).map((s) => [s.id, s.level]));
assert.equal(level(u.civic.player, 'woodcutting'), 15); assert(hasItem(u.civic.player, 'hatchet'));
assert.deepEqual(u.civic.player.logs, me.logs);

// ── Cooking (docs/RUNESCAPE_ROADMAP.md item 9): raw bag goods cook on a fire into
// meals that feed the hunger system; a burn wastes the ingredient. ──
const ct = new TownLife({ homes, minute: 10 * 60, seed: 7 }), cMe = ct.civic.player;
cMe.bag = { lamb: 2, veg: 1 };
assert.match(canCook(cMe, 'veg'), /Cooking level 8/, 'vegetables need Cooking 8');
assert.equal(canCook(cMe, 'lamb'), null, 'lamb can be cooked at level 1');
assert.match(canCook(cMe, 'pie'), /cannot be cooked/, 'only recipes can be cooked');
// A forced burn consumes the lamb and gives no XP.
const burnt = cookFood(cMe, 'lamb', () => 0);
assert(burnt.ok && burnt.burned); assert.equal(cMe.bag.lamb, 1); assert.equal(cMe.skills.cooking.xp, 0);
// A successful cook turns it into roast lamb and grants Cooking XP.
const cooked = cookFood(cMe, 'lamb', () => 0.999);
assert(cooked.ok && cooked.cooked === 'cooked_lamb'); assert.equal(cMe.bag.lamb, 0); assert.equal(cMe.bag.cooked_lamb, 1);
assert.equal(cMe.skills.cooking.xp, 30); assert.equal(level(cMe, 'cooking'), 1);
// Reaching Cooking 8 unlocks vegetables (the level-up note says so).
const upCook = addXp(cMe, 'cooking', xpForLevel(8) - cMe.skills.cooking.xp);
assert(upCook.level >= 8 && /You can now cook vegetables/.test(upCook.message));
assert.equal(canCook(cMe, 'veg'), null, 'vegetables are cookable at level 8');
// Eating the cooked meal feeds the hunger system (FOOD_ENERGY 85).
cMe.hunger = 90; const ate = ct.eatItem('cooked_lamb');
assert(/Hunger is now 5%/.test(ate), ate); assert.equal(cMe.bag.cooked_lamb, 0); assert.equal(Math.round(cMe.hunger), 5);
// Save a genuinely uneaten cooked meal; a zero count after eating cannot
// prove that the new good persists across restart.
const cookedVeg = cookFood(cMe, 'veg', () => .999);
assert(cookedVeg.ok && cookedVeg.cooked === 'cooked_veg');
assert.equal(cMe.bag.cooked_veg, 1);
// Cooking XP and the cooked-meal bag save and restore with the town.
const cu = new TownLife({ homes, minute: 10 * 60, seed: 7 });
assert(cu.restore(JSON.parse(JSON.stringify(ct.snapshot()))));
assert.equal(cu.civic.player.skills.cooking.xp, cMe.skills.cooking.xp);
assert.equal(cu.civic.player.bag.cooked_veg, 1, 'uneaten cooked food persists through save/restore');
console.log('PASS: XP curve, tools from the till or the free Woodlot rack, chopping with levels/stumps/regrowth and a 28-slot bag, fires, conserved log sales, cooking with burns/levels/XP and hunger, save and restore');
