// RuneScape engine step 1: the 0.6 s game tick. Frame time becomes whole ticks; a long pause
// never bursts many ticks at once; chopping rolls every 4 ticks (2.4 s).
import assert from 'node:assert/strict';
import { createGameTick, TICK_SECONDS, CHOP_TICKS } from '../src/world/game-tick.js';
assert.equal(TICK_SECONDS, 0.6); assert.equal(CHOP_TICKS * TICK_SECONDS, 2.4);
const g = createGameTick();
let ticks = 0; for (let i = 0; i < 600; i++) ticks += g.advance(1 / 60);   // 10 s at 60 fps
assert.equal(ticks, 16, '10 s of 60 fps frames is 16 whole ticks'); assert.equal(g.count, 16);
let slow = 0; for (let i = 0; i < 100; i++) slow += g.advance(0.15);       // 15 s at a phone's worst frame rate
assert.equal(slow, 25, 'frame rate does not change the tick rate');
assert.ok(g.advance(30) <= 2, 'returning to a backgrounded tab runs at most a tick or two, not a burst');
assert.equal(g.advance(-1), 0);
console.log('PASS: 0.6 s game tick independent of frame rate, no catch-up burst, 4-tick woodcutting rolls');
