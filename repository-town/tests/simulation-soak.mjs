// Soak playtest of the town simulation (src/world/life.js + government.js + power-grid.js):
// runs four weeks and checks shops, money, politics, electricity, water, waste and trucks
// day by day, plus the visitor's own actions. Prints a daily table and a findings list.
//   node tests/simulation-soak.mjs [--days 28] [--seed n] [--quiet]
import { TownLife, CANDIDATES } from '../src/world/life.js';
import { syncOffices } from '../src/world/government.js';

const args = process.argv.slice(2);
const DAYS = Number(args[args.indexOf('--days') + 1]) || 28;
const QUIET = args.includes('--quiet');
const SEED = Number(args[args.indexOf('--seed') + 1]) || 20261019;
const homes = [];
for (let r = 0; r < 7; r++) for (let c = 0; c < 26; c += 2) homes.push({ coordinate: String.fromCharCode(65 + c) + (r + 1), name: 'House', door: { x: (c - 12.5) * 26, z: r * 46 - 161 + 4 } });
const findings = [], passes = [];
const check = (ok, what, detail = '') => (ok ? passes : findings).push(what + (detail ? ` — ${detail}` : ''));
const run = (t, minutes) => { for (let m = 0; m < minutes; m += 0.5) t.tick(0.5); };
const until = (t, h) => run(t, ((h * 60 - t.minute) + 1440) % 1440 || 1440);
const r0 = (n) => Math.round(n);

// All money in town: households, the visitor, every till and the treasury.
const money = (t) => {
  const v = t.villagers.reduce((s, x) => s + x.wallet + (x.savings || 0), 0);
  const p = t.civic.player.wallet + t.civic.player.bank;
  const tills = [...t.places.values()].reduce((s, x) => s + x.till, 0);
  const bank = t.civic.credit?.capital || 0; // the credit union's lending pool
  const gov = (t.civic.finance?.federal || 0) + (t.civic.finance?.state || 0); // Commonwealth and NSW treasuries
  // A title transfer or rental payment moves cash among landlords, buyers,
  // property lenders and the agent; vehicle trades and workshop wages do too.
  // Count those finite accounts rather than treating their deposits as lost money.
  const land=t.civic.property;
  const propertyFunds=land ? Object.values(land.accounts).reduce((sum,n)=>sum+(Number(n)||0),0)
    +(land.reserve||0)+(land.bond||0) : 0;
  const motor=t.civic.motor;
  const vehicleFunds=motor ? (motor.dealerCash||0)+(motor.garageCash||0)+(motor.staffWages||0) : 0;
  return { villagers:v,player:p,tills,treasury:t.civic.treasury,bank,gov,propertyFunds,vehicleFunds,
    total:v+p+tills+t.civic.treasury+bank+gov+propertyFunds+vehicleFunds };
};
const negatives = (t) => {
  const bad = [];
  for (const x of t.villagers) if (!(x.wallet >= -1e-9) || !Number.isFinite(x.wallet)) bad.push(`${x.name} wallet ${x.wallet}`);
  for (const p of t.places.values()) {
    if (!(p.till >= -1e-9)) bad.push(`${p.id} till ${p.till}`);
    for (const [k, n] of [...Object.entries(p.stock), ...Object.entries(p.out)]) if (!(n >= 0) || !Number.isFinite(n)) bad.push(`${p.id}.${k}=${n}`);
  }
  if (!(t.civic.treasury >= -1e-9)) bad.push(`treasury ${t.civic.treasury}`);
  for (const [k, v] of Object.entries(t.civic.services)) if (!(v >= 0 && v <= 100)) bad.push(`service ${k}=${v}`);
  return bad;
};

// External money flows, so the books can be reconciled: the daily grant, outside income for
// programmers, the 7:00 import bill, foundry exports and authorised repair bills (contractors
// and parts from outside town). Everything else only moves money.
const flows = { grant: 0, outside: 0, imports: 0, exports: 0 };
function instrument(t) {
  const pay = t.pay.bind(t), hour = t.everyHour.bind(t), day = t.newDay.bind(t), log = t.log.bind(t);
  t.pay = (v) => { if (v.job === 'programmer') { const w = v.wallet, tr = t.civic.treasury, fd = t.civic.finance.federal; pay(v); flows.outside += (v.wallet - w) + (t.civic.finance.federal - fd) + Math.max(0, t.civic.treasury - tr); } else pay(v); };
  t.everyHour = () => {
    const d = t.place('depot').out, f = d.fuel || 0, o = d.ore || 0;
    hour();
    if (Math.floor(t.minute / 60) === 7) flows.imports += ((d.fuel || 0) - f) * 1 + ((d.ore || 0) - o) * 2;
  };
  t.newDay = () => { day(); };
  t.log = (text) => { const m = /exported \d+ tonnes of metal by rail for \$(\d+)/.exec(text); if (m) flows.exports += +m[1]; log(text); };
}

const t = new TownLife({ homes, minute: 6 * 60, seed: SEED });
instrument(t);
const start = money(t);
const daily = [];
let powerShortHours = 0, waterShortHours = 0, worstUnserved = 0;
const outOf = {};
const origBuy = t.buy.bind(t);
t.buy = (v, shopId, items) => { const before = v.memory; origBuy(v, shopId, items); if (v.memory !== before && /out of/.test(v.memory || '')) outOf[shopId] = (outOf[shopId] || 0) + 1; };

// ── Day 1–2: the visitor uses every shop counter. ──
// The same goods the shop counters offer (src/ui/townpanels.js placePanel).
const SELLS = { cafe: ['pie', 'bread'], pub: ['pie'] };
const shops = [...t.places.values()].filter((p) => p.sells?.length || SELLS[p.id]);
until(t, 11.5);
let bought = 0, refused = [];
for (const p of shops) for (const g of p.sells || SELLS[p.id]) {
  if (t.civic.player.wallet < 20) t.bank('withdraw', 40);
  const msg = t.buyItem(p.id, g);
  if (/You buy/.test(msg)) bought++; else refused.push(`${p.id}:${g}: ${msg}`);
}
check(bought >= shops.length, `visitor can buy at every shop (${bought} items across ${shops.length} shops)`, refused.slice(0, 4).join(' | '));
const baker = t.place('bakery');
const wallet0 = t.civic.player.wallet, till0 = baker.till, tr0 = t.civic.treasury;
t.civic.player.bag.bread = (t.civic.player.bag.bread || 0);
t.buyItem('bakery', 'bread');
const tax = t.civic.treasury - tr0, kept = baker.till - till0;
check(Math.abs(wallet0 - t.civic.player.wallet - (tax + kept)) < 1e-9 && Math.abs(tax - 0.5) < 1e-9, 'a $5 loaf splits into 10% sales tax and the till', `tax ${tax}, till +${kept}`);
check(/buys it back/.test(t.sellItem('bakery', 'bread')), 'shops buy goods back');
check(/eat/.test(t.eatItem('pie')) || !t.civic.player.bag.pie, 'visitor can eat from the bag');
// Sold out and closed shops refuse.
const butcher = t.place('butcher'); const lamb = butcher.stock.lamb; butcher.stock.lamb = 0;
check(/sold out/.test(t.buyItem('butcher', 'lamb')), 'a sold-out shelf refuses the sale'); butcher.stock.lamb = lamb;
const cafe = t.place('cafe'), cafeCloses = cafe.closes; cafe.closes = 0;
check(/closed/.test(t.buyItem('cafe', 'pie')), 'a closed shop refuses the sale'); cafe.closes = cafeCloses;
const broke = t.civic.player.wallet; t.civic.player.wallet = 0;
check(/You need/.test(t.buyItem('bakery', 'bread')), 'an empty wallet cannot buy'); t.civic.player.wallet = broke;
// Bank.
check(/Deposited \$10/.test(t.bank('deposit', 10)) && /Withdrew \$10/.test(t.bank('withdraw', 10)), 'bank deposit and withdrawal during opening hours');

// ── Politics: a vote, a tax motion, a repair request. ──
check(/recorded/.test(t.vote(CANDIDATES[2])), `visitor votes for ${CANDIDATES[2]}`);
check(/already voted/.test(t.vote(CANDIDATES[0])), 'one vote per election');
t.proposeCouncilMotion('tax', 0.08);
t.proposeCouncilMotion('priority', 'power');
t.civic.services.roads = 50;
const wo = t.repair('roads');
check(/WO-/.test(wo), 'a roads fault opens a work order', wo);

// ── Electricity: a feeder fault on day 3, then a fuel crisis on day 9. ──
let faultDone = null, fuelCrisis = null;

for (let d = 0; d < DAYS; d++) {
  const dayNo = t.day;
  let shortH = 0, waterH = 0, minFuel = Infinity, maxWaste = 0;
  for (let h = 0; h < 24; h++) {
    run(t, 60);
    const s = t.civic.supply, g = t.civic.powerGrid;
    if (!s.ok) shortH++;
    if (!s.waterOk) waterH++;
    if (g) worstUnserved = Math.max(worstUnserved, g.unserved);
    minFuel = Math.min(minFuel, t.place('power').stock.fuel || 0);
    maxWaste = Math.max(maxWaste, t.place('sewage').stock.wastewater || 0);
    if (dayNo === 3 && h === 9 && !faultDone) {
      t.faultPowerLine('west-feeder'); t.updatePowerGrid();
      const affected = t.civic.powerGrid.affected;
      check(affected.includes('west-homes') && !affected.includes('clinic'), 'a west-feeder fault cuts only the west homes', affected.join(','));
      check(/requested/.test(t.repairPowerLine('west-feeder')), 'the feeder repair is requested');
      faultDone = { day: t.day, minute: t.minute };
    }
    if (dayNo === 9 && h === 0 && !fuelCrisis) {
      fuelCrisis = { fuel: t.place('power').stock.fuel, depot: t.place('depot').out.fuel };
      t.place('power').stock.fuel = 0; t.place('depot').out.fuel = 0;
    }
  }
  powerShortHours += shortH; waterShortHours += waterH;
  const y = t.yesterday || {}, m = money(t), gov = t.governmentReport();
  const hungry = t.villagers.filter((v) => v.hunger > 80).length;
  daily.push({ day: dayNo, weather: t.civic.weather, meals: y.meals, sold: Object.values(y.sold || {}).reduce((a, b) => a + b, 0), deliveries: y.deliveries, baked: y.baked,
    shortH, waterH, minFuel, maxWaste, treasury: r0(m.treasury), tills: r0(m.tills), homes: r0(m.villagers), mayor: t.civic.mayor, tax: t.civic.taxRate,
    roads: r0(t.civic.services.roads), power: r0(t.civic.services.power), happiness: r0(t.civic.indicators.happiness), stockouts: y.stockouts, hungry, pollution: r0(t.civic.indicators.pollution), repairs: y.repairs, orders: gov.orders.filter((o) => o.status !== 'done').length });
  const bad = negatives(t);
  if (bad.length) check(false, `day ${dayNo}: invalid balances or stock`, bad.slice(0, 5).join(', '));
}

// ── Results ──
const g = t.civic.government, end = money(t);
const repairs = g.orders.filter((o) => o.approvedBy).reduce((n, o) => n + o.cost, 0);
const expected = start.total + flows.grant + flows.outside + flows.exports - flows.imports - repairs;
check(Math.abs(end.total - expected) < 1, 'money is conserved: every dollar comes from the grant, outside work or exports, or leaves as imports',
  `start $${r0(start.total)}, end $${r0(end.total)}, expected $${r0(expected)} (grant ${r0(flows.grant)}, outside ${r0(flows.outside)}, exports ${r0(flows.exports)}, imports ${r0(flows.imports)}, repairs ${repairs})`);
check(g.elections.length >= Math.floor(DAYS / 7), `elections every 7 days (${g.elections.length} held)`);
const winners = g.elections.map((e) => e.winner);
check(new Set(winners).size > 1 || g.elections.some((e) => Object.values(e.candidates).filter((n) => n > 0).length > 1), 'elections are contested (more than one candidate gets votes or wins)', g.elections.map((e) => `day ${e.day}: ${Object.entries(e.candidates).map(([n, v]) => n + ' ' + v).join('/')}`).join('; '));
check(g.minutes.length >= Math.floor(DAYS / 2) - 1, `council meets every second day (${g.minutes.length} meetings)`);
const taxMotion = g.motions.find((m) => m.type === 'tax');
check(taxMotion?.status === 'passed' ? Math.abs(t.civic.taxRate - 0.08) < 1e-9 : taxMotion?.status === 'lost', `tax motion decided and applied (${taxMotion?.status}, tax now ${t.civic.taxRate})`);
const roadOrder = g.orders.find((o) => o.service === 'roads');
check(roadOrder?.status === 'done', `roads work order completed (${roadOrder?.status})`);
const feeder = g.orders.find((o) => o.kind === 'feeder');
check(feeder?.status === 'done' && !t.civic.powerLines['west-feeder'], `west feeder repaired (${feeder?.status}, finished day ${feeder?.finished?.day} ${feeder?.finished ? String(Math.floor(feeder.finished.minute / 60)).padStart(2, '0') + ':' + String(feeder.finished.minute % 60).padStart(2, '0') : ''})`);
const crisis = daily.filter((r) => r.day >= 9 && r.day <= 11);
const normal = daily.filter((r) => r.day < 9 && r.day !== 3 || r.day > 16);
check(crisis.some((r) => r.shortH > 0), 'running out of fuel causes a power shortage', crisis.map((r) => `day ${r.day}: ${r.shortH}h short`).join(', '));
const after = daily.filter((r) => r.day >= 13 && r.day <= 16);
check(after.every((r) => r.shortH === 0), 'power recovers after the fuel crisis once the train and trucks restock', after.map((r) => `day ${r.day}: ${r.shortH}h, min fuel ${r.minFuel}`).join(', '));
check(normal.every((r) => r.shortH === 0), 'no power shortages on normal days', normal.filter((r) => r.shortH).map((r) => `day ${r.day}: ${r.shortH}h`).join(', '));
check(crisis.some((r) => r.waterH > 0 || r.maxWaste > 70), 'the blackout stops the water or wastewater pumps (power → utilities cascade)', crisis.map((r) => `day ${r.day}: water ${r.waterH}h short, wastewater ${r.maxWaste}`).join(', '));
const stand = t.events.filter((e) => /standing in/.test(e.text));
check(normal.every((r) => r.waterH === 0), 'the taps run on normal days', normal.filter((r) => r.waterH).map((r) => `day ${r.day}: ${r.waterH}h`).join(', '));
check(normal.every((r) => r.maxWaste <= 70), 'wastewater keeps up on normal days', `max ${Math.max(...normal.map((r) => r.maxWaste))}`);
const gmOrders = g.orders.filter((o) => o.reporter === 'General Manager');
check(gmOrders.length > 0 && gmOrders.every((o) => o.status === 'done' || o.created.day >= t.day - 1), `the council maintains worn services itself (${gmOrders.length} General Manager work orders: ${gmOrders.map((o) => o.service + ' ' + o.status).join(', ')})`);
check(daily.at(-1).happiness >= 60, `the town is content (happiness ${daily.at(-1).happiness})`);
const fed = daily.slice(1).map((r) => r.meals);
check(Math.min(...fed) >= 80, `villagers eat (worst day ${Math.min(...fed)} meals)`);
check(daily.slice(1).every((r) => r.deliveries >= 15), `trucks keep delivering (worst ${Math.min(...daily.slice(1).map((r) => r.deliveries))}/day)`);
check(daily.slice(1).every((r) => r.baked > 0), 'the bakery bakes every day');
check(end.treasury > 1000, `the council stays solvent ($${r0(end.treasury)})`);
const poor = t.villagers.filter((v) => v.wallet < 5);
check(poor.length <= 6, `few villagers broke at the end (${poor.length})`, poor.map((v) => `${v.name} the ${v.job} $${r0(v.wallet)}`).join(', '));
const richest = [...t.places.values()].filter((p) => p.till > 0).sort((a, b) => b.till - a.till).slice(0, 3);
check(end.tills < end.total * 0.5, `businesses don't hoard the town's money (tills $${r0(end.tills)} of $${r0(end.total)})`, richest.map((p) => `${p.id} $${r0(p.till)}`).join(', '));
const stockouts = Object.entries(outOf).sort((a, b) => b[1] - a[1]);
const missed = stockouts.reduce((s, [, n]) => s + n, 0), sales = daily.reduce((s, r) => s + (r.sold || 0), 0);
check(missed < sales * 0.06, `shops mostly stocked (${missed} villager stock-outs against ${sales} sales in ${DAYS} days, ${(100 * missed / sales).toFixed(1)}%)`, stockouts.slice(0, 5).map(([k, n]) => `${k} ${n}`).join(', '));
check(daily.at(-1).roads >= 55 && daily.at(-1).power >= 55, `services stay maintained (roads ${daily.at(-1).roads}%, power ${daily.at(-1).power}%)`);
check(daily.at(-1).pollution < 40, `pollution stays low (${daily.at(-1).pollution})`);

// Offices: whoever wins, every job in town stays covered (a mayor's own job by the clerk).
{
  const town = new TownLife({ homes, minute: 6 * 60, seed: SEED });
  const jobs = (x) => x.villagers.map((v) => v.job).filter((j) => !['mayor', 'council clerk', 'general manager'].includes(j)).sort().join(',');
  const before = jobs(town), gaps = [];
  for (const winner of ['Sadie', 'Vern', 'Arlo', 'Sadie', 'Arlo', 'Vern']) {
    town.civic.mayor = winner; syncOffices(town);
    const mayors = town.villagers.filter((v) => v.job === 'mayor').map((v) => v.name);
    if (mayors.join() !== winner) gaps.push(`${winner} won but mayors are ${mayors}`);
    // Vern began as mayor with no other job, so his clerk post is the one extra role.
    if (jobs(town) !== before) gaps.push(`after ${winner}: jobs ${jobs(town)}`);
  }
  check(!gaps.length, 'every job stays covered through six changes of mayor', gaps.slice(0, 2).join(' | '));
}

if (!QUIET) {
  console.log('day weather  meals sold deliv baked short water fuelMin waste treasury tills homes  mayor tax  roads happy stockouts orders');
  for (const r of daily) console.log([r.day, r.weather.padEnd(7), r.meals, r.sold, r.deliveries, r.baked, r.shortH, r.waterH, r.minFuel, r.maxWaste, r.treasury, r.tills, r.homes, r.mayor.padEnd(6), r.tax, r.roads, r.happiness, r.stockouts, r.orders].map(String).map((s) => s.padStart(5)).join(' '));
  console.log('\nelections:', g.elections.map((e) => `day ${e.day} ${e.winner} (${Object.entries(e.candidates).map(([n, v]) => n + ' ' + v).join(', ')})`).join('; '));
  console.log('fuel crisis started with', fuelCrisis, '· feeder fault at', faultDone, '· worst unserved', worstUnserved);
}
console.log(`\n${passes.length} passed, ${findings.length} findings`);
for (const p of passes) console.log('  ✓ ' + p);
for (const f of findings) console.log('  ✗ ' + f);
process.exit(findings.length ? 1 : 0);
