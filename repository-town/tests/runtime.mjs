import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../tools/game_runtime.js', import.meta.url), 'utf8');
// Browser event dispatch invokes both onload and addEventListener callbacks.
class XHR extends EventTarget {
  open() {} send() { throw Error('Unexpected network request'); }
  dispatchEvent(e) { this['on'+e.type]?.(e); return super.dispatchEvent(e); }
}
const win = { XMLHttpRequest: XHR, fetch: () => { throw Error('Unexpected network fetch'); } };
const context = { window: win, location: new URL('https://town.example/games/demo/index.html'), URL, Response, Event, ProgressEvent: Event, setTimeout, history: {} };
const packed = source.replace(/var F = .*?;/, 'var F = {"data.json":"{\\"ok\\":true}"};').replace(/var IMG = .*?;/, 'var IMG = {};');
vm.runInNewContext(packed, context);
const response = await win.fetch('/data.json'); assert.deepEqual(await response.json(), {ok:true});
const xhr = new XHR(); let properties=0, listeners=0, ends=0;
xhr.onload = () => properties++; xhr.addEventListener('load', () => listeners++); xhr.addEventListener('loadend',()=>ends++);
xhr.open('GET','/data.json'); xhr.send(); await new Promise(resolve=>setTimeout(resolve,10));
assert.equal(properties,1,'onload must fire once'); assert.equal(listeners,1); assert.equal(ends,1,'loadend listeners must fire');
console.log('PASS packed fetch and single-delivery XHR lifecycle');
