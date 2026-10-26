import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {Builder,GLASS} from '../src/world/builder.js';
import {buildPubInterior} from '../src/world/pub-interior.js';
import {PUB_ENVELOPE,pubFacadeCoordinate,pubEnvelopeFit,buildPubFacade} from '../src/world/pub-envelope.js';
import {ROOM} from '../src/world/interior-kit.js';
function build(){
 const b=new Builder();b.glass=[];
 const facade=buildPubFacade(b,{GLASS});
 return {b,facade};
}
test('RTPUB-002 published geometry uses one 14x18m floorplate inside and out',()=>{
 const e=PUB_ENVELOPE,{b,facade}=build();
 const room=buildPubInterior({id:'pub',name:'The Merged Branch'},()=>new THREE.Sprite(new THREE.SpriteMaterial()));
 assert.deepEqual([e.widthM,e.depthM,e.modelledStoreys],[14,18,2]);
 assert.deepEqual([ROOM.W,ROOM.D],[e.widthM,e.depthM]);
 assert.equal(facade.w,room.bounds.x1-room.bounds.x0);
 assert.equal(facade.d,room.bounds.z1-room.bounds.z0);
 assert.equal(room.buildingEnvelope,e);
 assert.equal(room.storey,0);
 assert.equal(room.storeyCount,3);
 assert.equal(pubFacadeCoordinate(room.bounds.z1),facade.front);
 assert.equal(pubFacadeCoordinate(room.bounds.z0),facade.back);
 assert.equal(facade.front-facade.back,18);
 assert.equal(e.facade.centreZ,-2);
 assert.equal(e.interior.centreZ,-3);
 assert.equal(e.originalConstructionYear,null);
 assert.throws(()=>pubFacadeCoordinate(Infinity),TypeError);
 assert(b.parts.length>20);
 room.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose?.();});
 for(const g of [...b.parts,...b.glass])g.dispose();
});
test('RTPUB-024 facade represents the reachable upper floor and separate rear escape stair',()=>{
 const {b,facade}=build(),e=PUB_ENVELOPE;
 assert.equal(facade.storeys,2);assert.equal(facade.basementLevels,1);assert.equal(facade.hasUpperFloor,true);assert.equal(e.habitableUpperFloor,true);assert.equal(e.accessibleLevels,3);
 assert.equal(e.stairs,2);assert.equal(e.lift,1);assert.equal(e.upperWindows,4);assert(e.roofPeakM>10);
 assert.equal(facade.pieces.filter(p=>p.name==='upper-glass').length,4);assert.equal(facade.pieces.filter(p=>p.name==='escape-stair-tread').length,28);assert.equal(b.glass.length,9);
 for(const geometry of b.glass){geometry.computeBoundingBox();assert(geometry.boundingBox.max.y<=8.3);}
 for(const g of [...b.parts,...b.glass])g.dispose();
});
test('RTPUB-002 facade walls have visible real door and window openings',()=>{
 const {facade}=build();
 const panel=facade.pieces;
 assert.equal(panel.filter(p=>p.name==='front-upper-spandrel').length,1);
 assert.equal(panel.filter(p=>p.name==='front-door-leaf').length,1);
 assert.equal(panel.filter(p=>p.name==='front-sill').length,2);
 assert.equal(panel.filter(p=>p.name==='side-sill').length,2);
 assert.equal(panel.filter(p=>p.name==='rear-side-wall').length,2);
 assert.equal(panel.filter(p=>p.name==='front-side-wall').length,2);
 assert(!panel.some(p=>p.name==='solid-opaque-box'));
 assert.equal(PUB_ENVELOPE.frontageDoor.widthM,2.1);
});
test('RTPUB-002 footprint is within nominal tile, not proven lawful property boundaries',()=>{
 const fit=pubEnvelopeFit({lotWidthM:26,lotDepthM:46});
 assert.equal(fit.modelledWithinNominalLot,true);
 assert.equal(fit.nominalSideSpaceEachM,6);
 assert.equal(fit.nominalFrontSpaceM,16);
 assert.equal(fit.nominalRearSpaceM,12);
 assert.equal(fit.cadastralBoundaryVerified,false);
 assert.equal(fit.adjoiningFireSeparationVerified,false);
 assert.equal(PUB_ENVELOPE.roofStructureCertified,false);
 assert.equal(PUB_ENVELOPE.externalFireSeparationAssessed,false);
 assert.equal(PUB_ENVELOPE.weatherproofingCertified,false);
 assert.equal(pubEnvelopeFit({lotWidthM:12,lotDepthM:46}).modelledWithinNominalLot,false);
 assert.throws(()=>pubEnvelopeFit({lotDepthM:0}),RangeError);
});
test('RTPUB-024 town renderer consumes the shared source, signs below roof, history unknown',()=>{
 const source=readFileSync(new URL('../src/world/townlife.js',import.meta.url),'utf8');
 assert.match(source,/return buildPubFacade\(b,\{GLASS,DARK,WOOD\}\)/);
 assert.match(source,/pub: \[0, 3\.91, 7\.15/);
 assert.doesNotMatch(source,/pub\(b\)\s*\{\s*b\.box\(0x7a4a3a, 14, 7, 11/);
 const e=PUB_ENVELOPE;
 assert.equal(e.originalConstructionYear,null);
 assert.equal(e.actualSiteBoundariesApproved,false);
});
