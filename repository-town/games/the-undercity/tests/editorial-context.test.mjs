import test from "node:test";
import assert from "node:assert/strict";
import {loadEditorialContext} from "../tools/storylet-generator.mjs";
test("AI writing uses the latest local Undercity project bible and style",()=>{
 const txt=loadEditorialContext({includeSecrets:false});
 assert.match(txt,/Living Project Bible/); assert.match(txt,/Style Guide/);
 assert.doesNotMatch(txt,/UC-S40/);
});
test("AI continuity context includes the proposed 40-entry ledger",()=>{
 const txt=loadEditorialContext();
 assert.match(txt,/UC-S40/);assert.match(txt,/not.*canon/i);
});
