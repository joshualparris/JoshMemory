// A civic building's exterior door faces the street. North-side buildings
// face +z; south-side industry and utilities face -z. One universal +z exit
// previously respawned the player *inside* the Foundry's exterior wall.
export function civicExitPose(site, colliders, radius = 0.46) {
  if (!site || !site.door || !Number.isFinite(site.door.x) || !Number.isFinite(site.door.z))
    throw new TypeError('Civic exit requires a door position');
  const side = site.side === 'south' ? -1 : 1;
  const collides = (x,z) => (colliders||[]).some(c=>{
    const cx=Math.max(c.x0,Math.min(c.x1,x)),cz=Math.max(c.z0,Math.min(c.z1,z));
    return (x-cx)**2+(z-cz)**2 < radius**2;
  });
  // Footpath distance also keeps the player beyond the auto-enter door sensor.
  for(const offset of [3.2,4.2,5.2,6.2,7.2,8.2,9.2,10.2]){
    const z=site.door.z+side*offset;
    for(const xoff of [0,-1.6,1.6,-3.2,3.2]){
      const x=site.door.x+xoff;
      // Facing away from the door, out over the street (yaw 0 looks towards -z).
      if(!collides(x,z))return {x,z,yaw:side<0?0:Math.PI};
    }
  }
  // Never return a collision-intersecting point. The caller can use the
  // safe town-centre respawn rather than trap the user inside geometry.
  return null;
}
