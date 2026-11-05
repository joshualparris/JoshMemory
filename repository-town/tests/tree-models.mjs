// Contract tests: real LiDAR coordinates/collision footprints and GPU-friendly detailed/far tree renderers.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createLiDARTreeForest, drawBuilderTree } from '../src/world/tree-models.js';
import { NARROMINE_TREES } from '../src/world/narromine-trees-data.js';
import { Builder, choppableTrees } from '../src/world/builder.js';

assert.equal(NARROMINE_TREES.length, 3096, 'all dated 2023 LiDAR tree observations preserved');
const before = NARROMINE_TREES.map(a => a.join(',')).join('|');
const colliders = [{ x0: 0, x1: 1, z0: 0, z1: 1 }];
const forest = createLiDARTreeForest(NARROMINE_TREES, colliders);
assert.equal(forest.stats.trees, NARROMINE_TREES.length);
assert(forest.stats.tiles > 4);
assert.equal(colliders.length, NARROMINE_TREES.length + 1, 'exactly one collision per real measured tree');
assert.equal(before, NARROMINE_TREES.map(a => a.join(',')).join('|'), 'never change real data coordinates');
// Tile streaming deliberately reorders the collider entries. Compare sets by trunk coordinates,
// not insertion order, and retain exact floating point formulas from the previous renderer.
const colliderKey = c => [c.x0,c.x1,c.z0,c.z1].join(',');
const expectedColliders = NARROMINE_TREES.map(([x,z,h]) => {
  assert(h > 0 && Number.isFinite(x) && Number.isFinite(z));
  const r = Math.min(0.45, 0.12 + h * 0.015);
  return colliderKey({x0:x-r-0.1,x1:x+r+0.1,z0:z-r-0.1,z1:z+r+0.1});
}).sort();
assert.deepEqual(colliders.slice(1).map(colliderKey).sort(), expectedColliders,
  'trunk collisions exactly preserve earlier rendering, independent of tile iteration order');
assert(forest.group.children.length > 0);
const detailed = forest.group.children.filter(g => g.name === 'Detailed trunks / branches / canopy');
const low = forest.group.children.filter(g => g.name === 'Distant low-poly tree silhouettes');
assert.equal(detailed.length, forest.stats.tiles);
assert.equal(low.length, forest.stats.tiles);
assert(detailed.every(g => g.children.length === 3), 'three instanced close meshes per tile');
assert(low.every(g => g.children.length === 2), 'two instanced far meshes per tile');
for (const mesh of forest.group.children.flatMap(g => g.children)) {
  assert(mesh instanceof THREE.InstancedMesh, 'tree parts are GPU instanced');
  assert(mesh.count > 0);
  assert(mesh.boundingSphere?.radius > 0, 'tile mesh has culling bounds');
  assert(mesh.instanceMatrix.count >= mesh.count);
}
const near = NARROMINE_TREES[100];
forest.update({ x: near[0], z: near[1] }, false, 10);
assert(detailed.some(g => g.visible), 'close silhouette streams at street level');
assert(low.some(g => g.visible), 'distant silhouettes remain cheap');
forest.update({ x: 999999, z: 999999 }, true, 20);
assert(detailed.every(g => !g.visible) && low.every(g => g.visible), 'airborne distant scene falls back to LOD');
const nearbyLeaf = detailed[0].children.find(c => /foliage/.test(c.name));
const shader = { uniforms: {}, vertexShader: '#include <common>\n#include <begin_vertex>' };
nearbyLeaf.material.onBeforeCompile(shader);
assert(shader.vertexShader.includes('treeGust') && shader.vertexShader.includes('USE_INSTANCING'), 'GPU vertex wind is compiled');
assert.equal(typeof shader.uniforms.treeWindTime.value, 'number');

const b = new Builder(), start = choppableTrees().length;
b.solid(0.6, 0.6, 7, 8);
b.tree({ type: 'oak' }, () => drawBuilderTree(b, { x: 7, z: 8, scale: 1.1, leaf: 0x547c48, seed: 3 }));
assert(b.parts.length >= 8, 'fictional tree now has trunk, branches and staggered foliage');
const merged = b.build();
assert(merged.children.length > 0);
assert.equal(choppableTrees().length, start + 1, 'existing woodcut registry retained');
assert(choppableTrees().at(-1).vCount > 100, 'all branches and leaves belong to choppable tree vertex range');
console.log('PASS TREE-REAL-001: ' + NARROMINE_TREES.length + ' LiDAR trees; ' +
  forest.stats.tiles + ' foliage LOD tiles, exact original trunk collisions, shader wind and woodcut geometry');
