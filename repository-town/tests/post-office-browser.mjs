// Real Chromium smoke test: the post office exists on the street, the
// player enters its normal civic interior, walks between genuine collision
// geometry and interacts with the researched counter/collection service zones.
// Does not invent postal transactions or mistake a source-only test for QA.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, devices } from 'playwright';
const browser=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
fs.mkdirSync('test-results/post-office',{recursive:true});
try{
 for(const mobile of [false,true]){
  const context=await browser.newContext(mobile?{...devices['Pixel 7']}:{viewport:{width:1280,height:900}});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.TOWN_URL||'http://127.0.0.1:8091/',{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>window.__town&&document.getElementById('loading').hidden,null,{timeout:90000});
  const info=await page.evaluate(()=>{const p=window.__town.shops().find(x=>x.id==='post');if(!p)return null;window.__town.meetGuide();window.__town.place(p.door.x,p.door.z+3,0);return {id:p.id,door:p.door};});
  assert(info?.door,'post office street entrance is missing');
  await page.screenshot({path:`test-results/post-office/${mobile?'phone':'desktop'}-exterior.png`});
  assert(await page.evaluate(()=>window.__town.enterShop('post')),'physical post office entrance should lead into the room');
  await page.waitForFunction(()=>window.__town.state().mode==='house',{timeout:10000});
  await page.evaluate(()=>window.__town.place(0,1.9,0));const start=await page.evaluate(()=>window.__town.state().pos);
  if(mobile){
   const cdp=await context.newCDPSession(page),{width,height}=page.viewportSize(),x=width*.2,y=height*.72;
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-39,id:1}]});
   await page.waitForTimeout(420);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }else{
   await page.evaluate(()=>document.activeElement?.blur?.());
   await page.keyboard.down('w');await page.waitForTimeout(500);await page.keyboard.up('w');
  }
  const after=await page.evaluate(()=>window.__town.state().pos);
  assert(after.z<start.z-.18,'actual '+(mobile?'touch':'keyboard')+' walk failed: '+JSON.stringify({start,after}));
  await page.screenshot({path:`test-results/post-office/${mobile?'phone':'desktop'}-interior.png`});
  for(const key of ['post:counter','post:boxes','post:packing','post:assisted','post:collection','post:mail-slot','post:supplies']){
   assert(await page.evaluate(k=>window.__town.approach(k),key),'cannot physically approach postal station '+key);
  }
  assert.deepEqual(errors,[],'post office caused browser errors');
  console.log('PASS hosted-capable '+(mobile?'Android touch':'desktop keyboard')+' post office exterior, entry, movement, counter and six service stations');
  await context.close();
 }
}finally{await browser.close();}
