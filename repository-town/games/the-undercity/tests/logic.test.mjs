import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// Test the ACTUAL inline game script, not a duplicate copy of its routing logic.
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,"The Undercity inline script must exist");
function section(first,last){
 const start=script.indexOf(first);
 const end=script.indexOf(last,start);
 assert.ok(start>=0&&end>start,first+" was not found");
 return script.slice(start,end);
}
const env=vm.createContext({console,window:{UndercityExpansions:{stories:[],cards:[],items:{},professions:[],destinies:[],ambitions:[]}}});
vm.runInContext(readFileSync(new URL("../src/game/rules.global.js",import.meta.url),"utf8"),env);
vm.runInContext(section("const SAVE=","let state;"),env,{timeout:2000});
vm.runInContext(section("function normaliseSave(","try{state="),env,{timeout:2000});
vm.runInContext(section("function cityRoute(","function beginOrigin("),env,{timeout:2000});
const query=(js)=>vm.runInContext(js,env,{timeout:2000});

test("the shipped script parses cleanly",()=>assert.doesNotThrow(()=>new vm.Script(script)));

test("all ordinary districts can be reached after collecting four investigation leads",()=>{
 const routes=query("Object.keys(PLACES).filter(k=>!['cell','watch','ward','tribunal','the_watch_house','the_tribunal','the_ward','the_pale_rooms'].includes(k)).map(k=>[k,cityRoute('court',k,{clues:4})])");
 for(const [id,path] of routes){
  assert.ok(path,"Route to "+id+" should exist");
  assert.equal(path[0],"court");
  assert.equal(path.at(-1),id);
 }
 assert.ok(routes.length>=8);
});

test("the route planner cannot bypass gated districts",()=>{
 assert.equal(query("cityRoute('court','stairs',{clues:0})"),null);
 assert.equal(query("cityRoute('court','edge',{clues:2})"),null);
 assert.deepEqual(Array.from(query("cityRoute('court','edge',{clues:4})")),["court","ink","stairs","edge"]);
});

test("each route consists solely of real connected roads",()=>{
 const r=query("cityRoute('market','quays',{clues:0})");
 assert.ok(r.length>=3);
 for(let i=1;i<r.length;i++){
  const edge=query("PLACES["+JSON.stringify(r[i-1])+"].adj.includes("+JSON.stringify(r[i])+")");
  assert.equal(edge,true,"Missing connection "+r[i-1]+" to "+r[i]);
 }
});

test("partial v1 saves retain valid progression and repair duplicate cards",()=>{
 const s=query("normaliseSave({version:1,stage:'explore',place:'market',stats:{guile:77},hand:['card_moss','card_moss','unknown'],ambition:2,clues:3,coin:20})");
 assert.equal(s.stats.guile,77);
 assert.equal(s.stats.resolve,10);
 assert.equal(s.ambition,2);
 assert.equal(s.place,"market");
 assert.deepEqual([...s.hand],["card_moss"]);
 assert.equal(s.coin,20);
});

test("imports cannot create bogus possessions or negative coins",()=>{
 const s=query("normaliseSave({version:1,stage:'explore',place:'court',stats:{},items:{bogus:999,brass:-20,moss:2},coin:-500,actions:9999})");
 assert.deepEqual(Object.keys(s.items),["moss"]);
 assert.equal(s.coin,0);
 assert.ok(s.actions<=20&&s.actions>=0);
});

test("all opportunity card districts are real and ordinary",()=>{
 const valid=query("CARDS.every(c=>!c.where||c.where.every(id=>PLACES[id]&&!['cell','watch','ward','tribunal','the_watch_house','the_tribunal','the_ward','the_pale_rooms'].includes(id)))");
 assert.equal(valid,true);
 assert.equal(query("CARDS.filter(c=>c.where.includes('choir')).length"),2);
});


test("missing or invalid save clocks recover without disabling regeneration",()=>{
 for(const clock of [undefined,null,"broken",1e30]){
  const s=query("normaliseSave("+JSON.stringify({version:1,stage:"explore",place:"court",stats:{},lastTick:clock,lastCard:clock,lastWage:clock})+")");
  for(const key of ["lastTick","lastCard","lastWage"]){assert.ok(Number.isFinite(s[key]));assert.ok(s[key]>0&&s[key]<=Date.now());}
  assert.equal(s.actions,10);
 }
 const zero=query("normaliseSave({version:1,place:'court',stats:{},actions:0})");
 assert.equal(zero.actions,0,"a deliberately empty action pool stays empty");
});
