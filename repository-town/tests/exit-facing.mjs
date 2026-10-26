// Leaving a building puts you on the street looking out over it, not staring back at the door.
//   node tests/exit-facing.mjs [--url u]
import { chromium } from 'playwright';
const args = process.argv.slice(2);
const URL = args.includes('--url') ? args[args.indexOf('--url') + 1] : 'http://localhost:8091/';
const fails = [];
const check = (ok, what) => { console.log(`${ok ? '✓' : '✗'} ${what}`); if (!ok) fails.push(what); };
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 900, height: 560 } });
await page.goto(URL);
await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 60000 });
const T = (f, a) => page.evaluate(f, a);
await T(() => { window.__town.life.setTime(9 * 60); window.__town.advanceSimulation(90); });
// How squarely the view points away from the door: 1 = straight out, -1 = straight back at it.
const away = (s, door) => { const dx = s.pos.x - door.x, dz = s.pos.z - door.z, d = Math.hypot(dx, dz) || 1; return (-Math.sin(s.yaw) * dx - Math.cos(s.yaw) * dz) / d; };
const walkOut = async () => {
  await T(() => window.__town.toExit());
  await page.keyboard.down('w');
  await page.waitForFunction(() => window.__town.state().mode === 'town', null, { timeout: 8000 }).catch(() => null);
  await page.keyboard.up('w');
  return T(() => window.__town.state());
};
const shops = await T(() => window.__town.shops());
for (const id of ['bakery', 'power']) {
  const site = shops.find((s) => s.id === id);
  // Walking out through the door, the way a player does.
  await T((id) => window.__town.enterShop(id), id); await page.waitForTimeout(300);
  let s = await walkOut();
  check(s.mode === 'town' && away(s, site.door) > 0.7, `walking out of the ${site.name}: facing the street (${away(s, site.door).toFixed(2)})`);
  // Using Exit while facing back into the room.
  await T((id) => window.__town.enterShop(id), id); await page.waitForTimeout(300);
  await T(() => window.__town.exitShop());
  s = await T(() => window.__town.state());
  check(s.mode === 'town' && away(s, site.door) > 0.7, `Exit from inside the ${site.name}: facing the street (${away(s, site.door).toFixed(2)})`);
}
// The 2026 row 2-7 north-facing infill must return to the REAL street side
// (-Z). Try available staffed sites; access rules remain enforced.
const infill = shops.filter(s => s.side === 'north' && s.expansion);
let infillExercised = false;
for (const site of infill) {
  if (!await T(id => window.__town.enterShop(id), site.id)) continue;
  infillExercised = true;
  let s = await walkOut();
  check(s.mode === 'town' && s.pos.z < site.door.z - 2 && away(s, site.door) > 0.7,
    `walking out of new ${site.name}: outside FRONT door facing northern road`);
  await T(id => window.__town.enterShop(id), site.id);
  s = await T(() => window.__town.state());
  if (s.mode === 'house') {
    await T(() => window.__town.exitShop());
    s = await T(() => window.__town.state());
    check(s.mode === 'town' && s.pos.z < site.door.z - 2 && away(s, site.door) > 0.7,
      `Exit button at ${site.name}: front footpath, not back wall`);
  }
  break;
}
check(infill.length > 0 && infillExercised, 'at least one new northern infill building was entered and exited');

// N5-N public bus shelter: inspect actual room and walk back through the front door.
const bus=shops.find(s=>s.id==='busstop');
check(!!bus,'N5-N community bus interchange exists');
if(bus){
  check(await T(()=>window.__town.enterShop('busstop')),'N5-N is publicly enterable');
  const inState=await T(()=>window.__town.state());
  check(inState.mode==='house' && inState.windows>=4 && inState.interactables.some(i=>i.key==='busstop:timetable'),
    'N5-N has its own glazed waiting room and timetable');
  const out=await walkOut();
  check(out.mode==='town' && out.pos.z<bus.door.z-2 && away(out,bus.door)>.7,
    'walking from the shelter exits at its real street-facing doorway');
  await T(()=>window.__town.enterShop('busstop'));
  await T(()=>window.__town.exitShop());
  const btnOut=await T(()=>window.__town.state());
  check(btnOut.mode==='town' && btnOut.pos.z<bus.door.z-2,
    'Exit action also places the player at the front, never at the rear wall');
}
// O5-N regional visitor centre: both walking and the Exit command use its porch.
const visitor=shops.find(s=>s.id==='visitorcentre');
check(!!visitor,'O5-N visitor information site exists');
if(visitor){
  check(await T(()=>window.__town.enterShop('visitorcentre')),'O5-N accepts a visitor');
  const insideVisitor=await T(()=>window.__town.state());
  check(insideVisitor.mode==='house' && insideVisitor.windows>=4 &&
    insideVisitor.interactables.some(i=>i.key==='visitorcentre:brochures') &&
    insideVisitor.interactables.some(i=>i.key==='visitorcentre:amenities'),
    'O5-N is a real walkable visitor information room, not a blank shell');
  const departed=await walkOut();
  check(departed.mode==='town' && departed.pos.z<visitor.door.z-2 &&
    away(departed,visitor.door)>.7,'O5-N walk-out returns to front verandah');
  await T(()=>window.__town.enterShop('visitorcentre'));
  await T(()=>window.__town.exitShop());
  const afterButton=await T(()=>window.__town.state());
  check(afterButton.mode==='town' && afterButton.pos.z<visitor.door.z-2,
    'O5-N manual exit returns to front rather than rear wall');
}
// M5-N memorial office: physical consultation, public map, staff register and real street exit.
const cemetery=shops.find(s=>s.id==='cemetery');
check(!!cemetery,'M5-N memorial office exists');
if(cemetery){
  check(await T(()=>window.__town.enterShop('cemetery')),'M5-N can be entered through front door');
  const insideCemetery=await T(()=>window.__town.state());
  check(insideCemetery.mode==='house'&&insideCemetery.windows>=4
    &&insideCemetery.interactables.some(i=>i.key==='cemetery:map')
    &&insideCemetery.interactables.some(i=>i.key==='cemetery:consult')
    &&insideCemetery.interactables.some(i=>i.key==='cemetery:records'),
    'memorial office is physically furnished and has three distinct public/consultation/record functions');
  const outCemetery=await walkOut();
  check(outCemetery.mode==='town' && outCemetery.pos.z<cemetery.door.z-2
    &&away(outCemetery,cemetery.door)>.7,
    'walking out of M5-N goes to FRONT memorial-garden walkway');
  await T(()=>window.__town.enterShop('cemetery'));
  await T(()=>window.__town.exitShop());
  const manualOut=await T(()=>window.__town.state());
  check(manualOut.mode==='town'&&manualOut.pos.z<cemetery.door.z-2,
    'M5-N manual exit also goes to the front, never through back wall');
}
// A house: walk in, walk back out.
await T(() => window.__town.travel('A1')); await page.waitForTimeout(500);
const front = await T(() => window.__town.state());
await page.keyboard.down('w'); await page.waitForFunction(() => window.__town.state().mode === 'house', null, { timeout: 20000 }); await page.keyboard.up('w');
const s = await walkOut();
check(s.mode === 'town' && Math.cos(s.yaw - Math.PI) > 0.7 && s.pos.z > front.pos.z - 6, `walking out of house A1: facing the street (yaw ${s.yaw.toFixed(2)})`);
await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED` : '\nAll exit-facing checks passed.');
process.exit(fails.length ? 1 : 0);
