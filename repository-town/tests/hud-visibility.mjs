import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {isHudBlocked,setCompanionLauncherVisibility} from '../src/ui/hud-visibility.js';

// Every focused interface blocks the floating AI button and action prompt.
for(const key of ['panel','buildingCard','npcDialogue','expedition','roster','help','game','map']){
  assert.equal(isHudBlocked({[key]:true}),true,key+' must hide floating controls');
}
assert.equal(isHudBlocked({panel:false,buildingCard:false,game:false}),false,
  'free roaming restores the Ask AI launcher');
const attrs={};
const button={hidden:false,disabled:false,setAttribute:(name,value)=>{attrs[name]=value;}};
setCompanionLauncherVisibility(button,true);
assert.equal(button.hidden,true);
assert.equal(button.disabled,true,'hidden button cannot receive taps or focus');
assert.equal(attrs['aria-hidden'],'true');
setCompanionLauncherVisibility(button,false,true);
assert.equal(button.hidden,true,'do not stack launcher over the open companion');
setCompanionLauncherVisibility(button,false,false);
assert.equal(button.hidden,false,'restore button after closing menus');
assert.equal(button.disabled,false);
assert.equal(attrs['aria-hidden'],'false');
const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const companion=readFileSync(new URL('../src/ui/companion.js',import.meta.url),'utf8');
assert(main.includes('isBlocked:()=>isHudBlocked(blockingHudOverlays())'),
  'keyboard and button clicks must check live overlay state');
assert(main.includes('if(blocked)$(\'prompt\').hidden=true'),
  'interaction hint must also hide under overlays');
assert(main.includes('syncOverlayHud();\n    renderFrame();'),
  'game loop must hide buttons after interaction selection');
assert(companion.includes('#town-companion-button[hidden]{display:none!important}'),
  'button must obey hidden even with its own styling');
assert(companion.includes('if(el.hidden&&(blocked||isBlocked()))return'),
  'K shortcut must not bring up companion over a menu');
console.log('PASS: all game overlays hide AI + prompt, disabled keyboard, automatic free-roam restoration');
