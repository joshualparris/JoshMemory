import assert from "node:assert/strict";
import {newGame,step,simulate,edit,rotate,cellAt,hydrate,serialize,power,CONTRACTS} from "./core.mjs";
const s=newGame();
const place=(x,y,t,dir=1)=>{const r=edit(s,x,y,t,dir);assert.equal(r.ok,true,JSON.stringify({x,y,t,r}));};
const turn=(x,y,desired)=>{
 let tries=0;
 while(cellAt(s,x,y).dir!==desired&&tries++<4)assert.equal(rotate(s,x,y).ok,true);
 assert.equal(cellAt(s,x,y).dir,desired);
};
assert.equal(edit(s,4,4,"drill").ok,false,"Drills should require a deposit");
assert.equal(edit(s,18,2,"remove").ok,false,"Permanent dock must not be removed");
simulate(s,420);
assert.equal(s.stage>=1,true,"Starter ironworks must complete the first contract");
assert.equal((s.stats.delivered.iron_plate||0)>=12,true);
assert.equal(!!hydrate(serialize(s)),true,"A valid save must round-trip");
assert.equal(hydrate('{"cells":{}}'),null,"Reject invalid saves");
// A second line extracts, smelts, and ships copper.
place(1,9,"drill");place(2,9,"belt");place(3,9,"furnace");
for(let x=4;x<18;x++)place(x,9,"belt");
simulate(s,500);
assert.equal(s.stage>=2,true,"Copper Current must be beatable");
// Replace a conveyor with a gear press; its input is smelted plates.
assert.equal(edit(s,8,2,"remove").ok,true);
place(8,2,"press");
simulate(s,650);
assert.equal(s.stage>=3,true,"Precision Engineering must be beatable");
// A third line feeds iron from above, while the copper line feeds from below.
place(0,11,"solar");
place(1,5,"drill");place(2,5,"belt");place(3,5,"furnace");
place(4,5,"belt",2);
place(4,6,"belt",1);
for(let x=5;x<12;x++)place(x,6,"belt");
place(12,6,"belt",2);
turn(12,9,0);
place(12,8,"belt",0);
place(12,7,"circuit",1);
for(let x=13;x<=15;x++)place(x,7,"belt");
place(16,7,"belt",2);
place(16,8,"belt",2);
simulate(s,850);
assert.equal(s.stage>=4,true,"The Logic Age must be beatable; stage="+s.stage+" delivered="+JSON.stringify(s.stats.delivered));
// Redirect gears from the upper line and circuits from the lower line into a laboratory.
turn(15,2,2);place(15,3,"belt",2);
turn(15,7,0);
place(15,6,"belt",0);place(15,5,"belt",0);
place(15,4,"lab",1);
place(16,4,"belt",1);place(17,4,"belt",0);place(17,3,"belt",0);
simulate(s,1700);
assert.equal(s.stage,CONTRACTS.length,"Final research contract must be achievable; stage="+s.stage+" stats="+JSON.stringify(s.stats.delivered));
assert.equal(s.victory,true);
assert.equal((s.stats.delivered.science||0)>=21,true);
const before=s.ticks;
s.paused=true;step(s);assert.equal(s.ticks,before,"Pause must freeze simulation");
s.paused=false;step(s);assert.equal(s.ticks,before+1);
console.log("PASS: six contracts, two raw-material lines, multistage crafting, routing, power, save/load, victory and pause.");
console.log(JSON.stringify({stage:s.stage,ticks:s.ticks,delivered:s.stats.delivered,credits:s.credits,power:power(s)}));
