// Focused integration and shader-source acceptance for Narromine's UV-free
// geometry-batched surface materials. Runs as part of narromine-layout.mjs.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { narromineSurfaceKind, createNarromineSurfaceMaterial } from '../src/world/narromine-surface-materials.js';

const cases = [
  [0x45484b, 'asphalt'],
  [0x4f5153, 'asphalt'],
  [0xbdb6a8, 'concrete'],
  [0x995741, 'brick'],
  [0xb99178, 'render'],
  [0x929ba0, 'metalRoof'],
  [0x344c58, 'glass'],
];
for (const [colour, kind] of cases) {
  assert.equal(narromineSurfaceKind(colour), kind, 'colour classification');
  const mat = createNarromineSurfaceMaterial(colour, THREE.DoubleSide);
  assert.ok(mat instanceof THREE.MeshStandardMaterial, kind + ' should use PBR');
  assert.equal(mat.userData.narromineSurfaceKind, kind);
  assert.equal(mat.color.getHex(), colour, 'keep source colour');
  assert.equal(mat.side, THREE.DoubleSide);
  assert.equal(mat.map, null, 'world-space detail must not need UV maps');
  assert.ok(mat.roughness >= 0 && mat.roughness <= 1);
  assert.ok(mat.metalness >= 0 && mat.metalness <= 1);
  assert.match(mat.customProgramCacheKey(), new RegExp(kind));
  const shader = {
    vertexShader: '#include <common>\n#include <begin_vertex>',
    fragmentShader: '#include <common>\n#include <color_fragment>',
  };
  mat.onBeforeCompile(shader);
  assert.match(shader.vertexShader, /vNarromineSurfacePos = transformed;/);
  assert.match(shader.vertexShader, /vNarromineSurfaceNormal = normal;/);
  assert.match(shader.fragmentShader, /diffuseColor\.rgb \*= narromineSurfaceFactor\(\)/);
  assert.match(shader.fragmentShader, /fwidth\(/, 'avoid hard high-frequency aliasing');
  assert.doesNotMatch(shader.fragmentShader, /texture2D\(/, 'no image assets required');
  mat.dispose();
}
const unclassified = createNarromineSurfaceMaterial(0xf0ead2);
assert.ok(unclassified instanceof THREE.MeshLambertMaterial);
assert.equal(unclassified.color.getHex(), 0xf0ead2);
assert.equal(narromineSurfaceKind(0xf0ead2), null);
unclassified.dispose();
console.log('Narromine surface materials: 7 classified PBR roles and UV-free shaders PASS');
