// RTMAP-PLAY-001. Fictional first playable subdivision, outside the established
// houses, far west of the original railway/farm plots. Metres in world space.
// Drawn plots are *unserviced planning lots*, not inhabited homes or real NSW titles.
export const SUBDIVISION_ROADS=Object.freeze([
 {name:'West approach / Workshop Way',x0:-542,x1:-337,z0:172.5,z1:181.5},
 {name:'Kurrajong Road',x0:-540.5,x1:-531.5,z0:177,z1:314},
 {name:'Bottlebrush Road',x0:-420.5,x1:-411.5,z0:216,z1:314},
 {name:'Wattle Street',x0:-539,x1:-413,z0:215.5,z1:224.5},
 {name:'Banksia Street',x0:-539,x1:-413,z0:304.5,z1:313.5}
]);
export const SUBDIVISION_PARCELS=Object.freeze(
 [0,1].flatMap(side=>Array.from({length:6},(_,i)=>{
  const number=i*2+(side===0?2:1),street=side===0?'Wattle Street':'Banksia Street';
  const x=-520+i*16,z=side===0?243:286.5;
  return Object.freeze({id:'SUB:'+side+':'+i,address:number+' '+street,
   street,number,x,z,width:16,depth:35,area:560,
   // Not an established legal lot, development approval or live utility account.
   kind:'residential',status:'vacant, not yet serviced'});
 }))
);
export const SUBDIVISION_START=Object.freeze({x:-508,z:220,yaw:Math.PI/2});
export function subdivisionRoadAllows(x,z){
 return SUBDIVISION_ROADS.some(r=>x>=r.x0&&x<=r.x1&&z>=r.z0&&z<=r.z1);
}
export function ensureSubdivisionTitles(life){
 const parcels=life?.civic?.property?.parcels;
 if(!parcels)return 0;
 for(const p of SUBDIVISION_PARCELS){
  if(!parcels[p.id]) parcels[p.id]={
   id:p.id,name:p.address+' · vacant subdivision parcel',address:p.address,
   kind:'house',owner:'Town Property Cooperative',tenant:null,occupants:[],
   jointOwners:[],occupied:false,value:7500+iPrice(p),rent:0,
   listed:false,protected:false,condition:100,
   unserviced:true,fictionalPlanning:true,area:p.area
  };
 }
 return SUBDIVISION_PARCELS.length;
}
const iPrice=p=>p.number*75;
export function drawPlayableSubdivision(b){
 const ROAD=0x464c52,EDGE=0xc9c6bb,LOT=0x8cac79,LINE=0xece9db;
 for(const road of SUBDIVISION_ROADS){
  const w=road.x1-road.x0,d=road.z1-road.z0,cx=(road.x0+road.x1)/2,cz=(road.z0+road.z1)/2;
  b.box(ROAD,w,.075,d,cx,.02,cz);
  if(w>d){for(let x=road.x0+8;x<road.x1-7;x+=12)b.box(LINE,3,.012,.12,x,.065,cz);
   b.box(EDGE,w,.08,.60,cx,.07,road.z0-.35);
   b.box(EDGE,w,.08,.60,cx,.07,road.z1+.35);
  }else{
   for(let z=road.z0+9;z<road.z1-7;z+=12)b.box(LINE,.12,.012,3,cx,.065,z);
   b.box(EDGE,.6,.08,d,road.x0-.35,.07,cz);
   b.box(EDGE,.6,.08,d,road.x1+.35,.07,cz);
  }
 }
 for(const p of SUBDIVISION_PARCELS){
  b.box(LOT,p.width,.04,p.depth,p.x,.02,p.z);
  // Fenced residential boundaries without blocking the future front driveways.
  const color=0xe0d7bd;
  b.box(color,p.width,.07,.10,p.x,.10,p.z-p.depth/2);
  b.box(color,p.width,.07,.10,p.x,.10,p.z+p.depth/2);
  b.box(color,.10,.07,p.depth,p.x-p.width/2,.10,p.z);
  b.box(color,.10,.07,p.depth,p.x+p.width/2,.10,p.z);
  // Number plinth and a visible reserved future-home envelope. No fake occupied houses.
  const signZ=p.z+(p.street==='Wattle Street'?-15.8:15.8);
  b.box(0xebe6d8,.85,.78,.15,p.x-.4,.41,signZ);
  b.box(0x3f665e,.72,.16,.17,p.x-.4,.73,signZ);
  // Permeable placeholder building pads - no fake walls or building collisions.
  b.box(0xb9b2a3,7.5,.07,8.5,p.x,.035,p.z);
  b.box(0xded1b7,6.5,.035,7.5,p.x,.087,p.z);
  for(const side of [-1,1]){
   b.cyl(0x866a4d,.16,1.35,p.x+side*6.4,.68,p.z);
   b.ball(0x68955f,.65,p.x+side*6.4,1.65,p.z);
  }
 }
}
