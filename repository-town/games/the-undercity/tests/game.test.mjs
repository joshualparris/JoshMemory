import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const filenames = ["content/ambitions.js","content/moth.generated.js","content/second-acts.generated.js","content/late-ambitions.js","content/cms-published.js","content/world.js","content/penalties.js","content/callings.js","content/systems.js","src/game/rules.global.js"];
const main = html.match(/<script>\s*([\s\S]*?)<\/script>/)?.[1];
assert.ok(main, "the main browser script must exist");

function launch(save = null) {
 const nodes = new Map(), handlers = {};
 const store = new Map(save ? [["the-undercity-v1",JSON.stringify(save)]] : []);
 const storage = { getItem(k){return store.get(k)??null;},setItem(k,v){store.set(k,v);},removeItem(k){store.delete(k);} };
 const document = {
  getElementById(k){if(!nodes.has(k)) nodes.set(k,{innerHTML:"",classList:{toggle:()=>false},setAttribute(){},click(){},style:{}});return nodes.get(k);},
  addEventListener(k,cb){handlers[k]=cb;},documentElement:{style:{setProperty(){}}}
 };
 const window={};
 const sandbox=vm.createContext({window,document,localStorage:storage,Date,console,
  setInterval(){},clearInterval(){},Math:Math, URL,Blob,confirm:()=>true,
  alert(t){throw Error(t)},getComputedStyle:()=>({getPropertyValue:()=>"1"})});
 // Deterministic success on every eligible challenge during the smoke run.
 vm.runInContext("Math.random = () => 0",sandbox);
 for(const file of filenames)vm.runInContext(readFileSync(new URL("../"+file,import.meta.url),"utf8"),sandbox,{filename:file});
 vm.runInContext(main,sandbox,{filename:"index.html:inline"});
 const act=(name,target,index=0,card="0")=>handlers.click({target:{closest:()=>({dataset:{act:name,target,index:String(index),card},classList:{toggle:()=>false},setAttribute(){}})}});
 return {window,act,storage,nodes};
}

test("all scripts parse and the document includes the expansion files",()=>{
 for(const file of filenames){assert.ok(html.includes(file));new vm.Script(readFileSync(new URL("../"+file,import.meta.url),"utf8"));}
 new vm.Script(main);
});

test("the original UI starts, and full content is accessible to the same engine",()=>{
 const app=launch(),d=app.window.UndercityDiagnostics;
 assert.ok(d,"runtime diagnostics are installed");
 assert.ok(d.storyCount>=125,"expected full expansion content");
 assert.ok(d.cardCount>=16);
 assert.equal(d.professionCount,34);
 assert.equal(d.destinyCount,20);
 assert.equal(d.equipmentSlots,20);
 assert.equal(d.livingStoryCount,4);
 assert.match(app.nodes.get("main").innerHTML,/THE.*UNDERCITY/s);
});

test("onboarding, four-path escape, navigation and selecting an ambition",()=>{
 const a=launch();
 a.act("intro");a.act("origin","scribe");a.act("faction","ledger");a.act("escape","observation");
 assert.equal(a.window.UndercityDiagnostics.checkState().place,"ink");
 a.act("travel","court");
 a.act("choose","choose-personal-ambition",0);
 assert.equal(a.window.UndercityDiagnostics.checkState().path,"moth");
 a.act("choose","path-moth-1",0);
 assert.equal(a.window.UndercityDiagnostics.checkState().pathProgress,1);
 a.act("tab","paths");assert.match(a.nodes.get("main").innerHTML,/Making Your Name/);
 assert.match(a.nodes.get("main").innerHTML,/Profession/);
 assert.match(a.nodes.get("main").innerHTML,/Destiny/);
});

test("previous version-one saves migrate without losing progress",()=>{
 const saved={version:1,stage:"explore",tab:"story",name:"Tester",background:"runner",faction:"hands",place:"court",
 stats:{observation:13,guile:25,persuasion:10,resolve:10},
 actions:7,lastTick:Date.now(),lastCard:Date.now(),coin:17,items:{map:1},flags:{remember:true},hand:["card_bell"],done:{ambition1:true},ambition:2,
 journal:[],relation:{ledger:0,wardens:0,choir:0,hands:2,dawn:0}};
 const a=launch(saved),s=JSON.parse(a.storage.getItem("the-undercity-v1"));
 assert.equal(s.ambition,2);assert.equal(s.coin,17);assert.equal(s.items.map,1);
 assert.equal(s.path,"");assert.deepEqual(Object.keys(s.renown).sort(),["guile","observation","persuasion","resolve"]);
});

test("weekly pay accrues through elapsed real time and does not recur on refresh",()=>{
 const past=Date.now()-8*86400000;
 const saved={version:1,stage:"explore",tab:"story",place:"court",stats:{observation:10,guile:10,persuasion:10,resolve:10},actions:5,
 coin:5,lastTick:Date.now(),lastCard:Date.now(),profession:"lamp-tender",lastWage:past,
 hand:[],items:{},relation:{ledger:0,wardens:0,choir:0,hands:0,dawn:0},flags:{},done:{},journal:[]};
 const a=launch(saved),s=JSON.parse(a.storage.getItem("the-undercity-v1"));
 assert.equal(s.coin,14);
 const b=launch(s),t=JSON.parse(b.storage.getItem("the-undercity-v1"));
 assert.equal(t.coin,14);
});

test("all new story locations, choices, effects and gates are internally valid",()=>{
 const a=launch(),e=a.window.UndercityExpansions,places=new Set(a.window.UndercityDiagnostics.locations());
 const ids=new Set();const items=e.items;
 for(const story of e.stories){
  assert.ok(story.id&&story.title&&story.description,story.id);
  assert.ok(!ids.has(story.id),"duplicate story id: "+story.id);ids.add(story.id);
  assert.ok(Array.isArray(story.where)&&story.where.every(p=>places.has(p)),story.id+" invalid place");
  if(story.category==="penalty-arrival") {
   assert.equal(story.autofire,true,story.id+" must fire on arrival");
   assert.ok(story.choices.length>=1,story.id+" needs an acknowledgement");
   assert.equal(story.choices[0].cost,0,story.id+" must cost no actions");
  } else if(story.category==="penalty-recovery") {
   // The three recovery options are separate selectable storylets in the same hub.
   assert.ok(story.choices.length>=1,story.id+" needs a recovery branch");
  } else assert.ok(story.choices.length>=2,story.id+" needs genuine choice");
  for(const c of story.choices){assert.ok(c.label&&c.success,story.id+" incomplete branch");
   if(c.stat)assert.ok(["observation","guile","persuasion","resolve"].includes(c.stat),story.id);
   for(const x of [c.effects,c.fail])for(const id of Object.keys(x?.items||{})){
    assert.ok(items[id] || ["brass","charcoal","silk","hook","badge","ticket","glass","ledger","moss","lure","map","relic"].includes(id),story.id+" unknown item "+id);
   }
  }
 }
 assert.ok(ids.size>=100);
 assert.equal(e.ambitions.length,4);
 assert.equal(e.makingNames.length,4);
 assert.equal(e.quirks.length,9);
 assert.equal(e.exceptionalStories.length,3);
 assert.equal(e.seasonalEvents.length,6);
});

test("equipping a real owned item raises effective challenge odds",()=>{
 const a=launch();
 a.act("intro");a.act("origin","scribe");a.act("faction","ledger");a.act("escape","observation");
 const first=a.window.UndercityDiagnostics.broadCheck("observation",6);
 a.act("equip","charcoal");
 const second=a.window.UndercityDiagnostics.broadCheck("observation",6);
 assert.ok(second>first,"equip bonus must affect odds");
 const save=JSON.parse(a.storage.getItem("the-undercity-v1"));
 assert.equal(save.equipment["tools of the trade"],"charcoal");
 a.act("equip","charcoal");
 const unequipped=JSON.parse(a.storage.getItem("the-undercity-v1"));
 assert.ok(!unequipped.equipment["tools of the trade"]);
});

test("a delayed Living Story resolves once and saves its message",()=>{
 const past=Date.now()-3700000;
 const saved={version:1,stage:"explore",tab:"messages",place:"court",
  stats:{observation:10,guile:10,persuasion:10,resolve:10},actions:5,coin:5,ambition:1,clues:0,
  lastTick:Date.now(),lastCard:Date.now(),hand:[],items:{},done:{},
  relation:{ledger:0,wardens:0,choir:0,hands:0,dawn:0},
  flags:{},journal:[],living:{"clockmaker-post":past},messages:[]};
 const a=launch(saved),first=JSON.parse(a.storage.getItem("the-undercity-v1"));
 assert.equal(first.flags["living:complete:clockmaker-post"],true);
 assert.equal(first.coin,8);
 assert.equal(first.clues,1);
 assert.equal(first.messages.length,1);
 assert.match(a.nodes.get("main").innerHTML,/note from the clockmaker/i);
 const b=launch(first),again=JSON.parse(b.storage.getItem("the-undercity-v1"));
 assert.equal(again.messages.length,1);
 assert.equal(again.coin,8);
});

test("legacy menace values migrate to four named penalty hubs and recover safely",()=>{
 const base={version:1,stage:"explore",tab:"story",place:"court",stats:{observation:10,guile:10,persuasion:10,resolve:10},
  actions:5,lastTick:Date.now(),lastCard:Date.now(),items:{},hand:[],journal:[]};
 const cases=[
  [{suspicion:8},"the_watch_house","suspicion"],
  [{notoriety:8},"the_tribunal","notoriety"],
  [{health:0},"the_ward","wounds"],
  [{sanity:0},"the_pale_rooms","delirium"]
 ];
 for(const [extras,hub,menace] of cases){
  const app=launch({...base,...extras});
  const at=JSON.parse(app.storage.getItem("the-undercity-v1"));
  assert.equal(at.place,hub);
  assert.ok(at.qualities[menace].level>=8);
  if(menace==="suspicion")assert.equal(at.criminalRecord,1);
  app.act("recover");
  const returned=JSON.parse(app.storage.getItem("the-undercity-v1"));
  assert.equal(returned.place,"court");
  assert.ok(returned.qualities[menace].level<8);
 }
});


test("moth ambition continues from eight to thirty-two chapters with a persistent finale",()=>{
 const base={version:1,stage:"explore",tab:"story",place:"court",background:"scribe",faction:"ledger",
  path:"moth",pathProgress:8,stats:{observation:1000,guile:1000,persuasion:1000,resolve:1000},
  coin:40,clues:9,actions:10,lastTick:Date.now(),lastCard:Date.now(),
  playtest:true,hand:[],items:{},done:{},flags:{},journal:[]};
 const a=launch(base);
 assert.match(a.nodes.get("main").innerHTML,/The Addresses Beneath the Lamp/);
 a.act("choose","path-moth-9",0);
 const progressed=JSON.parse(a.storage.getItem("the-undercity-v1"));
 assert.equal(progressed.pathProgress,9);
 assert.equal(progressed.pathEnding,"");
 const last=launch({...base,pathProgress:31});
 assert.match(last.nodes.get("main").innerHTML,/A New Oath in the Lamplight/);
 last.act("choose","path-moth-32",0);
 const ended=JSON.parse(last.storage.getItem("the-undercity-v1"));
 assert.equal(ended.pathProgress,32);
 assert.equal(ended.pathEnding,"moth:public-trust");
 assert.equal(ended.items["moth-lance"],1);
});
test("fourteen quality categories include all requested additive and pyramidal kinds",()=>{
 const a=launch(),types=a.window.UndercityExpansions.qualityTypes;
 assert.equal(Object.keys(types).length,14);
 for(const kind of ["status","circumstance","accomplishment","route","living_story","dream","metaquality"])
  assert.ok(types[kind],"missing "+kind);
 assert.equal(types.dream.pyramidal,true);
 assert.equal(types.route.pyramidal,false);
});
test("Tier 3 promotion is earned in-story and Tier 4 is gated by prior office",()=>{
 const base={version:1,stage:"explore",tab:"story",place:"court",background:"sentinel",
  faction:"wardens",profession:"light-warden",playtest:true,
  renown:{resolve:6,observation:0,guile:0,persuasion:0},
  stats:{observation:250,guile:250,persuasion:250,resolve:250},
  coin:20,clues:4,actions:10,lastTick:Date.now(),lastCard:Date.now(),hand:[],items:{},flags:{},done:{},journal:[]};
 const a=launch(base);
 a.act("profession","city-luminary");
 assert.equal(JSON.parse(a.storage.getItem("the-undercity-v1")).profession,"light-warden","Tier 4 cannot be hired directly");
 a.act("choose","profession-promotion-grand-light-warden",0);
 const after=JSON.parse(a.storage.getItem("the-undercity-v1"));
 assert.equal(after.profession,"grand-light-warden");
 assert.equal(after.items["crown-of-beacons"],1);
 assert.ok(after.coin>=25);
});
test("shop can buy, equip and sell gear without keeping a phantom bonus",()=>{
 const base={version:1,stage:"explore",tab:"bazaar",place:"court",stats:{observation:10,guile:10,persuasion:10,resolve:10},
  actions:10,coin:60,lastTick:Date.now(),lastCard:Date.now(),hand:[],items:{},done:{},flags:{},journal:[]};
 const a=launch(base);
 a.act("buy-item","promise-pendant");
 let s=JSON.parse(a.storage.getItem("the-undercity-v1"));
 assert.equal(s.coin,42);assert.equal(s.items["promise-pendant"],1);
 a.act("equip","promise-pendant");
 s=JSON.parse(a.storage.getItem("the-undercity-v1"));
 assert.equal(s.equipment.adornment,"promise-pendant");
 a.act("sell-item","promise-pendant");
 s=JSON.parse(a.storage.getItem("the-undercity-v1"));
 assert.equal(s.coin,51);
 assert.equal(s.items["promise-pendant"],0);
 assert.ok(!s.equipment.adornment);
});
test("Living Story queue persists trigger quality, delay, story link, and countdown",()=>{
 const base={version:1,stage:"explore",tab:"messages",place:"court",
 stats:{observation:10,guile:10,persuasion:10,resolve:10},actions:10,coin:8,ambition:1,
 lastTick:Date.now(),lastCard:Date.now(),hand:[],items:{},done:{},flags:{},journal:[]};
 const a=launch(base),s=JSON.parse(a.storage.getItem("the-undercity-v1"));
 const queued=s.living_stories.find(x=>x.id==="clockmaker-post");
 assert.ok(queued);assert.equal(queued.delay_hours,1);
 assert.equal(queued.storylet_id,"ambition2");
 assert.match(a.nodes.get("main").innerHTML,/Arrival in/);
 assert.match(a.nodes.get("main").innerHTML,/Trigger:/);
});
test("accessible landmarks and reading preferences are saved",()=>{
 assert.match(html,/class="skip-link" href="#main"/);
 assert.match(html,/aria-label="Current game view"/);
 assert.match(html,/prefers-reduced-motion/);
 const a=launch();
 a.act("colorblind");
 a.act("font","larger");
 const s=JSON.parse(a.storage.getItem("the-undercity-v1"));
 assert.equal(s.colorblind,true);
 assert.ok(s.readingSize>1);
 const restored=launch(s),after=JSON.parse(restored.storage.getItem("the-undercity-v1"));
 assert.equal(after.colorblind,true);
 assert.equal(after.readingSize,s.readingSize);
});

test("all four personal ambitions have 32 sequential, playable stages and a true finale",()=>{
 const a=launch();const stories=a.window.UndercityExpansions.stories;
 for(const id of ["moth","tide","mirror","ember"]){
  const own=stories.filter(s=>/^path-/.test(s.id)&&s.id.startsWith("path-"+id+"-"));
  assert.equal(own.length,32,id+" needs 32 unique chapters");
  assert.equal(new Set(own.map(s=>s.id)).size,32,id+" chapters must be unique");
  for(let n=1;n<=32;n++){
   const stage=own.find(s=>s.id==="path-"+id+"-"+n);
   assert.ok(stage,id+" missing chapter "+n);
   assert.ok(stage.choices.length>=2,id+" needs meaningful branches at "+n);
   assert.ok(stage.when({path:id,pathProgress:n-1,flags:{}}),id+" chapter "+n+" gate wrong");
  }
  const finale=own.find(s=>s.id==="path-"+id+"-32");
  assert.ok(finale.choices.some(c=>c.effects?.pathEnding),id+" ending must persist");
 }
});


test("all three negotiated coalition endings require choices made during earlier chapters",()=>{
 const baseline={version:1,stage:"explore",tab:"story",place:"edge",background:"scribe",faction:"ledger",
 stats:{observation:1000,guile:1000,persuasion:1000,resolve:1000},playtest:true,
 actions:10,lastTick:Date.now(),lastCard:Date.now(),coin:50,clues:12,ambition:4,
 hand:[],items:{},flags:{},done:{},journal:[],pathProgress:31};
 for(const id of ["tide","mirror","ember"]){
  const blocked=launch({...baseline,path:id,extras:{}});
  blocked.act("choose","path-"+id+"-32",3);
  const blockedState=JSON.parse(blocked.storage.getItem("the-undercity-v1"));
  assert.equal(blockedState.pathProgress,31,id+" coalition must be gated");
  const earned=launch({...baseline,path:id,extras:{[id+"Evidence"]:8,[id+"Witnesses"]:8}});
  earned.act("choose","path-"+id+"-32",3);
  const result=JSON.parse(earned.storage.getItem("the-undercity-v1"));
  assert.equal(result.pathProgress,32,id+" coalition must finish the ambition");
  assert.equal(result.pathEnding,id+":coalition");
 }
});


test("investigation guidance recognises roads that the player has already unlocked",()=>{
 for(const [ambition,clues,message,old] of [[2,2,"The Forgotten Stairs are open","Investigate two leads to open"],[3,4,"The Listening Edge is open","Find four leads and descend"]]){
  const app=launch({version:1,stage:"explore",tab:"story",place:"ink",ambition,clues,stats:{observation:10,guile:10,persuasion:10,resolve:10},hand:[],items:{},flags:{},done:{},journal:[]});
  const view=app.nodes.get("main").innerHTML;
  assert.ok(view.includes(message));assert.ok(!view.includes(old));
 }
});
