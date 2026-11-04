// Browser acceptance without any billable Google call: Google SDK is mocked.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import { createComparisonServer } from '../tools/narromine-visual-qa/live-streetview/server.mjs';
import { presetData, worldToGeo, geoToWorld } from '../tools/narromine-visual-qa/live-streetview/presets.mjs';

const meta = presetData();
assert.equal(meta.presets.length, 6, 'all six landmark locations');
for (const p of meta.presets) {
  const geo = worldToGeo(p.camera.x, p.camera.z);
  const back = geoToWorld(geo.lat, geo.lng);
  assert(Math.abs(back.x-p.camera.x) < 1e-6 && Math.abs(back.z-p.camera.z) < 1e-6, 'map projection round trip');
  assert(geo.lat < -30 && geo.lat > -35 && geo.lng > 145 && geo.lng < 151, 'valid NSW positions');
}
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'narromine-compare-'));
fs.writeFileSync(path.join(dir,'index.html'), '<!doctype html><html><head><title>Mock Game</title></head>'+
'<body><canvas id="scene" width="300" height="200"></canvas><header id="hud">HUD</header>'+
'<script>window.__town={state:()=>({pos:{x:-1,z:-2}}),place:(x,z,yaw)=>{window.lastPose={x,z,yaw}},life:{speed:()=>{},setTime:()=>{}}};</script></body></html>');
const server = createComparisonServer({ publicRoot:dir });
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const base = 'http://127.0.0.1:' + server.address().port;
let browser;
try {
  const metaResponse=await fetch(base+'/_streetview/api/presets');
  assert.equal(metaResponse.status,200);
  assert.equal((await metaResponse.json()).presets.length,6);
  assert.equal((await fetch(base+'/_streetview/server.mjs')).status,404, 'private source code cannot be served');
  assert.equal((await fetch(base+'/_streetview/app.js')).status,200, 'comparison app is served');
  assert.equal((await fetch(base+'/')).status,200, 'local game is served');
  assert.equal((await fetch(base+'/_streetview/api/presets',{method:'POST'})).status,405);
  assert.equal((await fetch(base+'/.git/config')).status,404,'dotfiles not served');
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({acceptDownloads:true,viewport:{width:1320,height:900}});
  const page=await context.newPage();
  const errors=[], requests=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(r.url().includes('maps.googleapis.com'))requests.push(r.url());});
  const mockGoogleJs = 'window.google={maps:{StreetViewStatus:{OK:"OK"},importLibrary:async function(name){'+
    'if(name!=="streetView")throw Error("Unexpected library");'+
    'class StreetViewPanorama {'+
    'constructor(el,options){window.mockPanoramaInstances=(window.mockPanoramaInstances||0)+1;'+
    'this.el=el;this.pos=options.position||{lat:-32.23565,lng:148.23927};this.pov=options.pov;this.listeners={};'+
    'el.textContent="Mock Street View (test only; no Google imagery)";}'+
    'addListener(key,fn){(this.listeners[key]||=([])).push(fn);}'+
    'emit(key){for(const fn of this.listeners[key]||[])fn();}'+
    'getPano(){return "mock-panorama";}'+
    'getPosition(){return {lat:()=>this.pos.lat,lng:()=>this.pos.lng};}'+
    'getPov(){return this.pov;} getStatus(){return "OK";}'+
    'setPosition(pos){this.pos=pos;this.emit("position_changed");this.emit("pano_changed");}'+
    'setPov(pov){this.pov=pov;this.emit("pov_changed");}'+
    'setPano(pano){this.pano=pano;this.emit("pano_changed");}'+
    'setVisible(flag){this.visible=flag;}'+
    '}class StreetViewService {'+
    'async getPanorama(request){window.mockMetadataCalls=(window.mockMetadataCalls||0)+1;'+
    'if(window.mockNoCoverage)throw {code:"ZERO_RESULTS"};'+
    'return {data:{location:{pano:"mock-official-"+window.mockMetadataCalls,'+
    'latLng:{lat:()=>request.location.lat,lng:()=>request.location.lng}}}};}'+
    '}return {StreetViewPanorama,StreetViewService};}}};window.mockNoCoverage=true;';
  await page.route('https://maps.googleapis.com/maps/api/js**',route=>route.fulfill({
    status:200,contentType:'application/javascript',body:mockGoogleJs
  }));
  await page.goto(base+'/_streetview/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.getElementById('location')?.options.length===6);
  assert.equal(requests.length,0, 'page open makes no call to Google');
  assert.match(await page.locator('#status').textContent(),/Google has NOT been contacted/);
  assert.match(await page.locator('#cost-summary').textContent(),/0 panorama instantiations/);
  await page.locator('#api-key').fill('fake-test-key-do-not-use');
  page.once('dialog',d=>d.accept());
  await page.locator('#connect').click();
  await page.waitForFunction(()=>document.getElementById('status')?.textContent.includes('No panorama within 500m'));
  assert.equal(await page.evaluate(()=>window.mockPanoramaInstances||0),0,
    'no billable panorama created when Google returns ZERO_RESULTS');
  assert.equal(await page.evaluate(()=>window.mockMetadataCalls),3,
    'three free availability lookups at increasing radius');
  assert.match(await page.locator('#cost-summary').textContent(),/0 panorama instantiations/);
  assert.match(await page.locator('#google-placeholder').textContent(),/within 500m/);
  assert.equal(requests.length,1, 'only explicitly authorised SDK request');
  await page.evaluate(()=>{window.mockNoCoverage=false;});
  await page.locator('#api-key').fill('fake-test-key-do-not-use');
  page.once('dialog',d=>d.accept());
  await page.locator('#connect').click();
  await page.waitForFunction(()=>window.mockPanoramaInstances===1);
  assert.equal(requests.length,1, 'one SDK request, reused when retrying after no coverage');
  assert.match(await page.locator('#cost-summary').textContent(),/US\$0\.014/);
  assert.equal(await page.locator('#api-key').inputValue(),'','API key cleared from input memory');
  await page.locator('#location').selectOption('post-office-entrance');
  assert.equal(await page.evaluate(()=>window.mockPanoramaInstances),1,'changing landmarks reuses existing panorama');
  assert.equal(requests.length,1,'no new SDK request for existing panorama movement');
  assert.equal(await page.evaluate(()=>window.mockPanoramaInstances),1,'one paid viewer for all landmarks');
  await page.waitForFunction(()=>window.mockMetadataCalls === 5);
  assert.equal(await page.evaluate(()=>window.mockMetadataCalls),5,'free metadata called on each explicit lookup');
  await page.locator('#match-heading').click();
  await page.locator('#follow-position').click();
  await page.locator('#note').fill('Compare roofline to independently obtained photographs');
  await page.locator('#add-note').click();
  assert.equal(await page.locator('#note-list li').count(),1);
  const downloadPromise=page.waitForEvent('download');
  await page.locator('#export-json').click();
  const download=await downloadPromise;
  assert.match(download.suggestedFilename(),/narromine-streetview-observations/);
  const file=path.join(dir,'export-test.json');
  await download.saveAs(file);
  const exported=JSON.parse(fs.readFileSync(file,'utf8'));
  assert.equal(exported.apiKeyStored,false);
  assert.equal(exported.photosStored,false);
  assert.equal(exported.observations.length,1);
  assert.equal(exported.locallyObservedGoogleActions.filter(e=>e.billableEvent).length,1);
  assert(!fs.readFileSync(file,'utf8').includes('fake-test-key-do-not-use'),'key never exported');
  assert.deepEqual(errors,[],'no browser page errors');
  console.log('PASS Narromine live Street View comparison: 6 locations, no automatic Google calls,');
  console.log('  one consented panorama creation, 0 repeated billed instances, cost ledger and notes export.');
} finally {
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
  fs.rmSync(dir,{recursive:true,force:true});
}