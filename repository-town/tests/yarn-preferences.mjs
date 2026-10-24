import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {
  AUTO_YARN_CAPTIONS_KEY,
  readAutoYarnCaptions,
  writeAutoYarnCaptions,
  shouldShowAutoYarnCaption,
} from '../src/ui/yarn-preferences.js';

const values = new Map();
const storage = {
  getItem: key => values.has(key) ? values.get(key) : null,
  setItem: (key, value) => values.set(key, value),
};
assert.equal(readAutoYarnCaptions(storage,true),false,'mobile defaults to no auto popups');
assert.equal(readAutoYarnCaptions(storage,false),true,'desktop retains original defaults');
assert.equal(writeAutoYarnCaptions(storage,true),true);
assert.equal(values.get(AUTO_YARN_CAPTIONS_KEY),'on');
assert.equal(readAutoYarnCaptions(storage,true),true,'saved preference overrides mobile default');
assert.equal(writeAutoYarnCaptions(storage,false),true);
assert.equal(readAutoYarnCaptions(storage,false),false,'saved off survives a reload');
assert.equal(readAutoYarnCaptions({getItem(){throw Error('blocked')}},true),false,'blocked storage uses mobile default');
assert.equal(writeAutoYarnCaptions({setItem(){throw Error('blocked')}},true),false,'storage failure does not crash settings');

const visible = {
  enabled:true,activeId:'Kip|Day4',dismissedId:'',elapsed:5,nearby:true,
  yarnPanelHidden:true,settingsPanelHidden:true,
};
assert.equal(shouldShowAutoYarnCaption(visible),true);
for (const patch of [
  {enabled:false}, {dismissedId:'Kip|Day4'}, {elapsed:15}, {nearby:false},
  {yarnPanelHidden:false}, {settingsPanelHidden:false}, {activeId:''},
]) assert.equal(shouldShowAutoYarnCaption({...visible,...patch}),false,JSON.stringify(patch));
assert.equal(shouldShowAutoYarnCaption({...visible,dismissedId:'OlderYarn'}),true,'new conversation is not permanently suppressed');

const yarns = await readFile('src/ui/yarns.js','utf8');
for (const signal of [
  "captionDismiss.setAttribute('aria-label', 'Dismiss nearby conversation')",
  'captionDismiss.onclick=',
  'settingsButton.id = \'btn-town-dialogue-settings\'',
  "autoToggle.onchange=()",
  'autoCaptions=autoToggle.checked',
  "writeAutoYarnCaptions(storage,autoCaptions)",
  '#town-yarn-caption[hidden]',
  "shouldShowAutoYarnCaption({enabled:autoCaptions",
  "close:()=>settingsPanel.hidden?dismiss():dismissSettings()",
]) assert.ok(yarns.includes(signal),'Missing wired preference: '+signal);
assert.ok(!yarns.includes('localStorage.clear()'),'settings must not erase town saves');
console.log('PASS: persistent mobile/desktop yarn preferences, dismissal, panel suppression and manual-conversation wiring');
