import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { UPPER_FLOOR_PLANS, hasUpperFloors, navigationForFloor } from '../src/world/floor-plans.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = p => readFileSync(path.join(root, p), 'utf8');
const knownProps = new Set([...source('src/world/props.js').matchAll(/def\(['"]([^'"]+)['"]/g)].map(x => x[1]));
assert(knownProps.size > 100, 'expected full prop catalogue');
assert(hasUpperFloors('V7') && hasUpperFloors('W7'));
assert(!hasUpperFloors('A1'), 'only opt-in buildings should get upper floors');
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
assert(main.includes('inside.floorIndex - 1'), 'upper entrance must not exit whole building');
assert(main.includes('scene.add(next.group)'), 'changing floors must render the new floor');
assert(vertical.includes('levels[i].group.position.y = i * FLOOR_HEIGHT'), 'interiors must be stacked vertically');
assert(player.includes('this.baseHeight + this.y + this.eye'), 'camera must respect floor elevation');
console.log('Multi-floor contract: V7 and W7 have 3 unique usable levels, valid props, navigable stairs and lift.');
