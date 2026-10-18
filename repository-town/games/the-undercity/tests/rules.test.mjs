import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as R from "../src/game/rules.js";

test("the shipped global bundle is generated from the canonical ES module",()=>{
 const moduleSource=readFileSync(new URL("../src/game/rules.js",import.meta.url),"utf8");
 const expected="/* Generated from rules.js; verify parity with tests. Do not edit directly. */\n(function(){\n\"use strict\";\n"+
  moduleSource.replace(/\bexport\s+(?=const|function)/g,"").replace("export default {","const UndercityRules = {")+
  "\nwindow.UndercityRules=UndercityRules;\n})();\n";
 assert.equal(readFileSync(new URL("../src/game/rules.global.js",import.meta.url),"utf8"),expected);
});

test("the CP pyramid is exact at its level-70 boundary and beyond",()=>{
 assert.deepEqual([0,1,2,3,69,70,71,72].map(level=>R.levelToTotalCp(level)),[0,1,3,6,2415,2485,2555,2625]);
 for(const level of [0,1,2,3,69,70,71,200]){
  const cp=R.levelToTotalCp(level);
  assert.equal(R.cpToLevel(cp),level);
  if(level>0)assert.equal(R.cpToLevel(cp-1),level-1);
  assert.equal(R.cpToNextLevel(cp),level<70?level+1:70);
 }
 assert.equal(R.cpToNextLevel(2484),1);
 assert.deepEqual(R.addCp({id:"observation",cp:2485,level:70},70,71),{id:"observation",cp:2555,level:71});
 assert.equal(R.addCp({id:"observation",cp:2555,level:71},900,71).cp,2555);
 assert.equal(R.addCp({id:"observation",cp:1,level:1},-50).cp,0);
});

test("broad scalers, narrow fixed odds and CP award threshold",()=>{
 assert.equal(R.broadChance(30,50),36);
 assert.equal(R.broadChance(30,50,.68),40);
 assert.equal(R.broadChance(0,50),10);
 assert.equal(R.broadChance(50,50),100); // supplied explicit equality rule
 assert.equal(R.broadChance(0,0),100);
 assert.equal(R.cpAward(79,true),2);
 assert.equal(R.cpAward(80,true),1);
 assert.equal(R.cpAward(25,false),1);
});

test("rare results are rolled only after a normal Broad success",()=>{
 const previous=Math.random;
 try{
  let rolls=0;
  Math.random=()=>{rolls++;return 0;};
  assert.deepEqual(R.resolveChallenge({difficulty:10,rareChance:.04},10),
   {outcome:"rare_success",chance:100,rare:true,cpAwarded:1});
  assert.equal(rolls,2);
  rolls=0;Math.random=()=>{rolls++;return .99;};
  const failure=R.resolveChallenge({difficulty:10},1);
  assert.equal(failure.outcome,"failure");assert.equal(failure.cpAwarded,1);assert.equal(rolls,1);
  rolls=0;Math.random=()=>{rolls++;return 0;};
  const narrow=R.resolveChallenge({narrow:60,rareChance:1},1);
  assert.equal(narrow.outcome,"success");assert.equal(narrow.rare,false);assert.equal(rolls,1);
 }finally{Math.random=previous;}
});

test("all 14 quality types, opposition, additive and binary qualities",()=>{
 assert.equal(Object.keys(R.QualityType).length,14);
 const d={merciful:{type:R.QualityType.DISPOSITION,max:15,opposite:["ruthless"]},
  ruthless:{type:R.QualityType.DISPOSITION,max:15},story:{type:R.QualityType.STORY},
  marker:{type:R.QualityType.FATE_MARKER}};
 const p={qualities:{ruthless:{id:"ruthless",cp:6,level:3}}};
 R.applyEffect(p,{quality:"merciful",cp:3},d);
 assert.equal(p.qualities.merciful.level,2);
 assert.equal(p.qualities.ruthless.level,2);
 R.applyEffect(p,{quality:"story",cp:5},d);
 assert.equal(p.qualities.story.level,5);
 R.applyEffect(p,{quality:"marker",cp:5},d);
 assert.equal(p.qualities.marker.level,1);
 R.applyEffect(p,{quality:"story",remove:true},d);
 assert.equal(p.qualities.story,undefined);
});

test("equipment bonuses are counted once per equipped owned item",()=>{
 const player={qualities:{guile:{level:11}},inventory:{hook:1,phantom:0},equipped:{weapon:"hook",hat:"phantom"}};
 const defs={hook:{stat_bonuses:{guile:2}},phantom:{stat_bonuses:{guile:7}}};
 assert.equal(R.getEffectiveStat(player,"guile",defs),13);
});

test("each menace has its own penalty location and arrest advances capped Record",()=>{
 const hubs=R.MENACE_PENALTY_HUBS;
 assert.deepEqual(Object.keys(hubs),["suspicion","notoriety","wounds","delirium"]);
 for(const [menace,place] of Object.entries(hubs)){
  const p={qualities:{[menace]:{id:menace,level:8,cp:36}},current_location:"court"};
  assert.equal(R.checkMenaceThreshold(p),place);
  R.sendToPenaltyHub(p,menace);assert.equal(p.current_location,place);
  if(menace==="suspicion")assert.equal(p.qualities.the_record.level,1);
 }
 const capped={qualities:{the_record:{id:"the_record",cp:R.levelToTotalCp(7),level:7}}};
 R.sendToPenaltyHub(capped,"suspicion");assert.equal(capped.qualities.the_record.level,7);
});

test("action regen caps offline accrual and spending requires funds",()=>{
 const now=Date.now();
 const p={actions:8,max_actions:10,last_action_tick:now-5000000};
 R.regenerateActions(p);
 assert.equal(p.actions,10);
 assert.ok(Math.abs(p.last_action_tick-Date.now())<5000);
 assert.equal(R.spendActions(p,3),true);assert.equal(p.actions,7);
 assert.equal(R.spendActions(p,8),false);assert.equal(p.actions,7);
 assert.equal(R.spendActions(p,-1),false);
});
