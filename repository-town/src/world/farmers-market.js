// Repo Town Farmers' Market in Market Square, modelled on the Dubbo Farmers Market (8 am–12 pm on
// the 1st and 3rd Saturday of each month, about 60 stalls of local produce, run by volunteers).
// Repo Town's square fits twelve 3 m × 3 m sites, the standard stall size in NSW market packs.
// Food stalls follow the NSW temporary-event rules those packs cite (Food Act 2003, Food
// Authority guidance); stalls cooking with gas carry a fire extinguisher and fire blanket, and
// every marquee is held down with leg weights. Stall businesses and stallholders are fictional;
// prices are illustrative 2026 prices. Pure layout and rules here; buildFarmersMarket draws it.
import * as THREE from 'three';
import { Builder } from './builder.js';
import { townDate } from './town-calendar.js';
import { makePerson } from './npcs.js';

export const MARKET_OPEN = 8 * 60, MARKET_CLOSE = 12 * 60;
// 1st and 3rd Saturday of the month.
export function isMarketDay(day) {
  const d = townDate(day);
  return d.weekday === 6 && (d.dayOfMonth <= 7 || (d.dayOfMonth >= 15 && d.dayOfMonth <= 21));
}
export function marketOpen(day, minute) { return isMarketDay(day) && minute >= MARKET_OPEN && minute < MARKET_CLOSE; }
// Stalls stand from set-up (6:30) until pack-down is finished (13:00).
export function marketStanding(day, minute) { return isMarketDay(day) && minute >= 390 && minute < 780; }
export function nextMarketDay(day) { for (let d = day; d < day + 40; d++) if (isMarketDay(d)) return d; return null; }

// Item kinds: good = a town good that goes in your bag; eat = eaten now (hunger), drink = coffee (rest).
export const STALLS = Object.freeze([
  { id: 'veg', name: 'Macquarie Flats Growers', what: 'Seasonal fruit and vegetables', holder: 'Trish', canopy: 0xffffff, stripe: 0x2f8a46,
    produce: [0xc0392b, 0x6aa84f, 0xe69138, 0x8e7c3c], items: [['Tomatoes, 1 kg', 6, { good: 'veg' }], ['Asparagus, bunch', 5, { good: 'veg' }], ['Strawberries, punnet', 5, { good: 'fruit' }], ['Navel oranges, 2 kg bag', 7, { good: 'fruit' }]] },
  { id: 'herbs', name: 'Little Plains Nursery', what: 'Herbs, seedlings and plants', holder: 'Mei', canopy: 0x5fae4f,
    produce: [0x3f8f3f, 0x6abf5a, 0x2e6b30, 0x9cc95a], items: [['Herb seedling punnet', 4.5, {}], ['Potted basil', 7, {}], ['Tomato seedlings, 6 pack', 6, {}]] },
  { id: 'bread', name: 'Wheatbelt Sourdough', what: 'Bread from a wood-fired oven', holder: 'Callum', canopy: 0xd9b26a,
    produce: [0xb07a3c, 0xc98d4a, 0x8d5a2b], items: [['Sourdough loaf', 9, { good: 'bread' }], ['Fruit loaf', 10, { good: 'bread' }], ['Cinnamon scroll', 5, { eat: 15 }]] },
  { id: 'meat', name: 'Talbragar Paddock Meats', what: 'Local pork, beef and lamb (chilled)', holder: 'Ray', canopy: 0xffffff, stripe: 0xa83232,
    produce: [0x9b2f2f, 0xc85a5a, 0x7d2424], items: [['Lamb chops, 1 kg', 24, { good: 'lamb' }], ['Pork sausages, 1 kg', 14, { good: 'lamb' }], ['Beef mince, 1 kg', 16, { good: 'lamb' }]] },
  { id: 'oil', name: 'Orana Olive Grove', what: 'Extra virgin olive oil and olives', holder: 'Sofia', canopy: 0x7e8f3a,
    produce: [0x9aa83a, 0x55602a, 0xc2c45a], items: [['Olive oil, 500 ml', 18, {}], ['Marinated olives, jar', 10, {}]] },
  { id: 'jams', name: "Nan Joyce's Preserves", what: 'Jams, chutneys and marinades', holder: 'Joyce', canopy: 0xffffff, stripe: 0xc0392b,
    produce: [0x8e1f2f, 0xe67e22, 0xb03a2e, 0xf1c40f], items: [['Apricot jam', 8, {}], ['Tomato chutney', 8, {}], ['Plum sauce', 9, {}]] },
  { id: 'honey', name: 'Box Gum Apiary', what: 'Local honey and beeswax', holder: 'Dave', canopy: 0xf2c14e,
    produce: [0xe0a526, 0xf4c542, 0xc98a14], items: [['Yellow box honey, 500 g', 12, {}], ['Honeycomb', 15, {}], ['Beeswax wraps', 14, {}]] },
  { id: 'wine', name: 'Cudgegong Ridge Wines', what: 'Regional wine, tastings (18+, RSA)', holder: 'Anika', canopy: 0x6b2a3a,
    produce: [0x4a1020, 0x7a1f35, 0xe8d9a8], items: [['Shiraz, bottle', 28, { adult: true }], ['Riesling, bottle', 24, { adult: true }]] },
  { id: 'nuts', name: 'River Bend Pecans', what: 'Nuts and dried fruit', holder: 'George', canopy: 0x8d6e4a,
    produce: [0x7a4f2a, 0x9c6b3c, 0xc69c6d], items: [['Pecans, 500 g', 14, {}], ['Dried apricots, 250 g', 8, {}], ['Roasted almonds, 250 g', 9, {}]] },
  { id: 'eggs', name: 'Free Range Hill Eggs', what: 'Eggs and seasonal produce', holder: 'Bec', canopy: 0x3a7ab8,
    produce: [0xf2e6c9, 0xd9b98f, 0xf7efe0], items: [['Free-range eggs, dozen', 8, { good: 'eggs' }], ['Duck eggs, half dozen', 7, { good: 'eggs' }]] },
]);
// Hot food and coffee: a coffee van and the community sausage sizzle (a fundraiser for a local club).
export const FOOD = Object.freeze([
  { id: 'coffee', name: 'Black Dog Coffee Van', what: 'Coffee from a converted van', holder: 'Jess', items: [['Flat white', 5, { drink: 15 }], ['Long black', 4.5, { drink: 15 }], ['Hot chocolate', 5, { drink: 8 }]] },
  { id: 'sizzle', name: 'Lions Club sausage sizzle', what: 'Community fundraiser barbecue', holder: 'Bill', items: [['Sausage in bread', 4, { eat: 25 }], ['Bacon and egg roll', 10, { eat: 40 }], ['Bottle of water', 2, { drink: 3 }]] },
]);

// Square-local layout (metres; the square's centre is at its lot centre, +z towards the street).
// Back row of six 3 m sites, two on each side, the coffee van and sizzle near the street.
const BACK = [-9, -5.4, -1.8, 1.8, 5.4, 9].map((x) => ({ x, z: -16.6, yaw: 0 }));
const SIDES = [{ x: -10.4, z: -9.6, yaw: Math.PI / 2 }, { x: -10.4, z: 0.2, yaw: Math.PI / 2 }, { x: 10.4, z: -9.6, yaw: -Math.PI / 2 }, { x: 10.4, z: 0.2, yaw: -Math.PI / 2 }];
export function marketLayout() {
  const sites = [...BACK, ...SIDES];
  const stalls = STALLS.map((s, i) => ({ ...s, ...sites[i] }));
  const food = [{ ...FOOD[0], x: 7.2, z: 6.6, yaw: Math.PI, van: true }, { ...FOOD[1], x: -5.8, z: 7.2, yaw: Math.PI }];
  return { stalls, food, info: { x: -2.4, z: 7.6, yaw: Math.PI } };
}
// Where a customer stands to be served: 1.6 m in front of the trestle, facing it.
export function servePoint(site) {
  // The van serves from its side hatch; everything else across the front of the table.
  const lx = site.van ? 2.4 : 0, lz = site.van ? 0.2 : 2.9;
  return { x: site.x + lx * Math.cos(site.yaw) + lz * Math.sin(site.yaw), z: site.z - lx * Math.sin(site.yaw) + lz * Math.cos(site.yaw) };
}

export function buyAtStall(life, stallId, index) {
  const all = [...STALLS, ...FOOD], s = all.find((x) => x.id === stallId), me = life.civic.player;
  if (!s || !s.items[index]) return 'That stall has packed up.';
  if (!marketOpen(life.day, life.minute)) return 'The market is closed. It runs 8 am to 12 pm on the 1st and 3rd Saturday of the month.';
  const [name, price, kind] = s.items[index];
  if (kind.adult && me.age !== undefined && me.age < 18) return 'Wine is sold to over-18s only (RSA).';
  if ((me.wallet || 0) < price) return `${name} is $${price.toFixed(2)}; you have $${(me.wallet || 0).toFixed(2)}.`;
  me.wallet = Math.round((me.wallet - price) * 100) / 100;
  let note = 'Into your bag.';
  if (kind.good) { me.bag = me.bag || {}; me.bag[kind.good] = (me.bag[kind.good] || 0) + 1; }
  else if (kind.eat) { me.hunger = Math.max(0, (me.hunger || 0) - kind.eat); note = 'You eat it at the market. Less hungry.'; }
  else if (kind.drink) { me.fatigue = Math.max(0, (me.fatigue || 0) - kind.drink); note = 'You drink it standing by the fountain.'; }
  else { me.marketGoods = me.marketGoods || {}; me.marketGoods[name] = (me.marketGoods[name] || 0) + 1; }
  life.civic.marketTakings = (life.civic.marketTakings || 0) + price;
  life.log(`A visitor bought ${name.toLowerCase()} at the ${s.name} stall.`);
  return `${s.holder} hands you the ${name.toLowerCase()}: $${price.toFixed(2)}. ${note}`;
}

// Draws the stalls (shown only while they stand), stallholders, a few shoppers and the info tent.
export function buildFarmersMarket(group, at) {
  const L = marketLayout(), root = new THREE.Group(); root.name = "Farmers' market"; root.position.set(at.x, 0, at.z);
  const b = new Builder(), colliders = [], people = [];
  const site = (s, fn) => b.at(s.x, 0, s.z, s.yaw, fn);
  for (const s of L.stalls) site(s, () => {
    // 3 x 3 m marquee: four legs with weights, canopy (striped where the stall has a stripe), valance.
    for (const lx of [-1.45, 1.45]) for (const lz of [-1.45, 1.45]) { b.box(0xdddddd, .05, 2.35, .05, lx, 1.18, lz); b.box(0x555b60, .32, .14, .32, lx, .07, lz); }
    b.box(s.canopy, 3.1, .06, 3.1, 0, 2.4, 0);
    if (s.stripe) for (let k = -1; k <= 1; k++) b.box(s.stripe, .45, .065, 3.12, k * 1.0, 2.405, 0);
    b.box(s.stripe || s.canopy, 3.1, .22, .03, 0, 2.27, 1.55);
    // Trestle table at the front with a cloth, produce in crates, a chalkboard price sign.
    b.box(0xf3efe6, 2.6, .05, .8, 0, .76, .95); b.box(0xf3efe6, 2.6, .5, .02, 0, .5, 1.35);
    for (const lx of [-1.2, 1.2]) b.box(0x6b5440, .05, .74, .7, lx, .37, .95);
    s.produce.forEach((c, k) => { const x = -0.95 + k * (1.9 / Math.max(1, s.produce.length - 1)); b.box(0x8b6b45, .5, .16, .4, x, .86, .95); b.box(c, .44, .12, .34, x, .97, .95); });
    b.box(0x2b2b2b, .55, .7, .04, 1.65, .55, 1.75); b.box(0x8b6b45, .6, .06, .06, 1.65, .92, 1.75);
    b.box(0x9fb7c8, .45, .35, .35, -1.0, .18, -.6);   // esky / stock under the canopy
  });
  for (const f of L.food) site(f, () => {
    if (f.van) {
      // Converted van: body, serving hatch with awning, menu board, generator-free (battery) set-up.
      b.box(0x2d2d2d, 2.0, 2.1, 4.4, 0, 1.25, 0); b.box(0x1a1a1a, 1.9, .5, 4.3, 0, .25, 0);
      b.box(0xf2efe8, .04, .8, 1.8, 1.02, 1.55, .2); b.box(0xb5502f, .9, .05, 2.0, 1.45, 2.15, .2);
      for (const wz of [-1.5, 1.5]) for (const wx of [-.9, .9]) b.cyl(0x111111, .34, .25, wx, .34, wz, 0, Math.PI / 2);
      b.box(0x222222, .05, .9, .7, 1.2, 1.0, -1.4);
    } else {
      // Gazebo with a gas barbecue, gas bottle, fire extinguisher and blanket (the gas-stall requirement).
      for (const lx of [-1.45, 1.45]) for (const lz of [-1.45, 1.45]) { b.box(0xdddddd, .05, 2.35, .05, lx, 1.18, lz); b.box(0x555b60, .32, .14, .32, lx, .07, lz); }
      b.box(0x1f4e9a, 3.1, .06, 3.1, 0, 2.4, 0); b.box(0xf2c14e, 3.1, .22, .03, 0, 2.27, 1.55);
      b.box(0x3b3b3b, 1.6, .85, .7, 0, .43, .3); b.box(0x777777, 1.5, .05, .6, 0, .88, .3);
      b.cyl(0xd7d7d7, .16, .6, 1.1, .3, -.2); b.cyl(0xc0392b, .09, .5, -1.2, .25, .9); b.box(0xc0392b, .25, .3, .05, -1.2, 1.2, 1.4);
      b.box(0xf3efe6, 1.8, .05, .7, 0, .76, 1.35);
    }
  });
  // Market information tent: organiser's table, map board, lost property, hand-wash station.
  site(L.info, () => { for (const lx of [-1, 1]) for (const lz of [-1, 1]) b.box(0xdddddd, .05, 2.2, .05, lx, 1.1, lz); b.box(0x2f8a46, 2.1, .06, 2.1, 0, 2.25, 0); b.box(0xf3efe6, 1.6, .05, .6, 0, .76, .7); b.box(0xeeeeee, .9, 1.1, .05, -.6, 1.1, -.9); b.box(0x4b8cc7, .4, .8, .4, 1.4, .4, .4); });
  root.add(b.build());
  // Colliders (world): trestle tables (stand on top 0.76 m), the van body, the barbecue.
  const rot = (s, lx, lz) => ({ x: at.x + s.x + lx * Math.cos(s.yaw) + lz * Math.sin(s.yaw), z: at.z + s.z - lx * Math.sin(s.yaw) + lz * Math.cos(s.yaw) });
  const box = (s, lx, lz, hw, hd, top) => { const c = rot(s, lx, lz), turned = Math.abs(Math.sin(s.yaw)) > .5, w = turned ? hd : hw, d = turned ? hw : hd; colliders.push({ x0: c.x - w, x1: c.x + w, z0: c.z - d, z1: c.z + d, top }); };
  for (const s of L.stalls) box(s, 0, .95, 1.3, .4, .76);
  box(L.food[0], 0, 0, 1.0, 2.2, 2.3); box(L.food[1], 0, .3, .8, .35, .88); box(L.info, 0, .7, .8, .3, .76);
  // Stallholders behind each table; a few shoppers on market mornings.
  const person = (seed, shirt, x, z, yaw, scale = 1) => { const p = makePerson(seed, shirt, 0x2f3542); p.group.position.set(x, 0, z); p.group.rotation.y = yaw; p.group.scale.setScalar(scale); root.add(p.group); people.push(p); };
  [...L.stalls, ...L.food].forEach((s, i) => { const c = rot(s, 0, s.van ? 0 : -0.1); person(101 + i * 17, s.stripe || s.canopy || 0x6b4f3a, c.x - at.x, c.z - at.z, s.yaw); });
  const shoppers = [[-6, -12.5, Math.PI], [-1, -12.6, Math.PI], [4.6, -12.8, Math.PI], [-7.6, -9.4, -Math.PI / 2], [7.4, .4, Math.PI / 2], [6.1, 3.4, 0], [-6.6, 3.6, 0], [2.5, -2.0, 2.2], [-2.3, 1.6, -.8]];
  shoppers.forEach(([x, z, y], i) => person(500 + i * 29, [0x3a7ab8, 0xc0392b, 0x6aa84f, 0xe69138, 0x8e44ad, 0x34495e][i % 6], x, z, y, i === 7 ? 0.6 : 1));
  group.add(root);
  root.visible = false;
  const spots = [...L.stalls, ...L.food].map((s) => { const p = servePoint(s); return { key: 'market:' + s.id, market: s.id, pos: new THREE.Vector3(at.x + p.x, 0, at.z + p.z), label: `${s.name} · ${s.what}` }; });
  spots.push({ key: 'market:info', market: 'info', pos: new THREE.Vector3(at.x + L.info.x, 0, at.z + L.info.z + 1.8), label: 'Market information tent' });
  return { root, colliders, spots, people, layout: L,
    // Tables block only while the stalls stand; call update each frame with the town clock.
    // While packed away a negative top makes the colliders harmless (never block, never stood on).
    update(day, minute) { root.visible = marketStanding(day, minute); for (const c of colliders) c.top = root.visible ? c.topWhenUp ?? (c.topWhenUp = c.top) : -1; } };
}

export function stallPanel(life, stallId, buy) {
  const all = [...STALLS, ...FOOD], s = all.find((x) => x.id === stallId);
  if (stallId === 'info') return { title: "Repo Town Farmers' Market · information", body: `<p>Open 8 am to 12 pm on the 1st and 3rd Saturday of the month, modelled on the Dubbo Farmers Market (Macquarie Valley Food & Wine Inc., about 60 stalls). Twelve 3 × 3 m sites here; all stallholders grow, make or raise what they sell.</p><p>Bring a bag: single-use plastic bags are not provided. Hand-wash station beside this tent. Wine is sold to over-18s only.</p><p><small>Stall businesses and stallholders are fictional; prices are illustrative.</small></p>`, actions: [] };
  if (!s) return { title: 'Stall', body: '<p>Packed up.</p>', actions: [] };
  return { title: `${s.name}`, body: `<p>${s.what}. ${s.holder} is serving.</p><p><small>Prices are illustrative 2026 prices.</small></p>`,
    actions: s.items.map(([name, price], i) => ({ label: `${name} · $${price.toFixed(2)}`, run: () => ({ title: s.name, body: `<p>${buy(stallId, i)}</p>`, actions: [] }) })) };
}
export function marketNotice(day, minute) {
  const next = nextMarketDay(day), open = marketOpen(day, minute);
  return { title: 'Market Square notice board', body: `<p>${open ? "The farmers' market is on now, until 12 pm." : `Next farmers' market: ${next ? townDate(next).label : 'to be announced'}, 8 am to 12 pm.`}</p><p>Every 1st and 3rd Saturday: local fruit and veg, sourdough, meat, eggs, honey, olive oil, preserves, nuts, wine tastings, coffee and the Lions sausage sizzle.</p>`, actions: [] };
}
