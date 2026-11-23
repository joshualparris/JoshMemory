// Distinct weatherboard/brick buildings for the fictional NSW-inspired village.
// Low-poly modelling reuses shared meshes/materials for affordable phone play.
import * as THREE from 'three';
const walls=[0xe6d2b6,0xbbad95,0xc7b9a2,0xd6c4a2,0xc5aa96].map(c=>new THREE.MeshLambertMaterial({color:c}));
const roofs=[0x90534a,0x5b6366,0x79836e,0x735749].map(c=>new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide}));
const windowMat=new THREE.MeshLambertMaterial({color:0x9db7c0,emissive:0x253e44,emissiveIntensity:.16});
const trimMat=new THREE.MeshLambertMaterial({color:0xede9da}),darkMat=new THREE.MeshLambertMaterial({color:0x654e3f});
const pathMat=new THREE.MeshLambertMaterial({color:0xc7bda7});
const greenMat=new THREE.MeshLambertMaterial({color:0x657f58});
const boxGeo=new THREE.BoxGeometry(1,1,1);
function box(root,w,h,d,x,y,z,mat){
  const m=new THREE.Mesh(boxGeo,mat);m.scale.set(w,h,d);m.position.set(x,y,z);root.add(m);return m;
}
function gable(root,{x,z,w,d,h,pitch,colour}){
  const eave=.55,zw=d/2+eave,xw=w/2+eave;
  const v=[
    -xw,h,-zw,0,h+pitch,-zw,-xw,h,zw, 0,h+pitch,-zw,0,h+pitch,zw,-xw,h,zw,
    0,h+pitch,-zw,xw,h,-zw,0,h+pitch,zw, xw,h,-zw,xw,h,zw,0,h+pitch,zw,
    -xw,h,-zw,xw,h,-zw,0,h+pitch,-zw,
    -xw,h,zw,0,h+pitch,zw,xw,h,zw
  ];
  const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geom.computeVertexNormals();
  const mesh=new THREE.Mesh(geom,roofs[colour%roofs.length]);mesh.position.set(x,0,z);mesh.name='Pitched metal roof';root.add(mesh);
}
function entry(root,b,face= -1,publicAccess=false){
  const {x,z,w,d,h}=b,front=z+face*d/2,outer=front+face*.12;
  box(root,1.7,2.45,.16,x,h*.34,outer,darkMat);
  box(root,.35,.12,.18,x+.46,h*.39,outer+face*.08,trimMat);
  box(root,2.0,.10,.55,x,.07,outer+face*.34,pathMat);
  for(const dx of [-w*.29,w*.29]){
    box(root,1.42,1.37,.12,x+dx,h*.59,outer,windowMat);
    box(root,1.53,.09,.17,x+dx,h*.59+ .72,outer+face*.045,trimMat);
    box(root,.09,1.48,.17,x+dx-.76,h*.59,outer+face*.045,trimMat);
    box(root,.09,1.48,.17,x+dx+.76,h*.59,outer+face*.045,trimMat);
  }
  if(publicAccess){
    box(root,w*.77,.16,2.65,x,h*.64,outer+face*1.25,roofs[0]);
    for(const dx of [-w*.36,w*.36])box(root,.14,h*.61, .14,x+dx,h*.31,outer+face*1.8,trimMat);
  }
}
export function drawLanternCivic(root,b,i){
  const {x,z,w,d,h}=b;
  if(b.name==='Bus Stop'){
    // Real open shelter, not a closed solid room masquerading as a bus stop.
    box(root,6,.18,3.1,x,2.8,z,roofs[1]);
    for(const dx of [-2.7,2.7])for(const dz of [-1.25,1.25])box(root,.12,2.6,.12,x+dx,1.4,z+dz,darkMat);
    box(root,5,.13,.55,x,1.0,z+.75,darkMat);
    box(root,5,.12,.14,x,1.55,z+.9,trimMat);
    box(root,6,.07,3.5,x,.04,z,pathMat);
    return;
  }
  box(root,w,h,d,x,h/2,z,walls[(i+1)%walls.length]);
  gable(root,{x,z,w,d,h,pitch:1.4+i*.12,colour:i});
  entry(root,b,-1,true);
  // Timber weatherboard/pier banding and side-window variety.
  box(root,w+.2,.22,d+.2,x,.27,z,trimMat);
  for(let k=1;k<7;k++){
    if(i%2===0)box(root,w+.07,.035,.08,x,.42+k*.52,z+d/2+.048,trimMat);
  }
  for(const side of [-1,1]){
    box(root,.14,1.2,2.1,x+side*w/2,h*.53,z+1.2,windowMat);
    box(root,.18,.1,2.25,x+side*w/2,h*.53+.65,z+1.2,trimMat);
  }
}
export function drawLanternHome(root,{x,z,w,d,h,index,face}){
  const wall=walls[index%walls.length];
  box(root,w,h,d,x,h/2,z,wall);
  gable(root,{x,z,w,d,h,pitch:1.3+(index%4)*.23,colour:(index+1)%roofs.length});
  entry(root,{x,z,w,d,h},face,false);
  for(const side of [-1,1]){
    box(root,.12,1.1,1.6,x+side*w/2,h*.58,z-.8,windowMat);
    box(root,.15,.09,1.75,x+side*w/2,h*.58+.59,z-.8,trimMat);
  }
  // Driveway/garden paths physically lead towards the nearest street.
  const nearestRoad=z<2840?2760:2990,edge=z+(z<nearestRoad?1:-1)*d/2;
  const end=nearestRoad+(z<nearestRoad?-7:7),len=Math.abs(end-edge);
  box(root,2.6,.06,len,x+w*.23,.035,(edge+end)/2,pathMat);
  for(const side of [-1,1]){
    const dx=x+side*(w/2+2.0);
    box(root,1.7,.11,1.7,dx,.07,z+(face*(d/2+1.5)),greenMat);
  }
  // Simple verandah where it belongs, not an unrelated floating slab.
  if(index%3===0){
    const front=z+face*d/2+face*1.25;
    box(root,w*.8,.13,2.55,x,h*.64,front,roofs[index%roofs.length]);
    for(const side of [-1,1])box(root,.12,h*.64,.12,x+side*w*.36,h*.32,front+face*.85,trimMat);
  }
}
export function drawLanternVillageDetails(root){
  // Gravel footpaths, timber seats, low street lighting and native gardens.
  const gravel=pathMat,asphalt=new THREE.MeshLambertMaterial({color:0x505457});
  const verge=new THREE.MeshLambertMaterial({color:0xa1a68b});
  for(const z of [2760,2990]){
    box(root,360,.07,9.5,0,.035,z,asphalt);
    for(const side of [-1,1]){
      box(root,360,.06,1.6,0,.075,z+side*6.9,gravel);
      for(const x of [-150,-92,-32,30,90,153]){
        const sideZ=z+side*11.7;
        const pole=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,5.8,6),trimMat);
        pole.position.set(x,2.9,sideZ);root.add(pole);
        const lamp=new THREE.Mesh(new THREE.BoxGeometry(.5,.18,.32),new THREE.MeshLambertMaterial({color:0xf1e9cc,emissive:0xffd79c,emissiveIntensity:.7}));
        lamp.position.set(x,5.8,sideZ);root.add(lamp);
      }
    }
    // One marking per lane, left-hand running, and a 40 km/h village approach.
    for(let x=-164;x<168;x+=20)box(root,4,.018,.14,x,.092,z,new THREE.MeshBasicMaterial({color:0xe2ded3}));
  }
  for(const [x,z] of [[-24,2868],[20,2868],[-20,2901],[22,2901]]){
    box(root,2,.37,.75,x,.28,z,darkMat);
    for(const dx of [-.7,.7])box(root,.12,.8,.11,x+dx,.3,z,trimMat);
    box(root,3,.10,.65,x,.55,z,verge);
  }
  // Bush-garden beds and public-space landscaping: all deliberate, no copies
  // of the private/real Narromine property geometry.
  for(let i=0;i<40;i++){
    const x=-165+(i*67)%330,z=2690+(i*97)%365;
    if(Math.abs(x)<18||Math.abs(z-2760)<14||Math.abs(z-2990)<14)continue;
    const plant=new THREE.Mesh(new THREE.IcosahedronGeometry(.75+(i%4)*.16,0),greenMat);
    plant.position.set(x,.45,z);root.add(plant);
  }
}
