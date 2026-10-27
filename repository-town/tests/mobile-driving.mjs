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
 await page.waitForFunction(()=>window.__town&&document.getElementById('loading').hidden,null,{timeout:90000});
 assert(await page.isVisible('#t-use'),'the mobile Use action is visible');
 await page.evaluate(()=>{window.__town.life.setTime(8*60);window.__town.life.ledger().civic.player.bank=5000;});
 let dealer=null;
 for(let attempt=0;attempt<27;attempt++){
   dealer=await page.evaluate(()=>window.__town.facilityState?.('dealership')||null);
   if(dealer?.allowed)break;
   await page.evaluate(()=>window.__town.advanceSimulation?.(10));
 }
 assert(dealer?.allowed,'dealer must have a real consultant in attendance: '+JSON.stringify(dealer));
 assert(await page.evaluate(()=>window.__town.enterShop('dealership')),
    'staffed dealership refused admission: '+JSON.stringify(dealer));
 await page.waitForFunction(()=>window.__town.state().mode==='house',{timeout:8000});
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
 // Parking assignment is resolved when the street scene becomes active.
 // Never walk to an obsolete provisional delivery position.
 await page.waitForFunction(reg=>{
   const car=window.__town.vehicles().find(v=>v.registration===reg);
   return car&&!car.parkingPending&&Number.isFinite(car.x)&&Number.isFinite(car.z);
 },v.registration,{timeout:10000});
 v=await page.evaluate(reg=>window.__town.vehicles().find(v=>v.registration===reg),v.registration);
 await page.evaluate(p=>window.__town.place(p.x+1.5,p.z+1.5),v);
 await page.waitForFunction(reg=>window.__town.state().nearbyVehicle===reg,v.registration,{timeout:10000});
 await page.tap('#t-use');
 await page.waitForFunction(()=>!!window.__town.state().driving,null,{timeout:5000});
 await page.waitForFunction(()=>!document.getElementById('driving-dashboard')?.hidden,null,{timeout:5000});
 assert.equal(await page.locator('#drive-speed').innerText(),'0','speedometer begins at a stop');
 const gaugeStart=await page.evaluate(()=>({fuel:document.getElementById('drive-fuel').textContent,temp:document.getElementById('drive-temp').textContent,registration:document.getElementById('drive-model').textContent}));
 assert(gaugeStart.fuel.includes('20.0')&&gaugeStart.registration.includes(v.registration),'dashboard displays the actual owned car and its fuel: '+JSON.stringify(gaugeStart));
 await page.tap('#drive-radio-power');
 assert.equal(await page.evaluate(()=>window.__town.driveDashboard().station),1,'phone radio on button tunes Country Road FM');
 await page.tap('#drive-radio-next');
 assert.equal(await page.evaluate(()=>window.__town.driveDashboard().station),2,'next station control works by touch');
 assert.match(await page.locator('#drive-radio-station').innerText(),/High Street Jazz/);
 await page.locator('#drive-radio-volume').evaluate(el=>{el.value='60';el.dispatchEvent(new Event('input',{bubbles:true}));});
 assert.equal(await page.evaluate(()=>window.__town.driveDashboard().volume),60,'volume changes through control');
 await page.tap('#drive-radio-power');
 assert.equal(await page.evaluate(()=>window.__town.driveDashboard().station),0,'radio can be switched off without affecting driving');
 // Real touch events move the on-screen joystick: the same path as Android input.
 const cdp=await ctx.newCDPSession(page);
 const x=page.viewportSize().width*.2,y=page.viewportSize().height*.7;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-48,id:1}]});
 await new Promise(r=>setTimeout(r,120));
 const duringTouch=await page.evaluate(()=>window.__town.driveDiagnostics?.());
 assert(duringTouch&&duringTouch.input.z<-.4,
    'Android joystick must deliver forward input to the actual game canvas: '+JSON.stringify(duringTouch));
 await new Promise(r=>setTimeout(r,2200));
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await new Promise(r=>setTimeout(r,200));
 v=await page.evaluate(()=>window.__town.vehicles()[0]);
 const diagnosis=await page.evaluate(()=>window.__town.driveDiagnostics?.());
 assert(v.fuel<20,'mobile joystick advances vehicle and consumes fuel: '+JSON.stringify({duringTouch,diagnosis,current:v}));
 const dash=await page.evaluate(()=>({speed:Number(document.getElementById('drive-speed').textContent),fuel:document.getElementById('drive-fuel').textContent,temp:document.getElementById('drive-temp').textContent,hidden:document.getElementById('driving-dashboard').hidden}));
 assert(!dash.hidden&&dash.temp!=='22 °C','driving must warm the coolant gauge rather than display a static reading: '+JSON.stringify(dash));
 assert(Number.parseFloat(dash.fuel)<20,'fuel gauge must reflect actual fuel consumption: '+JSON.stringify(dash));
 assert(v.odometer>64000,'odometer increases as vehicle travels');
 assert(!errors.length,'no browser page errors: '+errors.join('; '));
 console.log('PASS: Android viewport, full dealer purchase, physical car spawn, touch entry and joystick driving');
} finally {await browser.close();}
