// Geographically grounded entrance plus real collision/navigation checks for the
// interpretive, functional Narromine postal retail room.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CollisionWorld } from '../src/engine/collision.js';
import { routeVisitor } from '../src/world/shop-visitors.js';
import { DETAILED, PLACES, polyRect } from '../src/world/narromine-layout.js';
import {
  NARROMINE_POST_OFFICE_ENTRANCE as E,
  NARROMINE_POST_OFFICE_SAVE_ID,
  buildNarrominePostOfficeInterior,
  nearNarrominePostOfficeDoor,
  postOfficeExteriorGrounded,
} from '../src/world/narromine-post-office.js';

const post=DETAILED.find(x=>x.id==='narromine-post-office');
assert(post && post.address==='74 Dandaloo Street','real PO parcel retained');
assert(post.props.some(p=>p.kind==='steps'),'north-side entrance steps from imagery retained');
assert(postOfficeExteriorGrounded(),'entry and exit physically outside measured building parts and near the entrance steps');
assert(nearNarrominePostOfficeDoor(E),'correct approach triggers doorway');
assert(!nearNarrominePostOfficeDoor(E.outside),'return and fast travel do not auto-re-enter');
assert.equal(NARROMINE_POST_OFFICE_SAVE_ID,'NARROMINE-PO','unique interior save discriminator');
assert.notEqual(E.x, PLACES.find(x=>x.name==='Narromine Post Office').x,'real door sensor is not the POI centroid');
assert(Math.hypot(E.outside.x-E.x,E.outside.z-E.z)>1.3,'safe exterior return lies outside the sensor');
assert.equal(E.returnPose.x,E.outside.x,'exit returns to same outside north-side entrance');

const built=buildNarrominePostOfficeInterior(()=>new THREE.Sprite(new THREE.SpriteMaterial()));
assert(built.narrominePostal);
assert(built.group instanceof THREE.Group);

// Narromine previously used an oversized sphere/cylinder placeholder. Match
// the SAME deterministic articulated shop-worker model as Repository Town.
const staff=built.group.getObjectByName('Leah Bennett · Narromine postal retail');
assert(staff instanceof THREE.Group, 'Narromine attendant is a real character group');
assert.equal(staff.userData.residentAppearance?.identity,'narromine:post-office:leah-bennett',
  'uses Repository Town shared NPC wardrobe instead of a cylinder stand-in');
assert(staff.children.some(part=>part.userData.isOutfit), 'detailed clothed body');
// The shared wardrobe nests the articulated skeleton under a posture group (so it can sit
// and lie down), so verify articulation by traversing the hierarchy, not only direct children.
const joints=[];staff.traverse(part=>{if(part.isGroup)joints.push(part);});
assert(joints.length>=8, 'head, hips, knees, shoulders and elbows articulated');
assert(joints.some(part=>part.position.y>1.7), 'separate detailed head');

assert(built.rooms.length===1 && built.rooms[0].name.includes('Narromine'),'local post room');
assert(built.interactables.length>=7,'counter, PO boxes, packing bench, mail and heritage');
const counter=built.interactables.find(i=>i.key==='narromine-post-office:counter');
assert(counter && counter.act.do==='narromine-postal-counter','local postal menu, not Repo Town ledger');
const others=built.interactables.filter(i=>i.key!=='narromine-post-office:counter');
assert(others.every(i=>i.act.do!=='civic-ledger'),'no other PO hot spot opens unrelated Repo Town ledger');
for(const name of ['boxes','packing','collection','assisted','heritage'])assert(
  built.interactables.some(i=>i.key.endsWith(':'+name)),name+' service point registered');
const world=new CollisionWorld(built.colliders);
const places=[['spawn',built.spawn],['counter',counter.pos],...others.filter(i=>i.act.do==='info').map(i=>[i.key,i.pos])];
for(const [name,p] of places) {
  assert(!world.hits(p.x,p.z,.25),name+' clear of all physical colliders');
}
assert(routeVisitor(built.spawn,counter.pos,built.colliders,built.bounds,.27),'postal service desk is reachable from entry');
assert(built.exitZone.x0<0 && built.exitZone.x1>0,'public doorway has clear 2m opening');
assert(built.exitZone.z1>built.rooms[0].z1,'exit sensor extends outward');
assert(!world.hits(0,built.rooms[0].z1-.60,.3),'physical doorway stays free of collision');
assert(built.group.children.length>70,'postal fixtures and staff figure actually have 3D meshes');
console.log('PASS Narromine Post Office: real mapped front-door sensor, separate save, detailed interior, counter, postal services, clear visitor path and safe front exit');
