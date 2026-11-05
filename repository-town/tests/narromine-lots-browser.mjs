// Actual WebGL smoke for NSW cadastral overlay (not a land-survey certification).
// Screenshots for independent visual comparison on real built Narromine code.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const root=process.env.TOWN_URL||'http://127.0.0.1:8091/';
const output='test-results/narromine-lots';
fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
async function check(name,mobile){
 const opts=mobile?{viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:1}:{viewport:{width:1280,height:800},deviceScaleFactor:1};
 const page=await browser.newPage(opts),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>sessionStorage.setItem('town-cheats','1'));
 const results=[];
 try{
  for(const enabled of [false,true]){
   await page.goto(root+(enabled?'?lots=1':''),{waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,null,{timeout:120000});
   await page.evaluate(()=>{window.__town.closePanel?.();window.__town.life.setTime(12*60);window.__town.place(-4825,-542,Math.PI);});
   await page.waitForFunction(()=>window.__town.narromineVisible()&&window.__town.state().triangles>1000,null,{timeout:45000});
   await page.waitForTimeout(600);
   const actual=await page.evaluate(()=>({visible:window.__town.narromineVisible(),triangles:window.__town.state().triangles,calls:window.__town.state().calls}));
   assert(actual.visible&&actual.triangles>1000&&actual.calls>0,'actual Narromine built Three.js scene must render');
   await page.screenshot({path:output+'/'+name+'-'+(enabled?'overlay-on':'overlay-off')+'.png'});
   results.push({enabled,...actual});
  }
  assert.deepEqual(errors,[],'no page errors');
  // THREE.LineSegments count as WebGL *lines*, not triangles, so never
  // infer overlay visibility from renderer.info.render.triangles.
  // Node regression asserts the exact one-draw-call line mesh geometry;
  // captures here are retained for manual visible on/off comparison.
  assert(results[0].visible&&results[1].visible,'town must remain visible in both modes');
  console.log('PASS '+name+' real Narromine WebGL, two reviewable on/off screenshots, zero page errors; '+JSON.stringify(results));
 }finally{await page.close();}
}
try{await check('desktop',false);await check('phone-emulated',true);}
finally{await browser.close();}
