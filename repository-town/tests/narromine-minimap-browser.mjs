// Real WebGL desktop/mobile acceptance: the minimap is Repository Town-only.
// It must not obscure Narromine, but the player may temporarily request it.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startStaticServer } from '../tools/narromine-visual-qa/run.mjs';

const out=process.env.MINIMAP_SCREENSHOT_DIR||'test-results/narromine-minimap';
fs.mkdirSync(out,{recursive:true});
const local=await startStaticServer(path.resolve('dist/public'));
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[];
try{
  for(const mobile of [false,true]){
    const device=mobile?'mobile':'desktop';
    const page=await browser.newPage(mobile
      ? {viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:1}
      : {viewport:{width:1280,height:800},deviceScaleFactor:1});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{try{localStorage.removeItem('repository-town.minimap-hidden.v1')}catch{}});
    await page.goto(local.url,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,
      null,{timeout:90000});
    const map=page.locator('#minimap'),button=page.locator('#minimap-toggle');
    await page.evaluate(()=>window.__town.place(0,0,0));
    await page.waitForFunction(()=>!document.getElementById('minimap').hidden,{timeout:15000});
    assert.equal(await map.isVisible(),true,device+': Repo Town minimap visible at home');
    assert.equal(await button.getAttribute('aria-pressed'),'true');
    // In ordinary Repository Town the player can hide the map persistently.
    await button.click();
    await page.waitForFunction(()=>document.getElementById('minimap').hidden);
    assert.equal(await button.getAttribute('aria-pressed'),'false');
    assert.equal(await page.evaluate(()=>localStorage.getItem('repository-town.minimap-hidden.v1')),'1');
    await button.click();
    await page.waitForFunction(()=>!document.getElementById('minimap').hidden);
    assert.equal(await page.evaluate(()=>localStorage.getItem('repository-town.minimap-hidden.v1')),'0');

    // Explicit fast travel crosses the region boundary without reloading.
    await page.evaluate(()=>window.__town.place(-4800,-950,Math.PI));
    await page.waitForFunction(()=>document.body.classList.contains('narromine-minimap-zone')
      && document.getElementById('minimap').hidden,null,{timeout:15000});
    assert.equal(await map.isVisible(),false,device+': incorrect Repo Town grid hidden in Narromine');
    assert.equal(await button.isVisible(),true,device+': manual restore still available');
    assert.equal(await button.getAttribute('aria-label'),'Show Repository Town minimap');
    const firstDay=await page.evaluate(()=>{
      const node=document.getElementById('first-day');
      return node?getComputedStyle(node).display:null;
    });
    assert.equal(firstDay,'none',device+': first-day Railway Hotel task hidden in Narromine');
    const hiddenImage=await page.screenshot({path:path.join(out,device+'-narromine-hidden.png')});
    assert(hiddenImage.length>12000,device+': screenshot rendered');

    // Temporary map override is local to Narromine; returning resets.
    await button.click();
    await page.waitForFunction(()=>!document.getElementById('minimap').hidden);
    assert.equal(await map.isVisible(),true,device+': opt-in map works even in Narromine');
    await page.evaluate(()=>window.__town.place(0,0,0));
    await page.waitForFunction(()=>!document.body.classList.contains('narromine-minimap-zone'));
    await page.evaluate(()=>window.__town.place(-4800,-950,Math.PI));
    await page.waitForFunction(()=>document.body.classList.contains('narromine-minimap-zone')
      && document.getElementById('minimap').hidden);
    // Compass stays visible in Narromine when enabled, and doesn't overlap toggle.
    const overlap=await page.evaluate(()=>{
      const a=document.getElementById('minimap-toggle').getBoundingClientRect();
      const b=document.getElementById('game-compass').getBoundingClientRect();
      return Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left)) *
             Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
    });
    assert.equal(overlap,0,device+': minimap control never overlaps geographic compass');
    assert.equal(errors.length,0,device+': no uncaught browser errors '+errors.join(' | '));
    results.push({device,hiddenScreenshot:device+'-narromine-hidden.png',compassOverlapPx:overlap,errors:errors.length});
    await page.close();
  }
  console.log('PASS live WebGL minimap auto-hide (desktop + mobile) '+JSON.stringify(results));
}finally{
  await browser.close();
  await local.close();
}
