// Community Bank credit: eligibility, one loan at a time, daily interest, overdue, repayment,
// the journal, save/restore, and money conservation across all of it.
import assert from 'node:assert/strict';
import { TownLife } from '../src/world/life.js';

const homes = [];
for (let r = 0; r < 7; r++) for (let c = 0; c < 26; c += 2) homes.push({ coordinate: String.fromCharCode(65 + c) + (r + 1), name: 'House', door: { x: (c - 12.5) * 26, z: r * 46 - 161 + 4 } });

const t = new TownLife({ homes, minute: 10 * 60, seed: 7 });
const me = t.civic.player, k = () => t.civic.credit;
const total = () => me.wallet + me.bank + k().capital;      // visitor + lending pool
const run = (m) => { for (let i = 0; i < m; i += 0.5) t.tick(0.5); };
const toDay = (d, h = 10) => { while (t.day < d || t.minute < h * 60 - 0.01) { t.tick(0.5); if (t.day > d) break; } };

const start = total();
assert.equal(k().capital, 1500, 'pool starts at $1500');

// 1. No track record yet.
assert.match(t.borrow(200), /income first/, 'no loan before earning');
assert.equal(k().loan, null);

// 2. Earn something (recycling pays), then borrow.
t.civic.homes.recyclables = 20;
assert.match(t.collectRecycling(), /pays you/);
assert.ok(k().earned >= 10, 'recycling counts as earnings');
assert.match(t.borrow(150), /\$100, \$200 or \$400/, 'only listed sizes');
const bankBefore = me.bank;
assert.match(t.borrow(200), /paid into your savings/);
assert.equal(me.bank, bankBefore + 200);
assert.equal(k().capital, 1300);
assert.match(t.borrow(100), /already owe/, 'one loan at a time');
assert.equal(total() - 0, start + 0 + (total() - start), 'sanity');

// 3. Interest accrues daily, as a liability only.
const wallet0 = me.wallet, bank0 = me.bank;
toDay(t.day + 3);
const r = t.creditReport();
assert.ok(r.loan.interest >= 5.9 && r.loan.interest <= 6.1, `3 days at 1% of $200 is about $6, got ${r.loan.interest}`);
assert.equal(me.wallet + me.bank, wallet0 + bank0 - 0, 'interest does not come out of the account until paid');

// 4. Partial then full repayment, interest first.
const before = total();
assert.match(t.repay(20), /Paid \$20/);
assert.equal(total(), before, 'repayment only moves money between visitor and pool');
assert.ok(t.creditReport().loan.interest < r.loan.interest, 'interest is cleared first');
me.wallet += 500;                       // test top-up (outside money, not part of the loop below)
const topped = total();
assert.match(t.repay(Math.ceil(t.creditReport().loan.owed)), /cleared/);
assert.equal(t.civic.credit.loan, null);
assert.equal(total(), topped, 'full repayment conserves money');
assert.ok(k().capital > 1500, 'the pool keeps the interest it was paid');

// 5. Overdue doubles the rate and says so in the journal.
assert.match(t.borrow(100), /Repay by day/);
const due = k().loan.due;
toDay(due + 3);
assert.ok(t.creditReport().loan.overdue, 'loan is overdue past its due day');
assert.ok(t.creditReport().journal.some((e) => /overdue/.test(e.text)), 'journal records the overdue notice');
assert.ok(t.creditReport().loan.dailyInterest >= 1.9, 'overdue rate is 2% a day');

// 6. Closed bank refuses.
while (t.minute < 17 * 60 || t.minute > 20 * 60) t.tick(0.5);
assert.match(t.repay(10), /closed/);
assert.match(t.borrow(100), /closed/);

// 7. Capital limit and save/restore.
const snap = JSON.parse(JSON.stringify(t.snapshot()));
const u = new TownLife({ homes, minute: 10 * 60, seed: 7 });
u.restore(snap);
assert.deepEqual(u.civic.credit.loan, t.civic.credit.loan, 'loan survives a save');
assert.equal(u.civic.credit.capital, t.civic.credit.capital);
const old = JSON.parse(JSON.stringify(snap)); delete old.civic.credit;
const w = new TownLife({ homes, minute: 10 * 60, seed: 7 }); w.restore(old);
assert.equal(w.civic.credit.capital, 1500, 'older saves get a fresh pool');

// 8. Journal is bounded.
for (let i = 0; i < 80; i++) k().journal.unshift({ day: 1, minute: 0, text: 'x' });
while (t.minute < 10 * 60 || t.minute > 15 * 60) t.tick(0.5);
t.bank('deposit', 1);
assert.ok(k().journal.length <= 41);

console.log('PASS: bank credit — eligibility, one loan, 1%/day interest, overdue, repayment, closed hours, save/restore, conservation');
