import * as THREE from 'three';

// A practical small-town Australian production bakery. Rooms are zoned in
// workflow order: deliveries -> ingredient store -> mixer -> proofer ->
// guarded ovens -> cooling and bagging -> shop counter -> customer.
// Clear 2.7 m central corridor; no blocking "teleport" collision box.
const X=8.2, F=6, B=-17.5, H=4.1, A=1.4, TH=.16;
export const BAKERY_ROOMS=[
  'Bread shop & display', 'Main circulation & bakery passage',
  'Mixing & preparation', 'Baking & ovens',
  'Dough proofing', 'Cooling & packing',
  'Dry ingredient store', 'Wash-up & staff hygiene'
];
const ZONES=[
  {name:BAKERY_ROOMS[2],room:2,side:-1,z0:-6,z1:1.35,colour:0xcac4b2},
  {name:BAKERY_ROOMS[3],room:3,side:1,z0:-6,z1:1.35,colour:0xbabbb4},
  {name:BAKERY_ROOMS[4],room:4,side:-1,z0:-11.5,z1:-6,colour:0xd0c7b7},
  {name:BAKERY_ROOMS[5],room:5,side:1,z0:-11.5,z1:-6,colour:0xc9d1c5},
  {name:BAKERY_ROOMS[6],room:6,side:-1,z0:B,z1:-11.5,colour:0xc1b7a1},
  {name:BAKERY_ROOMS[7],room:7,side:1,z0:B,z1:-11.5,colour:0xb6c6c1}
];

export function buildBakeryInterior(site,makeLabel){
 const group=new THREE.Group();
 group.name='Bakery production and shop';
 group.add(new THREE.HemisphereLight(0xffffff,0x71645a,2.3));
 const colliders=[],interactables=[],sceneObjects=[],placedProps=[],dynamics=[],staticBatches=new Map();
 const m=new Map();
 const mat=c=>{if(!m.has(c))m.set(c,new THREE.MeshLambertMaterial({color:c}));return m.get(c)};
 const cube=(w,h,d,x,y,z,col)=>{
   if(!staticBatches.has(col))staticBatches.set(col,[]);
   staticBatches.get(col).push({w,h,d,x,y,z});
 };
 const solid=(w,h,d,x,y,z,col)=>{
   cube(w,h,d,x,y,z,col);
   colliders.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2});
 };
 const shelf=(x,z,w,d,levels=3)=>{
   solid(w,2.45,d,x,1.225,z,0x83634b);
   for(let level=0;level<levels;level++)cube(w-.1,.08,d+.05,x,.55+level*.72,z,0xbba17c);
 };
 const counter=(x,z,w=2.8)=>{solid(w,1,.83,x,.50,z,0x735746);cube(w+.06,.11,.94,x,1.04,z,0xc8b9a4)};
 const roomLabel=(txt,x,z)=>{const s=makeLabel(txt,'room');s.position.set(x,3.05,z);s.userData.labelKind='room';group.add(s)};
 const station=(key,title,description,room,x,z,doWhat='info')=>{
   const pos=new THREE.Vector3(x,0,z);
   interactables.push({key:'bakery:'+key,type:'civic',label:title,room,roomName:BAKERY_ROOMS[room],pos,
      act:{do:doWhat,title,text:description,stage:key,civicId:'bakery'}});
   placedProps.push({type:key,room});sceneObjects.push({type:'bakery',label:title,room,interactive:true,pos:{x,z}});
 };
 // Floors, painted plaster, tiled wet-room surfaces and wash-down skirting.
 cube(X*2,.16,F-B,0,-.08,(F+B)/2,0xb0ac9e);
 for(const q of ZONES)cube(X-A-.12,.024,q.z1-q.z0-.08,q.side*(X+A)/2,.03,(q.z1+q.z0)/2,q.colour);
 cube(A*2-.08,.03,1.35-B,0,.04,(B+1.35)/2,0xad9f91);
 cube(X*2,.20,F-B,0,H+.1,(B+F)/2,0xece5d6);
 for(let z=B+2;z<F;z+=4)cube(X*2,.18,.33,0,H+.02,z,0x8e8375);
 const wall=(xa,xb,za,zb)=>{if(xb>xa&&zb>za)solid(xb-xa,H,zb-za,(xa+xb)/2,H/2,(za+zb)/2,0xe5ddd0)};
 wall(-X,X,B,B+TH);
 // Front shop windows either side of a 2.5m entrance.
 wall(-X,-1.25,F-TH,F);
 wall(1.25,X,F-TH,F);
 cube(2.5,.20,.28,0,3.15,F,0x816e5b);
 cube(2.6,.07,.52,0,.035,F,0xbcb9ae);
 for(const side of [-1,1]){
    // Walls are complete colliders; daylight windows have a detailed glass
    // pane plus sill but do not create walk-through openings.
    solid(.18,H,F-B,side*X,H/2,(F+B)/2,0xe0d7ca);
    for(const q of ZONES.filter(v=>v.side===side)){
      const zm=(q.z0+q.z1)/2;
      cube(.045,1.55,1.4,side*(X+.1),2.1,zm,0x9eb7b6);
      cube(.09,.1,1.5,side*(X+.12),1.27,zm,0x786f65);
    }
    // Processing rooms have direct openings off the central corridor.
    for(const q of ZONES.filter(v=>v.side===side)){
      const mid=(q.z0+q.z1)/2;
      wall(side*A-.1,side*A+.1,q.z0,mid-1.12);
      wall(side*A-.1,side*A+.1,mid+1.12,q.z1);
      cube(.23,.18,2.28,side*A,2.75,mid,0x8b7d6d);
      roomLabel(q.name,side*(A+1.75),mid);
    }
    // Cross walls stop food prep, stock and wash-up areas merging.
    for(const z of [-6,-11.5])wall(side<0?-X:A,side<0?-A:X,z-TH/2,z+TH/2);
 }
 // Shop has a generous accessible circulation aisle from the front door.
 cube(5.6,.055,3.2,0,.035,3.25,0x9d907c);
 // Retail frontage: glass pie case, shelves of rolls and breads, cash till.
 counter(4.55,1.65,3.65);
 cube(2.3,.80,.12,4.55,1.66,1.65,0x9ab6b4); // transparent-looking display case
 cube(2.2,.08,.7,4.55,1.15,1.65,0xd4bd92);
 for(const x of [3.6,4.4,5.2]){
   cube(.4,.23,.4,x,1.27,1.65,0xb77b45); // pastry trays
   cube(.35,.12,.35,x,1.53,1.65,0xe0bb79);
 }
 shelf(-7.5,3.2,.60,3.10);
 for(const z of [1.9,2.8,3.7,4.5])for(const y of [.72,1.46,2.18]){
   cube(.52,.20,.38,-6.8,y,z,0xc59255); // bread tins and baskets
   cube(.38,.13,.28,-6.8,y+.18,z,0xe1ae65);
 }
 cube(.70,.25,.45,5.3,1.18,1.80,0x333d42); // EFTPOS terminal
 cube(.58,.10,.36,5.4,1.37,1.80,0xbac5be);
 cube(1.65,.9,.16,4.8,2.8,5.72,0x91795d); // menu sign
 station('checkout','Shop counter · buy bread and pies',
   'Fresh loaves and pies appear here after being baked and moved from the cooling racks. Prices and available quantities use the actual TownLife stock.',
   0,3.2,2.22,'civic-ledger');
 station('shelves','Inspect today’s baked goods',
   'Bread and pies are arranged on trays and kept off the floor. Unsold goods stay in the TownLife sales inventory and can run out.',
   0,-5.45,2.9,'bakery-status');
 station('opening-hours','Read bakery opening hours',
   'The bakery opens early. Bakers may be preparing dough before the sales counter opens. The opening times and staffing are simulated by the town clock.',
   0,1.0,4.5,'bakery-status');
 roomLabel('Bakery shopfront',-3.0,4.9);
 // MIXING zone. Stainless preparation benches, commercial mixer, sink.
 counter(-6.45,-4.1,2.2);
 solid(1.35,1.52,1.18,-5.2,.76,-2.15,0xb5b6ac); // spiral mixer
 const bowl=new THREE.Mesh(new THREE.CylinderGeometry(.55,.41,.42,14),mat(0x909fa1));
 bowl.position.set(-5.2,1.45,-2.15);group.add(bowl);
 cube(.35,.6,.28,-5.2,1.82,-2.15,0x6e777a);
 for(const x of [-7.05,-6.36,-5.67])cube(.50,.22,.47,x,1.18,-4.1,0xc7a477);
 solid(.80,.90,.7,-3.2,.45,-5.4,0xbebfba); // hand wash basin
 cube(.6,.1,.52,-3.2,.99,-5.4,0xd3d9d4);
 station('mixer','Mix a dough batch',
   'A commercial mixer combines flour, water, yeast and salt. The simulated batch uses two actual flour bags from the Mill and needs staff on shift.',
   2,-3.15,-2.30,'bakery-process');
 station('prep-bench','Inspect clean dough preparation benches',
   'Sanitised stainless work surfaces are used for dividing, weighing, rounding and shaping dough. Raw ingredients are kept separate from ready-to-eat products.',
   2,-5.5,-4.08);
 station('wash-hands','Use dedicated hand-wash sink',
   'This sink is for handwashing before handling food. Cleaning equipment and food ingredients should not share a hand-wash basin.',
   2,-3.05,-5.05);
 // OVEN zone. Commercial deck ovens, guarded surfaces, insulated doors.
 for(const z of [-1.20,-3.95]){
   solid(2.55,2.6,1.25,6.4,1.30,z,0x747b7b);
   cube(1.86,.74,.08,6.4,1.36,z+.68,0x383f42);
   cube(1.6,.48,.045,6.4,1.42,z+.735,0xaa7659);
   const flame=new THREE.Mesh(new THREE.BoxGeometry(1.55,.38,.04),
     new THREE.MeshLambertMaterial({color:0xf8ab61,emissive:0xe76f26,emissiveIntensity:.06}));
   flame.position.set(6.4,1.42,z+.77);
   flame.userData.anim={key:'bakery:oven-lights',type:'glow',phase:z,always:false};
   group.add(flame);dynamics.push(flame);
 }
 cube(1.8,.09,2.1,2.4,.93,-5.35,0xaab3ae); // landing bench
 cube(.2,2.5,.16,2.5,1.3,-4.88,0x7c9a9d); // rack
 station('oven','Check oven and bake proofed dough',
   'The deck ovens are guarded hot equipment. Baking completes only after simulated proofing and oven time, then adds real loaves to the Bakery shelves.',
   3,4.15,-2.6,'bakery-process');
 station('oven-safety','Read oven safety rules',
   'Hot trays and doors require safe handling. Keep the landing bench free, use protective equipment and let products cool before packing.',
   3,3.10,-4.65);
 // PROOFING zone. Enclosed cabinet, trays and thermometers.
 solid(1.75,2.7,1.05,-6.70,1.35,-9.28,0xc0c6c1);
 cube(1.27,1.98,.06,-6.7,1.43,-8.72,0x8da5a3);
 for(const y of [.7,1.25,1.80,2.3]) {
  cube(1.2,.08,.7,-6.70,y,-9.30,0xbcc3bb);
  for(const x of [-6.95,-6.55,-6.15])cube(.22,.11,.22,x,y+.11,-9.3,0xc7a06b);
 }
 solid(1.65,.90,.82,-3.65,.45,-10.2,0xb2b7b4);
 station('proofer','Check the dough proofer',
   'Dough rises in a warm, humid proofing cabinet. A supervised batch must finish its simulated proofing period before it can go into the oven.',
   4,-4.35,-9.35,'bakery-process');
 station('food-thermometer','Read proofing and temperature chart',
   'The baker records fermentation time, dough condition and cabinet settings. This interactive scene is educational, not a live appliance.',
   4,-3.05,-7.25);
 // COOLING/packing zone: on racks, not piled up in work zones.
 for(const x of [5.8,7.1]) {
   shelf(x,-9.05,.62,2.20,4);
   for(const z of [-9.9,-9.0,-8.1])for(const y of [.75,1.5,2.17])
     cube(.34,.16,.40,x,y,z,0xc78b48);
 }
 counter(2.95,-10.15,1.65);
 cube(.75,.12,.48,2.90,1.13,-10.14,0xc3b293);
 station('cooling','Inspect the cooling and packing racks',
   'Loaves cool on open racks before they are bagged and labelled. Putting hot loaves straight into sealed bags traps condensation.',
   5,3.8,-9.10,'bakery-status');
 station('delivery-orders','Read café and store delivery list',
   'The bakery supplies bread and pies to the town. Check how much product is on the shelves and where flour is coming from.',
   5,3.05,-7.25,'bakery-status');
 // DRY INGREDIENT STORE. Flour on pallets, sealed drums, allergen labels.
 shelf(-7.5,-14.55,.62,3.75,4);
 for(const x of [-6.65,-5.97,-5.29]){
  for(const z of [-14.9,-13.8]){
   cube(.62,.57,.54,x,.31,z,0xb7aa8e);
   cube(.54,.48,.49,x,.79,z,0xd6bb8c);
  }
 }
 solid(1.26,1.03,.78,-3.50,.52,-16,0xadb7b5); // weighing station
 cube(.86,.07,.55,-3.50,1.09,-16.0,0x718789);
 station('flour-store','Count flour from the town Mill',
   'The Mill delivers flour for baking. Bags are stored off the floor in the dry store. Inspect the Bakery’s actual ingredient inventory.',
   6,-5.05,-13.1,'bakery-status');
 station('allergens','Inspect ingredient and allergen labels',
   'Wheat flour contains gluten. Eggs, milk and other ingredients need clear storage identification. Accurate allergen information matters in real bakeries.',
   6,-3.2,-15.75);
 // WASH/STAFF zone: cleaning sink, lockers, apron hooks and bins.
 solid(1.75,1.02,.96,6.42,.51,-15.65,0xb0babe);
 cube(1.38,.14,.69,6.42,1.08,-15.65,0xdde1dc);
 for(const x of [3.06,3.95,4.83]) {
   solid(.7,2.1,.5,x,1.05,-16.55,0x8ba5a1); // lockers
   cube(.42,.08,.05,x,1.65,-16.24,0x4b5a58);
 }
 cube(.82,.52,.80,6.25,.26,-12.2,0x555b52); // lined refuse bin
 station('cleaning','Check the dishwash and sanitation station',
   'Utensils and trays are washed away from dough preparation. The cleaning station uses separate equipment and good drainage.',
   7,5.30,-15.0);
 station('staff-room','Check staff lockers and PPE',
   'Clean aprons, hair coverings and work shoes are stored separately from ingredients and baked products. Keep fire exits clear.',
   7,3.25,-14.0);
 // Work-zone pendant lights. Static ceiling fixtures avoid excessive draw calls.
 for(const q of ZONES){
  cube(1.08,.12,.56,q.side*4.6,3.86,(q.z0+q.z1)/2,0xffecd2);
 }
 for(const z of [4,0,-4,-8,-12,-16])cube(.72,.13,.42,0,3.86,z,0xffecd2);
 const unit=new THREE.BoxGeometry(1,1,1),matrix=new THREE.Matrix4();
 for(const [c,els] of staticBatches){
  const g=new THREE.InstancedMesh(unit,mat(c),els.length);
  els.forEach((e,i)=>{matrix.makeScale(e.w,e.h,e.d);matrix.setPosition(e.x,e.y,e.z);g.setMatrixAt(i,matrix)});
  g.instanceMatrix.needsUpdate=true;group.add(g);
 }
 group.userData.staticBatches=staticBatches.size;
 const rooms=[
  {name:BAKERY_ROOMS[0],x0:-X,x1:X,z0:1.35,z1:F},
  {name:BAKERY_ROOMS[1],x0:-A,x1:A,z0:B,z1:1.35},
  ...ZONES.map(q=>({name:q.name,x0:q.side<0?-X:A,x1:q.side<0?-A:X,z0:q.z0,z1:q.z1}))
 ];
 return {group,colliders,interactables,sceneObjects,placedProps,rooms,
   doors:[],dynamics,sight:[],
   bounds:{x0:-X,x1:X,z0:B,z1:F},
   spawn:new THREE.Vector3(0,0,F-2.3),
   exitZone:{x0:-1.10,x1:1.10,z0:F-.12,z1:F+1.2}};
}
