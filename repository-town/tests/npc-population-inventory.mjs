// RTD-003: keep the published NPC population inventory in sync with actual source.
// No rendering, AI, remote voices, network requests or project-secret content.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { NPCS } from '../src/ui/npc-data.js';
import { VILLAGER_NAMES, ROSTER_SIZE, TownLife } from '../src/world/life.js';
import { residentName } from '../src/ui/resident-identity.js';

const snapshot = JSON.parse(readFileSync(new URL('../docs/NPC_POPULATION_INVENTORY_2026-10-24.json', import.meta.url), 'utf8'));
const inventory = JSON.parse(readFileSync(new URL('../../docs/repository-town.json', import.meta.url), 'utf8'));
const coords = inventory.projects.map(project => project.coordinate);
const voiced = new Set(snapshot.namedStreetActors.filter(actor => actor.voicedGame300).map(actor => actor.id));

assert.equal(snapshot.schemaVersion, 1);
assert.equal(inventory.count, 188);
assert.equal(coords.length, 188);
assert.equal(new Set(coords).size, 188);
assert.equal(snapshot.counts.namedStreetActors, 32);
assert.equal(snapshot.counts.voicebankGame300Speakers, 10);
assert.equal(snapshot.counts.simulatedWorkers, 99);
assert.equal(snapshot.counts.originalWorkersKeptStable, 38);
assert.equal(snapshot.counts.additionalWorkers, 61);
assert.equal(snapshot.counts.houseResidentSlots, 188);
assert.equal(snapshot.counts.totalGridCells, 208);
assert.equal(snapshot.counts.gridCellsWithoutProjectHouse, 20);
assert.equal(snapshot.counts.workerHomes, 99);
assert.equal(snapshot.counts.projectHousesNotAssignedWorker, 89);
assert.equal(snapshot.counts.baseJobRows + snapshot.counts.reliefWorkers + snapshot.counts.securityWorkers, 99);
assert.equal(NPCS.length, 32);
assert.equal(ROSTER_SIZE, 99, 'count the expanded live roster, not just the original 38');
assert.equal(VILLAGER_NAMES.length, ROSTER_SIZE);
assert.equal(new Set(VILLAGER_NAMES).size, 99);

const named = NPCS.map(actor => ({
  key: 'named:' + actor.id,
  id: actor.id, name: actor.name, title: actor.title, coordinate: actor.coordinate,
  voicedGame300: voiced.has(actor.id), hasQuizChallenge: Boolean(actor.challenge),
}));
assert.deepEqual(snapshot.namedStreetActors, named);
assert.equal(named.filter(a => a.voicedGame300).length, 10);
assert.equal(named.filter(a => a.hasQuizChallenge).length, 20);
assert.equal(new Set(named.map(a => a.key)).size, named.length);
assert.equal(new Set(named.map(a => a.coordinate)).size, named.length);

// Same ordered repository lot inventory as createTownLife() uses at runtime.
// The simulation itself assigns its stable worker IDs and home coordinates.
const homes = coords.map(coordinate => ({
  coordinate,
  name: 'Project house ' + coordinate,
  door: {
    x: (coordinate.charCodeAt(0) - 65 - 12.5) * 26,
    z: (Number(coordinate.slice(1)) - 1 - 3.5) * 46,
  },
}));
const life = new TownLife({ homes });
assert.equal(life.villagers.length, 99);
const workers = life.villagers.map(v => ({
  id: v.id,
  key: 'worker:' + v.id,
  name: v.name,
  role: v.job,
  workplace: v.work,
  homeCoordinate: v.home.coordinate,
  rosterLayer: v.id < 38 ? 'original38' : v.id < 61 ? 'baseline' : v.id < 91 ? 'relief' : 'security',
}));
assert.deepEqual(snapshot.livingTownWorkers, workers);
assert.equal(workers.filter(w => w.rosterLayer === 'original38').length, 38);
assert.equal(workers.filter(w => w.rosterLayer === 'baseline').length, 23);
assert.equal(workers.filter(w => w.rosterLayer === 'relief').length, 30);
assert.equal(workers.filter(w => w.rosterLayer === 'security').length, 8);
assert.equal(new Set(workers.map(w => w.homeCoordinate)).size, 99);
assert.equal(new Set(workers.map(w => w.name)).size, 99);
assert(workers.every(w => coords.includes(w.homeCoordinate)));

const workerByHome = new Map(workers.map(worker => [worker.homeCoordinate, worker.id]));
const slots = coords.map(coordinate => ({
  key: 'resident:' + coordinate,
  coordinate,
  name: residentName(coordinate),
  assignedWorkerId: workerByHome.get(coordinate) ?? null,
}));
assert.deepEqual(snapshot.projectHouseResidentSlots, slots);
assert.equal(new Set(slots.map(s => s.name)).size, 188);
assert.equal(slots.filter(s => s.assignedWorkerId !== null).length, 99);
assert.equal(slots.filter(s => s.assignedWorkerId === null).length, 89);
const allCoords = Array.from({length:8}, (_,row) =>
  Array.from({length:26},(_,col) => String.fromCharCode(65 + col) + (row + 1))).flat();
assert.deepEqual(snapshot.emptyGridCells, allCoords.filter(coord => !coords.includes(coord)));
assert.equal(new Set([...named.map(n=>n.key), ...workers.map(w=>w.key), ...slots.map(s=>s.key)]).size, 319);
assert.deepEqual(snapshot.displayNameOverlapBetweenStreetCastAndWorkers, ['Rowan'],
  'same display name across two systems must not imply same actor identity');
// Guard the published roster against accidentally leaking private repository references.
assert(!JSON.stringify(snapshot).includes('github.com/'));
assert(!JSON.stringify(snapshot).includes('joshualparris/Aliens'));
console.log('PASS RTD-003: 32 named actors, 10 approved recorded voices, 20 quizzes, 99 named simulated workers (38 legacy IDs), 188 unique house slots, 20 unused grid cells; stable keys and worker-home assignments');
