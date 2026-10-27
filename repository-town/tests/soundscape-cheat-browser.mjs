// Chromium acceptance for music controls + selectable real gear/RPM-aware cheat vehicles.
// Run after building dist/public and starting tools/serve.mjs (TOWN_URL).
import assert from 'node:assert/strict';
import {chromium,devices} from 'playwright';
const url=process.env.TOWN_URL||'http://localhost:8091/';
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 for(const mobile of [false,true]){
  const context=await browser.newContext(mobile?{...devices['Pixel 7']}:{viewport:{width:1180,height:780}});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await page.waitForFunction(()=>window.__town&&document.querySelector('#loading')?.hidden,{timeout:90000});
  await page.evaluate(()=>window.__town.closePanel?.());
  await page.click('#btn-sound');
  await page.click('button:has-text("Audio mix")');
  await page.waitForSelector('[data-music-track]');
  await page.selectOption('[data-music-track]','3');
  assert.equal(await page.evaluate(()=>window.__town.soundscape().selectedTrack),3,'rock selection saved');
  await page.click('[data-music-next]');
  assert.equal(await page.evaluate(()=>window.__town.soundscape().selectedTrack),4,'next genre changes track');
  await page.click('[data-music-prev]');
  assert.equal(await page.evaluate(()=>window.__town.soundscape().selectedTrack),3,'previous goes back');
  await page.evaluate(()=>window.__town.closePanel());
  for(let i=0;i<5;i++)await page.evaluate(()=>document.querySelector('#hud h1').click());
  await page.fill('#cheat-password','CHEAT123');await page.click('#cheat-unlock');
  await page.click('button[data-a="goNew"]');
  await page.selectOption('#cheat-vehicle','supercar');
  await page.click('button[data-a="carHere"]');
  await page.waitForTimeout(600);
  let diag=await page.evaluate(()=>({driving:window.__town.state().driving,car:window.__town.life.ledger().civic.motor.owned.at(-1)}));
  assert(diag.driving,'cheat car can be driven');
  assert.equal(diag.car.model,'supercar','picked make/model preserved');
  assert.equal(diag.car.cheatUnrestricted,false,'town speed limit not silently bypassed');
  const before=diag.car.rpm;
  await page.evaluate(()=>window.__town.life.setTime(22*60));
  await page.waitForTimeout(250);
  if(mobile){
    // Touch joystick is already covered by tests/mobile-driving.mjs;
    // this test checks the selected motorbike/vehicle under handset layout.
    assert(await page.locator('#driving-dashboard').count());
  } else {
    await page.click('canvas');await page.keyboard.down('w');await page.waitForTimeout(1100);
    await page.keyboard.up('w');
    diag=await page.evaluate(()=>({v:window.__town.life.ledger().civic.motor.owned.at(-1),audio:window.__town.soundscape().vehicle}));
    assert(diag.v.rpm>=before,'engine RPM responds to accelerator');
    assert(/[1-7RN]/.test(diag.v.gear),'actual automatic gear visible');
    if(diag.audio?.active)assert(diag.audio.frequency>0,'live WebAudio has engine pitch');
  }
  assert.deepEqual(errors,[],'game errors: '+errors.join('; '));
  await context.close();
  console.log('PASS soundscape/cheat-garage '+(mobile?'Android':'desktop'));
 }
}finally{await browser.close();}
