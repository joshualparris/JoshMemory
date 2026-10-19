import * as THREE from "three";
import { lotPosition } from "../world/town.js";
import { SITES } from "./town-system.js";

// A civic high street occupies ONLY unassigned lots on row 8.
// All new meshes remain in the same world group and use simple shared materials.
const colours = {
  civic: 0xb8a385, finance: 0x6b96ae, services: 0x91bca2,
  commerce: 0xd09a66, industry: 0x818a93, utilities: 0x7a9eac,
  transport: 0xa8a18b, agriculture: 0x91b969, recreation: 0x6db880,
  emergency: 0xbf6262,
};
export function buildCivicDistrict(town, makeLabel) {
  const available = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
    .map(letter => letter + "8").filter(coordinate => !town.lots.has(coordinate));
  const buildings = [];
  const boxes = [];
  const root = new THREE.Group();
  root.name = "Living Civic District";
  town.group.add(root);
  const walls = new Map();
  const getWall = kind => {
    if (!walls.has(kind)) walls.set(kind, new THREE.MeshLambertMaterial({color: colours[kind] || 0xb8a385}));
    return walls.get(kind);
  };
  const roof = new THREE.MeshLambertMaterial({color: 0x3f4b57});
  const windowMat = new THREE.MeshLambertMaterial({color:0xffdc8e,emissive:0xffc56f,emissiveIntensity:0.06});
  const lampMat = new THREE.MeshLambertMaterial({color:0xffe7a6,emissive:0xffc56f,emissiveIntensity:0.08});
  const makeBox = (w,h,d,material,x,y,z, parent) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    mesh.position.set(x,y,z);parent.add(mesh);return mesh;
  };
  const makeSite = ([id,name,icon,kind],coordinate) => {
    const pos = lotPosition(coordinate);
    const group = new THREE.Group(); group.position.set(pos.x,0,pos.z);root.add(group);
    if (kind === "recreation") {
      const canopy = new THREE.Mesh(new THREE.ConeGeometry(4,6,8),getWall(kind));
      canopy.position.y = 5.5; group.add(canopy);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.5,.65,4,8),roof);
      trunk.position.y = 2;group.add(trunk);
      boxes.push({x0:pos.x-.65,x1:pos.x+.65,z0:pos.z-.65,z1:pos.z+.65});
    } else if (kind === "agriculture") {
      makeBox(8,.3,7,getWall(kind),0,.15,0,group);
      for (let n=0;n<4;n++) makeBox(7,.55,.45,getWall("recreation"),0,.6,-2+n*1.4,group);
      makeBox(3,3,3,roof,3,1.5,-3,group);
      boxes.push({x0:pos.x+1.5,x1:pos.x+4.5,z0:pos.z-4.5,z1:pos.z-1.5});
    } else {
      makeBox(11,4.8,9,getWall(kind),0,2.4,0,group);
      makeBox(12,0.7,10,roof,0,5.15,0,group);
      for(const x of [-3.3,0,3.3]) makeBox(1.5,1.6,.08,windowMat,x,3,4.55,group);
      makeBox(2.2,3,.2,roof,0,1.5,4.7,group);
      if(kind==="industry" || kind==="utilities"){
        makeBox(1.5,5,1.5,roof,3,7.7,-2,group);
      }
      boxes.push({x0:pos.x-5.7,x1:pos.x+5.7,z0:pos.z-4.7,z1:pos.z+4.7});
    }
    const sign = makeLabel(icon + " " + name, "street");
    sign.position.set(0,7.4,5.4);group.add(sign);
    buildings.push({id,name,kind,coordinate,position:pos});
  };
  SITES.slice(0,available.length).forEach((site,i)=>makeSite(site,available[i]));
  // Shared emissive materials change after sunset without GPU-heavy point lights.
  available.filter((_,i)=>i%2===0).forEach(coordinate=>{
    const p=lotPosition(coordinate);
    makeBox(.18,5,.18,roof,p.x+7,2.5,p.z+10,root);
    makeBox(.9,.55,.9,lampMat,p.x+7,5.1,p.z+10,root);
  });
  // Two small procedural delivery trucks drive the existing high-street road.
  // Their motion is cosmetic; actual deliveries are recorded by the model.
  const truckMat = new THREE.MeshLambertMaterial({color:0xebba64});
  const tyreMat = new THREE.MeshLambertMaterial({color:0x25313b});
  const trucks = [0,1].map(i=>{
    const vehicle = new THREE.Group();
    makeBox(3,1.3,2.1,truckMat,-1,1.15,0,vehicle);
    makeBox(1.8,2,2.1,getWall("transport"),1,1.5,0,vehicle);
    for (const x of [-1.8,1.3]) for(const z of [-1,1]){
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.48,.48,.25,10),tyreMat);
      wheel.rotation.x=Math.PI/2;wheel.position.set(x,.53,z*1.05);vehicle.add(wheel);
    }
    root.add(vehicle);return vehicle;
  });
  function update(t, night = false) {
    windowMat.emissiveIntensity = night ? 1.3 : 0.06;
    lampMat.emissiveIntensity = night ? 2.2 : 0.08;
    if(!available.length)return;
    const left=lotPosition("A8").x-20,right=lotPosition("Z8").x+20;
    const road=lotPosition("A8").z+16, span=right-left;
    trucks.forEach((v,i)=>{
      const u=((t*3.1+i*span/2)%span+span)%span;
      v.position.set(i===0?left+u:right-u,.1,road+(i===0?-1.2:1.2));
      v.rotation.y=i===0?Math.PI/2:-Math.PI/2;
    });
  }
  town.colliders.push(...boxes);
  return {buildings,update};
}

