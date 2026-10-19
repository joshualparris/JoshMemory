import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { UPPER_FLOOR_PLANS, hasUpperFloors, navigationForFloor, upperPlansFor, STOREYS_BY_STYLE } from '../src/world/floor-plans.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = p => readFileSync(path.join(root, p), 'utf8');
const knownProps = new Set([...source('src/world/props.js').matchAll(/def\(['"]([^'"]+)['"]/g)].map(x => x[1]));
assert(knownProps.size > 100, 'expected full prop catalogue');
assert(hasUpperFloors('V7') && hasUpperFloors('W7'));
assert(!hasUpperFloors('A1'), 'only opt-in buildings should get upper floors');
assert.equal(UPPER_FLOOR_PLANS.X7.length, 2, 'Transfer lighthouse must have three floors');
assert(UPPER_FLOOR_PLANS.X7[0].title.includes('Transfer'), 'X7 floor 2 needs a transfer deck');
assert(UPPER_FLOOR_PLANS.X7[1].title.includes('preservation'), 'X7 floor 3 needs a preservation loft');
const countByStyle = Object.entries(STOREYS_BY_STYLE);
assert.equal(countByStyle.length, 16, 'all supported tall exterior styles must be included');
for (const [style, total] of countByStyle) {
  const sample = { coordinate:'Z9', ext:{style} };
  const generated = upperPlansFor(sample);
  assert.equal(generated.length, total - 1, style+' level count mismatch');
  assert.equal(hasUpperFloors(sample), true, style+' must be multi-floor');
  const unique = new Set(generated.map(x=>x.title));
  assert.equal(unique.size, generated.length, style+' upper floors need different themes');
  for (const level of generated) {
    assert.equal(level.rooms.length,3,style+' must include landing and two distinctive rooms');
    assert(level.rooms.some(r=>r.props.some(p=>Array.isArray(p) && p[2]?.do==='info')),
      style+' needs interactive upstairs exhibits');
    for(const room of level.rooms)for(const entry of room.props) {
      const type = typeof entry === 'string'?entry:entry[0];
      assert(knownProps.has(type),style+' has unknown prop '+type);
    }
  }
}
const other={coordinate:'A1',ext:{style:'cottage'}};
assert.equal(upperPlansFor(other).length,0,'true single-storey buildings must stay single-storey');
for (const [coord, levels] of Object.entries(UPPER_FLOOR_PLANS)) {
  assert.equal(levels.length, 2, coord + ' should have 3 levels total');
  const seenNames = new Set(), signatures = new Set();
  for (const [n, level] of levels.entries()) {
    assert.equal(level.rooms.length, 3, coord + ': upstairs needs 3 themed rooms');
    assert.notEqual(level.title, levels[(n+1)%2].title, 'stories should have unique themes');
    let active = 0;
    for (const room of level.rooms) {
      assert(room.w >= 8 && room.d >= 8, 'rooms must fit people and landings');
      assert(!seenNames.has(room.name), coord + ': rooms cannot be duplicates');
      seenNames.add(room.name);
      for (const [type, label, action] of room.props) {
        assert(knownProps.has(type), coord + ': unknown prop ' + type);
        assert(typeof label === 'string' && label.length, 'props need labels');
        if (action) { assert.equal(action.do, 'info'); active++; }
      }
    }
    assert(active >= 2, coord + ': each upper story should have usable exhibits');
    const signature = JSON.stringify(level.rooms.map(r => r.props.map(p => p[0])));
    assert(!signatures.has(signature), 'story furnishings must not be repeated');
    signatures.add(signature);
  }
}
assert.deepEqual(navigationForFloor(0), { up: 1, down: null, lift: [0,1,2] });
assert.deepEqual(navigationForFloor(1), { up: 2, down: 0, lift: [0,1,2] });
assert.deepEqual(navigationForFloor(2), { up: null, down: 1, lift: [0,1,2] });
const main = source('src/main.js'), vertical = source('src/world/multifloor.js'), player = source('src/engine/player.js');
assert(main.includes('createFloorStack(h, makeLabel)'), 'game must create the actual floor models');
assert(main.includes('changeFloor(nearThing.target)'), 'stairs must be interactable');
assert(main.includes('openLift()'), 'elevator must have a chooser');
assert(main.includes("document.createElement('button')"), 'floors must have an accessible direct-selection button');
assert(main.includes('floorBadge.onclick'), 'floor shortcut must actually open the lift selector');
assert(vertical.includes('vertical:entrance:lift'), 'entrance must have obvious signed lift wayfinding');
assert(main.includes('inside.floorIndex - 1'), 'upper entrance must not exit whole building');
assert(main.includes('scene.add(next.group)'), 'changing floors must render the new floor');
assert(vertical.includes('levels[i].group.position.y = i * FLOOR_HEIGHT'), 'interiors must be stacked vertically');
assert(player.includes('this.baseHeight + this.y + this.eye'), 'camera must respect floor elevation');
console.log('Multi-floor contract: X7 + V7 + W7 and 16 tall exterior styles have unique stories, valid props and visible stairs/lifts.');
