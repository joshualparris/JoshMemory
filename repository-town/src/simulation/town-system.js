// Deterministic, offline-first civic simulation. No network, credentials, or repository data.
// One in-game minute equals one real second: a full town day takes 24 real minutes.
// This module has no DOM or Three.js dependencies and can be unit-tested in Node.
export const CREDIT = "TC";
export const SITES = [
  ["town-hall", "Town Hall", "🏛️", "civic"],
  ["bank", "Community Bank", "🏦", "finance"],
  ["post", "Post Office", "📮", "services"],
  ["market", "High Street Market", "🛒", "commerce"],
  ["bakery", "Bakery", "🥖", "commerce"],
  ["mill", "Flour Mill", "🌾", "industry"],
  ["clinic", "Health Clinic", "🏥", "services"],
  ["school", "School & Library", "📚", "services"],
  ["power", "Power Station", "⚡", "utilities"],
  ["waterworks", "Water Works", "💧", "utilities"],
  ["sewage", "Wastewater Works", "🚰", "utilities"],
  ["depot", "Freight Depot", "🚚", "transport"],
  ["recycling", "Recycling Centre", "♻️", "industry"],
  ["landfill", "Waste Depot", "🗑️", "utilities"],
  ["factory", "Foundry & Workshop", "🏭", "industry"],
  ["farm", "Community Farm", "🥕", "agriculture"],
  ["park", "Town Park", "🌳", "recreation"],
  ["fire", "Fire & Rescue", "🚒", "emergency"],
  ["cafe", "Community Café", "☕", "commerce"],
  ["council", "Public Works", "🔧", "services"],
];
const initialStores = {
  farm: { wheat: 24, vegetables: 18, fruit: 10, eggs: 9, milk: 9, compost: 5 },
  mill: { wheat: 8, flour: 12 },
  bakery: { flour: 10, bread: 10 },
  market: { bread: 16, vegetables: 12, fruit: 8, eggs: 6, milk: 6 },
  depot: { fuel: 90, wheat: 0, flour: 0, bread: 0, vegetables: 0, fruit: 0, eggs: 0, milk: 0 },
  power: { fuel: 200 }, waterworks: { cleanWater: 110 },
  sewage: { wastewater: 0 }, recycling: { recyclables: 0, scrap: 4 },
  landfill: { rubbish: 0 }, playerInventory: {}, factory: { ore: 30, metal: 8, parts: 16 },
  council: { parts: 8 }, homes: { rubbish: 0, recyclables: 0 },
};
const prices = { bread: 5, vegetables: 3, fruit: 4, eggs: 4, milk: 4, parts: 12 };
const work = ["farmer", "driver", "baker", "miller", "shopkeeper", "teacher", "nurse", "engineer", "recycler", "postie", "firefighter", "water operator", "council worker", "café cook", "mechanic", "librarian"];
const LIMIT = 90;
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function bounded(number, min, max) { return Math.min(max, Math.max(min, number)); }
function addLog(s, message) {
  s.events.unshift({ day: s.day, time: clockText(s.minute), message });
  if (s.events.length > LIMIT) s.events.length = LIMIT;
}
function stock(s, site, item) { return s.stores[site]?.[item] || 0; }
function take(s, site, item, amount) {
  const moved = Math.min(Math.max(0, amount), stock(s, site, item));
  s.stores[site][item] = stock(s, site, item) - moved;
  return moved;
}
function add(s, site, item, amount) {
  if (!s.stores[site]) s.stores[site] = {};
  s.stores[site][item] = stock(s, site, item) + amount;
}
function transfer(s, from, to, item, count) {
  const moved = take(s, from, item, count);
  add(s, to, item, moved);
  return moved;
}
export function clockText(minute) {
  const t = ((minute % 1440) + 1440) % 1440;
  return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0");
}
export function residentSchedule(hour, job = "worker") {
  if (hour < 6 || hour >= 22) return "asleep at home";
  if (hour < 8) return "having breakfast at home";
  if (hour < 12) return "working as " + job;
  if (hour < 13) return "eating lunch";
  if (hour < 17) return "working as " + job;
  if (hour < 19) return "shopping or travelling home";
  if (hour < 21) return "cooking, visiting friends or relaxing";
  return "getting ready for bed";
}
function weatherFor(day) { return ["sunny", "sunny", "cloudy", "rainy", "windy", "sunny", "cloudy"][(day - 1) % 7]; }
function seedState(population) {
  const residents = Array.from({ length: population }, (_, i) => ({
    id: "resident-" + (i + 1), name: "Resident " + (i + 1),
    job: work[i % work.length], home: Math.floor(i / 2) + 1,
  }));
  return {
    version: 1, minute: 480, day: 1, fractional: 0, population,
    mayor: "Rowan", ballots: {}, electionDay: 7, voted: false,
    wallet: 75, bankBalance: 150, householdCash: 2000, treasury: 4800, shopBalance: 700,
    taxRate: 0.1, budgets: { utilities: 35, services: 30, environment: 20, transport: 15 },
    stores: clone(initialStores), residents,
    services: { power: 100, water: 100, sewage: 100, roads: 100, waste: 100, post: 100 },
    supply: { electricity: 0, electricityDemand: 0, water: 0, waterDemand: 0, wastewater: 0 },
    indicators: { health: 90, happiness: 78, environment: 82, jobs: population, pollution: 3 },
    stats: { breadBaked: 0, meals: 0, deliveries: 0, letters: 0, recycled: 0, landfill: 0, harvest: 0, taxes: 0, wages: 0, repairs: 0 },
    letters: [], events: [], weather: weatherFor(1),
  };
}
function checkService(s, key, threshold = 35) { return s.services[key] >= threshold; }
function deliver(s, from, to, item, amount) {
  if (!checkService(s, "roads") || stock(s, "depot", "fuel") < 1) return 0;
  const n = transfer(s, from, to, item, amount);
  if (n) { take(s, "depot", "fuel", 1); s.stats.deliveries++; }
  return n;
}
function runHour(s) {
  const hour = Math.floor((s.minute % 1440) / 60);
  // External trading partners supply fuel and ore; imports cost actual public funds.
  // Foundry exports provide new income rather than silently conjuring treasury funds.
  if (hour === 8) {
    const imports = [
      ["power", "fuel", 45, 140, 140],
      ["depot", "fuel", 12, 60, 60],
      ["factory", "ore", 14, 48, 75],
      ["council", "parts", 3, 12, 100],
    ];
    for (const [site, item, below, qty, cost] of imports) {
      if (stock(s, site, item) < below && s.treasury >= cost) {
        s.treasury -= cost; add(s, site, item, qty);
        addLog(s, "External supplier delivered " + qty + " " + item + " to " + site + " for " + cost + " TC.");
      }
    }
  }
  if (hour === 16 && stock(s, "factory", "metal") >= 14 && checkService(s, "roads")) {
    const sold = take(s, "factory", "metal", 10);
    s.treasury += sold * 12;
    addLog(s, "The foundry exported " + sold + " metal units for " + (sold * 12) + " TC.");
  }
  const daytime = hour >= 7 && hour <= 18;
  const solar = daytime ? (s.weather === "sunny" ? 25 : s.weather === "cloudy" ? 14 : 8) : 0;
  const thermal = stock(s, "power", "fuel") >= 2 && checkService(s, "power") ? 34 : 0;
  if (thermal) take(s, "power", "fuel", 2);
  const demand = 32 + (hour >= 8 && hour < 18 ? 8 : 0);
  s.supply.electricity = checkService(s, "power") ? solar + thermal : 0;
  s.supply.electricityDemand = demand;
  const electricityOK = s.supply.electricity >= demand;
  if (!electricityOK && hour % 3 === 0) addLog(s, "Power shortage: homes and businesses are affected.");

  const capacity = electricityOK && checkService(s, "water") ? 25 : 0;
  // The river is renewable, but purification, pumping and pipes need electricity.
  if (capacity) add(s, "waterworks", "cleanWater", Math.min(capacity, Math.max(0, 250 - stock(s, "waterworks", "cleanWater"))));
  const needed = 16 + (hour >= 8 && hour <= 19 ? 4 : 0);
  const actualWater = take(s, "waterworks", "cleanWater", needed);
  s.supply.water = actualWater;
  s.supply.waterDemand = needed;
  const waterOK = actualWater >= needed;
  if (!waterOK && hour % 3 === 0) addLog(s, "Water restrictions: supply cannot meet demand.");
  add(s, "sewage", "wastewater", Math.floor(actualWater * 0.8));
  s.supply.wastewater = stock(s, "sewage", "wastewater");
  const treated = electricityOK && checkService(s, "sewage") ? take(s, "sewage", "wastewater", 22) : 0;
  if (treated) { s.indicators.pollution = bounded(s.indicators.pollution - 0.2, 0, 100); }
  if (stock(s, "sewage", "wastewater") > 70) {
    s.indicators.pollution = bounded(s.indicators.pollution + 2, 0, 100);
    if (hour % 4 === 0) addLog(s, "Wastewater backlog is polluting waterways.");
  }

  // Primary production; industrial steps consume actual input stock.
  if (hour === 6 || hour === 16) {
    const yieldFactor = s.weather === "rainy" ? 0.7 : 1;
    for (const [item, n] of [["wheat", 9], ["vegetables", 6], ["fruit", 3], ["eggs", 3], ["milk", 3]]) {
      add(s, "farm", item, Math.floor(n * yieldFactor));
      s.stats.harvest += Math.floor(n * yieldFactor);
    }
    addLog(s, "The farm harvested produce for the town.");
  }
  if (hour >= 7 && hour < 18 && electricityOK && waterOK) {
    if (stock(s, "mill", "wheat") >= 4) { take(s, "mill", "wheat", 4); add(s, "mill", "flour", 3); }
    if (stock(s, "bakery", "flour") >= 2) {
      take(s, "bakery", "flour", 2); add(s, "bakery", "bread", 5); s.stats.breadBaked += 5;
    }
    if (stock(s, "factory", "ore") >= 2) {
      take(s, "factory", "ore", 2); add(s, "factory", "metal", 1);
    }
  }
  if ([8, 12, 16, 20].includes(hour)) {
    deliver(s, "farm", "mill", "wheat", 12);
    deliver(s, "mill", "bakery", "flour", 10);
    for (const item of ["bread"]) deliver(s, "bakery", "market", item, 12);
    for (const item of ["vegetables", "fruit", "eggs", "milk"]) deliver(s, "farm", "market", item, 8);
    if (s.stats.deliveries) addLog(s, "Depot trucks are moving goods along the high street.");
  }

  // Household demand, generated waste and local sales (no phantom inventory).
  if ([7, 12, 18].includes(hour)) {
    const mealsNeeded = Math.ceil(s.population / 8);
    const bread = take(s, "market", "bread", mealsNeeded);
    const vegetables = take(s, "market", "vegetables", mealsNeeded);
    const meals = Math.min(bread, vegetables);
    s.stats.meals += meals;
    const wanted = bread * prices.bread + vegetables * prices.vegetables;
    const income = Math.min(s.householdCash, wanted);
    s.householdCash -= income;
    const taxes = Math.floor(income * s.taxRate);
    s.shopBalance += income - taxes; s.treasury += taxes; s.stats.taxes += taxes;
    if (income < wanted) s.indicators.happiness = bounded(s.indicators.happiness - 2, 0, 100);
    add(s, "homes", "rubbish", Math.ceil((bread + vegetables) / 4));
    add(s, "homes", "recyclables", Math.floor((bread + vegetables) / 4));
    if (meals < mealsNeeded) {
      s.indicators.health = bounded(s.indicators.health - 2, 0, 100);
      addLog(s, "Some households could not buy enough food.");
    } else s.indicators.health = bounded(s.indicators.health + 0.2, 0, 100);
  }
  if (hour === 6 || hour === 15) {
    if (checkService(s, "waste") && checkService(s, "roads")) {
      const rubbish = transfer(s, "homes", "landfill", "rubbish", 16);
      transfer(s, "homes", "recycling", "recyclables", 16);
      s.stats.landfill += rubbish;
      const reclaimed = take(s, "recycling", "recyclables", 14);
      add(s, "recycling", "scrap", Math.floor(reclaimed / 2));
      s.stats.recycled += reclaimed;
    }
  }
  if (hour === 10 && electricityOK) {
    const salvaged = transfer(s, "recycling", "factory", "scrap", 8);
    add(s, "factory", "parts", Math.floor(salvaged / 2));
  }
  if (hour === 9 || hour === 15) {
    const ready = s.letters.filter(x => x.due <= s.day && !x.delivered);
    if (ready.length && checkService(s, "post") && checkService(s, "roads")) {
      for (const letter of ready) { letter.delivered = true; s.stats.letters++; }
      addLog(s, "Postie delivered " + ready.length + " letters.");
    }
  }

  // Maintenance and public wages: government cannot spend money it does not have.
  if (hour === 17) {
    const due = Math.min(s.treasury, s.population * 2);
    s.treasury -= due; s.householdCash += due;
    const privateWages = Math.min(s.shopBalance, s.population * 4);
    s.shopBalance -= privateWages; s.householdCash += privateWages;
    s.stats.wages += due + privateWages;
    if (due < s.population * 2) s.indicators.happiness = bounded(s.indicators.happiness - 2, 0, 100);
  }
  if (hour === 0) {
    // Display-space and perishability constraints: excess fresh food spoils.
    for (const [item, capacity] of [["bread", 40], ["milk", 24], ["fruit", 32], ["vegetables", 36], ["eggs", 30]]) {
      const excess = Math.max(0, stock(s, "market", item) - capacity);
      if (excess) {
        take(s, "market", item, excess);
        add(s, "homes", "rubbish", Math.ceil(excess / 2));
        addLog(s, "Market composted or discarded " + excess + " surplus " + item + ".");
      }
    }
    s.day++; s.weather = weatherFor(s.day); s.voted = false;
    for (const key of Object.keys(s.services)) {
      s.services[key] = bounded(s.services[key] - (key === "roads" ? 0.45 : 0.25), 0, 100);
    }
    s.indicators.environment = bounded(100 - s.indicators.pollution, 0, 100);
    s.indicators.happiness = bounded(s.indicators.happiness + (waterOK && electricityOK ? 1 : -3), 0, 100);
    if (s.day % 7 === 0) {
      const nominees = ["Rowan", "Sage", "Kit"];
      const votes = nominees.map(name => (s.ballots[name] || 0) + ((s.day + name.length * 7) % 9) + 6);
      s.mayor = nominees[votes.indexOf(Math.max(...votes))];
      s.electionDay = s.day + 7; s.ballots = {};
      addLog(s, s.mayor + " was elected mayor for the next seven days.");
    }
    addLog(s, "A new day begins: " + s.weather + " weather forecast.");
  }
}
export function createTownSimulation({ population = 32, restored = null } = {}) {
  const s = restored ? clone(restored) : seedState(bounded(Math.floor(population), 1, 200));
  if (s.version !== 1 || !s.stores || !s.services || !Array.isArray(s.residents)) throw new Error("Unsupported town save");
  function advance(realSeconds) {
    if (!Number.isFinite(realSeconds) || realSeconds <= 0) return 0;
    s.fractional += Math.min(realSeconds, 3600);
    const count = Math.floor(s.fractional);
    s.fractional -= count;
    for (let i = 0; i < count; i++) {
      s.minute++;
      if (s.minute % 60 === 0) runHour(s);
    }
    return count;
  }
  function buy(item, amount = 1) {
    const n = bounded(Math.floor(amount), 1, 20), price = prices[item];
    if (!price) return { ok: false, message: "That item is not for sale." };
    if (stock(s, "market", item) < n) return { ok: false, message: "The market is out of stock." };
    const cost = n * price;
    if (s.wallet < cost) return { ok: false, message: "Not enough Town Credits." };
    transfer(s, "market", "playerInventory", item, n); s.wallet -= cost;
    const tax = Math.floor(cost * s.taxRate); s.treasury += tax; s.shopBalance += cost - tax;
    s.stats.taxes += tax; addLog(s, "Visitor bought " + n + " " + item + " for " + cost + " TC.");
    return { ok: true, message: "Bought " + n + " " + item + " for " + cost + " TC." };
  }
  function sell(item, amount = 1) {
    const n = bounded(Math.floor(amount), 1, 20), price = prices[item];
    if (!price) return { ok: false, message: "The market does not trade that item." };
    if (stock(s, "playerInventory", item) < n) return { ok: false, message: "You do not have enough " + item + "." };
    const payment = n * Math.max(1, Math.floor(price * 0.6));
    if (s.shopBalance < payment) return { ok: false, message: "The shop cannot afford to buy this." };
    transfer(s, "playerInventory", "market", item, n);
    s.shopBalance -= payment; s.wallet += payment;
    addLog(s, "Visitor sold " + n + " " + item + " for " + payment + " TC.");
    return { ok: true, message: "Sold " + n + " " + item + " for " + payment + " TC." };
  }
  function recycle(amount = 2) {
    const n = bounded(Math.floor(amount), 1, 10);
    // Voluntary litter collection is a small bounded visitor activity, not free infinite cash.
    const collected = take(s, "homes", "recyclables", n);
    if (!collected) return { ok: false, message: "No recyclables are waiting for collection." };
    add(s, "recycling", "recyclables", collected);
    const reward = Math.min(s.treasury, collected * 2); s.treasury -= reward; s.wallet += reward;
    s.stats.recycled += collected;
    addLog(s, "Visitor sorted " + collected + " recyclables and earned " + reward + " TC.");
    return { ok: true, message: "Recycled " + collected + " items; earned " + reward + " TC." };
  }
  function repair(service) {
    if (!Object.hasOwn(s.services, service)) return { ok: false, message: "Unknown public service." };
    const cost = 90, parts = 2;
    if (s.treasury < cost || stock(s, "council", "parts") < parts) return { ok: false, message: "Council needs 90 TC and two spare parts." };
    if (s.services[service] >= 99) return { ok: false, message: "That service is already in good condition." };
    s.treasury -= cost; take(s, "council", "parts", parts);
    s.services[service] = bounded(s.services[service] + 35, 0, 100); s.stats.repairs++;
    addLog(s, "Council repaired the " + service + " network.");
    return { ok: true, message: "Repair completed: " + service + " +35 condition." };
  }
  function reportFault(service) {
    if (!Object.hasOwn(s.services, service)) return { ok: false, message: "Unknown public service." };
    s.services[service] = bounded(s.services[service] - 75, 0, 100);
    addLog(s, "Incident reported: " + service + " infrastructure damaged.");
    return { ok: true, message: "Fault simulated. Service continuity will be affected until repaired." };
  }
  function vote(name) {
    if (!["Rowan", "Sage", "Kit"].includes(name)) return { ok: false, message: "Unknown candidate." };
    if (s.voted) return { ok: false, message: "You've already voted today." };
    s.ballots[name] = (s.ballots[name] || 0) + 1;
    s.voted = true; addLog(s, "A ballot was cast for the next mayoral election.");
    return { ok: true, message: "Vote recorded. Next election: day " + s.electionDay + "." };
  }
  function deposit(amount) {
    const n = bounded(Math.floor(amount), 1, 10000);
    if (s.wallet < n) return { ok: false, message: "Not enough credits in your wallet." };
    s.wallet -= n; s.bankBalance += n; return { ok: true, message: "Deposited " + n + " TC." };
  }
  function withdraw(amount) {
    const n = bounded(Math.floor(amount), 1, 10000);
    if (s.bankBalance < n) return { ok: false, message: "Not enough credits in your account." };
    s.bankBalance -= n; s.wallet += n; return { ok: true, message: "Withdrew " + n + " TC." };
  }
  function postLetter(to = "Rowan") {
    if (s.wallet < 2) return { ok: false, message: "Postage costs 2 TC." };
    s.wallet -= 2; s.treasury += 2;
    s.letters.push({ to: String(to).slice(0, 40), due: s.day + 1, delivered: false });
    addLog(s, "A letter was posted for next-day delivery.");
    return { ok: true, message: "Posted a letter. It should arrive next town day." };
  }
  const snapshot = () => clone({ ...s, hour: Math.floor((s.minute % 1440) / 60), time: clockText(s.minute), activities: s.residents.map(r => ({ ...r, activity: residentSchedule(Math.floor((s.minute % 1440) / 60), r.job) })) });
  return { advance, buy, sell, recycle, repair, reportFault, vote, deposit, withdraw, postLetter, snapshot, serialize: () => JSON.stringify(s) };
}
