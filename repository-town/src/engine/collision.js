// Static axis-aligned collision for a flat world. Colliders are {x0,x1,z0,z1}
// rectangles; the player is a circle. A uniform grid keeps lookups cheap with
// thousands of colliders (188 houses plus yard props).
const CELL = 8;

export class CollisionWorld {
  constructor(colliders = []) {
    this.grid = new Map();
    this.all = [];
    for (const c of colliders) this.add(c);
  }

  add(c) {
    this.all.push(c);
    for (let gx = Math.floor(c.x0 / CELL); gx <= Math.floor(c.x1 / CELL); gx++) {
      for (let gz = Math.floor(c.z0 / CELL); gz <= Math.floor(c.z1 / CELL); gz++) {
        const k = gx + ',' + gz;
        if (!this.grid.has(k)) this.grid.set(k, []);
        this.grid.get(k).push(c);
      }
    }
  }

  near(x, z, r) {
    const out = new Set();
    for (let gx = Math.floor((x - r) / CELL); gx <= Math.floor((x + r) / CELL); gx++) {
      for (let gz = Math.floor((z - r) / CELL); gz <= Math.floor((z + r) / CELL); gz++) {
        const list = this.grid.get(gx + ',' + gz);
        if (list) for (const c of list) out.add(c);
      }
    }
    return out;
  }

  hits(x, z, r) {
    for (const c of this.near(x, z, r)) {
      const cx = Math.max(c.x0, Math.min(x, c.x1)), cz = Math.max(c.z0, Math.min(z, c.z1));
      if ((x - cx) ** 2 + (z - cz) ** 2 < r * r) return c;
    }
    return null;
  }

  // Moves axis by axis so the player slides along walls instead of sticking.
  // Steps are subdivided so a fast run can never tunnel through a 0.4 m wall.
  move(pos, dx, dz, r) {
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dz)) / (r * 0.5)));
    const sx = dx / steps, sz = dz / steps;
    let blocked = false;
    for (let i = 0; i < steps; i++) {
      if (!this.hits(pos.x + sx, pos.z, r)) pos.x += sx; else blocked = true;
      if (!this.hits(pos.x, pos.z + sz, r)) pos.z += sz; else blocked = true;
    }
    return blocked;
  }
}
