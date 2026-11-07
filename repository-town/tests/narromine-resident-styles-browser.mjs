// #505 real scene proof. Counts attached indoor renderer models, not UI radio state.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

const BASE=process.env.TOWN_URL||'http://127.0.0.1:8091/';
const OUT='test-results/narromine-resident-styles';
fs.mkdirSync(OUT,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const evidence=[];
try{
  for(const [device,opts] of [
    ['desktop',{viewport:{width:1280,height:800},deviceScaleFactor:1}],
    ['phone',{viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:1}],
  ]){
    const page=await browser.newPage(opts),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>window.__town&&document.querySelector('#loading')?.hidden,null,{timeout:100000});
    await page.evaluate(()=>{
      window.__town.life.day=2; // deterministic weekday simulation, not a real roster
      window.__town.life.setTime(11*60);
      window.__town.residentStyle('classic');
    });
    const entry=await page.evaluate(()=>window.__town.enterNarromineWorkplace('work-5'));
    assert(entry,device+': mapped library is enterable in 3D');
    const initial=await page.evaluate(()=>window.__town.state());
    assert.equal(initial.mode,'house');
    assert(initial.people.length>0,device+': modelled library staff on a game weekday');
    assert.equal(initial.coordinate,'NARROMINE-WORK:work-5');
    assert.equal(await page.evaluate(()=>window.__town.residentStyle().indoors),0,device+': classic has no rigged overlays');
    await page.screenshot({path:OUT+'/'+device+'-classic-library.png'});
    await page.evaluate(()=>window.__town.residentStyle('quaternius'));
    assert.equal(await page.evaluate(()=>window.__town.residentStyleReady()),true,device+': Quaternius assets loaded');
    await page.waitForFunction(()=>window.__town.residentStyle().indoors>0,null,{timeout:30000});
    const rigged=await page.evaluate(()=>({style:window.__town.residentStyle(),state:window.__town.state()}));
    assert.equal(rigged.style.style,'quaternius');
    assert(rigged.state.people.length>0,device+': named NPCs remain');
    await page.screenshot({path:OUT+'/'+device+'-quaternius-library.png'});
    await page.evaluate(()=>window.__town.residentStyle('classic'));
    await page.waitForFunction(()=>window.__town.residentStyle().indoors===0,null,{timeout:15000});
    await page.screenshot({path:OUT+'/'+device+'-classic-after-switch.png'});
    await page.evaluate(()=>window.__town.residentStyle('cartoon'));
    const cartoonReady=await page.evaluate(()=>window.__town.residentStyleReady());
    assert(cartoonReady,device+': advertised Cartoon assets must actually load');
    await page.waitForFunction(()=>window.__town.residentStyle().indoors>0,null,{timeout:30000});
    await page.screenshot({path:OUT+'/'+device+'-cartoon-library.png'});
    // The compact HUD hides the legacy Exit house button on narrow screens.
    // Invoke its existing game handler rather than treating a hidden control
    // as a renderer regression; the subject of this test is resident style.
    await page.evaluate(() => document.querySelector('#btn-exit').click());
    await page.waitForFunction(()=>window.__town.state().mode==='town',null,{timeout:20000});
    assert(await page.evaluate(()=>window.__town.enterNarromineWorkplace('work-5')),device+': re-entry');
    await page.waitForFunction(()=>window.__town.residentStyle().indoors>0,null,{timeout:20000});
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__town&&document.querySelector('#loading')?.hidden,null,{timeout:100000});
    const after=await page.evaluate(()=>window.__town.residentStyle());
    assert.equal(after.style,'cartoon',device+': persistent style after reload');
    if((await page.evaluate(()=>window.__town.state().mode))==='town')
      assert(await page.evaluate(()=>window.__town.enterNarromineWorkplace('work-5')),device+': re-enter after reload');
    await page.waitForFunction(()=>window.__town.residentStyle().indoors>0,null,{timeout:30000});
    const restored=await page.evaluate(()=>window.__town.state());
    assert.equal(restored.coordinate,'NARROMINE-WORK:work-5');
    assert.deepEqual(errors,[],device+': no uncaught browser errors');
    evidence.push({device,people:rigged.state.people.length,quaterniusModels:rigged.style.indoors,restoredStyle:after.style,callCount:restored.calls});
    await page.close();
  }
  fs.writeFileSync(OUT+'/acceptance.json',JSON.stringify(evidence,null,2));
  console.log('PASS #505 real Narromine desktop/mobile WebGL: style switching and already-visible NPCs, new entry, reload '+JSON.stringify(evidence));
}finally{await browser.close();}
