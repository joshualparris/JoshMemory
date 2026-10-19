// Public and household finance on top of the town's money model (life.civic): finite Commonwealth
// and NSW treasuries, PAYG income tax, council grants, the visitor's rent and power bills, household
// and business arrears, business utilities, and a double-entry journal. Every transfer moves money
// from one finite balance to another; the only money that appears is the opening endowment of each
// treasury, which the soak test counts in town money. Figures are fictional Town Dollars for a
// 24-minute game day, not real Australian rates.
export const RATES = Object.freeze({
  paygPercent: 10,        // simplified whole-dollar PAYG withholding on wages
  visitorRent: 8,         // per town day, from day 2
  visitorPower: 2,
  businessUtilities: 3,   // per private business per town day
  federalGrant: 600,      // daily Commonwealth local-services grant to council (while funds last)
  stateGrant: 300,        // daily NSW local-infrastructure grant to council (while funds last)
  federalStart: 40000,
  stateStart: 25000,
  arrearsCapWages: 6,     // unpaid wage arrears stop growing after this many shifts
  journalMax: 120,
});

const r2 = (n) => Math.round(n * 100) / 100;
const num = (n) => (Number.isFinite(n) && n >= 0 ? r2(n) : 0);

export function freshFinance() {
  return {
    federal: RATES.federalStart, state: RATES.stateStart,
    rentArrears: 0, powerArrears: 0, visitorPaid: 0,
    entries: [], seq: 0, lastClosedDay: 1,
    daily: blank(), lifetime: blank(), biz: {},
  };
}
const blank = () => ({ tax: 0, rates: 0, utilities: 0, rent: 0, grants: 0, councilWages: 0, stateWages: 0, unpaid: 0 });

export function fin(life) {
  const c = life.civic;
  if (!c.finance || typeof c.finance !== 'object') c.finance = freshFinance();
  const f = c.finance;
  for (const k of ['federal', 'state', 'rentArrears', 'powerArrears', 'visitorPaid']) f[k] = num(f[k]);
  if (!Array.isArray(f.entries)) f.entries = [];
  if (!f.daily) f.daily = blank();
  if (!f.lifetime) f.lifetime = blank();
  if (!f.biz) f.biz = {};
  return f;
}

export function record(life, from, to, amount, memo) {
  const f = fin(life);
  if (!(amount > 0)) return;
  f.entries.unshift({ id: ++f.seq, day: life.day, minute: Math.floor(life.minute), debit: String(from).slice(0, 40), credit: String(to).slice(0, 40), amount: r2(amount), memo: String(memo).slice(0, 100) });
  if (f.entries.length > RATES.journalMax) f.entries.length = RATES.journalMax;
}

function revenue(life, type, amount) {
  const f = fin(life);
  f.daily[type] = r2((f.daily[type] || 0) + amount);
  f.lifetime[type] = r2((f.lifetime[type] || 0) + amount);
}
export const bizStats = (life, id) => { const f = fin(life); return (f.biz[id] ||= { sales: 0, wages: 0, utilities: 0, rates: 0, unpaid: 0, supplies: 0 }); };

// A sale at a till (called from TownLife.sale): the shop's gross takings.
export function noteSale(life, shop, price) { bizStats(life, shop.id).sales = r2(bizStats(life, shop.id).sales + price); }
export function noteRates(life, place, amount) { bizStats(life, place.id).rates = r2(bizStats(life, place.id).rates + amount); revenue(life, 'rates', amount); record(life, 'business:' + place.id, 'council', amount, place.name + ' business rates'); }

// Whole-dollar PAYG: withheld from a wage that has already reached the worker's wallet.
export function withhold(life, v, gross) {
  const amount = Math.floor(gross * RATES.paygPercent / 100);
  if (amount <= 0 || v.wallet < amount) return 0;
  const f = fin(life);
  v.wallet -= amount; f.federal = r2(f.federal + amount);
  revenue(life, 'tax', amount);
  record(life, 'npc:' + v.name, 'commonwealth', amount, 'PAYG income tax');
  return amount;
}

// PAYG on the visitor's wages, taken from the wallet that was just paid.
export function withholdVisitor(life, gross) {
  const me = life.civic.player, amount = Math.floor(gross * RATES.paygPercent / 100);
  if (amount <= 0 || me.wallet < amount) return 0;
  const f = fin(life);
  me.wallet -= amount; f.federal = r2(f.federal + amount);
  revenue(life, 'tax', amount);
  record(life, 'visitor', 'commonwealth', amount, 'PAYG income tax on your wages');
  return amount;
}

// Draw a payment from the NSW treasury first for school and clinic jobs, falling back to the council.
export function stateFunded(site) { return site === 'school' || site === 'clinic'; }
export function drawState(life, amount) {
  const f = fin(life), take = Math.min(f.state, amount);
  if (take > 0) { f.state = r2(f.state - take); revenue(life, 'stateWages', take); record(life, 'nsw', 'wages', take, 'NSW health and education payroll'); }
  return take;
}
export function noteCouncilWage(life, amount) { if (amount > 0) { revenue(life, 'councilWages', amount); record(life, 'council', 'wages', amount, 'Council payroll'); } }

// Daily Commonwealth and NSW grants to the council, from money those treasuries actually hold.
export function dailyGrants(life) {
  const f = fin(life), c = life.civic;
  const fed = Math.min(RATES.federalGrant, f.federal), st = Math.min(RATES.stateGrant, f.state);
  f.federal = r2(f.federal - fed); f.state = r2(f.state - st);
  c.treasury = r2(c.treasury + fed + st);
  if (fed) record(life, 'commonwealth', 'council', fed, 'Commonwealth local services grant');
  if (st) record(life, 'nsw', 'council', st, 'NSW local infrastructure grant');
  revenue(life, 'grants', fed + st);
  return fed + st;
}

// Start of each town day (day 2 onwards): the visitor's rent and power, villagers' rate arrears,
// and every private business's utilities. Nothing overdrafts; shortfalls become arrears.
export function dailyClose(life) {
  const f = fin(life), c = life.civic, me = c.player;
  if (f.lastClosedDay >= life.day) return;
  f.lastClosedDay = life.day;
  f.daily = blank();
  // The visitor's household bills.
  const bill = (due, field, label) => {
    let owe = f[field] + due, paid = 0;
    for (const pot of ['wallet', 'bank']) { const take = Math.min(owe, Math.floor(me[pot])); if (take > 0) { me[pot] -= take; owe -= take; paid += take; } }
    f[field] = owe; c.treasury = r2(c.treasury + paid); f.visitorPaid += paid;
    if (paid) { revenue(life, label === 'rent' ? 'rent' : 'utilities', paid); record(life, 'visitor', 'council', paid, 'Your ' + label); }
    if (owe > 0) f.daily.unpaid = r2(f.daily.unpaid + owe);
  };
  bill(RATES.visitorRent, 'rentArrears', 'rent');
  bill(RATES.visitorPower, 'powerArrears', 'power');
  if (f.rentArrears + f.powerArrears > 0) life.log('Your rent and power are overdue. Pay them at the Community Bank.');
  // Private businesses pay utilities from the till, then any bills they still owe.
  for (const p of life.places.values()) {
    if (p.kind === 'home' || p.kind === 'utility' || !p.target || ['hall', 'school', 'clinic', 'post', 'depot', 'square', 'bank'].includes(p.id)) continue;
    const s = bizStats(life, p.id), due = RATES.businessUtilities + s.unpaid, pay = Math.min(due, Math.max(0, Math.floor(p.till)));
    if (pay > 0) { p.till -= pay; c.treasury = r2(c.treasury + pay); s.utilities = r2(s.utilities + pay); revenue(life, 'utilities', pay); record(life, 'business:' + p.id, 'council', pay, p.name + ' utilities'); }
    s.unpaid = r2(due - pay);
    if (s.unpaid > 0) f.daily.unpaid = r2(f.daily.unpaid + s.unpaid);
  }
}

// The visitor settles overdue household bills at the bank.
export function payBills(life) {
  const f = fin(life), c = life.civic, me = c.player;
  if (!life.open(life.place('bank'))) return 'The bank is closed (9:00–16:00).';
  let owe = f.rentArrears + f.powerArrears;
  if (owe <= 0) return 'You have no overdue bills.';
  let paid = 0;
  for (const pot of ['wallet', 'bank']) { const take = Math.min(owe, Math.floor(me[pot])); if (take > 0) { me[pot] -= take; owe -= take; paid += take; } }
  if (paid <= 0) return 'You have nothing to pay with.';
  const rent = Math.min(f.rentArrears, paid); f.rentArrears -= rent; f.powerArrears -= paid - rent;
  c.treasury = r2(c.treasury + paid); f.visitorPaid += paid;
  record(life, 'visitor', 'council', paid, 'Overdue rent and power');
  return `Paid $${paid} of overdue bills. $${f.rentArrears + f.powerArrears} still owing.`;
}

export function overdue(life) { const f = fin(life); return f.rentArrears + f.powerArrears; }

// Money held by the three tiers of government and the lending pool, for the books and the soak test.
export function governmentMoney(life) { const f = fin(life); return f.federal + f.state; }

export function economyReport(life) {
  const f = fin(life), c = life.civic, cr = life.creditReport();
  const biz = [...life.places.values()].filter((p) => p.target && p.kind !== 'home').map((p) => {
    const s = f.biz[p.id] || { sales: 0, wages: 0, utilities: 0, rates: 0, unpaid: 0, supplies: 0 };
    return { id: p.id, name: p.name, till: Math.round(p.till), sales: Math.round(s.sales), wages: Math.round(s.wages), rates: Math.round(s.rates), utilities: Math.round(s.utilities), unpaid: Math.round(s.unpaid), result: Math.round(s.sales - s.wages - s.rates - s.utilities) };
  });
  const people = life.villagers.reduce((n, v) => n + v.wallet + (v.savings || 0), 0);
  const tills = [...life.places.values()].reduce((n, p) => n + p.till, 0);
  return {
    council: r2(c.treasury), commonwealth: f.federal, nsw: f.state, bank: cr.capital,
    people: Math.round(people), tills: Math.round(tills), visitor: Math.round(c.player.wallet + c.player.bank),
    total: Math.round(people + tills + c.treasury + f.federal + f.state + cr.capital + c.player.wallet + c.player.bank),
    rentArrears: f.rentArrears, powerArrears: f.powerArrears,
    daily: { ...f.daily }, lifetime: { ...f.lifetime },
    wageArrears: life.villagers.reduce((n, v) => n + (v.wageArrears || 0), 0),
    rateArrears: life.villagers.reduce((n, v) => n + (v.rateArrears || 0), 0),
    biz, entries: f.entries.slice(0, 16),
  };
}
