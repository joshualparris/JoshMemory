import assert from 'node:assert/strict';
import fs from 'node:fs';
import {TownLife} from '../src/world/life.js';
import {ABS_DUBBO,apportion} from '../src/world/abs-dubbo.js';
import {residentSchedule} from '../src/world/population.js';
import {makeDistinctPerson} from '../src/world/npc-wardrobe.js';
import {populationHTML} from '../src/ui/population-panel.js';
const homes=JSON.parse(fs.readFileSync(new URL('../../docs/repository-town.json',import.meta.url))).projects.map(({coordinate})=>({coordinate,door:{x:(coordinate.charCodeAt(0)-65-12.5)*26,z:(Number(coordinate.slice(1))-1-3.5)*46+3}}));
for(const n of [0,1,5,171,470,1000]){const a=apportion(n,ABS_DUBBO.ageCounts);assert.equal(a.reduce((a,b)=>a+b,0),n);a.forEach((x,i)=>assert.ok(Math.abs(x-n*ABS_DUBBO.ageCounts[i]/ABS_DUBBO.ageCounts.reduce((a,b)=>a+b,0))<1));}
const town=new TownLife({homes}),p=town.population,r=town.populationReport();
assert.equal(r.population,470);assert.equal(r.under18,117);assert.equal(r.older,78);assert.equal(r.medianAge,35);assert.equal(r.male,225);assert.equal(r.female,245);
assert.deepEqual(r.ageCounts,apportion(470,ABS_DUBBO.ageCounts));
assert.deepEqual(r.householdCounts,{family:128,lone:53,group:7});assert.deepEqual(r.familyCounts,{coupleWithoutChildren:49,coupleWithChildren:51,oneParent:26,other:2});
assert.equal(new Set(p.residents.map(v=>v.populationId)).size,470);
assert.equal(p.households.flatMap(h=>h.members).length,470);
for(const v of p.residents){assert.ok(Number.isInteger(v.age));assert.ok(v.home);if(v.age<18){assert.notEqual(v.maritalStatus,'married');assert.ok(v.guardianIds.length);assert.ok(p.residents.some(a=>v.guardianIds.includes(a.populationId)&&a.age>=v.age+18));}}
assert.equal(town.villagers.length,171);assert.equal(town.marriages.length,55);
for(const v of town.villagers){assert.ok(v.age>=18);if(v.marriageYear)assert.ok(v.age>=2026-v.marriageYear+18);}
for(const h of p.households.filter(h=>h.familyType==='coupleWithChildren'||h.familyType==='oneParent'))assert.ok(h.members.some(v=>['child','adult child'].includes(v.relation)));
const child=p.additional.find(v=>v.age===8),senior=p.additional.find(v=>v.age>=75);
assert.equal(residentSchedule(child,1,600).at,'school');assert.equal(residentSchedule(child,6,600).at,'home');assert.equal(residentSchedule(child,7,600).at,'home');assert.equal(residentSchedule(child,1,1300).inside,true);
assert.ok(makeDistinctPerson('child',child).group.scale.y<makeDistinctPerson('adult',{age:40}).group.scale.y*.8);
assert.equal(makeDistinctPerson('child',child).group.userData.residentAppearance.facialHair,false);
assert.equal(makeDistinctPerson('senior',senior).group.userData.residentAppearance.hair,0xb9b5ae);
town.minute=450;for(let i=0;i<180;i++)town.tick(.25);
assert.ok(p.additional.some(v=>v.path.length||v.destination==='school'));
const saved=town.snapshot(),restored=new TownLife({homes});assert.ok(restored.restore(saved));
assert.deepEqual(restored.populationReport(),r);assert.deepEqual(restored.snapshot().population,saved.population);
const old=structuredClone(saved);delete old.population;assert.ok(restored.restore(old));assert.equal(restored.population.residents.length,470);
assert.match(populationHTML(town),/470 residents/);assert.match(populationHTML(town),/UCL112006/);
console.log('PASS ABS population totals, age bands, constrained families, guardians, school week, appearances, migration and save continuity');
