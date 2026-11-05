import * as THREE from 'three';
// Low-draw-call visualisation of the existing, fictional farm-cooperative state.
// The farm paddocks and street geometry are untouched; no duplicate shops/solids.
const MAT=(colour)=>new THREE.MeshLambertMaterial({color:colour});
const cube=new THREE.BoxGeometry(1,1,1);
const species=Object.freeze({
 sheep:{body:[1.1,.72,.55],head:[.38,.36,.38],bodyColour:0xe4e0cd,headColour:0x6c6660},
 cow:{body:[1.65,1,.68],head:[.55,.6,.5],bodyColour:0xbfb8a3,headColour:0x53473e},
 hen:{body:[.5,.44,.35],head:[.25,.25,.22],bodyColour:0xb98549,headColour:0xbd3d27}
});
export function createLinkedIndustryView(life,group){
 const animals=new Map();
 for(const [farm,herd] of Object.entries(life.civic.linkedIndustries.herds)){
  const p=life.place(farm),def=species[herd[0].species],body=new THREE.InstancedMesh(cube,MAT(def.bodyColour),herd.length),
    head=new THREE.InstancedMesh(cube,MAT(def.headColour),herd.length);
  body.name='Farm '+farm+' · living animals';head.name=body.name+' heads';
  body.frustumCulled=false;head.frustumCulled=false;group.add(body,head);
  animals.set(farm,{p,herd,body,head,def});
 }
 const van=new THREE.Group();van.name='Cooperative supply van';
 const chassis=new THREE.Mesh(cube,MAT(0x4f7181));chassis.scale.set(2.15,1.2,3.4);chassis.position.y=.94;van.add(chassis);
 const cab=new THREE.Mesh(cube,MAT(0xeae0c7));cab.scale.set(2.05,.9,1.45);cab.position.set(0,1.55,1);van.add(cab);group.add(van);
 const vet=new THREE.Group();vet.name='Cooperative on-call veterinary visit';
 const coat=new THREE.Mesh(cube,MAT(0x9fdfdf));coat.scale.set(.55,1.1,.38);coat.position.y=.86;vet.add(coat);
 const head=new THREE.Mesh(cube,MAT(0xb68a6a));head.scale.set(.33,.34,.32);head.position.y=1.61;vet.add(head);group.add(vet);
 const xform=new THREE.Object3D();
 function update(dt,t,eye,overview){
  const s=life.civic.linkedIndustries;
  const ftime=life.day*1440+life.minute;
  for(const [farm,item] of animals){
   const {p,herd,body,head,def}=item,field=p.field;
   const near=!overview&&Math.hypot(p.x-eye.x,(field.z0+field.z1)/2-eye.z)<150;
   body.visible=near;head.visible=near;if(!near)continue;
   for(let i=0;i<herd.length;i++){
    const a=herd[i],width=Math.max(4,field.x1-field.x0-3),depth=Math.max(5,field.z1-field.z0-4);
    const offset=(i*0.61803398875)%1,second=(i*.41421356237)%1;
    const xx=(field.x0+field.x1)/2+(offset-.5)*width;
    const zz=(field.z0+field.z1)/2+(second-.5)*depth;
    const bob=a.alive ? .035*Math.sin(ftime*.015+i) : 0;
    const base=def.bodyColour;
    xform.position.set(xx, .72*(a.species==='cow'?1:.7)+bob,zz);
    xform.rotation.set(0,(i*.49)%6.283,0);xform.scale.set(...def.body);
    xform.updateMatrix();body.setMatrixAt(i,xform.matrix);
    const c=(a.isolated||a.health<60)?0xa67a60:base;
    body.setColorAt(i,new THREE.Color(c));
    xform.position.set(xx+Math.sin(xform.rotation.y)*.55,1.16*(a.species==='cow'?1:.7)+bob,zz+Math.cos(xform.rotation.y)*.55);
    xform.scale.set(...def.head);xform.updateMatrix();head.setMatrixAt(i,xform.matrix);
   }
   body.instanceMatrix.needsUpdate=true;head.instanceMatrix.needsUpdate=true;
   if(body.instanceColor)body.instanceColor.needsUpdate=true;
  }
  const active=s.supplyRuns.find(r=>r.status==='in-transit');
  van.visible=!!active&&!overview&&Math.hypot(active.x-eye.x,active.z-eye.z)<165;
  if(van.visible){
   const from=life.place(active.from).curb,to=life.place(active.to).curb;
   van.position.set(active.x,0,active.z);
   van.rotation.y=Math.atan2(to.x-from.x,to.z-from.z);
  }
  const v=s.vet;
  vet.visible=['travelling','examining','returning'].includes(v.status)&&!overview;
  if(vet.visible){
   if(v.status==='examining'){
    const c=s.cases.find(c=>c.id===v.activeCase),p=c&&life.place(c.farm);
    if(p)vet.position.set(p.front.x,0,p.front.z);
   }else if(v.from&&v.to){
    const f=1-v.travelMinutes/Math.max(1,v.totalTravel);
    vet.position.set(v.from.x+(v.to.x-v.from.x)*f,0,v.from.z+(v.to.z-v.from.z)*f);
   }
   vet.visible=vet.visible&&Math.hypot(vet.position.x-eye.x,vet.position.z-eye.z)<130;
  }
 }
 return {animals,van,vet,update};
}
