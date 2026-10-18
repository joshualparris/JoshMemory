import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const main=html.match(/<script>\s*([\s\S]*?)<\/script>/)?.[1];
const files=[...html.matchAll(/<script src="\.\/([^"?]+)(?:\?[^"]*)?"\s*><\/script>/g)].map(m=>m[1]);
assert.ok(main&&files.length>=7);

function launch(save){
 const nodes=new Map(),listeners={},storage=new Map([["the-undercity-v1",JSON.stringify(save)]]);
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 const document={
  getElementById:id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:"",style:{},setAttribute(){},focus(){},classList:{toggle(){}}});return nodes.get(id);},
  addEventListener:(event,fn)=>listeners[event]=fn,
  documentElement:{setAttribute(){},style:{setProperty(){}}}
 };
 const window={};
 const context=vm.createContext({window,document,localStorage,Date,console,URL,Blob,
  setInterval(){},clearInterval(){},confirm:()=>true,alert(t){throw Error(t)},Math});
 vm.runInContext("Math.random=()=>0",context);
 for(const file of files)vm.runInContext(readFileSync(new URL("../"+file,import.meta.url),"utf8"),context,{filename:file});
 vm.runInContext(main,context,{filename:"index.html:inline"});
 const act=(name,target="",index=0)=>listeners.click({target:{closest:()=>({dataset:{act:name,target,index:String(index),card:"0"},classList:{toggle(){}},setAttribute(){}})}});
 const get=()=>JSON.parse(storage.get("the-undercity-v1"));
 return {window,nodes,act,get};
}
function base(path){
 return {version:1,stage:"explore",tab:"story",name:"Continuity Inspector",background:"scribe",faction:"ledger",
  place:"court",actions:10,lastTick:Date.now(),lastCard:Date.now(),playtest:true,
  coin:100,clues:12,ambition:4,path,pathProgress:0,pathEnding:"",
  stats:{observation:1000,guile:1000,persuasion:1000,resolve:1000},
  relation:{ledger:0,wardens:0,choir:0,hands:0,dawn:0},
  renown:{observation:7,guile:7,persuasion:7,resolve:7},
  hand:[],items:{},flags:{},done:{},journal:[]};
}

for(const ambition of ["moth","tide","mirror","ember"]){
 test("complete playthrough "+ambition+" reaches real chapter 32 ending without teleporting",()=>{
  const app=launch(base(ambition));
  const stories=app.window.UndercityExpansions.stories;
  let visits=0;
  for(let n=1;n<=32;n++){
   const st=stories.find(x=>x.id==="path-"+ambition+"-"+n);
   assert.ok(st,"missing "+ambition+" chapter "+n);
   const before=app.get(),destination=st.where[0];
   assert.equal(before.pathProgress,n-1,ambition+" before "+n);
   const route=app.window.UndercityDiagnostics.route(before.place,destination);
   assert.ok(route&&route.length>0,ambition+" unreachable "+n+" from "+before.place+" to "+destination);
   for(const stop of route.slice(1)){
    const previous=app.get().place;
    app.act("travel",stop);
    assert.equal(app.get().place,stop,ambition+" route "+previous+" -> "+stop+" blocked");
    app.act("dismiss");
    visits++;
   }
   app.act("dismiss");
   const scene=app.nodes.get("main").innerHTML;
   assert.ok(scene.includes('data-target="'+st.id+'"'),ambition+" chapter "+n+" has no actionable choice in the gameplay view");
   app.act("choose",st.id,n%2); // exercise both standard branch types, not just the same choice
   const after=app.get();
   assert.equal(after.pathProgress,n,ambition+" chapter "+n+" did not progress");
   assert.equal(after.place,destination,ambition+" chapter "+n+" changed location unexpectedly");
   assert.equal(Boolean(after.pathEnding),n===32,ambition+" early or missing ending at "+n);
  }
  const result=app.get();
  assert.ok(result.pathEnding.startsWith(ambition+":"),"end branch not recorded");
  assert.ok(result.journal.length>0);
  assert.ok(visits>=12,"expected genuine routed travel across city districts");
 });
}

test("every chapter has unique copy and at least two genuine skill decisions",()=>{
 const app=launch(base("moth")),all=app.window.UndercityExpansions.stories;
 for(const id of ["moth","tide","mirror","ember"]){
  const stages=Array.from({length:32},(_,i)=>all.find(s=>s.id==="path-"+id+"-"+(i+1)));
  const titles=stages.map(s=>s.title.replace(/^\d+\.\s*/,"").toLowerCase());
  assert.equal(new Set(titles).size,32,id+" repetitive or duplicate chapter title");
  for(let n=0;n<32;n++){
   const c=stages[n].choices;
   assert.ok(c.length>=2,id+"/"+(n+1)+" lacks branches");
   assert.ok(new Set(c.filter(x=>x.stat).map(x=>x.stat)).size>=2,id+"/"+(n+1)+" lacks different skill checks");
   assert.ok(c.every(x=>x.success&&x.failure),"missing branch outcome "+id+"/"+(n+1));
  }
 }
});
