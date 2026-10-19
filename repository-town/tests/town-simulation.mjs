import assert from "node:assert/strict";
import { createTownSimulation, clockText, residentSchedule, SITES } from "../src/simulation/town-system.js";

assert.equal(clockText(480), "08:00");
assert.equal(clockText(1440), "00:00");
assert.equal(residentSchedule(2, "farmer"), "asleep at home");
assert.match(residentSchedule(10, "farmer"), /working as farmer/);
assert.equal(SITES.length, 20);

const town = createTownSimulation();
let s = town.snapshot();
assert.equal(s.population, 32);
assert.equal(s.wallet, 75);
assert.equal(s.time, "08:00");
assert.equal(town.advance(-5), 0);
assert.equal(town.advance(60), 60);
s = town.snapshot();
assert.equal(s.time, "09:00");
assert.equal(s.supply.electricityDemand, 40);
assert.ok(s.supply.electricity >= 40, "Initial grid should power town");
assert.equal(s.supply.water, s.supply.waterDemand);
const initialBread = s.stores.market.bread;
assert.equal(town.buy("bread").ok, true);
assert.equal(town.snapshot().stores.market.bread, initialBread - 1);
assert.equal(town.snapshot().wallet, 70);
assert.equal(town.snapshot().stores.playerInventory.bread, 1, "Purchases must remain in the player's bag");
assert.equal(town.sell("bread").ok, true);
assert.equal(town.snapshot().stores.playerInventory.bread, 0);
assert.equal(town.snapshot().wallet, 73, "Market buy-back returns actual funds");
assert.equal(town.sell("bread").ok, false, "Cannot resell an item that is no longer owned");
assert.equal(town.buy("unobtainium").ok, false);
assert.equal(town.deposit(20).ok, true);
assert.equal(town.snapshot().bankBalance, 170);
assert.equal(town.withdraw(15).ok, true);
assert.equal(town.snapshot().wallet, 68);
assert.equal(town.postLetter("Rowan").ok, true);
assert.equal(town.vote("Kit").ok, true);
assert.equal(town.vote("Rowan").ok, false, "One ballot per town day");

assert.equal(town.reportFault("water").ok, true);
const damaged = town.snapshot().services.water;
assert.ok(damaged < 35, "Reported burst should disable normal water purification");
assert.equal(town.repair("water").ok, true);
assert.ok(town.snapshot().services.water >= damaged + 34);
assert.ok(town.snapshot().treasury < s.treasury + 100);
assert.equal(town.repair("unknown").ok, false);

town.advance(60 * 24);
s = town.snapshot();
assert.equal(s.day, 2, "Day advances at midnight");
assert.ok(s.stats.harvest > 0, "Farm harvest must be recorded");
assert.ok(s.stats.breadBaked > 0, "Mill/bakery must use available inputs");
assert.ok(s.stats.deliveries > 0, "Delivery trucks must move actual stock");
assert.ok(s.stats.meals > 0, "Residents must consume actual groceries");
assert.ok(s.stats.letters > 0, "Posted letter delivered next day");
assert.ok(s.stats.recycled >= 0);

const saved = JSON.parse(town.serialize());
const restored = createTownSimulation({ restored: saved });
assert.deepEqual(restored.snapshot(), town.snapshot(), "Save/load should preserve public town state");
const twinA = createTownSimulation();
const twinB = createTownSimulation();
twinA.advance(1200); twinB.advance(1200);
assert.deepEqual(twinA.snapshot(), twinB.snapshot(), "Sim must be deterministic");
for (const items of Object.values(town.snapshot().stores)) {
  for (const count of Object.values(items)) {
    assert.ok(Number.isFinite(count) && count >= 0, "Inventory must never go negative");
  }
}
assert.throws(() => createTownSimulation({ restored: { version: 99 } }), /Unsupported town save/);
console.log("Living Town: clock, economy, utility failure, repairs, voting, post, supply chain, persistence and stock checks passed.");
