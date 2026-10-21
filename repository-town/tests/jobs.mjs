// Paid shifts: only inside the workplace with staff on duty, duties five minutes apart, wages from the
// employer's till then the council, PAYG to the Commonwealth, two shifts a day, and receipts.
import assert from 'node:assert/strict';
import { TownLife } from '../src/world/life.js';
import { JOB_BOARD } from '../src/world/jobs.js';
import { RATES } from '../src/world/finance.js';

const homes = [];
for (let r = 0; r < 7; r++) for (let c = 0; c < 26; c += 2) homes.push({ coordinate: String.fromCharCode(65 + c) + (r + 1), name: 'House', door: { x: (c - 12.5) * 26, z: r * 46 - 161 + 4 } });
let t = new TownLife({ homes, minute: 10 * 60, seed: 5 });
const me = t.civic.player, f = () => t.civic.finance;
let onDuty = null;                                   // keep this workplace's staff at their posts while time runs
const staff = (site) => { onDuty = site; for (const v of t.villagers) if (v.work === site) { v.step = { kind: 'work' }; v.path = []; } };
const run = (m) => { for (let i = 0; i < m; i += 0.5) { if (onDuty) staff(onDuty); t.tick(0.5); } };
const task = (k) => { if (onDuty) staff(onDuty); return t.doTask(k); };
const total = () => me.wallet + me.bank + t.civic.treasury + f().federal + f().state + [...t.places.values()].reduce((s, p) => s + p.till, 0);

assert.equal(JOB_BOARD.length, 6);
assert.match(t.startJob('nope').message, /Unknown/);
assert.match(t.startJob('store-stocker').message, /Shift started/, 'store is open at 10:00');
assert.match(t.startJob('bakery-assistant').message, /Finish that shift there, or cancel it/, 'one shift at a time');

// Time does not count outside the workplace, or without staff on duty.
t.playerAt = null; staff('store'); run(10);
assert.equal(t.jobsReport().active.worked, 0, 'no progress outside');
t.playerAt = 'store'; onDuty = null; for (const v of t.villagers) if (v.work === 'store') { v.step = { kind: 'walk' }; v.path = [1]; }
run(10); assert.equal(t.jobsReport().active.worked, 0, 'no progress with no one on duty');
staff('store'); run(10);
assert.ok(t.jobsReport().active.worked >= 9, 'progress inside with staff on duty');

// Duties: unknown, then spaced five minutes apart.
assert.match(task('nonsense').message, /not a duty/);
assert.match(task('check-expiry').message, /Done/);
assert.match(task('refill-shelves').message, /more town minutes/, 'duties are spaced out');
assert.match(t.finishJob().message, /minutes still to work/);
run(6); assert.match(task('refill-shelves').message, /Done/);
run(6); assert.match(task('count-stock').message, /Done/);
run(30);
assert.equal(t.jobsReport().active.worked, 35, 'the shift is full');

// Clocking out pays from the till first, takes PAYG, and never makes money.
const shop = t.place('store'); shop.till = 500;
const w0 = me.wallet, fed0 = f().federal, before = total();
const r = t.finishJob();
assert.match(r.message, /Shift complete/, r.message);
const tax = Math.floor(24 * RATES.paygPercent / 100);
assert.equal(me.wallet, w0 + 24 - tax, 'net wage in the wallet');
assert.equal(f().federal, fed0 + tax, 'PAYG went to the Commonwealth');
assert.equal(shop.till, 500 - 24, 'the till paid the wage');
assert.ok(Math.abs(total() - before) < 1e-6, 'wages only move money');
assert.ok(t.creditReport().earned >= 20, 'wages count towards credit');
assert.ok(t.jobsReport().receipts.some((x) => /Shop|stocker|Store/.test(x.text)), 'wage receipt recorded');
assert.match(t.startJob('store-stocker').message, /already did/, 'one of each per day');

// A broke till falls back to the council; with both empty the shift is not lost money.
t.civic.treasury = 1000; shop.till = 0;
assert.match(t.startJob('post-assistant').message, /Shift started/);
t.playerAt = 'post'; staff('post'); run(31);
for (const k of JOB_BOARD.find((x) => x.id === 'post-assistant').tasks) { task(k); run(6); }
const c0 = t.civic.treasury; assert.match(t.finishJob().message, /Shift complete/); assert.equal(c0 - t.civic.treasury, 22, 'council covered the post office wage');

// Two shifts a day maximum.
assert.match(t.startJob('civic-cleaner').message, /2 shifts a day/);

// An unfinished shift lapses at midnight.
t = null;
const u = new TownLife({ homes, minute: 10 * 60, seed: 5 });
u.startJob('store-stocker');
for (let i = 0; i < 15 * 60; i += 0.5) u.tick(0.5);
assert.equal(u.jobsReport().active, null, 'shift lapsed overnight');

// Save and restore keep receipts and the day's shifts.
const v = new TownLife({ homes, minute: 10 * 60, seed: 5 });
v.civic.jobs = { active: null, done: { 1: ['farm-hand'] }, earned: 40, spent: 12, receipts: [{ day: 1, type: 'wage', text: 'x', amount: 5 }] };
const snap = JSON.parse(JSON.stringify(v.snapshot())); const w = new TownLife({ homes, minute: 10 * 60, seed: 5 }); w.restore(snap);
assert.equal(w.jobsReport().receipts.length, 1); assert.equal(w.civic.jobs.earned, 40);

console.log('PASS: jobs — shifts need presence and staff, duties spaced, till then council pays, PAYG, daily limits, lapse, save/restore');
