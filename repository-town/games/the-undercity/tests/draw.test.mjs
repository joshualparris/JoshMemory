import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const inline=html.match(/<script>\s*([\s\S]*?)<\/script>/)?.[1];
assert.ok(inline,"main engine script must exist");
const rules=inline.slice(inline.indexOf("const FREQUENCY="),inline.indexOf("\nfunction odds(",inline.indexOf("const FREQUENCY=")));
const draws=inline.slice(inline.indexOf("function drawCard(){"),inline.indexOf("\nfunction apply(",inline.indexOf("function drawCard(){")));
assert.ok(rules.includes("function cardWeight(")&&draws.includes("function drawCard()"));

function harness(cards,random=()=>.5){
 const state={stage:"explore",hand:[],place:"court",flags:{},lastCard:1000};
 const fakeMath=Object.create(Math);fakeMath.random=random;
 const ctx=vm.createContext({state,CARDS:cards,Math:fakeMath,Date});
 vm.runInContext(rules+"\n"+draws,ctx);
 return {state,ctx,draw:()=>vm.runInContext("drawCard()",ctx),
  weight:c=>vm.runInContext("cardWeight("+JSON.stringify(c)+")",ctx)};
}
test("urgent legal card bypasses weights, even when it has zero weight",()=>{
 const a=harness([{id:"quiet",weight:200,where:["court"]},{id:"alarm",urgency:"high",weight:0,where:["court"]}],()=>.99);
 assert.equal(a.draw(),true);
 assert.deepEqual(a.state.hand,["alarm"]);
});
test("urgent but illegal card never bypasses eligibility",()=>{
 const a=harness([{id:"ordinary",weight:1,where:["court"]},{id:"elsewhere",weight:0,urgency:"high",where:["quays"]}],()=>0);
 assert.equal(a.draw(),true);assert.equal(a.state.hand[0],"ordinary");
});
test("unlock multiplicity is a weighted multiplier without penalising unconditional cards",()=>{
 const a=harness([]);
 assert.equal(a.weight({weight:1,frequency:"standard"}),10);
 assert.equal(a.weight({weight:1,frequency:"standard",unlock_conditions:[{flag:"one"},{flag:"two"},{flag:"three"}]}),30);
 assert.equal(a.weight({weight:3,frequency:"frequent",unlock_conditions:[{flag:"ready"},{flag:"noble"}]}),120);
});
test("weighted draw distribution approximates 1:3 over a seeded large sample",()=>{
 let seed=1777;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const a=harness([{id:"base",weight:1},{id:"triple",weight:1,unlock_conditions:[{flag:"ready"},{flag:"one"},{flag:"two"}]}],random);
 a.state.flags={ready:true,one:true,two:true};
 let triple=0;const N=20000;
 for(let i=0;i<N;i++){a.state.hand=[];a.draw();if(a.state.hand[0]==="triple")triple++;}
 const fraction=triple/N;
 assert.ok(fraction>.732&&fraction<.768,"expected 0.75, got "+fraction);
});
test("hand capacity stops the draw and leaves the clock unchanged if already full",()=>{
 const cards=Array.from({length:8},(_,i)=>({id:"c"+i,weight:1}));
 const a=harness(cards,()=>.2);
 a.state.hand=cards.slice(0,6).map(c=>c.id);
 assert.equal(a.draw(),false);
 assert.equal(a.state.lastCard,1000);
 assert.equal(a.state.hand.length,6);
});
