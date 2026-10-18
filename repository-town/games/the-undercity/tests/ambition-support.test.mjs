import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import path from "node:path";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const spec=JSON.parse(readFileSync(path.join(root,"content/storylets/ambitions/second-acts.v1.json"),"utf8"));
test("66 original optional investigations are distinctly gated, risk-based, and do not skip main ambition progress",()=>{
 assert.equal(spec.schema_version,1);assert.equal(spec.chapters.length,66);
 for(const id of ["tide","mirror","ember"]){
  const stories=spec.chapters.filter(s=>s.unlock.path===id).sort((a,b)=>a.progress-b.progress);
  assert.equal(stories.length,22);
  assert.deepEqual(stories.map(s=>s.progress),Array.from({length:22},(_,i)=>8+i));
  stories.forEach((s,i)=>{
   assert.equal(s.id,`side-${id}-${i+9}`);
   assert.equal(s.next_storylet,null);
   assert.equal(s.choices.length,3);
   assert.ok(new Set(s.choices.map(c=>c.stat)).size>=2);
   assert.ok(s.choices.every(c=>!c.effects.pathProgress&&!c.effects.pathEnding&&!c.effects.items));
   assert.ok(s.choices.every(c=>c.effects?.flag),"every route has a permanent consequence");
  });
 }
});
test("the optional investigation bundle exactly matches the JSON source",()=>{
 execFileSync(process.execPath,["scripts/build-second-acts.mjs","--check"],{cwd:root,stdio:"pipe"});
});
