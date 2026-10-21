// Public and household finance: PAYG, finite Commonwealth/NSW treasuries and grants, rent and
// power bills with arrears, business utilities, wage arrears, the bakery batch, save/restore and
// conservation of every dollar.
import assert from 'node:assert/strict';
import { TownLife } from '../src/world/life.js';
import { RATES } from '../src/world/finance.js';
import { superviseBread } from '../src/world/bakery-production.js';

const homes = [];
for (let r = 0; r < 7; r++) for (let c = 0; c < 26; c += 2) homes.push({ coordinate: String.fromCharCode(65 + c) + (r + 1), name: 'House', door: { x: (c - 12.5) * 26, z: r * 46 - 161 + 4 } });
const make = () => new TownLife({ homes, minute: 6 * 60, seed: 11 });
const run = (t, m) => { for (let i = 0; i < m; i += 0.5) t.tick(0.5); };
const toDay = (t, d, h = 10) => { while (t.day < d || (t.day === d && t.minute < h * 60)) t.tick(0.5); };
const makeTenant = (life) => {
  // Explicitly contract for housing before expecting rent and utility bills.
  const parcels=Object.values(life.civic.property.parcels);
  const home=parcels.find(p=>p.kind==='house'&&!p.tenant)||parcels.find(p=>p.kind==='house');
  home.tenant=null;home.occupied=false;home.owner='Town Property Cooperative';
  life.civic.player.wallet=500;life.civic.player.bank=0;
  assert.match(life.leaseProperty(home.id),/Lease signed/);
  return home;
};
const town = (t) => {
  const v = t.villagers.reduce((s, x) => s + x.wallet + (x.savings || 0), 0), p = t.civic.player;
  const tills = [...t.places.values()].reduce((s, x) => s + x.till, 0), f = t.civic.finance;
  return v + p.wallet + p.bank + tills + t.civic.treasury + f.federal + f.state + t.civic.credit.capital;
};

// 1. Opening balances and the economy report add up.
let t = make();
assert.equal(t.civic.finance.federal, RATES.federalStart);
assert.equal(t.civic.finance.state, RATES.stateStart);
assert.ok(Math.abs(t.economyReport().total - Math.round(town(t))) <= 1, 'report total matches the books');

// 2. Only an actual rented home incurs rent and power, with finite grants and wages.
makeTenant(t);
toDay(t, 1, 23);
assert.equal(t.civic.finance.lifetime.rent, 0, 'no rent on the first day');
const start = town(t), fed0 = t.civic.finance.federal, st0 = t.civic.finance.state, wallet0 = t.civic.player.wallet + t.civic.player.bank;
toDay(t, 3, 6);
const f = t.civic.finance;
assert.ok(f.lifetime.rent >= 8 && f.lifetime.utilities >= 2, 'visitor rent and power were charged');
assert.ok(t.civic.player.wallet + t.civic.player.bank <= wallet0 - 18, 'two days of bills left the visitor poorer');
assert.ok(f.lifetime.tax > 0 && f.lifetime.grants > 0, 'PAYG collected and grants paid');
assert.ok(f.state < st0, 'NSW treasury paid out');
assert.ok(f.entries.every((e) => e.amount > 0 && e.debit !== e.credit), 'journal entries are positive and two-sided');
const d2 = f.lifetime;
assert.ok(d2.rates > 0, 'business rates were recorded');

// 3. Grants and wages come from real balances: an empty treasury pays nothing.
t = make(); toDay(t, 1, 23);
t.civic.finance.federal = 0; t.civic.finance.state = 0;
const council0 = t.civic.treasury; toDay(t, 2, 6);
assert.equal(t.civic.finance.lifetime.grants, 0, 'no grant from an empty treasury');
assert.ok(t.civic.finance.federal >= 0 && t.civic.finance.state >= 0, 'treasuries never go negative');

// 4. Visitor bills never overdraft; arrears block borrowing until paid.
t = make(); makeTenant(t); toDay(t, 1, 23);
t.civic.player.wallet = 0; t.civic.player.bank = 0;
toDay(t, 3, 10);
assert.equal(t.civic.player.wallet, 0); assert.equal(t.civic.player.bank, 0);
assert.ok(t.civic.finance.rentArrears > 0, 'unpaid rent becomes arrears');
t.civic.credit.earned = 100;
assert.match(t.borrow(100), /overdue rent and power/, 'arrears block credit');
assert.match(t.payBills(), /nothing to pay/);
t.civic.player.wallet = 500;
assert.match(t.payBills(), /Paid \$/);
assert.equal(t.civic.finance.rentArrears + t.civic.finance.powerArrears, 0, 'bills cleared');
assert.match(t.borrow(100), /paid into your savings/, 'credit opens once bills are paid');

// 5. Wage arrears: a worker whose employer and council cannot pay is owed, and is paid back later.
t = make(); toDay(t, 1, 23);
const w = t.villagers.find((v) => v.work === 'clinic' || v.work === 'school');
t.civic.treasury = 0; t.civic.finance.state = 0;
const owedBefore = w.wageArrears || 0;
t.pay(w);
assert.ok((w.wageArrears || 0) > owedBefore, 'unpaid wage becomes arrears');
t.civic.finance.state = 5000;
const walletMid = w.wallet; t.pay(w);
assert.ok(w.wallet > walletMid, 'arrears are paid when funds return');

// 6. Business utilities: a shop with an empty till owes them, and pays later.
t = make(); toDay(t, 1, 23);
const shop = t.place('bakery'); shop.till = 0;
toDay(t, 2, 7);
assert.ok((t.civic.finance.biz.bakery?.unpaid || 0) >= RATES.businessUtilities, 'an empty till leaves the utilities owing');
shop.till = 200; toDay(t, 3, 7);
assert.equal(t.civic.finance.biz.bakery.unpaid, 0, 'back-bills are paid once the till has money');

// 7. Exact conservation over weeks is checked by tests/simulation-soak.mjs, which counts the treasuries and the lending pool.

// 8. Save and restore keep treasuries, arrears and the journal.
t = make(); toDay(t, 4, 10); t.villagers[0].wageArrears = 12; t.villagers[0].rateArrears = 7;
const snap = JSON.parse(JSON.stringify(t.snapshot()));
const u = make(); u.restore(snap);
assert.equal(u.civic.finance.federal, t.civic.finance.federal);
assert.equal(u.civic.finance.entries.length, t.civic.finance.entries.length);
assert.equal(u.villagers[0].wageArrears, 12); assert.equal(u.villagers[0].rateArrears, 7);
const old = JSON.parse(JSON.stringify(snap)); delete old.civic.finance;
const w2 = make(); w2.restore(old);
assert.equal(w2.economyReport().commonwealth, RATES.federalStart, 'older saves get fresh treasuries');

// 9. The bakery batch uses real flour and adds real loaves, one per day.
t = make(); toDay(t, 2, 6); run(t, 30);
const bk = t.place('bakery'); bk.stock.flour = 10; bk.out.bread = 0;
for (const v of t.villagers) if (v.work === 'bakery') { v.step = { kind: 'work' }; v.path = []; }
t.playerAt='bakery';assert.ok(superviseBread(t,'wash').ok);assert.ok(superviseBread(t,'weigh',2000).ok);assert.ok(superviseBread(t, 'mix').ok, 'mix starts');for(let i=0;i<8;i++)assert.ok(superviseBread(t,'shape').ok);assert.ok(superviseBread(t,'proof').ok);
assert.equal(bk.stock.flour, 8, 'two bags of flour used');
assert.match(superviseBread(t, 'oven').message, /Proofing is still underway/);
run(t, 41);
assert.ok(superviseBread(t, 'oven').ok, 'oven after proofing');
assert.match(superviseBread(t, 'unload').message, /baking/);
run(t, 26);
const before = bk.out.bread; assert.ok(superviseBread(t, 'unload').ok, 'unload');t.minute+=6;assert.ok(superviseBread(t,'pack').ok);
assert.equal(bk.out.bread, before + 8, 'eight loaves added to the rack');
assert.match(superviseBread(t, 'mix').message, /finished/, 'one batch a day');

console.log('PASS: finance — PAYG, finite treasuries, grants, rent/power arrears, loans gated on bills, wage arrears, utilities, save/restore, bakery batch');
