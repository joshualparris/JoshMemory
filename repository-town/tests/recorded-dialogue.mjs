import assert from 'node:assert/strict';
import {RECORDED_DIALOGUE_BRANCHES,RECORDED_DIALOGUE_EVENTS,makeTownRecordedConversation} from '../src/ui/recorded-dialogue.js';
const safe=['greeting','help','explore','ambient','quest','choice','surprise','farewell'];
assert.deepEqual([...RECORDED_DIALOGUE_EVENTS].sort(),[...safe].sort());
for(const [name,choices] of Object.entries(RECORDED_DIALOGUE_BRANCHES)){
 assert(choices.length>0,name+' must have choices');
 for(const choice of choices){
   assert(RECORDED_DIALOGUE_BRANCHES[choice.next],name+' must lead to real branch');
   if(choice.event)assert(safe.includes(choice.event),'no unearned completion or repair lines');
 }
}
function element(tag){
 const listeners={};
 return {tag,children:[],textContent:'',disabled:false,attributes:{},
  setAttribute(k,v){this.attributes[k]=v;},append(...nodes){this.children.push(...nodes);},
  appendChild(node){this.children.push(node);return node;},
  replaceChildren(...nodes){this.children=[...nodes];},
  addEventListener(k,fn){listeners[k]=fn;},
  click(){if(!this.disabled)listeners.click?.();},
 };
}
const root={createElement:element};
assert.equal(makeTownRecordedConversation({id:'ember',name:'Ember'},root),null,'unrecorded NPC cannot impersonate another cast member');
const ui=makeTownRecordedConversation({id:'rowan',name:'Rowan'},root);
assert(ui,'Rowan has a recorded conversation');
assert.equal(ui.attributes['aria-label'],'Recorded conversation with Rowan');
assert.equal(ui.children[2].children.length,5,'initial five player choices');
assert.equal(ui.children[3].attributes.role,'status','spoken transcript must be accessible');
assert(ui.children[2].children.every(b=>b.disabled),'buttons stay disabled until player module is ready');
assert.equal(ui.children[4].children[0].disabled,true,'no autoplay or phantom playing');
ui.stopRecordedConversation();
console.log('PASS: recorded NPC choice branches, player gesture, actor gating and safe outcomes');
