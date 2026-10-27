// Debug-only, game-world actions. This is not an authentication boundary: the
// client-side password only hides the console from casual play. It never sends
// data or touches real-world accounts, money, or property titles.
import {roadAllows} from './player-driving.js';
import {ensureSubdivisionTitles} from './playable-subdivision.js';
const MODELS=new Set(['hatch','sedan','ute','van','truck']);
export const CHEAT_PASSWORD='CHEAT123';
export function cheatClaimDeed(life,id){
 ensureSubdivisionTitles(life);
 const register=life.civic?.property;
 const deed=register?.parcels?.[id];
 if(!deed)return 'No matching fictional town title.';
 if(deed.owner==='visitor')return 'Already yours: '+deed.address;
 // Cheats replace the normal financial transaction, intentionally, in this local game.
 delete register.liens[id];
 deed.owner='visitor';deed.jointOwners=[];deed.listed=false;
 // Preserve occupants, tenants, public protection and room access rules.
 register.journal.unshift({day:life.day,text:'Debug claim: '+deed.address+' (no simulated payment).'});
 register.journal.length=Math.min(100,register.journal.length);
 return 'Claimed '+deed.address+'. Existing tenants and land-use restrictions stay in place.';
}
export function cheatAddFunds(life,amount=10000){
 if(!Number.isFinite(amount)||amount<=0||amount>1000000)return 'Invalid amount.';
 life.civic.player.bank=Math.round(((life.civic.player.bank||0)+amount)*100)/100;
 return 'Added '+amount+' fictional Town Dollars to savings.';
}
export function cheatSpawnCar(life,x,z,collision,model='hatch'){
 if(!MODELS.has(model))return {ok:false,message:'Unknown car type.'};
 const motor=life.civic?.motor;
 if(!motor)return {ok:false,message:'Motor system unavailable.'};
 const offsets=[[0,0],[0,2],[0,-2],[2,0],[-2,0],[0,4],[0,-4],[4,0],[-4,0]];
 let target=null;
 for(const [dx,dz] of offsets){
  const xx=x+dx,zz=z+dz;
  if(!roadAllows(xx,zz)||collision.hits(xx,zz,1.45))continue;
  if((life.civic.motor.owned||[]).some(v=>Number.isFinite(v.x)&&Math.hypot(v.x-xx,v.z-zz)<5))continue;
  if(life.trucks.some(v=>Math.hypot(v.x-xx,v.z-zz)<5))continue;
  if(life.villagers.some(v=>!v.inside&&Math.hypot(v.x-xx,v.z-zz)<3))continue;
  target={x:xx,z:zz};break;
 }
 if(!target)return {ok:false,message:'No free road space here. Teleport to Wattle Street, then summon your car.'};
 const n=motor.next++, registration='RT-DEBUG-'+n;
 const vehicle={stockId:'debug-'+n,model,registration,owner:'visitor',price:0,
  condition:100,odometer:0,fuel:90,roadworthy:true,regoUntil:life.day+365,
  lastService:life.day,serviceDue:life.day+365,
  x:target.x,z:target.z,yaw:0,speed:0,parkingPending:false,debugVehicle:true};
 motor.owned.push(vehicle);
 motor.journal.unshift('Day '+life.day+': debug-summoned '+registration+'.');
 return {ok:true,vehicle,message:'Summoned '+registration+' onto a clear road.'};
}
