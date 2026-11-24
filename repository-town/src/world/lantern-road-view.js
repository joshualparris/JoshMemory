// Curved two-lane fictional rural road drawn from the SAME centreline used by
// roadAllows(). Lightweight ribbon geometry, instanced markings/trees and fences.
// Not an engineered road; bend advisory and scenery are game-world interpretation.
import * as THREE from 'three';
import {LANTERN_ROAD as R,LANTERN_ROAD_CENTRELINE as POINTS} from './lantern-point-layout.js';

const mat=(c)=>new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide});
const mats={
  soil:mat(0x927b58),grass:mat(0x849a60),gravel:mat(0xb8a98a),
  asphalt:mat(0x46494b),line:new THREE.MeshBasicMaterial({color:0xe8e6d7}),
  centre:new THREE.MeshBasicMaterial({color:0xe8e1b2}),
  fence:mat(0x8c826b),trunk:mat(0x887766),
  foliage1:mat(0x78916c),foliage2:mat(0x8a9b70),foliage3:mat(0x617e67),
  yellow:mat(0xe2b659),
};
const tangent=(i)=>{
  const a=POINTS[Math.max(0,i-1)],b=POINTS[Math.min(POINTS.length-1,i+1)];
  const length=Math.hypot(b.x-a.x,b.z-a.z)||1;
  return {x:(b.x-a.x)/length,z:(b.z-a.z)/length};
};
const side=(i)=>{const t=tangent(i);return {x:t.z,z:-t.x};};
function ribbon(halfWidth,y,material,name){
  const vertices=[],normals=[],indices=[];
  for(let i=0;i<POINTS.length;i++){
    const p=POINTS[i],s=side(i);
    for(const sign of [-1,1]) {
      vertices.push(p.x+s.x*halfWidth*sign,y,p.z+s.z*halfWidth*sign);
      normals.push(0,1,0);
    }
    if(i>0){const k=i*2;indices.push(k-2,k-1,k,k-1,k+1,k);}
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
  g.setIndex(indices);
  const mesh=new THREE.Mesh(g,material);mesh.name=name;mesh.frustumCulled=false;return mesh;
}
function stripe(group,offset,width,y,material){
  const vertices=[],indices=[];
  for(let i=0;i<POINTS.length;i++){
    const p=POINTS[i],s=side(i);
    for(const edge of [-1,1])vertices.push(p.x+s.x*(offset+width/2*edge),y,p.z+s.z*(offset+width/2*edge));
    if(i>0){const k=i*2;indices.push(k-2,k-1,k,k-1,k+1,k);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();
  const mesh=new THREE.Mesh(g,material);mesh.frustumCulled=false;group.add(mesh);return mesh;
}
const rnd=(n)=>{let a=(Math.imul(n+17,2654435761)>>>0);a^=a>>>16;return a/4294967296;};
function positionAt(length){
  let remaining=length;
  for(let i=1;i<POINTS.length;i++){
    const a=POINTS[i-1],b=POINTS[i],distance=Math.hypot(b.x-a.x,b.z-a.z);
    if(remaining<=distance){
      const t=remaining/distance,tx=(b.x-a.x)/distance,tz=(b.z-a.z)/distance;
      return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,tx,tz,sx:tz,sz:-tx};
    }
    remaining-=distance;
  }
  const p=POINTS.at(-1),t=tangent(POINTS.length-1);
  return {x:p.x,z:p.z,tx:t.x,tz:t.z,sx:t.z,sz:-t.x};
}
const total=POINTS.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-POINTS[i].x,p.z-POINTS[i].z),0);
function markers(group){
  // Left-hand driving and rural edge delineation; centre dashes on straight
  // sections, double solid at the slower curves.
  const straight=[],curve=[];
  for(let length=12;length<total-9;length+=16){
    const p=positionAt(length);
    if(p.z>535&&p.z<805)curve.push(p);else straight.push(p);
  }
  const geom=new THREE.BoxGeometry(.13,.022,3.8),object=new THREE.Object3D();
  const inst=new THREE.InstancedMesh(geom,mats.centre,straight.length);
  for(let i=0;i<straight.length;i++){
    const p=straight[i];object.position.set(p.x,.061,p.z);
    object.rotation.set(0,Math.atan2(p.tx,p.tz),0);object.scale.set(1,1,1);object.updateMatrix();inst.setMatrixAt(i,object.matrix);
  }
  inst.instanceMatrix.needsUpdate=true;group.add(inst);
  for(const offset of [-4.72,4.72])stripe(group,offset,.10,.065,mats.line);
  // Double centre at curves, instead of inviting overtaking through the bends.
  const lineParts=[];
  for(let i=1;i<POINTS.length;i++){
    const a=POINTS[i-1],b=POINTS[i];
    if((a.z+b.z)/2<530||(a.z+b.z)/2>805)continue;
    lineParts.push(a,b);
  }
  // Avoid joining nonconsecutive ends across a large gap.
  for(const offset of [-.19,.19]){
    const coords=[];
    for(const [a,b] of Array.from({length:lineParts.length/2},(_,i)=>[lineParts[2*i],lineParts[2*i+1]])){
      const theta=Math.atan2(b.z-a.z,b.x-a.x),dx=Math.sin(theta)*offset,dz=-Math.cos(theta)*offset;
      coords.push(a.x+dx,.067,a.z+dz,b.x+dx,.067,b.z+dz);
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));
    group.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xe8e1b2})));
  }
}
function roadSign(group,atMetres,signSide=1){
  if(typeof document==='undefined')return;
  const p=positionAt(atMetres),outside=11*signSide;
  const x=p.x+p.sx*outside,z=p.z+p.sz*outside;
  const post=new THREE.Mesh(new THREE.CylinderGeometry(.07,.085,2.45,8),new THREE.MeshLambertMaterial({color:0x8d979b}));
  post.position.set(x,1.22,z);group.add(post);
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=320;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  ctx.clearRect(0,0,256,320);
  ctx.translate(128,106);ctx.rotate(Math.PI/4);
  ctx.fillStyle='#f1cc43';ctx.strokeStyle='#181c1d';ctx.lineWidth=9;
  ctx.fillRect(-66,-66,132,132);ctx.strokeRect(-66,-66,132,132);
  ctx.rotate(-Math.PI/4);ctx.translate(-128,-106);
  ctx.strokeStyle='#191a18';ctx.lineWidth=12;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(93,136);ctx.bezierCurveTo(126,123,139,92,164,79);ctx.stroke();
  ctx.fillStyle='#e9cf48';ctx.fillRect(63,220,130,71);
  ctx.strokeStyle='#25231f';ctx.lineWidth=5;ctx.strokeRect(65,220,126,71);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#131716';ctx.font='bold 52px sans-serif';ctx.fillText('40',128,254);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const board=new THREE.Mesh(new THREE.PlaneGeometry(1.7,2.12),new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide,depthWrite:false}));
  board.position.set(x,2.75,z);board.rotation.y=Math.atan2(p.tx,p.tz);
  board.name='Fictional bend advisory sign, 40 km/h';group.add(board);
}
function roadside(group){
  const posts=[],fences=[];
  for(let d=150;d<total-600;d+=36){
    const p=positionAt(d);
    if(p.z<560||p.z>2540)continue;
    for(const sign of [-1,1]){
      const lateral=27+5*rnd(d+sign*5);
      const x=p.x+p.sx*lateral*sign,z=p.z+p.sz*lateral*sign;
      posts.push({x,z,rot:Math.atan2(p.tx,p.tz)});
      if(d>190){
        for(const y of [.65,1.03]){
          const prev=positionAt(d-36);
          const px=prev.x+prev.sx*lateral*sign,pz=prev.z+prev.sz*lateral*sign;
          fences.push(px,y,pz,x,y,z);
        }
      }
    }
  }
  const postMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(.14,1.4,.14),mats.fence,posts.length);
  const object=new THREE.Object3D();
  posts.forEach((p,i)=>{object.position.set(p.x,.7,p.z);object.rotation.set(0,p.rot,0);object.scale.set(1,1,1);object.updateMatrix();postMesh.setMatrixAt(i,object.matrix);});
  postMesh.instanceMatrix.needsUpdate=true;group.add(postMesh);
  const wire=new THREE.BufferGeometry();wire.setAttribute('position',new THREE.Float32BufferAttribute(fences,3));
  group.add(new THREE.LineSegments(wire,new THREE.LineBasicMaterial({color:0x8c8b80,transparent:true,opacity:.68})));
  // Irregularly spaced native-looking roadside gums; no identical tree rows.
  const trees=[];
  for(let d=210;d<total-500;d+=27){
    // No randomly planted gums through Repository Town's existing southern lots.
    // Start roadside vegetation after the two connecting curves.
    if(d<850||rnd(d*2)<.23)continue;
    const p=positionAt(d+11*rnd(d)),s=rnd(d+73)<.5?-1:1;
    const lateral=38+rnd(d+29)*20;
    trees.push({x:p.x+p.sx*lateral*s,z:p.z+p.sz*lateral*s,size:.65+rnd(d+9)*.7,seed:d});
  }
  const trunk=new THREE.InstancedMesh(new THREE.CylinderGeometry(.25,.38,1,6),mats.trunk,trees.length);
  const foliage=[0,1,2].map((i)=>new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),mats['foliage'+(i+1)],trees.length));
  trees.forEach((p,i)=>{
    const h=(4.8+rnd(p.seed+7)*3)*p.size;
    object.rotation.set(0,rnd(p.seed)*Math.PI,0);
    object.position.set(p.x,h*.5,p.z);object.scale.set(p.size,h,p.size);object.updateMatrix();trunk.setMatrixAt(i,object.matrix);
    for(let j=0;j<3;j++){
      const ox=(j-1)*(1.5+rnd(p.seed+j)*.7)*p.size;
      object.position.set(p.x+ox,h*(.75+j*.045),p.z+(j%2?1:-1)*.5);
      object.scale.set((2.5+rnd(p.seed+j*2))*p.size,(1.8+j*.2)*p.size,(2.7+rnd(p.seed+j*3))*p.size);
      object.updateMatrix();foliage[j].setMatrixAt(i,object.matrix);
    }
  });
  trunk.instanceMatrix.needsUpdate=true;group.add(trunk);
  for(const item of foliage){item.instanceMatrix.needsUpdate=true;group.add(item);}
  return {trees:trees.length,posts:posts.length};
}
export function buildLanternRoadView(){
  const group=new THREE.Group();group.name='Lantern Road — curved NSW-inspired fictional rural route';
  group.add(ribbon(40,-.055,mats.grass,'grass corridor'));
  // Sealed surface and gravel shoulders have a slight cross-section level step,
  // not the former 155 mm artificial rural kerb.
  group.add(ribbon(R.halfWidth+R.shoulderWidth,.035,mats.gravel,'gravel shoulders'));
  group.add(ribbon(R.halfWidth,.052,mats.asphalt,'two-lane road pavement'));
  markers(group);
  // Visible fictional bend advisories for both travel directions. No claim of
  // official NSW road designation or engineering-approved advisory speed.
  roadSign(group,263,1);roadSign(group,900,-1);
  const environment=roadside(group);
  return {group,centreline:POINTS,totalLength:total,environment};
}
