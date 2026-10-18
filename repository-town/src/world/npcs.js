// Lightweight, friendly low-poly residents. Geometry is procedural, so no image assets,
// CDN calls, texture downloads, or private repository data are needed.
import * as THREE from 'three';
import { NPCS, HOUSE_GUIDE } from '../ui/npc-data.js';

function colour(value) { return new THREE.MeshLambertMaterial({color:value}); }
const skin = colour(0xf1c8a1), dark = colour(0x293043), black = colour(0x161b28);
const box = (w,h,d) => new THREE.BoxGeometry(w,h,d);
const ball = (r) => new THREE.SphereGeometry(r,10,7);

export function makeNPC(npc, makeLabel) {
  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body);
  const tunic = colour(npc.color);
  const torso = new THREE.Mesh(box(.76,.92,.4),tunic); torso.position.y=1.13;body.add(torso);
  const head = new THREE.Mesh(ball(.35),skin); head.position.y=1.97;body.add(head);
  const hair = new THREE.Mesh(box(.69,.16,.65),dark);hair.position.set(0,2.27,-.05);body.add(hair);
  for(const side of [-1,1]) {
    const arm = new THREE.Mesh(box(.21,.75,.25),tunic);arm.position.set(side*.52,1.13,0);body.add(arm);
    const leg = new THREE.Mesh(box(.29,.63,.31),dark);leg.position.set(side*.21,.35,0);body.add(leg);
    const eye = new THREE.Mesh(ball(.042),black);eye.position.set(side*.145,1.99,.3);body.add(eye);
  }
  // A coloured badge and tall hat make these characters recognisable from a distance.
  const badge = new THREE.Mesh(box(.24,.24,.07),colour(npc.color));badge.position.set(.14,1.32,.24);body.add(badge);
  if(['pip','sage','nova','vale'].includes(npc.id)){
    const brim=new THREE.Mesh(new THREE.CylinderGeometry(.39,.45,.09,9),dark);brim.position.y=2.31;body.add(brim);
    const crown=new THREE.Mesh(new THREE.CylinderGeometry(.25,.32,.31,9),tunic);crown.position.y=2.5;body.add(crown);
  }
  if(npc.id==='circuit'){
    head.material=colour(0xa7dce8);
    const antenna=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.38,7),dark);antenna.position.y=2.51;body.add(antenna);
    const tip=new THREE.Mesh(ball(.095),tunic);tip.position.y=2.72;body.add(tip);
  }
  if(makeLabel) {
    const label=makeLabel(npc.emoji+' '+npc.name,'interactive');label.position.set(0,3.03,0);
    root.add(label); root.userData.label=label;
  }
  root.userData.body=body;
  root.userData.npc=npc;
  root.userData.baseY=0;
  return root;
}
export function placeTownNPCs(group, lots, makeLabel) {
  const result=[];
  for(const npc of NPCS){
    const lot=lots.get(npc.coordinate);
    if(!lot)continue;
    const figure=makeNPC(npc,makeLabel);
    const x=npc.id==='rowan'?3.2:lot.doorPos.x+3.1;
    const z=npc.id==='rowan'?lot.doorPos.z+6.8:lot.doorPos.z+6;
    figure.position.set(x,0,z);
    group.add(figure);
    result.push({npc,group:figure,pos:new THREE.Vector3(x,0,z),mode:'town'});
  }
  return result;
}
export function placeHouseGuide(inside, makeLabel) {
  const room=inside.rooms[0], world=inside.colliders;
  const candidates=[
    [inside.spawn.x+1.5,inside.spawn.z-1.3],
    [inside.spawn.x-1.5,inside.spawn.z-1.3],
    [inside.spawn.x+1.5,inside.spawn.z+.8],
    [inside.spawn.x-1.5,inside.spawn.z+.8]
  ];
  const free=(x,z)=>{
    if(x<=room.x0+.55||x>=room.x1-.55||z<=room.z0+.55||z>=room.z1-1.65)return false;
    return !world.some(c => {const cx=Math.max(c.x0,Math.min(x,c.x1)),cz=Math.max(c.z0,Math.min(z,c.z1));return (x-cx)**2+(z-cz)**2<.55**2;});
  };
  const point=candidates.find(p=>free(...p));
  if(!point)return null;
  const figure=makeNPC(HOUSE_GUIDE,makeLabel);
  figure.position.set(point[0],0,point[1]);inside.group.add(figure);
  return {npc:HOUSE_GUIDE,group:figure,pos:figure.position,mode:'house',house:{name:inside.house.name,kind:inside.house.kind,coordinate:inside.house.coordinate}};
}
export function animateNPCs(list,time,playerPos) {
  for(const entry of list) {
    const d=Math.hypot(entry.pos.x-playerPos.x,entry.pos.z-playerPos.z);
    const visible=d<65;entry.group.visible=visible;
    if(!visible)continue;
    const model=entry.group.userData.body;
    model.position.y=Math.sin(time*1.7+entry.pos.x*.15)*.07;
    // Face the visitor within conversation distance, without constantly rotating at range.
    if(d<7)model.rotation.y=Math.atan2(playerPos.x-entry.pos.x,playerPos.z-entry.pos.z);
    const lbl=entry.group.userData.label;
    if(lbl)lbl.visible=d>1.4;
  }
}
