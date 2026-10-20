import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {TownLife} from '../src/world/life.js';
import { SIGNAL_CROSSINGS, crossingState, mustStopAtCrossing } from '../src/world/traffic-signals.js';

const site=SIGNAL_CROSSINGS[0];
assert.equal(SIGNAL_CROSSINGS.length,1,'pilot controls one busy high-street junction');
assert.equal(site.x,52);
assert.equal(site.z,177);
assert.equal(crossingState(0).vehicles,'green');
assert.equal(crossingState(43/3).vehicles,'amber');
assert.equal(crossingState(49/3).pedestrians,'wait','clear junction before pedestrians walk');
assert.equal(crossingState(55/3).vehicles,'red');
assert.equal(crossingState(55/3).pedestrians,'walk');
assert.equal(crossingState(70/3).pedestrians,'wait','end pedestrian phase before next vehicle green');
assert.equal(crossingState(72/3).vehicles,'green','signal repeats predictably');
assert.equal(crossingState((72*5+55)/3).pedestrians,'walk','later cycles are deterministic');

const from={x:site.x-7,z:site.z+1.7},to={x:site.x-5,z:site.z+1.7};
assert(mustStopAtCrossing(from,to,55/3),'eastbound truck stops on red');
assert(mustStopAtCrossing(from,to,43/3),'eastbound truck stops on amber');
assert(!mustStopAtCrossing(from,to,0),'green releases traffic');
assert(mustStopAtCrossing({x:site.x+7,z:site.z-1.7},{x:site.x+5,z:site.z-1.7},55/3),'westbound traffic also stops');
assert(!mustStopAtCrossing({x:site.x-4,z:site.z+1.7},{x:site.x+1,z:site.z+1.7},55/3),'a truck already past its stop line may finish crossing');
assert(!mustStopAtCrossing({x:site.x-7,z:site.z+20},{x:site.x-5,z:site.z+20},55/3),'other streets are unaffected');
assert(!mustStopAtCrossing(from,from,55/3),'turning in place is never prevented by the signal');

const homes=[];
for(let r=0;r<7;r++)for(let c=0;c<26;c+=2)
  homes.push({coordinate:String.fromCharCode(65+c)+(r+1),name:'House',door:{x:(c-12.5)*26,z:r*46-161+4}});
const life=new TownLife({homes,minute:55/3,seed:20261020});
life.villagers=[];life.obstacles=[];
const truck=life.trucks[0],others=life.trucks.slice(1);
for(let i=0;i<others.length;i++){others[i].x=800+i*20;others[i].z=400;}
truck.x=site.x-8;truck.z=site.z+1.7;truck.heading=Math.PI/2;
truck.wait=0;truck.path=[{x:site.x+18,z:truck.z}];truck.state='delivering';
life.driveTruck(truck,0.5);
assert(truck.braking,'actual truck simulation must apply red light, not only paint it');
assert(truck.x<=site.x-5.8+1e-5,'truck stays behind painted crossing');
const held=truck.x;
life.minute=0;
life.driveTruck(truck,0.5);
assert(!truck.braking,'truck resumes on green');
assert(truck.x>held+0.5,'truck moves across stop line on green');

const scene=readFileSync(new URL('../src/world/townlife.js',import.meta.url),'utf8');
assert(scene.includes('syncTrafficSignals(m)'),'traffic light visuals follow the same town clock');
assert(scene.includes('SIGNAL_CROSSINGS'),'zebra stripes and signals exist at the simulated junction');
console.log('PASS: MIT-inspired signal cycle, safe stop line, both directions, truck braking/resuming, visible scene integration.');
