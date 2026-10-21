import * as THREE from 'three';
import { superviseBread } from './bakery-production.js';
const M=(color)=>new THREE.MeshLambertMaterial({color});
const block=(parent,color,w,h,d,x,y,z)=>{
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(color));m.position.set(x,y,z);parent.add(m);return m;
};
const now=l=>l.day*1440+l.minute;
function bakeryState(life){
 life.civic.bakeryHands??={day:life.day,shapes:0,kneads:0,holding:null,order:null,served:0,sequence:0,cooledAt:null};
 const s=life.civic.bakeryHands;
 if(s.day!==life.day){Object.assign(s,{day:life.day,shapes:0,kneads:0,holding:null,order:null,sequence:0,cooledAt:null});}
 return s;
}
export function installBakeryImmersion(built,life,camera,makeLabel){
 const root=new THREE.Group();root.name='Animated bakery handling';built.group.add(root);
 const dough=new THREE.Mesh(new THREE.SphereGeometry(.24,12,8),M(0xe6d7b5));
 dough.scale.set(1.4,.5,1);dough.position.set(-1.4,1.20,-3.45);root.add(dough);
 const tray=new THREE.Group();tray.position.set(1.3,1.13,-3.45);root.add(tray);
 block(tray,0x929ba0,1,.045,.62,0,0,0);
 const rolls=[];
 for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.12,9,6),M(0xe2c9a3));m.scale.set(1,.64,1);m.position.set((i%2-.5)*.45,.12,(Math.floor(i/2)-.5)*.26);tray.add(m);rolls.push(m);}
 const door=new THREE.Group();door.position.set(-.5,1.1,-3.53);root.add(door);
 block(door,0x636971,1.15,.58,.07,0,0,0);
 block(door,0x273039,.7,.35,.085,0,0,.07);
 const hands=new THREE.Group();hands.name='First-person bakery hands';camera.add(hands);
 const left=block(hands,0xc99877,.20,.22,.60,-.38,-.38,-.80),right=block(hands,0xc99877,.20,.22,.60,.38,-.38,-.80);
 const carried=block(hands,0x9ba0a4,.95,.045,.55,0,-.48,-.95);
 const packageMesh=block(hands,0xc99654,.4,.25,.29,0,-.37,-.96);
 const counter=new THREE.Group();counter.position.set(-2.4,0,-3.55);root.add(counter);
 block(counter,0xc0a47e,.68,.73,.6,0,.36,0);
 const parcel=block(counter,0xc78d4c,.36,.28,.34,0,.89,0);
 const queue=[];
 for(let i=0;i<2;i++){
  const g=new THREE.Group();root.add(g);
  const skin=[0xcda080,0xa77359][i];
  block(g,[0x658a91,0x98774e][i],.53,.89,.32,0,1.05,0);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.25,9,7),M(skin));head.position.y=1.73;g.add(head);
  queue.push(g);
 }
 const added=[];
 const station=(key,label,x,z)=>{
  const tag=makeLabel(label,'interactive');tag.position.set(x,1.9,z);tag.userData.labelKind='interactive';built.group.add(tag);
  const item={key:'bakery-immersive:'+key,label,type:'civic',room:0,roomName:'Bakery',pos:new THREE.Vector3(x,0,z),act:{do:'bakery-immersive',action:key}};
  built.interactables.push(item);added.push(item);
 };
 station('knead','Knead dough',-1.4,-2.65);
 station('shape','Shape four rolls',-.35,-2.65);
 station('take-tray','Pick up baking tray',1.3,-2.65);
 station('oven','Open oven / load tray',2.6,-2.65);
 station('rack','Cooling rack / collect',3.8,-2.65);
 station('order','Next bakery customer',-3.9,-2.35);
 station('bread','Pack bread',-2.6,-2.35);
 station('pie','Pack meat pie',-1.65,-2.35);
 station('serve','Hand order to customer',-4.8,-2.35);
 const pickOrder=(s)=>{
  const good=(s.sequence++%3===1)?'pie':'bread';
  s.order={good,name:['Mabel','Theo','June','Arlo'][s.sequence%4],placedAt:now(life)};
 };
 function act(action){
  const s=bakeryState(life),bakery=life.place('bakery'),batch=life.civic.bakeryBatch;
  if(action==='knead'){
   if(s.holding)return 'Put down or use the item you are holding first.';
   s.kneads=Math.min(8,s.kneads+1);
   return 'Kneading dough: '+s.kneads+'/4 motions completed.'+(s.kneads>=4?' Dough has been worked and is ready to shape.':'');
  }
  if(action==='shape'){
   if(s.kneads<4)return 'Knead the dough at least four times first.';
   s.shapes=Math.min(4,s.shapes+1);
   return 'Shaped '+s.shapes+' of four rolls using the preparation bench.';
  }
  if(action==='take-tray'){
   if(s.holding)return 'Your hands are full: '+s.holding+'.';
   if(s.shapes<4)return 'Shape all four rolls before lifting the tray.';
   s.holding='tray';return 'You are carrying a tray. Walk to the guarded oven.';
  }
  if(action==='oven'){
   if(s.holding!=='tray')return 'Bring a tray to the oven first; prepare and carry it from the bench.';
   // Separate bread production maintains authoritative ingredient and time constraints.
   const requested=!batch||batch.phase==='finished'?'mix':batch.phase==='proofing'?'oven':batch.phase==='baking'?'unload':null;
   if(!requested)return 'The batch is not ready for another oven action.';
   if(requested==='unload')return 'Use the cooling rack to remove the baked bread safely.';
   const result=superviseBread(life,requested);
   if(result.ok){s.holding=null;s.shapes=0;s.kneads=0;s.cooledAt=null;}
   return result.message;
  }
  if(action==='rack'){
   if(!batch)return 'There is no supervised bread batch. Prepare dough at the bench first.';
   if(batch.phase==='baking'){
    const result=superviseBread(life,'unload');
    if(result.ok)s.cooledAt=now(life)+6;
    return result.ok?'The oven is unloaded. Loaves must cool for six town minutes before handling. '+result.message:result.message;
   }
   if(batch.phase!=='finished')return 'The bread is still proofing or waiting for the oven.';
   if(s.cooledAt!=null&&now(life)<s.cooledAt)return 'Bread is cooling. Wait '+Math.ceil(s.cooledAt-now(life))+' more town minutes.';
   return 'Bread has cooled and can be safely packed for the shop.';
  }
  if(action==='order'){
   if(s.order)return s.order.name+' is waiting for '+s.order.good+'. Pick the correct item and serve it.';
   pickOrder(s);return s.order.name+' orders one '+s.order.good+'. Take it from the packing station, then hand it over.';
  }
  if(action==='bread'||action==='pie'){
   if(!s.order)return 'Take an order from the waiting customer first.';
   if(s.holding)return 'You are already holding '+s.holding+'.';
   if(action!==s.order.good)return 'Wrong item. Customer ordered '+s.order.good+'.';
   if((bakery.out[action]||0)<1)return 'Out of '+action+'. Wait for the next delivery or production batch.';
   if(action==='bread'&&s.cooledAt!=null&&now(life)<s.cooledAt)return 'Fresh bread is still cooling. Wait before packing.';
   s.holding=action;return 'Packed '+action+'. Carry it to the customer to complete the order.';
  }
  if(action==='serve'){
   if(!s.order)return 'No customer order is waiting.';
   if(s.holding!==s.order.good)return 'Pick up the correct '+s.order.good+' first.';
   if((bakery.out[s.holding]||0)<1)return 'That item is no longer available in the bakery stock.';
   bakery.out[s.holding]-=1;
   const name=s.order.name,good=s.order.good;
   s.holding=null;s.order=null;s.served++;
   life.log('Bakery demonstration customer '+name+' collected one '+good+' (stock -1).');
   // No money is invented: simulated visitors do not automatically have cash.
   return name+' received the '+good+'. Bakery stock decreased by one. Orders served: '+s.served+'.';
  }
  return 'Unknown bakery station.';
 }
 function update(dt,time){
  const s=bakeryState(life),batch=life.civic.bakeryBatch;
  dough.scale.y=.5+Math.min(1,s.kneads/4)*.26+.07*Math.sin(time*5);
  rolls.forEach((r,i)=>r.visible=i<s.shapes);
  tray.visible=s.holding!=='tray';
  const open=batch?.phase==='proofing'||s.holding==='tray';
  door.rotation.x+=( (open?-.9:0)-door.rotation.x)*Math.min(1,dt*6);
  hands.visible=!!s.holding || (time%8<.8&&s.kneads>0);
  carried.visible=s.holding==='tray';packageMesh.visible=['bread','pie'].includes(s.holding);
  const swing=.025*Math.sin(time*7);hands.position.y=s.holding?swing:0;
  queue.forEach((g,i)=>{
    const active=i===0?!!s.order:true;
    g.visible=active;
    // Customer queue is visibly arranged on the public side of the counter.
    g.position.set(-4+i*1.2,0,-2.0+i*1.0);
    g.rotation.y=.1*Math.sin(time*.9+i);
  });
  parcel.visible=!!s.order;
 }
 return {act,update};
}
