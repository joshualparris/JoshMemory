// Automated Android-size Chromium gameplay regression; actual hardware still needs a human walkthrough.
// Start a local build: node tools/serve.mjs dist/public 8091
import { chromium,devices } from 'playwright';
import assert from 'node:assert/strict';
const URL=process.env.TOWN_URL||'http://127.0.0.1:8091/';
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const ctx=await browser.newContext({...devices['Pixel 7']});
const page=await ctx.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try {
 await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
 try {
  await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,null,{timeout:90000});
 } catch(e) {
  const debug=await page.evaluate(()=>({title:document.title,ready:document.readyState,hasTown:!!window.__town,loading:document.getElementById('loading')?.outerHTML?.slice(0,800),status:document.getElementById('status')?.textContent?.slice(0,200),scripts:[...document.scripts].map(x=>x.src||x.type)})).catch(err=>({error:String(err)}));
  console.error('Mobile startup diagnostic:',JSON.stringify({debug,pageErrors:errors}));
  throw e;
 }
 assert(await page.isVisible('#t-use'),'the mobile Use action is visible');
 await page.evaluate(()=>{window.__town.life.setTime(10*60);window.__town.life.ledger().civic.player.bank=5000;window.__town.enterShop('dealership');});
 await page.waitForFunction(()=>window.__town.state().mode==='house');
 const things=await page.evaluate(()=>window.__town.state().interactables);
 const counter=things.find(x=>/vehicle sales desk/i.test(x.label));
 assert(counter,'showroom sales counter exists');
 assert(await page.evaluate(k=>window.__town.approach(k),counter.key),'sales counter physically reachable');
 await page.waitForFunction(k=>window.__town.state().near===k,counter.key,{timeout:6000});
 await page.tap('#t-use');
 await page.waitForFunction(()=>!!window.__town.state().panel);
 const buttons=await page.evaluate(()=>window.__town.state().panel.buttons);
 const buy=buttons.findIndex(s=>s.startsWith('Buy Used hatchback'));
 assert(buy>=0,'used vehicle purchase available in interactive dealership');
 const result=await page.evaluate(i=>({clicked:window.__town.answer(i),panel:window.__town.state().panel,
    funds:window.__town.life.ledger().civic.player}),buy);
 let v=await page.evaluate(()=>window.__town.vehicles()[0]);
 assert(v&&v.registration&&Number.isFinite(v.x),'purchased car appears in world: '+JSON.stringify({result,vehicle:v}).slice(0,1000));
 await page.evaluate(()=>{window.__town.exitShop();});
 await page.evaluate(p=>window.__town.place(p.x+1.5,p.z+1.5),v);
 await page.waitForFunction(reg=>window.__town.state().nearbyVehicle===reg,v.registration,{timeout:6000});
 await page.tap('#t-use');
 await page.waitForFunction(()=>!!window.__town.state().driving,null,{timeout:5000});
 // Real touch events move the on-screen joystick: the same path as Android input.
 const cdp=await ctx.newCDPSession(page);
 const x=page.viewportSize().width*.2,y=page.viewportSize().height*.7;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-48,id:1}]});
 await new Promise(r=>setTimeout(r,2200));
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await new Promise(r=>setTimeout(r,200));
 v=await page.evaluate(()=>window.__town.vehicles()[0]);
 assert(v.fuel<20,'mobile joystick advances vehicle and consumes fuel');
 assert(v.odometer>64000,'odometer increases as vehicle travels');
 assert(!errors.length,'no browser page errors: '+errors.join('; '));
 console.log('PASS: Android viewport, full dealer purchase, physical car spawn, touch entry and joystick driving');
} finally {await browser.close();}
