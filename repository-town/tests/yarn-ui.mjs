// Browserless UI integration test for the actual mounted yarn settings/toast.
// A tiny DOM stand-in avoids requiring a 3D/WebGL browser on CI.
import assert from 'node:assert/strict';
import { mountTownYarns } from '../src/ui/yarns.js';
import { AUTO_YARN_CAPTIONS_KEY } from '../src/ui/yarn-preferences.js';

const nodes = [];
class Node {
  constructor(tag='div') {
    this.tag=tag; this.children=[]; this.attrs={}; this.hidden=false;
    this.textContent=''; this.parent=null; this.checked=false;
    nodes.push(this);
  }
  append(...children) {
    for(const child of children) { child.parent=this; this.children.push(child); }
  }
  after(child) {
    child.parent=this.parent;
    if(this.parent){
      const i=this.parent.children.indexOf(this);
      this.parent.children.splice(i+1,0,child);
    }
  }
  setAttribute(key,value){this.attrs[key]=value;}
  focus(){document.activeElement=this;}
  remove() {
    if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);
    this.parent=null;
  }
  get firstChild(){return this.children[0]||null;}
}
const document = {
  body:new Node('body'),
  head:new Node('head'),
  createElement:tag=>new Node(tag),
  getElementById:id=>nodes.find(node=>node.id===id)||null,
  activeElement:null,
};
globalThis.document=document;
const buttons=new Node('div');
document.body.append(buttons);
const roster=new Node('button');
roster.id='btn-npcs';
buttons.append(roster);
const values=new Map();
globalThis.localStorage={
  getItem:key=>values.get(key)||null,
  setItem:(key,value)=>values.set(key,value),
};
globalThis.matchMedia=()=>({matches:true}); // narrow/touch layout
const life={social:{events:[]},playerAt:''};
const player={pos:{x:0,z:0}};
let opened=0;
const yarns=mountTownYarns({life,player,onOpen:()=>opened++});
const get=id=>document.getElementById(id);
const caption=get('town-yarn-caption');
const settings=get('town-dialogue-settings');
const toggle=get('town-auto-yarn-toggle');
const settingsButton=get('btn-town-dialogue-settings');
const closeCaption=nodes.find(node=>node.attrs['aria-label']==='Dismiss nearby conversation');
const closeSettings=nodes.find(node=>node.attrs['aria-label']==='Close dialogue settings');
assert.ok(caption&&settings&&toggle&&settingsButton&&closeCaption&&closeSettings);
assert.equal(toggle.checked,false,'new mobile visitor starts with no automatic popups');
assert.equal(caption.hidden,true);
settingsButton.onclick();
assert.equal(settings.hidden,false,'settings opens');
assert.equal(yarns.isOpen(),true,'settings counts as an open overlay');
assert.equal(opened,1,'settings hides conflicting town HUD');
toggle.checked=true;
toggle.onchange();
assert.equal(values.get(AUTO_YARN_CAPTIONS_KEY),'on');
yarns.close();
assert.equal(settings.hidden,true,'Escape/back closes settings');
assert.equal(yarns.isOpen(),false);

const event=(minute,name)=>({
  day:4,minute,kind:'pub',people:[name,'Rowan'],
  position:{x:0,z:0},
  lines:Array.from({length:4},(_,i)=>({speaker:name,text:'Yarn line '+i})),
});
life.social.events.unshift(event(1100,'Kip'));
yarns.update(1,'town');
assert.equal(caption.hidden,false,'new nearby event is visible when enabled');
closeCaption.onclick();
assert.equal(caption.hidden,true,'dismiss instantly hides current caption');
yarns.update(1,'town');
assert.equal(caption.hidden,true,'dismissed event cannot immediately return');
life.social.events.unshift(event(1101,'Nell'));
yarns.update(1,'town');
assert.equal(caption.hidden,false,'a different yarn may appear');
settingsButton.onclick();
assert.equal(caption.hidden,true,'settings hides caption immediately');
toggle.checked=false;
toggle.onchange();
assert.equal(values.get(AUTO_YARN_CAPTIONS_KEY),'off');
closeSettings.onclick();
life.social.events.unshift(event(1102,'Kip'));
yarns.update(1,'town');
assert.equal(caption.hidden,true,'saved preference suppresses later automatic captions');
assert.equal(get('btn-town-yarns').hidden,false,'manual Yarns button remains available');
console.log('PASS: mobile settings, persisted toggle, caption dismiss, new event, close/back and manual access');
