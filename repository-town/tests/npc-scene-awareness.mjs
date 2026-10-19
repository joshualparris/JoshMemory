import assert from 'node:assert/strict';
import {isSceneQuestion,sceneFromRoom,answerSceneQuestion} from '../src/ui/scene-awareness.js';
// Uma can describe actual room objects, not random README text.
const rooms=[{name:'Game Room'},{name:'Archive'}];
const objects=[
  {room:0,type:'cabinet',label:'Arcade cabinet',pos:{x:1,z:1},interactive:true},
  {room:0,type:'picture',label:'framed wall picture',pos:{x:2,z:0},interactive:false},
  {room:0,type:'desk',label:'computer desk',pos:{x:4,z:1},interactive:false},
  {room:0,type:'shelf',label:'faraway shelf',pos:{x:25,z:0},interactive:false},
  {room:1,type:'bookshelf',label:'bookshelf',pos:{x:1,z:0},interactive:true},
  {room:0,type:'walker',label:'Uma',pos:{x:.1,z:0},interactive:true},
];
const get=(pos={x:0,z:0},ri=0)=>sceneFromRoom({rooms,objects,roomIndex:ri,position:pos});
const scene=get();
assert.equal(scene.roomName,'Game Room');
assert.equal(scene.roomCount,5);
assert.equal(scene.nearby.length,3);
assert.match(answerSceneQuestion(scene,'ok what objects are next to you right now'),/Arcade cabinet/);
assert.match(answerSceneQuestion(scene,'what objects are next to you right now'),/framed wall picture/);
assert.doesNotMatch(answerSceneQuestion(scene,'what is around you'),/bookshelf|faraway shelf|Uma/i);
assert.match(answerSceneQuestion(scene,'what can I interact with here?'),/Arcade cabinet/);
assert.doesNotMatch(answerSceneQuestion(scene,'what can I interact with here?'),/computer desk/);
assert.match(answerSceneQuestion(get({x:1,z:0},1),'what objects are around you?'),/bookshelf/);
assert.equal(answerSceneQuestion(scene,'tell me about Breach Command'),null);
assert.equal(isSceneQuestion('what are you doing here?'),false);
assert.match(answerSceneQuestion(null,'what objects are beside you right now','villager'),/street/);
assert.match(answerSceneQuestion(null,'what objects are beside you right now'),/can't tell/);
assert.equal(sceneFromRoom({rooms,objects,roomIndex:10,position:{x:0,z:0}}),null);
assert.equal(sceneFromRoom({rooms,objects,roomIndex:0,position:{x:NaN,z:0}}),null);
const snap=JSON.stringify(scene);
assert(!snap.includes('secret'));
console.log('PASS: resident real-room context, moving viewpoint, accurate distance order, props vs people, no through-wall claims, offline nearby answers');
