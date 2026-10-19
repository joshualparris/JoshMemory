import { TownMoney } from './money.js';
import { TownFinance } from './finance.js';
// Town life simulation: the clock, farms, the mill and bakery, shops, trucks, the post,
// and villagers with jobs, hunger, pantries, wallets and daily routines. Pure logic (no
// three.js) so it runs and is tested on its own; src/world/townlife.js draws it.
//
// Time: three real seconds are one town minute, so a day lasts 72 real minutes (the
// player can speed it up). People and trucks move at real speed, so distances in town
// minutes come from SEC_PER_MIN.
// Places sit on street 8's empty lots (G8–Z8) and the farm strip south of it.

export const LOT_X = 26, LOT_Z = 46;
export const SEC_PER_MIN = 3;
export const WALK = 1.5, BIKE = 4.5, DRIVE = 8;               // metres per real second
const WAGES = { retired: 25, student: 10, mayor: 70, nurse: 60, teacher: 60, programmer: 65 };
const PUBLIC_PAYROLL = new Set(['hall','school','clinic','post','depot','square','home']);
const ROAD = (r) => r * LOT_Z - 3.5 * LOT_Z + 16;            // road centre line of street r (0-based)
const lotX = (col) => (col - 12.5) * LOT_X;
const LOT8_Z = 7 * LOT_Z - 3.5 * LOT_Z;                       // z of the street-8 lot centres
export const AVENUES = [0, 5, 10, 15, 20, 25].map((c) => (c - 13) * LOT_X);
export const FIELD_Z0 = ROAD(7) + 8, FIELD_Z1 = ROAD(7) + 34;  // farm strip south of street 8

export const GOODS = {
  grain: { name: 'grain', unit: 'bag', price: 2 },
  flour: { name: 'flour', unit: 'bag', price: 4 },
  bread: { name: 'bread', unit: 'loaf', price: 5 },
  pie: { name: 'pies', unit: 'pie', price: 7 },
  veg: { name: 'vegetables', unit: 'box', price: 4 },
  fruit: { name: 'fruit', unit: 'bag', price: 4 },
  eggs: { name: 'eggs', unit: 'dozen', price: 6 },
  milk: { name: 'milk', unit: 'bottle', price: 3 },
  lamb: { name: 'lamb', unit: 'cut', price: 12 },
  coffee: { name: 'coffee beans', unit: 'bag', price: 9 },
  tea: { name: 'tea', unit: 'tin', price: 6 },
  parcel: { name: 'parcels', unit: 'parcel', price: 0 },
};

// col letter → place. `sells` are what villagers can buy; `makes` what work produces.
export const PLACE_DEFS = [
  { col: 'G', id: 'hall', name: 'Town Hall', kind: 'hall', opens: 9 * 60, closes: 17 * 60 },
  { col: 'H', id: 'store', name: 'General Store', kind: 'shop', sells: ['eggs', 'milk', 'flour', 'tea', 'coffee', 'bread'], opens: 7 * 60, closes: 19 * 60, target: { eggs: 20, milk: 20, flour: 10, tea: 10, coffee: 10, bread: 10 } },
  { col: 'I', id: 'bakery', name: 'Bakery', kind: 'shop', sells: ['bread', 'pie'], opens: 6 * 60, closes: 18 * 60, target: { flour: 12, eggs: 6, milk: 6, lamb: 6, veg: 6 } },
  { col: 'J', id: 'cafe', name: 'Commit Café', kind: 'cafe', opens: 6 * 60 + 30, closes: 16 * 60, target: { bread: 10, eggs: 10, milk: 10, coffee: 6, veg: 6, pie: 6 } },
  { col: 'K', id: 'greengrocer', name: 'Greengrocer', kind: 'shop', sells: ['veg', 'fruit'], opens: 8 * 60, closes: 18 * 60, target: { veg: 24, fruit: 20 } },
  { col: 'L', id: 'butcher', name: 'Butcher', kind: 'shop', sells: ['lamb'], opens: 8 * 60, closes: 17 * 60 + 30, target: { lamb: 16 } },
  { col: 'M', id: 'square', name: 'Market Square', kind: 'park', opens: 0, closes: 24 * 60 },
  { col: 'N', id: 'pub', name: 'The Merged Branch', kind: 'pub', opens: 11 * 60, closes: 23 * 60, target: { lamb: 8, veg: 10, pie: 6, bread: 6 } },
  { col: 'O', id: 'post', name: 'Post Office', kind: 'post', opens: 8 * 60, closes: 17 * 60, target: { parcel: 12 } },
  { col: 'P', id: 'school', name: 'School', kind: 'school', opens: 8 * 60 + 30, closes: 15 * 60 },
  { col: 'Q', id: 'clinic', name: 'Clinic', kind: 'clinic', opens: 8 * 60, closes: 17 * 60 },
  { col: 'R', id: 'depot', name: 'Rail Depot', kind: 'depot', opens: 6 * 60, closes: 18 * 60 },
  { col: 'S', id: 'mill', name: 'Flour Mill', kind: 'mill', opens: 7 * 60, closes: 16 * 60, target: { grain: 20 } },
  { col: 'T', id: 'sheep', name: 'Sheep Station', kind: 'farm', makes: 'lamb', opens: 6 * 60, closes: 15 * 60 },
  { col: 'U', id: 'dairy', name: 'Dairy', kind: 'farm', makes: 'milk', opens: 5 * 60, closes: 14 * 60 },
  { col: 'V', id: 'coop', name: 'Chook Shed', kind: 'farm', makes: 'eggs', opens: 6 * 60, closes: 14 * 60 },
  { col: 'W', id: 'orchard', name: 'Orchard', kind: 'farm', makes: 'fruit', opens: 7 * 60, closes: 15 * 60 },
  { col: 'X', id: 'garden', name: 'Market Garden', kind: 'farm', makes: 'veg', opens: 6 * 60, closes: 15 * 60 },
  { col: 'Y', id: 'silo', name: 'Wheat Farm', kind: 'farm', makes: 'grain', opens: 6 * 60, closes: 16 * 60 },
  { col: 'Z', id: 'farmhouse', name: 'Farmhouse', kind: 'home', opens: 0, closes: 24 * 60 },
];

const WHOLESALE = Object.fromEntries(Object.entries(GOODS).map(([g,v]) => [g,v.price===0?0:Math.max(1,Math.floor(v.price*.55))]));

const JOBS = [
  ['farmer', 'silo', 6 * 60, 16 * 60], ['farmer', 'garden', 6 * 60, 15 * 60], ['farmer', 'orchard', 7 * 60, 15 * 60],
  ['dairy hand', 'dairy', 5 * 60, 14 * 60], ['poultry keeper', 'coop', 6 * 60, 14 * 60], ['shearer', 'sheep', 6 * 60, 15 * 60],
  ['miller', 'mill', 7 * 60, 16 * 60], ['baker', 'bakery', 4 * 60 + 30, 13 * 60], ['baker', 'bakery', 6 * 60, 15 * 60],
  ['barista', 'cafe', 6 * 60 + 15, 15 * 60], ['cook', 'cafe', 7 * 60, 15 * 60 + 30], ['grocer', 'greengrocer', 7 * 60 + 30, 17 * 60],
  ['shopkeeper', 'store', 7 * 60 + 30, 18 * 60], ['butcher', 'butcher', 7 * 60 + 30, 16 * 60], ['publican', 'pub', 11 * 60, 23 * 60],
  ['postie', 'post', 8 * 60, 14 * 60], ['truck driver', 'depot', 6 * 60, 16 * 60], ['truck driver', 'depot', 7 * 60, 17 * 60],
  ['truck driver', 'depot', 6 * 60 + 30, 15 * 60], ['teacher', 'school', 8 * 60, 15 * 60 + 30], ['nurse', 'clinic', 8 * 60, 17 * 60],
  ['mayor', 'hall', 9 * 60, 16 * 60], ['station master', 'depot', 6 * 60, 15 * 60], ['programmer', 'home', 9 * 60, 17 * 60],
  ['programmer', 'home', 10 * 60, 18 * 60], ['retired', 'square', 9 * 60, 12 * 60], ['student', 'school', 8 * 60 + 30, 15 * 60],
  ['student', 'school', 8 * 60 + 30, 15 * 60], ['artist', 'square', 10 * 60, 15 * 60], ['retired', 'square', 14 * 60, 17 * 60],
  ['farmer', 'silo', 7 * 60, 15 * 60], ['grocer', 'greengrocer', 8 * 60, 16 * 60],
];
// Villager names; src/ui/social.js keeps their friendships and grudges.
export const VILLAGER_NAMES = ['Mabel', 'Arlo', 'Bea', 'Cas', 'Dot', 'Ezra', 'Flo', 'Gus', 'Hattie', 'Ivo', 'June', 'Kip', 'Lou', 'Merv', 'Nora', 'Ollie',
  'Peg', 'Rafe', 'Sadie', 'Theo', 'Una', 'Vern', 'Win', 'Zara', 'Bluey', 'Clem', 'Dulcie', 'Errol', 'Fern', 'Gwen', 'Harlan', 'Ida'];

// Home meals: [name, ingredients]. Villagers cook the first one their pantry can make.
const MEALS = {
  breakfast: [['toast and scrambled eggs', { bread: 1, eggs: 1 }], ['fruit and a glass of milk', { fruit: 1, milk: 1 }], ['toast with butter and a cuppa', { bread: 1 }]],
  lunch: [['a salad sandwich', { bread: 1, veg: 1 }], ['leftover pie', { pie: 1 }], ['an apple and some bread', { fruit: 1, bread: 1 }]],
  dinner: [['roast lamb and veg', { lamb: 1, veg: 1 }], ['a vegie omelette', { eggs: 1, veg: 1 }], ['a meat pie with peas', { pie: 1 }], ['vegetable soup with bread', { veg: 1, bread: 1 }]],
};
const OUT_MEALS = { cafe: [['bacon-and-egg roll', 9], ['big brekkie', 14], ['flat white and a muffin', 8], ['toastie', 9], ['soup of the day', 10]], pub: [['a parmy and chips', 22], ['roast of the day', 24], ['steak pie and mash', 18]] };

const plural = (unit, n) => (n === 1 ? unit : /[sx]$|ch$/.test(unit) ? `${unit}es` : unit === 'loaf' ? 'loaves' : `${unit}s`);
export const amount = (good, n) => (GOODS[good].unit === 'dozen' ? `${n} dozen ${GOODS[good].name}` : `${n} ${plural(GOODS[good].unit, n)} of ${GOODS[good].name}`);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(Math.floor(m % 60)).padStart(2, '0')}`;
export const timeText = fmt;

// Seeded random so a new town always starts the same way.
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ── Walking routes ─────────────────────────────────────────────────────────
const rowOf = (z) => { let best = 0; for (let r = 1; r < 8; r++) if (Math.abs(ROAD(r) - z) < Math.abs(ROAD(best) - z)) best = r; return best; };
const sideZ = (r, z, off = 5.3) => (z < ROAD(r) ? ROAD(r) - off : ROAD(r) + off);
// Footpath route: out to the footpath, along it, up an avenue if changing street, back in.
export function walkRoute(a, b) {
  const ra = rowOf(a.z), rb = rowOf(b.z), sa = sideZ(ra, a.z), sb = sideZ(rb, b.z);
  const pts = [{ x: a.x, z: sa }];
  if (!(ra === rb && sa === sb)) {
    const ave = AVENUES.reduce((p, c) => (Math.abs(a.x - c) + Math.abs(b.x - c) < Math.abs(a.x - p) + Math.abs(b.x - p) ? c : p));
    // Walk up the edge of the avenue, clear of the trucks' lanes and the corner houses.
    pts.push({ x: ave + 3.2, z: sa }, { x: ave + 3.2, z: sb });
  }
  pts.push({ x: b.x, z: sb }, { x: b.x, z: b.z });
  return pts;
}
// Road route for trucks, driving on the left (Australia): heading +x the left lane is −z;
// heading +z it is +x. Along the street, up the nearest avenue if changing street.
export function driveRoute(a, b) {
  const ra = rowOf(a.z), rb = rowOf(b.z);
  const lane = (r, dir) => ROAD(r) + (dir > 0 ? -1.7 : 1.7);
  const pts = [];
  if (ra === rb) {
    const d = Math.sign(b.x - a.x) || 1;
    // Pulls out into the lane over a few metres instead of sliding sideways.
    pts.push({ x: a.x + d * Math.min(5, Math.abs(b.x - a.x) / 3), z: lane(ra, d) }, { x: b.x, z: lane(ra, d) });
    return pts;
  }
  const ave = AVENUES.reduce((p, c) => (Math.abs(a.x - c) + Math.abs(b.x - c) < Math.abs(a.x - p) + Math.abs(b.x - p) ? c : p));
  const d1 = Math.sign(ave - a.x) || 1, d2 = Math.sign(b.x - ave) || 1, dz = Math.sign(ROAD(rb) - ROAD(ra));
  const aveLane = ave + (dz > 0 ? 1.7 : -1.7);
  pts.push({ x: a.x + d1 * Math.min(5, Math.abs(ave - a.x) / 3), z: lane(ra, d1) }, { x: aveLane, z: lane(ra, d1) }, { x: aveLane, z: lane(rb, d2) }, { x: b.x, z: lane(rb, d2) });
  return pts;
}

// The freight train runs on the line behind street 8: due 6:40, at the Rail Depot
// 7:00–7:20, gone west by 7:40. Returns its x, or null when it is not in town.
export const RAIL_Z = 7 * 46 - 3.5 * 46 - 17;
export function trainX(minute, depotX) {
  const m = minute;
  if (m >= 400 && m < 420) return depotX + ((420 - m) / 20) * (420 - depotX);
  if (m >= 420 && m < 440) return depotX;
  if (m >= 440 && m < 460) return depotX - ((m - 440) / 20) * (420 + depotX);
  return null;
}

// ── The town ───────────────────────────────────────────────────────────────
export class TownLife {
  constructor({ homes, minute = 7 * 60, seed = 20261019 }) {
    // homes: [{ coordinate, name, door: {x,z} }] — the repository houses people live in.
    this.rand = rng(seed);
    this.day = 1; this.minute = minute;
    this.events = []; this.stats = this.freshStats();
    this.money = new TownMoney();
    this.treasury = 80000;
    this.finance=new TownFinance(this);
    this.money.finance=this.finance;
    this.places = new Map();
    for (const d of PLACE_DEFS) {
      const col = d.col.charCodeAt(0) - 65;
      const x = lotX(col);
      this.places.set(d.id, {
        ...d, x, door: { x, z: LOT8_Z + 7.5 }, front: { x, z: LOT8_Z + 9.3 }, curb: { x, z: ROAD(7) - 1.7 },
        stock: Object.fromEntries(Object.keys(d.target || {}).map((k) => [k, Math.round(d.target[k] * 0.6)])), till:0, grossSales:0, operating:PUBLIC_PAYROLL.has(d.id)?0:4500, out:{},
      });
    }
    // Farms keep produce at the farm until a truck collects it; fields lie across the road.
    for (const p of this.places.values()) if (p.kind === 'farm') { p.out[p.makes] = 8; p.field = { x0: p.x - 11, x1: p.x + 11, z0: FIELD_Z0, z1: FIELD_Z1 }; p.growth = 0.5; }
    this.place('mill').out.flour = 6;
    this.place('bakery').out = { bread: 8, pie: 4 };
    this.place('depot').out = { coffee: 12, tea: 10, parcel: 6 };
    this.homes = homes;
    const picks = homes.filter((_, i) => i % Math.max(1, Math.floor(homes.length / JOBS.length)) === 2).slice(0, JOBS.length);
    this.villagers = JOBS.slice(0, picks.length).map(([job, work, start, end], i) => {
      const home = picks[i];
      return {
        id: i, name: VILLAGER_NAMES[i % VILLAGER_NAMES.length], job, work, start, end, home,
        x: home.door.x, z: home.door.z + 2, inside: true, path: [], step: null, activity: 'asleep at home',
        hunger: 25 + this.rand() * 20, wallet: 40 + Math.round(this.rand() * 40),
        pantry: { bread: 2, eggs: 2, milk: 1, veg: 1, fruit: 1, lamb: i % 3 === 0 ? 0 : 1, pie: 0 },
        carrying: null, lastMeal: null, meals: [], seen: [], doneToday: {},
      };
    });
    this.trucks = [0, 1, 2].map((i) => ({ id: i, driver: null, x: this.place('depot').curb.x + (i - 1) * 8, z: ROAD(7) - 1.7, heading: 0, path: [], job: null, load: null, wait: 0, state: 'parked' }));
    this.parcels = [];   // { coordinate, x, z, from } waiting on doorsteps
    this.obstacles = []; // set by the renderer each frame: [{x, z}] (the player)
    for (const t of this.trucks) t.driver = this.villagers.find((v) => v.job === 'truck driver' && !this.trucks.some((o) => o.driver === v)) || null;
    this.log(`Day ${this.day} begins. The town wakes up.`);
  }

  freshStats(){return {harvested:{},milled:0,baked:0,deliveries:0,delivered:{},sold:{},meals:0,mealsOut:0,parcels:0,wagesPaid:0,wagesOwed:0,wholesale:0,playerWages:0}}
  isPublicPayroll(site){return PUBLIC_PAYROLL.has(site)}
  payWageSource(site,amount){
    if(!Number.isSafeInteger(amount)||amount<=0)return false;
    if(this.isPublicPayroll(site)){
      if(site==='school'||site==='clinic'){
        if(this.finance.stateTreasury<amount)return false;
        this.finance.stateTreasury-=amount;return true;
      }
      if(this.treasury<amount)return false;
      this.treasury-=amount;return true;
    }
    const p=this.place(site);
    return p?TownMoney.debitBusiness(p,amount):false;
  }
  payPlayerPurchase(site,good){
    const shop=this.place(site),inv=shop&&(site==='bakery'?shop.out:shop.stock);
    const sells=site==='cafe'?['pie','bread']:site==='pub'?['pie']:shop?.sells;
    if(!shop||!sells?.includes(good)||!GOODS[good])return {ok:false,message:'Product not sold here.'};
    if(!this.open(shop))return {ok:false,message:'Shop is currently closed.'};
    if(!(inv[good]>0))return {ok:false,message:'Sold out of '+GOODS[good].name+'.'};
    const payment=this.money.purchase(this.day,GOODS[good].price,shop,good);
    if(!payment.ok)return payment;
    inv[good]--;
    this.stats.sold[good]=(this.stats.sold[good]||0)+1;
    this.log('The player bought '+GOODS[good].name+' from '+shop.name+'.');
    return {...payment,price:GOODS[good].price,remaining:inv[good]};
  }
  place(id) { return this.places.get(id); }
  time() { return fmt(this.minute); }
  isDay() { return this.minute >= 6 * 60 && this.minute < 19 * 60; }
  // 0 at midnight, 1 at noon: drives sky colour and lights.
  daylight() { const h = this.minute / 60; return clamp(Math.sin(((h - 6) / 13) * Math.PI) * 1.4, 0, 1); }
  log(text) { this.events.unshift({ t: `Day ${this.day} ${fmt(this.minute)}`, text }); this.events.length = Math.min(this.events.length, 60); }
  open(p) { return this.minute >= p.opens && this.minute < p.closes; }

  // Advances the town by `minutes` of town time (call with small steps).
  tick(minutes) {
    const before = this.minute;
    this.minute += minutes;
    if (this.minute >= 24 * 60) { this.minute -= 24 * 60; this.day++; this.newDay(); this.finance.dailyClose(); }
    const hourly = Math.floor(before / 60) !== Math.floor(this.minute / 60) || this.minute < before;
    if (hourly) this.everyHour();
    for (const v of this.villagers) this.liveVillager(v, minutes);
    for (const t of this.trucks) this.driveTruck(t, minutes);
  }

  newDay() {
    this.yesterday = this.stats;
    this.stats = this.freshStats();
    for (const v of this.villagers) v.doneToday = {};
    this.log(`Day ${this.day} begins. The 6:40 freight train is due at the Rail Depot.`);
  }

  // Production happens on the hour while the right workers are at work.
  everyHour() {
    const at = (id) => this.villagers.filter((v) => v.work === id && v.step?.kind === 'work');
    for (const p of this.places.values()) {
      if (p.kind === 'farm') {
        p.growth = clamp(p.growth + (this.isDay() ? 0.04 : 0.01), 0, 1);
        const hands = at(p.id).length;
        if (hands && this.open(p)) {
          const n = Math.round((2 + 3 * p.growth) * hands);
          p.out[p.makes] = (p.out[p.makes] || 0) + n;
          this.stats.harvested[p.makes] = (this.stats.harvested[p.makes] || 0) + n;
          if (p.makes === 'grain' && p.growth > 0.9) { p.growth = 0.3; this.log(`The wheat paddock was harvested. ${n} bags of grain went into the silo.`); }
        }
      }
    }
    const mill = this.place('mill');
    const batch = Math.min(2, Math.floor((mill.stock.grain || 0) / 3));
    if (at('mill').length && batch) { mill.stock.grain -= 3 * batch; mill.out.flour = (mill.out.flour || 0) + 2 * batch; this.stats.milled += 2 * batch; }
    const bakery = this.place('bakery');
    if (at('bakery').length) {
      const s = bakery.stock;
      if ((s.flour || 0) >= 2) { s.flour -= 2; bakery.out.bread = (bakery.out.bread || 0) + 8; this.stats.baked += 8; if ((bakery.out.bread || 0) > 30) bakery.out.bread = 30; }
      if ((s.flour || 0) >= 1 && (s.lamb || 0) >= 1 && (s.veg || 0) >= 1) { s.flour--; s.lamb--; s.veg--; bakery.out.pie = (bakery.out.pie || 0) + 4; this.stats.baked += 4; }
    }
    const h = Math.floor(this.minute / 60);
    if (h === 7) {
      const depot = this.place('depot');
      depot.out.coffee = (depot.out.coffee || 0) + 8; depot.out.tea = (depot.out.tea || 0) + 6; depot.out.parcel = (depot.out.parcel || 0) + 6 + Math.round(this.rand() * 6);
      this.log('The freight train pulled into the Rail Depot with coffee, tea and the mail.');
    }
    // Parcels left on doorsteps get taken inside by evening.
    if (h === 19 && this.parcels.length) { this.log(`${this.parcels.length} parcel${this.parcels.length > 1 ? 's were' : ' was'} collected from doorsteps.`); this.parcels = []; }
  }

  // ── Trucks ──
  driveTruck(t, minutes) {
    const drv = t.driver;
    const onShift = drv && this.minute >= drv.start && this.minute < drv.end && drv.step?.kind === 'work';
    if (t.wait > 0) { t.wait -= minutes; return; }
    // Brakes for anyone standing in the road ahead (the player, villagers crossing).
    t.braking = t.path.length > 0 && this.blocked(t);
    if (t.braking) return;
    if (t.path.length) {
      let budget = minutes * SEC_PER_MIN * DRIVE;  // ~30 km/h in town
      while (budget > 0 && t.path.length) {
        const p = t.path[0], dx = p.x - t.x, dz = p.z - t.z, d = Math.hypot(dx, dz);
        if (d <= budget) { t.x = p.x; t.z = p.z; budget -= d; t.path.shift(); if (d > 0.01) t.heading = Math.atan2(dx, dz); }
        else { t.x += (dx / d) * budget; t.z += (dz / d) * budget; t.heading = Math.atan2(dx, dz); budget = 0; }
      }
      if (!t.path.length) this.truckArrived(t);
      return;
    }
    if (!onShift) { if (t.state !== 'parked') { t.state = 'parked'; t.path = driveRoute(t, this.stopAt(t, 'depot')); t.job = null; } return; }
    if (!t.job) this.pickJob(t);
  }

  // Each truck has its own bay along the curb so two never stop on the same spot.
  stopAt(t, id) { const c = this.place(id).curb; return { x: c.x + (t.id - 1) * 8, z: c.z }; }

  blocked(t) {
    const fx = Math.sin(t.heading), fz = Math.cos(t.heading);
    const near = (p) => { const dx = p.x - t.x, dz = p.z - t.z, ahead = dx * fx + dz * fz; return ahead > 1 && ahead < 8 && Math.abs(dx * fz - dz * fx) < 1.3; };
    return this.obstacles.some(near) || this.villagers.some((v) => !v.inside && near(v));
  }

  // Finds the most useful load: a destination short of a good that a source has spare.
  pickJob(t) {
    const routes = [
      ['silo', 'grain', 'mill'], ['mill', 'flour', 'bakery'], ['mill', 'flour', 'store'],
      ['bakery', 'bread', 'store'], ['bakery', 'bread', 'cafe'], ['bakery', 'pie', 'cafe'], ['bakery', 'pie', 'pub'], ['bakery', 'bread', 'pub'],
      ['garden', 'veg', 'greengrocer'], ['garden', 'veg', 'bakery'], ['garden', 'veg', 'pub'], ['garden', 'veg', 'cafe'], ['orchard', 'fruit', 'greengrocer'],
      ['dairy', 'milk', 'store'], ['dairy', 'milk', 'cafe'], ['dairy', 'milk', 'bakery'], ['coop', 'eggs', 'store'], ['coop', 'eggs', 'cafe'], ['coop', 'eggs', 'bakery'],
      ['sheep', 'lamb', 'butcher'], ['sheep', 'lamb', 'pub'], ['sheep', 'lamb', 'bakery'],
      ['depot', 'coffee', 'cafe'], ['depot', 'coffee', 'store'], ['depot', 'tea', 'store'], ['depot', 'parcel', 'post'],
    ];
    let best = null;
    for (const [from, good, to] of routes) {
      const src = this.place(from), dst = this.place(to);
      const have = src.out[good] || 0, need = (dst.target?.[good] || 0) - (dst.stock[good] || 0);
      if (have < 3 || need < 3 || this.trucks.some((o) => o !== t && o.job?.to === to && o.job?.good === good)) continue;
      const cost=WHOLESALE[good];
      const balance=(dst.operating||0)+(dst.till||0);
      const affordable=cost?Math.floor(balance/cost):20;
      const quantity=Math.min(20,have,need,affordable);
      if(quantity<3)continue;
      const score=need/(dst.target[good]||1)+this.rand()*.1;
      if(!best||score>best.score)best={from,to,good,n:quantity,score};
    }
    if (!best) { t.state = 'waiting for an order'; return; }
    t.job = best; t.state = `heading to the ${this.place(best.from).name} for ${GOODS[best.good].name}`;
    t.path = driveRoute(t, this.stopAt(t, best.from)); t.leg = 'pickup';
  }

  truckArrived(t) {
    if (!t.job) { t.state = 'parked'; return; }
    const src = this.place(t.job.from), dst = this.place(t.job.to), g = t.job.good;
    if (t.leg === 'pickup') {
      const n = Math.min(t.job.n, src.out[g] || 0);
      src.out[g] = (src.out[g] || 0) - n; t.load = { good: g, n };
      t.wait = 4; t.leg = 'deliver'; t.state = `delivering ${amount(g, n)} to the ${dst.name}`;
      t.path = driveRoute(t, this.stopAt(t, t.job.to));
      if (!n) { t.job = null; t.path = []; t.leg = null; t.state = 'found nothing to collect, looking for another job'; }
    } else {
      const shipped=t.load?.n||0,unit=WHOLESALE[g]||0;
      const balance=(dst.operating||0)+(dst.till||0);
      const n=Math.min(shipped,unit?Math.floor(balance/unit):shipped);
      const invoice=n*unit;
      if(shipped>n)src.out[g]=(src.out[g]||0)+(shipped-n);
      const prevTill=dst.till||0,prevOperating=dst.operating||0;
      if(n&&(!invoice||TownMoney.debitBusiness(dst,invoice))){
        if(invoice){
          const fromTill=prevTill-(dst.till||0),fromOperating=prevOperating-(dst.operating||0);
          if(fromTill>0)this.finance.record('register:'+dst.id,'business:'+src.id,fromTill,'wholesale '+g);
          if(fromOperating>0)this.finance.record('business:'+dst.id,'business:'+src.id,fromOperating,'wholesale '+g);
          src.operating=(src.operating||0)+invoice;this.stats.wholesale+=invoice;
          dst.costOfGoods=(dst.costOfGoods||0)+invoice;
          src.wholesaleRevenue=(src.wholesaleRevenue||0)+invoice;
        }
        dst.stock[g]=(dst.stock[g]||0)+n;
        this.stats.deliveries++;this.stats.delivered[g]=(this.stats.delivered[g]||0)+n;
        if(n>=8||this.rand()<.3)this.log((t.driver?.name||'A truck')+' delivered '+amount(g,n)+' to the '+dst.name+' for $'+invoice+'.');
      }else if(n){src.out[g]=(src.out[g]||0)+n;}
      t.load=null;t.job=null;t.wait=4;t.state='unloaded, looking for the next job';
    }
  }

  // ── Villagers ──
  // Decides the next thing to do from the clock, hunger, pantry and job.
  plan(v) {
    const m = this.minute, home = this.doorstep(v), work = this.workSpot(v);
    const sleepFrom = v.job === 'baker' && v.start < 6 * 60 ? 20 * 60 + 30 : 22 * 60 + 30;
    const wake = Math.min(v.start - 75, 6 * 60 + 30);
    const asleep = m >= sleepFrom || m < wake;
    if (asleep) return this.goThen(v, home, { kind: 'sleep', at: 'home', until: wake < m ? wake + 24 * 60 : wake, activity: 'asleep at home' });
    if (!v.doneToday.breakfast) {
      v.doneToday.breakfast = true;
      const meal = this.cookable(v, 'breakfast');
      if (meal) return this.goThen(v, home, { kind: 'cook', at: 'home', meal, dur: 20, activity: `making ${meal[0]}` });
      const cafe = this.place('cafe');
      if (this.open(cafe) && v.wallet >= 9) return this.goThen(v, cafe.front, { kind: 'eatout', at: 'cafe', dur: 25, activity: 'having breakfast at the Commit Café' });
      if (this.open(this.place('bakery')) && v.wallet >= 5) return this.goThen(v, this.place('bakery').front, { kind: 'snack', at: 'bakery', good: 'bread', dur: 8, activity: 'grabbing a bread roll at the Bakery' });
    }
    const working = m >= v.start && m < v.end;
    if (working && !(m >= 12 * 60 && m < 13 * 60 && !v.doneToday.lunch && v.job !== 'publican')) {
      if (v.work === 'home') return this.goThen(v, home, { kind: 'work', at: 'home', until: v.end, activity: 'coding at home' });
      if (v.job === 'postie' && !v.doneToday.round && (this.place('post').stock.parcel || 0) > 0) return this.postRound(v);
      return this.goThen(v, work, { kind: 'work', at: v.work, until: Math.min(v.end, m < 12 * 60 && v.job !== 'publican' ? 12 * 60 : v.end), activity: this.workActivity(v) });
    }
    if (working && !v.doneToday.lunch) {
      v.doneToday.lunch = true;
      const cafe = this.place('cafe');
      if (this.rand() < 0.5 && this.open(cafe) && v.wallet >= 10) return this.goThen(v, cafe.front, { kind: 'eatout', at: 'cafe', dur: 30, activity: 'grabbing lunch at the Commit Café' });
      const meal = this.cookable(v, 'lunch');
      if (meal) { this.eat(v, meal[0], meal[1]); return this.goThen(v, this.place('square').front, { kind: 'idle', dur: 30, activity: `eating ${meal[0]} in the Market Square` }); }
      return this.goThen(v, this.place('bakery').front, { kind: 'snack', at: 'bakery', good: 'pie', dur: 15, activity: 'buying a pie for lunch' });
    }
    // After work: shopping when the pantry is low, then dinner, then the evening.
    if (!v.doneToday.shopping && m >= Math.min(v.end, 16 * 60) && m < 18 * 60 + 30) {
      const list = this.shoppingList(v);
      v.doneToday.shopping = true;
      if (list.length) return this.shop(v, list);
    }
    if (!v.doneToday.dinner && m >= 17 * 60 + 30 && m < 20 * 60 + 30) {
      v.doneToday.dinner = true;
      const meal = this.cookable(v, 'dinner');
      if (meal) return this.goThen(v, home, { kind: 'cook', at: 'home', meal, dur: 40, activity: `cooking ${meal[0]}` });
      const pub = this.place('pub');
      if (this.open(pub) && v.wallet >= 18) return this.goThen(v, pub.front, { kind: 'eatout', at: 'pub', dur: 50, activity: 'having dinner at The Merged Branch' });
      const near = ['bakery', 'store'].find((id) => this.open(this.place(id)) && (id === 'bakery' ? this.place(id).out.pie : this.place(id).stock.bread));
      if (near && v.wallet >= 5) return this.goThen(v, this.place(near).front, { kind: 'snack', at: near, good: near === 'bakery' ? 'pie' : 'bread', dur: 8, activity: `picking up ${near === 'bakery' ? 'a pie' : 'some bread'} for tea` });
    }
    // Leisure.
    const r = this.rand();
    if (m >= 19 * 60 && r < 0.35 && this.open(this.place('pub'))) return this.goThen(v, this.place('pub').front, { kind: 'idle', at: 'pub', dur: 60 + this.rand() * 60, activity: 'having a yarn at the pub' });
    if (r < 0.55) return this.goThen(v, this.jitter(this.place('square').front, 8), { kind: 'idle', dur: 20 + this.rand() * 30, activity: 'taking a stroll through the Market Square' });
    if (r < 0.8) {
      const friend = this.homes[Math.floor(this.rand() * this.homes.length)];
      return this.goThen(v, { x: friend.door.x, z: friend.door.z + 1.8 }, { kind: 'idle', dur: 15 + this.rand() * 20, activity: `visiting the neighbours at ${friend.coordinate} (${friend.name})`, visit: friend });
    }
    return this.goThen(v, home, { kind: 'idle', at: 'home', dur: 40, activity: 'pottering about at home' });
  }

  // Just outside the front door; anyone whose step is "at home" has gone inside.
  doorstep(v) { return { x: v.home.door.x, z: v.home.door.z + 0.9 }; }

  workSpot(v) {
    if (v.work === 'home') return this.doorstep(v);
    const p = this.place(v.work);
    if (p.field) return { x: p.field.x0 + 2 + this.rand() * (p.field.x1 - p.field.x0 - 4), z: p.field.z0 + 3 + this.rand() * (p.field.z1 - p.field.z0 - 6) };
    if (v.job === 'truck driver') return p.front;
    return this.jitter(p.front, 2);
  }
  workActivity(v) {
    const a = { farmer: 'working the paddock', 'dairy hand': 'milking the cows', 'poultry keeper': 'collecting eggs', shearer: 'tending the sheep', miller: 'grinding flour', baker: 'baking bread and pies',
      barista: 'pulling coffees', cook: 'cooking brekkies', grocer: 'stacking the vegie crates', shopkeeper: 'serving at the counter', butcher: 'cutting lamb', publican: 'pulling beers',
      postie: 'sorting the mail', 'truck driver': 'driving deliveries', teacher: 'teaching a class', nurse: 'seeing patients', mayor: 'running the town', 'station master': 'meeting the train',
      student: 'in class', retired: 'feeding the ducks', artist: 'painting the town' };
    return `${a[v.job] || 'working'} at the ${v.work === 'home' ? 'house' : this.place(v.work).name}`;
  }
  jitter(p, r) { return { x: p.x + (this.rand() - 0.5) * r * 2, z: p.z + (this.rand() - 0.5) * r * 0.6 }; }

  cookable(v, kind) { return MEALS[kind].find(([, need]) => Object.entries(need).every(([k, n]) => (v.pantry[k] || 0) >= n)) || null; }
  shoppingList(v) {
    const want = { bread: 2, eggs: 2, milk: 2, veg: 2, fruit: 1, lamb: 1 };
    return Object.entries(want).filter(([k, n]) => (v.pantry[k] || 0) < n).map(([k]) => k);
  }
  shop(v, list) {
    // Bread from the bakery, or the General Store once the bakery has shut.
    const where = { bread: this.open(this.place('bakery')) ? 'bakery' : 'store', pie: 'bakery', eggs: 'store', milk: 'store', veg: 'greengrocer', fruit: 'greengrocer', lamb: 'butcher' };
    const stops = [...new Set(list.map((g) => where[g]))].filter((id) => this.open(this.place(id)));
    if (!stops.length) return null;
    v.queue = stops.map((id) => ({ kind: 'buy', at: id, items: list.filter((g) => where[g] === id), dur: 5, activity: `shopping at the ${this.place(id).name}` }));
    v.queue.push({ kind: 'idle', at: 'home', dur: 10, activity: 'unpacking the shopping', target: this.doorstep(v) });
    const first = v.queue.shift();
    return this.goThen(v, this.place(first.at).front, first);
  }
  postRound(v) {
    v.doneToday.round = true;
    const post = this.place('post');
    const n = Math.min(post.stock.parcel || 0, 6);
    post.stock.parcel -= n;
    const stops = Array.from({ length: n }, () => this.homes[Math.floor(this.rand() * this.homes.length)]);
    v.queue = stops.map((h) => ({ kind: 'parcel', home: h, dur: 2, activity: `delivering a parcel to ${h.coordinate} (${h.name})`, target: { x: h.door.x, z: h.door.z + 1.4 } }));
    v.queue.push({ kind: 'work', at: 'post', until: v.end, activity: 'sorting the mail at the Post Office', target: post.front });
    const first = v.queue.shift();
    return this.goThen(v, first.target, first);
  }

  goThen(v, target, step) {
    v.step = { ...step, target };
    v.path = Math.hypot(target.x - v.x, target.z - v.z) < 1 ? [] : walkRoute(v, target);
    // Long trips are by bike; short ones on foot.
    let len = 0, prev = v; for (const p of v.path) { len += Math.abs(p.x - prev.x) + Math.abs(p.z - prev.z); prev = p; }
    v.bike = len > 160 && v.job !== 'retired';
    if (v.path.length) { v.inside = false; v.activity = `${v.bike ? 'cycling' : 'walking'} — ${step.activity}`; }
    else this.arrive(v);                       // already there
    return v.step;
  }

  eat(v, name, need) {
    for (const [k, n] of Object.entries(need || {})) v.pantry[k] = Math.max(0, (v.pantry[k] || 0) - n);
    v.hunger = 0; v.lastMeal = { name, at: this.minute, day: this.day };
    v.meals.unshift(`${name} (${fmt(this.minute)})`); v.meals.length = Math.min(v.meals.length, 5);
    this.stats.meals++;
  }

  liveVillager(v, minutes) {
    v.hunger = clamp(v.hunger + minutes * (v.step?.kind === 'sleep' ? 0.04 : 0.08), 0, 100);
    if (v.engaged) return;                   // chatting with the player: stands still
    if (v.path.length) {
      let budget = minutes * SEC_PER_MIN * (v.bike ? BIKE : WALK);
      while (budget > 0 && v.path.length) {
        const p = v.path[0], dx = p.x - v.x, dz = p.z - v.z, d = Math.hypot(dx, dz);
        if (d <= budget) { v.x = p.x; v.z = p.z; budget -= d; v.path.shift(); }
        else { v.x += (dx / d) * budget; v.z += (dz / d) * budget; budget = 0; }
        v.heading = Math.atan2(dx, dz);
      }
      if (!v.path.length) this.arrive(v);
      return;
    }
    const s = v.step;
    if (!s) { this.plan(v); return; }
    if (s.dur !== undefined) { s.dur -= minutes; if (s.dur <= 0) this.finish(v); return; }
    if (s.until !== undefined) {
      const until = s.until % (24 * 60), past = s.kind === 'sleep' ? (this.minute >= until && this.minute < until + 60) : this.minute >= s.until;
      if (past) this.finish(v);
      return;
    }
    this.finish(v);
  }

  arrive(v) {
    const s = v.step; if (!s) return;
    v.activity = s.activity;
    v.inside = s.at === 'home';
    if (s.kind === 'snack') this.snack(v, s.at, s.good);
    if (s.kind === 'eatout' || s.kind === 'buy' || s.kind === 'parcel') {
      // These happen on arrival; the step's duration is the time spent there.
      if (s.kind === 'eatout') this.eatOut(v, s.at);
      if (s.kind === 'buy') this.buy(v, s.at, s.items);
      if (s.kind === 'parcel') { this.parcels.push({ coordinate: s.home.coordinate, x: s.home.door.x + 0.6, z: s.home.door.z + 0.6, from: v.name }); this.stats.parcels++; }
    }
    if (s.visit) v.seen.unshift(s.visit.coordinate);
  }

  finish(v) {
    const s = v.step;
    if (s?.kind === 'cook' && s.meal) this.eat(v, s.meal[0], s.meal[1]);
    if (s?.kind === 'work' && this.minute >= v.end - 1 && v.paidDay !== this.day) this.pay(v);
    if (s?.kind === 'idle' && s.at === 'home' && v.carrying) {
      for (const [k, n] of Object.entries(v.carrying)) v.pantry[k] = (v.pantry[k] || 0) + n;
      v.carrying = null;
    }
    v.step = null;
    if (v.queue?.length) { const next = v.queue.shift(); this.goThen(v, next.target || this.place(next.at).front, next); return; }
    this.plan(v);
  }

  eatOut(v, where) {
    const p = this.place(where), menu = OUT_MEALS[where] || OUT_MEALS.cafe;
    const [dish, price] = menu[Math.floor(this.rand() * menu.length)];
    const uses = where === 'pub' ? ['lamb', 'veg', 'pie'] : ['bread', 'eggs', 'milk', 'coffee'];
    const ok = uses.some((g) => (p.stock[g] || 0) > 0);
    if (!ok || v.wallet < price) { v.activity = `found the ${p.name} out of food`; this.log(`The ${p.name} ran out of food and had to turn ${v.name} away.`); return; }
    for (const g of uses) if ((p.stock[g] || 0) > 0) { p.stock[g]--; break; }
    v.wallet -= price; p.till += price; p.grossSales=(p.grossSales||0)+price; this.finance.record('npc:'+v.id,'register:'+p.id,price,'restaurant meal'); this.stats.mealsOut++;
    this.eat(v, dish); v.activity = `${v.step.activity} — ${dish}`;
  }

  // Buys one item and eats it on the spot (a roll for breakfast, a pie for lunch).
  snack(v, shopId, good) {
    const shop = this.place(shopId), src = shopId === 'bakery' ? shop.out : shop.stock, price = GOODS[good].price;
    if (!this.open(shop) || !(src[good] > 0) || v.wallet < price) { v.memory = `the ${shop.name} had no ${GOODS[good].name} left`; v.activity = `found the ${shop.name} out of ${GOODS[good].name}`; return; }
    src[good]--; v.wallet -= price; shop.till += price; shop.grossSales=(shop.grossSales||0)+price; this.finance.record('npc:'+v.id,'register:'+shop.id,price,'snack '+good); this.stats.sold[good] = (this.stats.sold[good] || 0) + 1;
    this.eat(v, good === 'pie' ? 'a meat pie from the Bakery' : 'a fresh bread roll');
  }

  buy(v, shopId, items) {
    const shop = this.place(shopId);
    const src = shopId === 'bakery' ? shop.out : shop.stock;
    const bag = v.carrying || {};
    const missing = [];
    for (const g of items) {
      const n = g === 'veg' || g === 'bread' ? 2 : 1;
      const have = src[g] || 0, price = GOODS[g].price * n;
      if (have >= n && v.wallet >= price) { src[g] -= n; bag[g] = (bag[g] || 0) + n; v.wallet -= price; shop.till += price; shop.grossSales=(shop.grossSales||0)+price; this.finance.record('npc:'+v.id,'register:'+shop.id,price,'groceries '+g); this.stats.sold[g] = (this.stats.sold[g] || 0) + n; }
      else missing.push(GOODS[g].name);
    }
    if (Object.keys(bag).length) v.carrying = bag;
    if (missing.length) { v.memory = `the ${shop.name} was out of ${missing.join(' and ')}`; if (this.rand() < 0.5) this.log(`${v.name} found the ${shop.name} out of ${missing.join(' and ')}.`); }
  }

  // Workers are paid at the end of each shift; the money comes back through the shops.
  pay(v){
    const base=WAGES[v.job]||45;
    const arrears=v.wageArrears||0;
    const wage=(this.isPublicPayroll(v.work)?this.treasury:(this.place(v.work)?.till||0)+(this.place(v.work)?.operating||0))>=base+arrears
      ?base+arrears:base;
    v.paidDay=this.day;
    const p=this.place(v.work),beforeTill=p?.till||0,beforeOperating=p?.operating||0;
    if(this.payWageSource(v.work,wage)){
      v.wallet+=wage;this.stats.wagesPaid+=wage;
      v.wageArrears=Math.max(0,arrears-(wage-base));
      if(this.isPublicPayroll(v.work)){
        const stateFunded=v.work==='school'||v.work==='clinic';
        this.finance.record(stateFunded?'state':'council','npc:'+v.id,wage,'public wages and arrears '+v.job);
        const field=stateFunded?'stateSpending':'councilSpending';
        this.finance.daily[field]+=wage;
        this.finance.lifetime[field]+=wage;
      }else if(p){
        const cash=beforeTill-(p.till||0),bank=beforeOperating-(p.operating||0);
        if(cash>0)this.finance.record('register:'+p.id,'npc:'+v.id,cash,'wages '+v.job);
        if(bank>0)this.finance.record('business:'+p.id,'npc:'+v.id,bank,'wages '+v.job);
        p.payrollPaid=(p.payrollPaid||0)+wage;
      }
      const withheld=this.finance.taxNpcWage(v,wage);
      if(withheld)this.log(v.name+' paid $'+withheld+' income tax to council.');
      if(wage>base)this.log(v.name+' received $'+(wage-base)+' of previously unpaid wages.');
      this.log(v.name+' was paid $'+wage+' gross from '+(this.isPublicPayroll(v.work)?'council':p?.name)+'.');
    }else{
      v.wageArrears=arrears+base;
      this.stats.wagesOwed+=base;
      this.log(v.name+' is owed $'+v.wageArrears+' by '+(p?.name||'the town')+'.');
    }
  }

  // ── For chat, the guide and the ledger ──
  describe(v) {
    const last = v.lastMeal ? `${v.lastMeal.name} at ${fmt(v.lastMeal.at)}${v.lastMeal.day !== this.day ? ' yesterday' : ''}` : 'nothing yet today';
    const pantry = Object.entries(v.pantry).filter(([, n]) => n > 0).map(([k, n]) => amount(k, n)).join(', ') || 'nothing much';
    return { name: v.name, job: v.job, workplace: v.work === 'home' ? 'from home' : this.place(v.work).name, home: `${v.home.coordinate} (${v.home.name})`,
      now: v.activity, lastMeal: last, recentMeals: v.meals, hungry: v.hunger > 60, pantry, wallet: v.wallet, carrying: v.carrying, memory: v.memory || null };
  }
  news(n = 6) { return this.events.slice(0, n); }
  ledger() {
    const shops = [...this.places.values()].filter(p=>p.target).map(p=>({id:p.id,name:p.name,stock:p.stock,till:p.till,operating:p.operating,grossSales:p.grossSales,open:this.open(p)}));
    const farms = [...this.places.values()].filter((p) => p.kind === 'farm').map((p) => ({ name: p.name, makes: GOODS[p.makes].name, waiting: p.out[p.makes] || 0, growth: p.growth }));
    return { day: this.day, time: fmt(this.minute), stats: this.stats, yesterday: this.yesterday || null, shops, farms, economy:this.finance.audit(), trucks: this.trucks.map((t) => ({ driver: t.driver?.name, state: t.state, load: t.load })), parcels: this.parcels.length, news: this.news(12),
      finance:{treasury:this.treasury,player:this.money.snapshot(),wagesPaid:this.stats.wagesPaid,wagesOwed:this.stats.wagesOwed,wholesale:this.stats.wholesale},
      population: this.villagers.length, atWork: this.villagers.filter((v) => v.step?.kind === 'work').length, asleep: this.villagers.filter((v) => v.step?.kind === 'sleep').length };
  }

  // Saves just what matters to resume tomorrow where the town left off.
  snapshot() { return {day:this.day,minute:this.minute,treasury:this.treasury,money:this.money.snapshot(),finance:this.finance.snapshot(),places:[...this.places.values()].map(p=>[p.id,p.stock,p.out,p.till,p.growth,p.supervisedBatch||null,p.operating,p.grossSales,p.payrollPaid||0,p.costOfGoods||0,p.wholesaleRevenue||0,p.lifetimeExpenses||0,p.unpaidBills||0,p.dailyExpenses||0]),villagers:this.villagers.map(v=>[v.id,v.pantry,v.wallet,v.lastMeal,v.meals,v.paidDay||null,v.wageArrears||0,v.housingArrears||0])}; }
  restore(s) {
    if (!s || typeof s !== 'object') return;
    this.day=s.day||1;this.minute=s.minute||7*60;
    if(Number.isSafeInteger(s.treasury)&&s.treasury>=0)this.treasury=s.treasury;
    this.money.restore(s.money);
    if(s.finance)this.finance.restore(s.finance);
    else this.finance.lastClosedDay=this.day; // do not back-bill users upgrading from old saves
    for(const [id,stock,out,till,growth,supervisedBatch,operating,grossSales,payrollPaid,costOfGoods,wholesaleRevenue,lifetimeExpenses,unpaidBills,dailyExpenses]of s.places||[]){const p=this.place(id);if(p)Object.assign(p,{stock,out,till,growth:growth??p.growth,supervisedBatch:supervisedBatch||null,operating:Number.isSafeInteger(operating)&&operating>=0?operating:p.operating,grossSales:Number.isSafeInteger(grossSales)&&grossSales>=0?grossSales:0,payrollPaid:payrollPaid||0,costOfGoods:costOfGoods||0,wholesaleRevenue:wholesaleRevenue||0,lifetimeExpenses:lifetimeExpenses||0,unpaidBills:unpaidBills||0,dailyExpenses:dailyExpenses||0});}
    for(const [id,pantry,wallet,lastMeal,meals,paidDay,wageArrears,housingArrears]of s.villagers||[]){const v=this.villagers[id];if(v)Object.assign(v,{pantry,wallet,lastMeal,meals:meals||[],paidDay:paidDay||null,wageArrears:wageArrears||0,housingArrears:housingArrears||0});}
  }
}
