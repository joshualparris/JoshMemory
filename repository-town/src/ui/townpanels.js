// Panels for town life: shop counters, farms, the Town Ledger and the town guide, plus
// the gossip and Expedition relic hints villagers share in conversation (src/ui/npc.js).
import { GOODS, amount, timeText, CANDIDATES } from '../world/life.js';
import { locateVillager } from './npc-location.js';
import { RELICS, PROGRESS_KEY, cleanProgress } from '../adventure/data.js';
import { esc } from './interactions.js';

const list = (o) => Object.entries(o || {}).filter(([, n]) => n > 0).map(([g, n]) => amount(g, n)).join(', ') || 'nothing';
const hours = (p) => (p.opens === 0 && p.closes >= 1440 ? 'open all hours' : `${timeText(p.opens)}–${timeText(p.closes)}`);

// How each place works, so the town reads as a real supply chain.
const ABOUT = {
  hall: 'The mayor keeps the Town Ledger here: every harvest, delivery, sale and meal in town is written down.',
  store: 'Eggs from the Chook Shed, milk from the Dairy, flour from the Mill, bread from the Bakery, and coffee and tea off the morning freight train.',
  bakery: 'The bakers start at half past four. Each hour two bags of flour make eight loaves; flour, lamb and vegetables make meat pies.',
  cafe: 'Brekkie and lunch from 6:30. The cook uses bread, eggs and milk delivered each morning; the coffee comes in on the train.',
  greengrocer: 'Vegetables from the Market Garden and fruit from the Orchard, brought in by truck.',
  butcher: 'Lamb from the Sheep Station, cut fresh each morning.',
  square: 'The heart of town: benches, a fountain, market stalls, and the notice board with today\'s news.',
  pub: 'The Merged Branch opens at 11. Roasts, parmies and pies for dinner; a yarn and a cold drink after work.',
  post: 'The 7:00 freight train brings the mail. Trucks carry it here and the postie walks the parcels to people\'s doorsteps.',
  school: 'Classes from half past eight to three.',
  clinic: 'The town nurse sees patients from eight to five.',
  depot: 'The freight train is due at 6:40 and unloads coffee, tea and parcels at 7:00. Three trucks work out of here.',
  mill: 'Grain from the Wheat Farm goes in; every hour the miller grinds up to six bags of grain into four bags of flour.',
  sheep: 'Merino sheep graze the paddock across the road. The shearer brings in lamb for the butcher, the pub and the bakery\'s pies.',
  dairy: 'The cows are milked from five in the morning. Fresh milk goes to the store, the café and the bakery.',
  coop: 'The chooks roam the yard across the road; the poultry keeper collects eggs each morning.',
  orchard: 'Apple, orange and lemon trees. The more the trees ripen, the bigger the pick.',
  garden: 'Rows of cabbages, carrots, lettuce, beetroot and pumpkins, watered from the tank by the shed.',
  silo: 'Wheat grows in the paddock across the road; when it turns gold the tractor brings in the harvest and the grain goes to the mill.',
  farmhouse: 'The old homestead where the farm families have Sunday lunch.',
  bank: 'Keep your money safe between visits. Villagers bank their savings here too.',
  power: 'Solar panels carry the day; the generators burn fuel (by the drum, delivered from the depot) for the evening peak. If fuel runs out, the town goes dark.',
  waterworks: 'Pumps creek water through the filters into the reservoir. The pumps need power; without it the taps run dry.',
  sewage: 'Treats wastewater from every house. If it backs up, the creek gets polluted.',
  fire: 'Fire & Rescue: the crew checks hydrants, roads and power lines, and reports faults to the council.',
  recycling: 'Bins from every house are sorted here; the scrap goes to the foundry.',
  landfill: 'Where the town\'s rubbish ends up. The more people recycle, the slower it fills.',
  foundry: 'Ore off the train and scrap from recycling become metal and spare parts. Metal is exported by rail; parts keep the town\'s networks repaired.',
};
const pct = (n) => `<span class="bar"><span style="width:${Math.round(n)}%"></span></span> ${Math.round(n)}%`;
const money = (n) => `$${Math.round(n).toLocaleString('en-AU')}`;
function bagLine(life) { const me = life.civic.player; return `<p class="dim">🎒 Your bag: ${esc(Object.entries(me.bag).filter(([, n]) => n > 0).map(([g, n]) => amount(g, n)).join(', ') || 'empty')} · wallet ${money(me.wallet)} · savings ${money(me.bank)}</p>`; }

// Utilities, the bank, the fire station and the foundry (south side of street 8).
function civicPanel(life, id, again) {
  const p = life.place(id), c = life.civic, u = life.ledger().utilities, rows = [`<p>${esc(ABOUT[id] || '')}</p>`];
  const staff = life.villagers.filter((v) => v.work === id);
  if (id === 'power') rows.push(`<p><b>Supply:</b> ${c.supply.power} of ${c.supply.powerDemand} needed · ${c.supply.ok ? '<span class="ok">lights on</span>' : '<b>BLACKOUT</b>'} · weather ${esc(c.weather)}</p><p><b>Fuel:</b> ${u.fuel} drums</p>`);
  if (id === 'waterworks') rows.push(`<p><b>Reservoir:</b> ${u.reservoir} kL · supplying ${c.supply.water} of ${c.supply.waterDemand} an hour · ${c.supply.waterOk ? '<span class="ok">normal</span>' : '<b>restrictions</b>'}</p>`);
  if (id === 'sewage') rows.push(`<p><b>Waiting for treatment:</b> ${u.wastewater} kL · pollution ${Math.round(c.indicators.pollution)}%</p>`);
  if (id === 'recycling') rows.push(`<p><b>Sorting:</b> ${u.recycling} bags · recycled today ${life.stats.recycled}</p><p class="dim">Kerbside recycling waiting: ${Math.floor(c.homes.recyclables)} bags.</p>`);
  if (id === 'landfill') rows.push(`<p><b>Rubbish buried:</b> ${u.landfill} tonnes · environment ${Math.round(c.indicators.environment)}%</p>`);
  if (id === 'foundry') rows.push(`<p><b>Ore:</b> ${p.stock.ore || 0} · <b>metal:</b> ${p.stock.metal || 0} · <b>scrap:</b> ${p.stock.scrap || 0} · <b>parts ready:</b> ${p.out.parts || 0}</p>`);
  if (id === 'fire') rows.push(`<h3>Town networks</h3>${Object.entries(c.services).map(([k, v]) => `<p>${esc(k)} ${pct(v)}</p>`).join('')}<p class="dim">Repairs are ordered at the Town Hall.</p>`);
  if (id === 'bank') rows.push(`<p><b>Your wallet:</b> ${money(c.player.wallet)} · <b>savings:</b> ${money(c.player.bank)}</p><p class="dim">Town treasury: ${money(c.treasury)}. Villagers' savings: ${money(life.villagers.reduce((a, v) => a + (v.savings || 0), 0))}.</p>`);
  rows.push(`<p><b>Hours:</b> ${esc(hours(p))} · <b>Staff:</b> ${staff.map((v) => esc(`${v.name} (${v.job})`)).join(', ') || 'automated'}</p>`);
  const act = (label, fn) => ({ label, run: () => { const msg = fn(); return { ...again(), body: `<p><b>${esc(msg)}</b></p>` + again().body }; } });
  const actions = [];
  if (id === 'bank') actions.push(act('Deposit $20', () => life.bank('deposit', 20)), act('Withdraw $20', () => life.bank('withdraw', 20)));
  if (id === 'recycling') actions.push(act('Help sort kerbside recycling', () => life.collectRecycling()));
  return { title: `${p.name}`, body: rows.join('') + bagLine(life), actions, wide: true };
}

// Town Hall council: repairs, the mayoral election and the town books.
export function hallPanel(life) {
  const c = life.civic, again = () => hallPanel(life);
  const act = (label, fn) => ({ label, run: () => { const msg = fn(); const next = again(); return { ...next, body: `<p><b>${esc(msg)}</b></p>` + next.body }; } });
  const worst = Object.entries(c.services).sort((a, b) => a[1] - b[1])[0];
  return {
    title: 'Town Hall · Council', wide: true,
    body: `<p>Mayor <b>${esc(c.mayor)}</b> · next election day ${c.electionDay} · treasury ${money(c.treasury)} · tax ${Math.round(c.taxRate * 100)}% on sales, $15 a day in rates.</p>
      <p><b>Health</b> ${pct(c.indicators.health)} <b>Happiness</b> ${pct(c.indicators.happiness)} <b>Environment</b> ${pct(c.indicators.environment)}</p>
      <h3>Networks</h3>${Object.entries(c.services).map(([k, v]) => `<p>${esc(k)} ${pct(v)}</p>`).join('')}
      <p class="dim">A repair costs $90 and two boxes of spare parts (in stock: ${life.place('hall').stock.parts || 0}). Most worn: ${esc(worst[0])}.</p>` + bagLine(life),
    actions: [
      act(`Repair the ${worst[0]} network`, () => life.repair(worst[0])),
      ...CANDIDATES.map((n) => act(`Vote ${n}`, () => life.vote(n))),
      { label: 'Open the Town Ledger', run: () => ledgerPanel(life) },
    ],
  };
}

export function placePanel(life, id) {
  const p = life.place(id);
  if (p.side === 'south') return civicPanel(life, id, () => placePanel(life, id));
  if (id === 'hall') return hallPanel(life);
  const open = life.open(p);
  const staff = life.villagers.filter((v) => v.work === id);
  const here = staff.filter((v) => v.step?.kind === 'work' && !v.path.length);
  const visitors = life.villagers.filter((v) => v.step?.at === id && v.step.kind !== 'work' && !v.path.length);
  const rows = [];
  rows.push(`<p>${esc(ABOUT[id] || '')}</p>`);
  rows.push(`<p><b>Hours:</b> ${esc(hours(p))} · ${open ? '<span class="ok">open now</span>' : '<span class="dim">closed now</span>'} · it's ${esc(life.time())}</p>`);
  if (p.kind === 'farm') {
    rows.push(`<p><b>Crop:</b> <span class="bar"><span style="width:${Math.round(p.growth * 100)}%"></span></span> ${Math.round(p.growth * 100)}% grown</p>`);
    rows.push(`<p><b>Waiting for the truck:</b> ${esc(amount(p.makes, p.out[p.makes] || 0))}</p>`);
    rows.push(`<p><b>Harvested today:</b> ${esc(amount(p.makes, life.stats.harvested[p.makes] || 0))}</p>`);
  } else {
    const shelves = id === 'bakery' ? p.out : p.stock;
    if (p.target) rows.push(`<p><b>${id === 'bakery' ? 'On the shelves' : 'In stock'}:</b> ${esc(list(shelves))}</p>`);
    if (id === 'bakery') rows.push(`<p><b>Out the back:</b> ${esc(list(p.stock))}</p>`);
    if (id === 'mill') rows.push(`<p><b>Ready to go:</b> ${esc(list(p.out))}</p>`);
    if (id === 'depot') rows.push(`<p><b>On the platform:</b> ${esc(list(p.out))}</p><p><b>Trucks:</b> ${life.trucks.map((t) => esc(`${t.driver?.name || 'Spare truck'} — ${t.state}`)).join('<br>')}</p>`);
    if (p.till) rows.push(`<p><b>Takings so far:</b> $${p.till}</p>`);
  }
  rows.push(`<p><b>Working here:</b> ${staff.length ? staff.map((v) => esc(`${v.name} (${v.job}, ${timeText(v.start)}–${timeText(v.end)})${here.includes(v) ? ' — here now' : ''}`)).join(', ') : 'nobody'}</p>`);
  if (visitors.length) rows.push(`<p><b>Here now:</b> ${visitors.map((v) => esc(`${v.name}, ${v.activity}`)).join('; ')}</p>`);
  if (id === 'square' || id === 'hall') rows.push(`<h3>Town news</h3><ul class="news">${life.news(8).map((e) => `<li><span class="dim">${esc(e.t)}</span> ${esc(e.text)}</li>`).join('')}</ul>`);
  const shelves = id === 'bakery' ? p.out : p.stock;
  const sells = { store: p.sells, bakery: p.sells, greengrocer: p.sells, butcher: p.sells, cafe: ['pie', 'bread'], pub: ['pie'] }[id] || [];
  const me = life.civic.player, again = () => placePanel(life, id);
  const act = (label, fn) => ({ label, run: () => { const msg = fn(); const next = again(); return { ...next, body: `<p><b>${esc(msg)}</b></p>` + next.body }; } });
  const actions = sells.filter((g) => (shelves[g] || 0) > 0).slice(0, 4).map((g) => act(`Buy ${GOODS[g].unit === 'pie' ? 'a pie' : `a ${GOODS[g].unit} of ${GOODS[g].name}`} ($${GOODS[g].price})`, () => life.buyItem(id, g)));
  for (const g of sells.filter((g) => me.bag[g] > 0).slice(0, 2)) actions.push(act(`Sell back ${GOODS[g].name}`, () => life.sellItem(id, g)));
  for (const g of Object.keys(me.bag).filter((g) => me.bag[g] > 0 && ['bread', 'pie', 'fruit', 'veg'].includes(g)).slice(0, 1)) actions.push(act(`Eat the ${GOODS[g].name}`, () => life.eatItem(g)));
  if (id === 'post') actions.push(act('Post a letter to Mabel ($2)', () => life.postLetter('Mabel')));
  return { title: `${p.name} · ${p.kind === 'farm' ? 'farm' : p.kind}`, body: rows.join('') + (sells.length || id === 'post' ? bagLine(life) : ''), actions, wide: true };
}

export function ledgerPanel(life) {
  const L = life.ledger(), s = L.stats;
  const n = (o) => Object.entries(o).map(([g, k]) => esc(amount(g, k))).join(', ') || 'none yet';
  const y = L.yesterday;
  return {
    title: `Town Ledger · Day ${L.day}, ${L.time}`, wide: true,
    body: `<p><b>Population:</b> ${L.population} villagers · ${L.atWork} at work · ${L.asleep} asleep · ${life.homes.length} households.</p>
      <h3>Today</h3>
      <p><b>Harvested:</b> ${n(s.harvested)}<br><b>Milled:</b> ${s.milled} bags of flour · <b>Baked:</b> ${s.baked} loaves and pies<br>
      <b>Deliveries:</b> ${s.deliveries} truckloads — ${n(s.delivered)}<br><b>Sold in shops:</b> ${n(s.sold)}<br>
      <b>Meals:</b> ${s.meals} eaten (${s.mealsOut} at the café and pub) · <b>Parcels delivered:</b> ${s.parcels}</p>
      ${y ? `<p class="dim">Yesterday: ${y.deliveries} deliveries, ${y.baked} baked, ${y.meals} meals, ${y.parcels} parcels.</p>` : ''}
      <h3>Shops</h3><table class="ledger"><tr><th>Shop</th><th>Stock</th><th>Till</th></tr>${L.shops.map((p) => `<tr><td>${esc(p.name)} ${p.open ? '' : '<span class="dim">(closed)</span>'}</td><td>${esc(list(p.stock))}</td><td>$${p.till}</td></tr>`).join('')}</table>
      <h3>Farms</h3><table class="ledger"><tr><th>Farm</th><th>Crop</th><th>Waiting for pickup</th></tr>${L.farms.map((f) => `<tr><td>${esc(f.name)}</td><td>${Math.round(f.growth * 100)}% grown</td><td>${f.waiting} ${esc(f.makes)}</td></tr>`).join('')}</table>
      <h3>Council and utilities</h3><p>Mayor ${esc(L.civic.mayor)} · treasury ${money(L.civic.treasury)} · weather ${esc(L.civic.weather)} · power ${L.civic.supply.power}/${L.civic.supply.powerDemand} ${L.civic.supply.ok ? '' : '<b>(blackout)</b>'} · water ${L.civic.supply.water}/${L.civic.supply.waterDemand} · fuel ${L.utilities.fuel} drums · reservoir ${L.utilities.reservoir} kL<br>Taxes today ${money(s.taxes)} · wages ${money(s.wages)} · recycled ${s.recycled} · to landfill ${s.landfill}</p>
      <h3>Trucks</h3><p>${L.trucks.map((t) => esc(`${t.driver || 'Spare'}: ${t.state}`)).join('<br>')}</p>
      <h3>News</h3><ul class="news">${L.news.map((e) => `<li><span class="dim">${esc(e.t)}</span> ${esc(e.text)}</li>`).join('')}</ul>`,
  };
}

// The Town Guide kiosk near the start shows newcomers around.
export function guidePanel(life, opts) {
  const { go, ledger, chat, journal, arcade, speed, setSpeed, relic } = opts;
  const h = life.minute / 60;
  const hello = h < 5 ? "You're up late! Most of town is asleep" : h < 12 ? "Mornin'! The town's getting going" : h < 17 ? "G'day! It's a busy afternoon" : h < 21 ? 'Evening! People are heading home for tea' : "Evening! The pub's still going";
  const busy = life.ledger();
  const next = relic();
  return {
    title: '🗺️ Town Guide', wide: true,
    body: `<p>${hello} — it's <b>${esc(life.time())}</b> on day ${life.day}. ${busy.atWork} people are at work and ${busy.asleep} are asleep.</p>
      <p>Every one of the <b>188 houses</b> is built from a real GitHub repository, along 8 streets (rows 1–8, columns A–Z). Houses built from games have an arcade inside.</p>
      <p>Repository Town also grows and makes its own food. Farms across the road from the high street grow wheat, vegies and fruit and keep sheep, cows and chooks. Trucks from the Rail Depot carry it all to the Mill, the Bakery and the shops; people buy their groceries after work and cook at home, or eat at the Commit Café and The Merged Branch.</p>
      <h3>What's happening</h3><ul class="news">${life.news(4).map((e) => `<li><span class="dim">${esc(e.t)}</span> ${esc(e.text)}</li>`).join('')}</ul>
      ${next ? `<p><b>Adventure Guild:</b> twelve glowing relics hide outside houses; bring them to the Guild Chest beside this kiosk. Next clue: ${esc(next.clue)} <span class="dim">(${esc(next.name)})</span></p>` : '<p><b>Adventure Guild:</b> you\'ve found every relic. Legend!</p>'}
      <p><b>People:</b> stop any villager or resident (E or ✋) to ask what they ate, for gossip, a relic hint or a small errand. The town's characters (💬 NPCs) will chat about anything. <b>T</b> or the time button jumps the clock; 🔊 toggles sound.</p>
      <p class="dim">Time runs at ${speed()}× (a town day takes ${Math.round(72 / speed())} real minutes).</p>`,
    actions: [
      { label: '🥖 High street', run: () => go('bakery') }, { label: '🌳 Market Square', run: () => go('square') }, { label: '🐑 The farms', run: () => go('sheep') },
      { label: '🚂 Rail Depot', run: () => go('depot') }, { label: '📒 Town Ledger', run: ledger }, { label: '🕹️ Arcade (M5)', run: arcade },
      { label: '📖 Quest Journal', run: journal }, { label: '💬 Chat with Rowan', run: chat },
      { label: `⏩ Time ${[1, 4, 15].map((s) => (s === speed() ? `[${s}×]` : `${s}×`)).join(' ')}`, run: () => { const order = [1, 4, 15]; setSpeed(order[(order.indexOf(speed()) + 1) % order.length]); return guidePanel(life, opts); } },
    ],
  };
}

// Relics the player hasn't found yet, in journal order.
export function relicsLeft() {
  let progress = {}; try { progress = JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; } catch { /* storage blocked */ }
  const done = new Set(cleanProgress(progress).collected || []);
  return RELICS.filter((r) => !done.has(r.id));
}

// What a villager might pass on: news, what neighbours are up to, shortages.
export function gossip(life, v) {
  const others = life.villagers.filter((o) => o !== v);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const lines = life.news(10).filter((e) => !/begins/.test(e.text)).slice(0, 5).map((e) => e.text.replace(/\.$/, ''));
  for (let i = 0; i < 4; i++) { const o = pick(others); lines.push(`${o.name} the ${o.job} is ${o.activity.replace(/^(walking|cycling) — /, 'on the way to ')}`); }
  const short = life.ledger().shops.filter((s) => Object.values(s.stock).some((n) => n === 0)).map((s) => s.name);
  if (short.length) lines.push(`the ${short[0]} has run out of something again`);
  const hungry = others.find((o) => o.hunger > 70); if (hungry) lines.push(`${hungry.name} looked half-starved this morning`);
  return [...new Set(lines)];
}

// The facts a villager or resident brings to a conversation (fed to Groq and to the
// offline replies). `v` is a life villager, or null for a resident at home.
export function townContext(life, v, resident) {
  const left = relicsLeft();
  return {
    time: life.time(), day: life.day, daylight: life.isDay(),
    self: v ? life.describe(v) : null,
    // Observed current place must never be confused with the home or workplace.
    location: v ? locateVillager(life,v) : null,
    resident: resident || null,
    gossip: gossip(life, v),
    relics: left.slice(0, 3).map((r) => ({ name: r.name, clue: r.clue, hint: r.hint })),
    open: [...life.places.values()].filter((p) => p.target && life.open(p)).map((p) => p.name),
    trucks: life.trucks.map((t) => `${t.driver?.name || 'a spare truck'} is ${t.state}`),
  };
}
