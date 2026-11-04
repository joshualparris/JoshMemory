// Deterministic behaviour contract for the isolated, non-invasive minimap UI.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const js=fs.readFileSync(new URL('../src/ui/minimap-visibility.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/ui/minimap-visibility.css',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../src/index.html',import.meta.url),'utf8');
assert(html.includes('ui/minimap-visibility.js')&&html.includes('ui/minimap-visibility.css'),'game HTML loads standalone map toggle resources');
assert(css.includes('body.narromine-minimap-zone #first-day'),'Repo Town-only quest hidden in Narromine');
assert(css.includes('#game-compass'),'compass layout adjusted without modifying its rendering');
assert(!js.includes('narromine-buildings-data.js'),'no Narromine world geometry dependence');
assert(!js.includes('maps.googleapis.com'),'no Google calls or API credentials');
function simulate(persisted='0'){
  const classes=new Set(),values=new Map([['repository-town.minimap-hidden.v1',persisted]]);
  const map={hidden:false},events={},button={
    setAttribute(name,value){this[name]=value;},
    addEventListener(event,handler){events[event]=handler;},
    click(){events.click();},
    textContent:''
  };
  const body={classList:{toggle(name,on){if(on)classes.add(name);else classes.delete(name);},contains:name=>classes.has(name)},
    append(node){assert.equal(node,button);}};
  const document={
    body,pointerLockElement:null,
    getElementById:id=>id==='minimap'?map:null,
    createElement:tag=>{assert.equal(tag,'button');return button;}
  };
  let gameState=null, tick=null;
  const window={get __town(){return {state:()=>gameState}}};
  vm.runInNewContext(js,{document,window,
    localStorage:{getItem:key=>values.get(key)||null,setItem:(key,val)=>values.set(key,val)},
    setInterval:(fn,interval)=>{assert.equal(interval,250);tick=fn;}
  },{filename:'minimap-visibility.js'});
  assert(tick,'UI watches region changes without touching the game frame loop');
  const update=state=>{gameState=state;tick();};
  return {map,button,classes,values,update};
}
let a=simulate();
a.update({mode:'town',pos:{x:0,z:0}});
assert.equal(a.map.hidden,false,'Repo Town map visible by default');
assert.equal(a.button['aria-pressed'],'true');
a.update({mode:'town',pos:{x:-4800,z:-950}});
assert.equal(a.map.hidden,true,'Narromine auto-hides irrelevant Repo Town minimap');
assert(a.classes.has('narromine-minimap-zone'));
assert.equal(a.button['aria-label'],'Show Repository Town minimap');
a.button.click();
assert.equal(a.map.hidden,false,'player can temporarily show minimap in Narromine');
a.update({mode:'town',pos:{x:0,z:0}});
assert.equal(a.map.hidden,false,'return to Repo Town restores minimap');
a.update({mode:'town',pos:{x:-4800,z:-950}});
assert.equal(a.map.hidden,true,'re-entering Narromine auto-hides map again');
a.update({mode:'house',coordinate:'NARROMINE-PO',pos:{x:0,z:0}});
assert.equal(a.map.hidden,true,'Narromine Post Office interior does not display Repo Town map');
a.update({mode:'house',coordinate:'NARROMINE-COLES',pos:{x:0,z:0}});
assert.equal(a.map.hidden,true,'Narromine Coles interior does not display Repo Town map');
a.update({mode:'town',pos:{x:0,z:0}});
a.button.click();
assert.equal(a.map.hidden,true,'manual hide from Repo Town works');
assert.equal(a.values.get('repository-town.minimap-hidden.v1'),'1','Repo Town preference saved to device');
a.update({mode:'town',pos:{x:-4800,z:-950}});
a.button.click();
assert.equal(a.map.hidden,false,'temporary Narromine show still possible with Repo Town preference hidden');
a.update({mode:'town',pos:{x:0,z:0}});
assert.equal(a.map.hidden,true,'saved Repo Town preference respected on return');
let b=simulate('1');
b.update({mode:'town',pos:{x:0,z:0}});
assert.equal(b.map.hidden,true,'hidden preference survives page reload');
b.button.click();
assert.equal(b.map.hidden,false,'manual show overwrites hidden preference');
b.update({mode:'town',pos:{x:-1300,z:-950}});
assert.equal(b.map.hidden,false,'at boundary, remains in Repo Town region');
b.update({mode:'town',pos:{x:-1300.1,z:-950}});
assert.equal(b.map.hidden,true,'just west of Narromine region boundary, automatically hidden');
console.log('PASS Narromine-aware minimap: auto-hide, temporary override, interior, saved preference, no game source edits.');
