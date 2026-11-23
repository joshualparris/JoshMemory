// Fictional shared-world geography. X points east; +Z points south.
// The designed road and the drivable collision footprint share ONE polyline.
// Compressed, fictional-world geometry; not a NSW road-design approval or speed survey.
export const LANTERN_POINT = Object.freeze({
  id:'parristan-lantern-point',name:'Lantern Point',x:0,z:2870,
  source:'Parristan Living Nation settlement #11',fictional:true,
  representedDistanceMetres:16500,gameDistanceMetres:2870,
  latitude:-32.273600-16500/111195,longitude:148.408400,
  approach:Object.freeze({x:0,z:2810,yaw:Math.PI}),
});
// The game connection starts on the EXISTING eastern avenue, not through homes.
// Two ~85 m-radius quarter-curves replace the previously square 90-degree
// crossings. Fictional in-game advisory speed 40 km/h at the bends.
export const LANTERN_ROAD = Object.freeze({
  x:0,entranceX:338,startZ:235,curveStartZ:580,curveEndZ:750,
  westTangentX:253,eastTangentX:85,turnZ:665,endZ:3160,
  curveRadius:85,halfWidth:5,shoulderWidth:1.4,
  crossStreets:Object.freeze([2760,2990]),crossExtent:180,
  advisoryBendKmh:40,
});
function buildCentreline(){
  const p=[],push=(x,z)=>{const q={x,z};if(!p.length||Math.hypot(p.at(-1).x-x,p.at(-1).z-z)>.00001)p.push(Object.freeze(q));};
  const {entranceX,startZ,curveStartZ,turnZ,westTangentX,eastTangentX,curveRadius,endZ}=LANTERN_ROAD;
  // Continuous entry tangent south on x = 338.
  for(let z=startZ;z<curveStartZ;z+=7)push(entranceX,z);
  push(entranceX,curveStartZ);
  // Clockwise 90-degree change from south to west.
  for(let i=1;i<=28;i++){const theta=i*Math.PI/56;push(westTangentX+curveRadius*Math.cos(theta),curveStartZ+curveRadius*Math.sin(theta));}
  for(let x=westTangentX-7;x>eastTangentX;x-=7)push(x,turnZ);
  push(eastTangentX,turnZ);
  // Clockwise 90-degree change from west to south.
  for(let i=1;i<=28;i++){const theta=-Math.PI/2-i*Math.PI/56;push(eastTangentX+curveRadius*Math.cos(theta),curveEndZ+curveRadius*Math.sin(theta));}
  for(let z=curveEndZ+7;z<endZ;z+=7)push(0,z);
  push(0,endZ);
  return Object.freeze(p);
}
export const LANTERN_ROAD_CENTRELINE = buildCentreline();
const segments=Object.freeze(LANTERN_ROAD_CENTRELINE.slice(1).map((p,i)=>{
  const a=LANTERN_ROAD_CENTRELINE[i],dx=p.x-a.x,dz=p.z-a.z,d2=dx*dx+dz*dz;
  return Object.freeze({a,b:p,dx,dz,d2,minX:Math.min(a.x,p.x),maxX:Math.max(a.x,p.x),minZ:Math.min(a.z,p.z),maxZ:Math.max(a.z,p.z)});
}));
export function distanceToLanternRoad(x,z){
  if(!Number.isFinite(x)||!Number.isFinite(z))return Infinity;
  let distance2=Infinity;
  for(const s of segments){
    const t=Math.max(0,Math.min(1,((x-s.a.x)*s.dx+(z-s.a.z)*s.dz)/s.d2));
    const dx=x-(s.a.x+s.dx*t),dz=z-(s.a.z+s.dz*t);
    distance2=Math.min(distance2,dx*dx+dz*dz);
  }
  return Math.sqrt(distance2);
}
export function onLanternRoad(x,z){
  if(!Number.isFinite(x)||!Number.isFinite(z))return false;
  const cross=Math.abs(x)<=LANTERN_ROAD.crossExtent &&
    LANTERN_ROAD.crossStreets.some(roadZ=>Math.abs(z-roadZ)<=5);
  if(cross)return true;
  // Called repeatedly per physics frame by lane assist. Quickly reject all
  // far-away road segments before doing the nearest-point maths.
  const radius=LANTERN_ROAD.halfWidth+.25,r2=radius*radius;
  for(const p of segments){
    if(x<p.minX-radius||x>p.maxX+radius||z<p.minZ-radius||z>p.maxZ+radius)continue;
    const t=Math.max(0,Math.min(1,((x-p.a.x)*p.dx+(z-p.a.z)*p.dz)/p.d2));
    const dx=x-p.a.x-p.dx*t,dz=z-p.a.z-p.dz*t;
    if(dx*dx+dz*dz<=r2)return true;
  }
  return false;
}
export const LANTERN_MAP_DESTINATION=Object.freeze({
  id:LANTERN_POINT.id,kind:'region',name:LANTERN_POINT.name,
  x:LANTERN_POINT.x,z:LANTERN_POINT.z,
  address:'Fictional Parristan settlement · south of Repository Town',
  fact:'A 3D settlement linked to Parristan Living Nation, 16.5 km away in fictional-world geography. The playable approach uses a compressed, curved rural road.',
});
