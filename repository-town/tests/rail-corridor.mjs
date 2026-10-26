// Regression for the 26 Oct 2026 screenshot: railway was laid through
// street-7 lamps/footpath. Structural and schedule checks are not certification.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {RAIL_Z as lifeRail, trainX} from '../src/world/life.js';
import {RAIL_Z,RAIL_GAUGE,RAIL_CROSSINGS,RAIL_STRUCTURE_HALF_WIDTH,
 RAIL_LAMP_MIN_DISTANCE,permittedTracksideLight,withinLevelCrossing,railCrossingClosed,railSideYardClear}
 from '../src/world/rail-corridor.js';

assert.equal(RAIL_Z,144,'rail line is on its dedicated strip, not street-7 pavement');
assert.equal(lifeRail,RAIL_Z,'simulated train and drawn rails use same corridor');
assert.equal(RAIL_GAUGE,1.435,'rail heads use standard gauge');
assert.equal(RAIL_CROSSINGS.length,6,'each physical north/south avenue has one crossing');
assert.deepEqual(RAIL_CROSSINGS.map(c=>c.x),[-338,-208,-78,52,182,312]);
assert.equal(new Set(RAIL_CROSSINGS.map(c=>c.x)).size,6);
assert(RAIL_STRUCTURE_HALF_WIDTH>RAIL_GAUGE);
assert.equal(RAIL_LAMP_MIN_DISTANCE,5.5);
const street7=6*46-3.5*46+16; // 131
const southFootpathLamp=street7+6; // 137, old railway centre 136
assert(Math.abs(RAIL_Z-southFootpathLamp)>RAIL_LAMP_MIN_DISTANCE);
assert(permittedTracksideLight(southFootpathLamp-0.85));
assert(!permittedTracksideLight(RAIL_Z),'on-track lamps are prohibited');
assert(!permittedTracksideLight(RAIL_Z+1.6));
assert(!railSideYardClear(RAIL_Z+1.6,2.5),'detached yard objects must not intrude');
assert(railSideYardClear(161,3),'row-8 structures can remain in the safe house area');
assert(permittedTracksideLight(RAIL_Z+8));
for(const crossing of RAIL_CROSSINGS) {
  assert(withinLevelCrossing(crossing.x));
  assert(!withinLevelCrossing(crossing.x+7));
}
assert(!withinLevelCrossing(-400));
assert(!railCrossingClosed(null,52));
assert(!railCrossingClosed(Infinity,52));
assert(!railCrossingClosed(117,52,false),'stationary depot train does not hold the boom gates');
assert(railCrossingClosed(100,52,true),'approaching westbound locomotive triggers warning');
assert(railCrossingClosed(52,52,true),'train directly over crossing keeps it closed');
assert(railCrossingClosed(108,52,true),'locomotive 56m east triggers an advance warning');
assert(railCrossingClosed(0,52,true),'wagons east of locomotive still occupy approach');
assert(!railCrossingClosed(200,52,true),'distant train must not block an empty crossing');
const depotX=(17-12.5)*26; // R column
assert.equal(trainX(425,depotX),depotX);
assert.equal(trainX(500,depotX),null);
assert(railCrossingClosed(trainX(441,depotX),52,true),'departure is protected before movement');

const town=readFileSync(new URL('../src/world/town.js',import.meta.url),'utf8');
const scene=readFileSync(new URL('../src/world/townlife.js',import.meta.url),'utf8');
assert(town.includes('permittedTracksideLight(lz - side * 0.85)'),'lamps honour line protection');
assert(scene.includes("v.home.coordinate.endsWith('8') && !railSideYardClear"),'rear garden props are excluded from corridor');
assert(scene.includes('train.rotation.y = Math.PI'),'locomotive must lead while travelling west');
assert(scene.includes('for (const z of [-RAIL_GAUGE/2, RAIL_GAUGE/2])'),'train wheel spacing follows track gauge');
assert(scene.includes('RAIL_GAUGE/2'),'both rails come from standard-gauge source');
assert(scene.includes('withinLevelCrossing(x, 0.2)'),'sleepers leave crossings clear');
assert(scene.includes('syncRailGates(m)'),'dynamic signals update every simulation tick');
assert(scene.includes('const state=life.railGate(gate.crossing.x)'),'the gates obey the shared road-user interlocking state');
assert(scene.includes('railClearanceAudit([...town.colliders,...colliders])'));
assert(scene.includes('statics.solid(len,0.25,centre,z)'),'fencing is physical, not decorative');
assert(scene.includes('gate.pivot.rotation.z=state.arm*Math.PI/2'),'boom state reflects warning/closure/fault');
const player=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert(player.includes('townLife.railBarrierColliders(player.pos.z)'),'player movement obeys rail gates');
console.log('PASS: track reservation, lamp clearance, gauge, six road decks, timetable-coupled gate state.');
