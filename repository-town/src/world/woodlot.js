// The Town Woodlot, north of the railway beside the north road: choppable trees that turn into
// stumps and grow back, and the fires players light (rules in skills.js; main.js wires the controls).
import * as THREE from 'three';
import { TREES, isStump, liveFires } from './skills.js';

// [type, x, z]: east of the north road, clear of the road and the railway fence.
const PLANTING = [
  ['tree', 18, -204], ['tree', 26, -202], ['tree', 34, -205], ['tree', 20, -212],
  ['oak', 30, -213], ['oak', 39, -211], ['oak', 24, -221],
  ['willow', 34, -223], ['willow', 43, -220],
];
const LOOK = {
  tree: { trunk: 0x6b4a2f, crown: 0x3f8a3a, r: 0.28, h: 3.2, crownR: 1.7, shape: 'round' },
  oak: { trunk: 0x5a3b22, crown: 0x2f6b2c, r: 0.42, h: 3.6, crownR: 2.4, shape: 'round' },
  willow: { trunk: 0x6f5a3c, crown: 0x8fbf5a, r: 0.36, h: 3.8, crownR: 2.2, shape: 'droop' },
};

export function buildWoodlot(group, makeLabel) {
  const root = new THREE.Group(); root.name = 'Town Woodlot'; group.add(root);
  const mats = {}, mat = (c, e = 0) => (mats[c + ':' + e] ??= new THREE.MeshLambertMaterial({ color: c, emissive: e }));
  const trees = PLANTING.map(([type, x, z], i) => {
    const look = LOOK[type], g = new THREE.Group(); g.position.set(x, 0, z);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(look.r * 0.8, look.r, look.h, 8), mat(look.trunk)); trunk.position.y = look.h / 2;
    const crown = new THREE.Group();
    if (look.shape === 'droop') {
      for (let k = 0; k < 7; k++) { const a = (k / 7) * Math.PI * 2, s = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3, 7), mat(look.crown)); s.position.set(Math.cos(a) * 1.2, look.h - 0.2, Math.sin(a) * 1.2); s.rotation.x = Math.PI; crown.add(s); }
      const top = new THREE.Mesh(new THREE.SphereGeometry(look.crownR * 0.75, 9, 7), mat(look.crown)); top.position.y = look.h + 0.6; crown.add(top);
    } else {
      for (const [dx, dy, dz, s] of [[0, 0.9, 0, 1], [0.7, 0.4, 0.3, 0.7], [-0.6, 0.5, -0.4, 0.75]]) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(look.crownR * s, 9, 7), mat(look.crown)); b.position.set(dx, look.h + dy, dz); crown.add(b);
      }
    }
    const stump = new THREE.Mesh(new THREE.CylinderGeometry(look.r, look.r * 1.1, 0.45, 8), mat(look.trunk)); stump.position.y = 0.22; stump.visible = false;
    const ring = new THREE.Mesh(new THREE.CircleGeometry(look.r * 0.9, 10), mat(0xd9b98a)); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.455; stump.add(ring);
    g.add(trunk, crown, stump); root.add(g);
    const id = `woodlot:${type}-${i + 1}`, name = TREES[type].name;
    return { id, type, key: id, pos: new THREE.Vector3(x, 0, z), group: g, trunk, crown, stump, label: `🪓 Chop the ${name.toLowerCase()}`, sway: 0 };
  });
  // A painted sign by the road.
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 0.12), mat(0x5a4632)); post.position.set(11, 1.1, -199); root.add(post);
  if (makeLabel) { const sign = makeLabel('🪓 Town Woodlot · bring a hatchet', 'house'); sign.position.set(11, 2.6, -199); root.add(sign); }
  const colliders = trees.map((t) => { const r = LOOK[t.type].r + 0.15; return { x0: t.pos.x - r, x1: t.pos.x + r, z0: t.pos.z - r, z1: t.pos.z + r }; });

  // Fires: a little pile of logs and a flickering flame; no real light, to stay cheap on phones.
  const fireMeshes = new Map();
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffa020, transparent: true, opacity: 0.9 }), coreMat = new THREE.MeshBasicMaterial({ color: 0xfff1a0 });
  function fireMesh(f) {
    const g = new THREE.Group(); g.position.set(f.x, 0, f.z);
    for (let k = 0; k < 3; k++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7, 6), mat(0x4a3220)); l.rotation.z = Math.PI / 2; l.rotation.y = (k / 3) * Math.PI; l.position.y = 0.1; g.add(l); }
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.9, 8), flameMat); flame.position.y = 0.55;
    const core = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.5, 6), coreMat); core.position.y = 0.4;
    g.add(flame, core); g.userData.flame = flame; root.add(g); return g;
  }

  // Each frame: stumps for felled trees, a little sway while being chopped, and the live fires.
  function update(life, t, choppingId = null) {
    for (const tree of trees) {
      const stump = isStump(life, tree.id);
      tree.trunk.visible = tree.crown.visible = !stump; tree.stump.visible = stump;
      tree.crown.rotation.z = tree.id === choppingId && !stump ? Math.sin(t * 9) * 0.04 : 0;
    }
    const fires = liveFires(life), live = new Set(fires.map((f) => f.id));
    for (const [id, m] of fireMeshes) if (!live.has(id)) { root.remove(m); fireMeshes.delete(id); }
    for (const f of fires) {
      const m = fireMeshes.get(f.id) || fireMeshes.set(f.id, fireMesh(f)).get(f.id);
      m.userData.flame.scale.set(1, 0.85 + Math.sin(t * 13 + f.id) * 0.15, 1);
    }
  }
  return { root, trees, colliders, update, fireCount: () => fireMeshes.size };
}
