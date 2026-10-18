import test from "node:test";
import assert from "node:assert/strict";
import {inventory,csv} from "../scripts/story-catalog.mjs";
test("the authoring catalogue inventories playable source data",()=>{
 const v=inventory();
 assert.ok(v.storylets>100);
 assert.ok(v.cards>=15);
 assert.ok(v.places>=8);
 assert.deepEqual(v.duplicates,[]);
 assert.deepEqual(v.missingChoices,[]);
});
test("ambition gaps are measurable and Moth's thirty-stage arc is indexed",()=>{
 const v=inventory();
 assert.ok(v.ambitions.moth.chapters>=30);
 for(const a of Object.values(v.ambitions)){
  assert.equal(a.missingToThirty,Math.max(0,30-a.chapters));
  assert.ok(a.branches>=a.chapters*2);
 }
});
test("the story tracker is exportable as spreadsheet CSV",()=>{
 const v=inventory(),output=csv(v);
 assert.match(output,/^id,title,kind,ambition,chapter,place,branches,challengedBranches/m);
 assert.equal(output.trim().split("\n").length,v.rows.length+1);
});
