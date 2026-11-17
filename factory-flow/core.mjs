// IRON & LOGIC — deterministic, dependency-free factory simulation.
export const WIDTH=19, HEIGHT=12, VERSION=1;
export const DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
export const ITEMS={
 iron_ore:{name:"Iron ore",icon:"●",value:1},
 copper_ore:{name:"Copper ore",icon:"●",value:1},
 iron_plate:{name:"Iron plate",icon:"▰",value:4},
 copper_plate:{name:"Copper plate",icon:"▰",value:4},
 gear:{name:"Gear",icon:"⚙",value:13},
 circuit:{name:"Circuit",icon:"▦",value:17},
 science:{name:"Research pack",icon:"⬡",value:55}
};
export const BUILDINGS={
 belt:{name:"Conveyor",icon:"➤",cost:7,power:0,detail:"Moves one item along its arrow."},
 drill:{name:"Mining drill",icon:"⛏",cost:45,power:2,detail:"Place on an ore deposit. Extracts its ore."},
 furnace:{name:"Smelter",icon:"♨",cost:65,power:3,detail:"Turns iron or copper ore into plates."},
 press:{name:"Gear press",icon:"⚙",cost:105,power:4,unlock:2,detail:"Consumes 2 iron plates to make a gear."},
 circuit:{name:"Circuit bench",icon:"▦",cost:155,power:5,unlock:3,detail:"Consumes 1 iron plate + 1 copper plate."},
 lab:{name:"Research lab",icon:"⬡",cost:235,power:7,unlock:4,detail:"Consumes 1 gear + 1 circuit to make a research pack."},
 router:{name:"Alternator",icon:"⇄",cost:55,power:0,unlock:2,detail:"Alternates straight and right-hand output."},
 solar:{name:"Solar array",icon:"☀",cost:95,power:0,detail:"Adds 16 units of clean power."}
};
export const CONTRACTS=[
 {name:"First Light",brief:"Prove your ironworks can deliver finished plates.",need:{iron_plate:12},reward:180},
 {name:"Copper Current",brief:"Establish a second production line for copper plates.",need:{copper_plate:12},reward:240},
 {name:"Precision Engineering",brief:"Build a gear press. It needs two iron plates per gear.",need:{gear:10},reward:350},
 {name:"The Logic Age",brief:"Feed iron and copper plates into the same circuit bench.",need:{circuit:8},reward:500},
 {name:"The Research Race",brief:"Combine gears and circuits in a lab.",need:{science:6},reward:750},
 {name:"Industrial Mastery",brief:"Scale production and supply your final research order.",need:{science:15},reward:1500}
];
export const DEPOSITS=[
 {x:1,y:2,ore:"iron_ore"},{x:1,y:9,ore:"copper_ore"},
 {x:1,y:5,ore:"iron_ore"},{x:1,y:6,ore:"copper_ore"},
 {x:6,y:10,ore:"iron_ore"},{x:7,y:5,ore:"copper_ore"}
];
const key=(x,y)=>x+","+y;
export const inBounds=(x,y)=>Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<WIDTH&&y<HEIGHT;
export const depositAt=(x,y)=>DEPOSITS.find(d=>d.x===x&&d.y===y)?.ore||null;
export const cellAt=(s,x,y)=>s.cells[key(x,y)]||null;
function makeCell(type,dir=1){return {type,dir,out:null,inv:{},job:null,clock:0,turn:0};}
export function newGame(){
 const s={version:VERSION,cells:{},credits:440,stage:0,stageProgress:{},ticks:0,
    stats:{earned:0,spent:0,delivered:{},built:0,produced:{}},events:[],victory:false,
    speed:1,paused:false};
 const set=(x,y,t,dir=1)=>s.cells[key(x,y)]=makeCell(t,dir);
 set(0,0,"solar");
 set(1,2,"drill");set(2,2,"belt");set(3,2,"furnace");
 for(let x=4;x<18;x++)set(x,2,"belt");
 set(18,2,"dock");set(18,9,"dock");
 s.events.push("The starter ironworks is running. Deliver 12 iron plates.");
 return s;
}
function message(s,text){s.events.unshift(text);s.events=s.events.slice(0,7);}
export function power(s){
 let supply=0,demand=0;
 for(const c of Object.values(s.cells)){
   if(c.type==="solar")supply+=16;
   else demand+=BUILDINGS[c.type]?.power||0;
 }
 return {supply,demand,spare:supply-demand};
}
export function unlocked(s,type){return !!BUILDINGS[type]&&(BUILDINGS[type].unlock||0)<=s.stage;}
export function edit(s,x,y,type,dir=1){
 if(!inBounds(x,y))return {ok:false,error:"Outside factory grounds."};
 const id=key(x,y),old=s.cells[id];
 if(old?.type==="dock")return {ok:false,error:"The shipping dock is permanent."};
 if(type==="remove"){
   if(!old)return {ok:false,error:"Nothing to dismantle."};
   const refund=Math.floor((BUILDINGS[old.type]?.cost||0)*0.5);
   s.credits+=refund;delete s.cells[id];message(s,"Dismantled "+(BUILDINGS[old.type]?.name||old.type)+". Refunded $"+refund+".");
   return {ok:true};
 }
 if(!BUILDINGS[type])return {ok:false,error:"Choose a building first."};
 if(old)return {ok:false,error:"Clear this tile first, or right-click to rotate."};
 if(!unlocked(s,type))return {ok:false,error:"Complete more contracts to unlock this machine."};
 if(type==="drill"&&!depositAt(x,y))return {ok:false,error:"Drills must sit directly on an ore deposit."};
 if(type!=="drill"&&depositAt(x,y))return {ok:false,error:"Only mining drills may occupy ore deposits."};
 if(s.credits<BUILDINGS[type].cost)return {ok:false,error:"Not enough credits."};
 s.credits-=BUILDINGS[type].cost;s.stats.spent+=BUILDINGS[type].cost;
 s.stats.built++;s.cells[id]=makeCell(type,((dir%4)+4)%4);
 return {ok:true};
}
export function rotate(s,x,y){
 const c=cellAt(s,x,y);
 if(!c||c.type==="dock"||c.type==="solar")return {ok:false,error:"This tile cannot rotate."};
 c.dir=(c.dir+1)%4;return {ok:true};
}
function canReceive(c,item){
 if(!c)return false;
 if(c.type==="dock")return true;
 if(c.type==="belt"||c.type==="router")return c.out===null;
 if(c.type==="furnace")return (item==="iron_ore"||item==="copper_ore")&&(c.inv[item]||0)<12;
 if(c.type==="press")return item==="iron_plate"&&(c.inv[item]||0)<12;
 if(c.type==="circuit")return (item==="iron_plate"||item==="copper_plate")&&(c.inv[item]||0)<12;
 if(c.type==="lab")return (item==="gear"||item==="circuit")&&(c.inv[item]||0)<12;
 return false;
}
function deliver(s,item){
 s.stats.delivered[item]=(s.stats.delivered[item]||0)+1;
 let gain=ITEMS[item]?.value||0;s.credits+=gain;s.stats.earned+=gain;
 if(s.stage>=CONTRACTS.length)return;
 const contract=CONTRACTS[s.stage];
 if(contract.need[item]){
   s.stageProgress[item]=Math.min(contract.need[item],(s.stageProgress[item]||0)+1);
   if(Object.entries(contract.need).every(([it,n])=>(s.stageProgress[it]||0)>=n)){
     const oldName=contract.name;s.credits+=contract.reward;s.stats.earned+=contract.reward;
     s.stage++;s.stageProgress={};
     message(s,"✓ Contract complete: "+oldName+" · $"+contract.reward+" bonus!");
     if(s.stage===CONTRACTS.length){s.victory=true;message(s,"🏆 Factory mastery achieved! Freeplay is now unlocked.");}
     else message(s,"New contract: "+CONTRACTS[s.stage].name);
   }
 }
}
function productFor(c){
 if(c.type==="furnace"){
   if((c.inv.iron_ore||0)>=1)return {needs:{iron_ore:1},out:"iron_plate",time:5};
   if((c.inv.copper_ore||0)>=1)return {needs:{copper_ore:1},out:"copper_plate",time:5};
 }
 if(c.type==="press")return {needs:{iron_plate:2},out:"gear",time:8};
 if(c.type==="circuit")return {needs:{iron_plate:1,copper_plate:1},out:"circuit",time:9};
 if(c.type==="lab")return {needs:{gear:1,circuit:1},out:"science",time:12};
 return null;
}
function rotateRight(dir){return (dir+1)%4;}
export function step(s){
 if(s.paused)return s;
 s.ticks++;
 const allowed=new Set();
 let remaining=power(s).supply;
 const machineEntries=Object.entries(s.cells)
   .filter(([,c])=>BUILDINGS[c.type]?.power)
   .sort(([a],[b])=>a.localeCompare(b));
 // Fair, deterministic rolling priority under brownouts.
 const start=s.ticks%Math.max(1,machineEntries.length);
 for(let i=0;i<machineEntries.length;i++){
   const [id,c]=machineEntries[(i+start)%machineEntries.length],cost=BUILDINGS[c.type].power;
   if(remaining>=cost){allowed.add(id);remaining-=cost;}
 }
 // Outputs move at most one tile per tick; intent snapshot avoids chain teleporting.
 const intents=[];
 for(const [id,c] of Object.entries(s.cells)){
   if(!c.out)continue;
   const [x,y]=id.split(",").map(Number);
   const dir=c.type==="router"&&c.turn%2===1?rotateRight(c.dir):c.dir;
   const [dx,dy]=DIRS[dir],targetId=key(x+dx,y+dy),dest=s.cells[targetId];
   if(canReceive(dest,c.out))intents.push({from:id,to:targetId,item:c.out});
 }
 // Deterministic conflict resolution: one item per receiving conveyor each tick.
 const claimed=new Set();
 for(const intent of intents){
   const c=s.cells[intent.from],d=s.cells[intent.to];
   if(!c||!d||!c.out||claimed.has(intent.to)||!canReceive(d,intent.item))continue;
   claimed.add(intent.to);c.out=null;
   if(c.type==="router")c.turn++;
   if(d.type==="dock")deliver(s,intent.item);
   else if(d.type==="belt"||d.type==="router")d.out=intent.item;
   else d.inv[intent.item]=(d.inv[intent.item]||0)+1;
 }
 for(const [id,c] of Object.entries(s.cells)){
   if(c.type==="drill"&&allowed.has(id)&&!c.out){
     c.clock++;
     if(c.clock>=5){
       const [x,y]=id.split(",").map(Number),ore=depositAt(x,y);
       if(ore){c.out=ore;s.stats.produced[ore]=(s.stats.produced[ore]||0)+1;}
       c.clock=0;
     }
   }else if(["furnace","press","circuit","lab"].includes(c.type)&&allowed.has(id)){
     if(c.job){c.job.remaining--;
       if(c.job.remaining<=0&&c.out===null){
         c.out=c.job.out;s.stats.produced[c.out]=(s.stats.produced[c.out]||0)+1;c.job=null;
       }else if(c.job.remaining<0)c.job.remaining=0;
     }
     if(!c.job&&c.out===null){
       const recipe=productFor(c);
       if(recipe&&Object.entries(recipe.needs).every(([it,n])=>(c.inv[it]||0)>=n)){
         for(const [it,n]of Object.entries(recipe.needs))c.inv[it]-=n;
         c.job={remaining:recipe.time,out:recipe.out,total:recipe.time};
       }
     }
   }
 }
 return s;
}
export function simulate(s,n){for(let i=0;i<n;i++)step(s);return s;}
export function serialize(s){return JSON.stringify(s);}
export function hydrate(value){
 let s;
 try{s=typeof value==="string"?JSON.parse(value):structuredClone(value);}catch{return null;}
 if(!s||s.version!==VERSION||typeof s.cells!=="object"||!s.cells||
 !Number.isFinite(s.credits)||!Number.isInteger(s.stage)||s.stage<0||s.stage>CONTRACTS.length||
 !Number.isFinite(s.ticks)||Object.keys(s.cells).length>WIDTH*HEIGHT)return null;
 for(const [id,c]of Object.entries(s.cells)){
   const nums=id.split(",").map(Number);
   if(nums.length!==2||!inBounds(nums[0],nums[1])||!(c.type in BUILDINGS)&&c.type!=="dock"||
      !Number.isInteger(c.dir)||c.dir<0||c.dir>3)return null;
 }
 if(!s.stats||!s.stageProgress||!Array.isArray(s.events))return null;
 s.speed=[1,2,4].includes(s.speed)?s.speed:1;s.paused=!!s.paused;
 return s;
}
export function inspect(s,x,y){
 const c=cellAt(s,x,y),d=depositAt(x,y);
 if(!c)return d?"Unworked "+ITEMS[d].name+" deposit. Place a drill.":"Empty ground. Select a building and click to construct.";
 if(c.type==="dock")return "Shipping dock: sells anything arriving on a belt, for credits and contract progress.";
 if(c.type==="solar")return "Solar array: +16 continuous power. No cables needed.";
 const held=c.out?" | Output: "+ITEMS[c.out].name:"";
 const input=Object.entries(c.inv).filter(([,v])=>v>0).map(([k,v])=>ITEMS[k].name+" ×"+v).join(", ");
 const job=c.job?" | Job: "+Math.ceil(100*(c.job.total-c.job.remaining)/c.job.total)+"%":"";
 return BUILDINGS[c.type].name+" | Facing "+["N","E","S","W"][c.dir]+held+(input?" | Input: "+input:"")+job;
}
