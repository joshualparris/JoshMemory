import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const mobile of [false,true]){
 const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const closePanel=async()=>{await page.locator('#panel-close').click();const vp=page.viewportSize();await page.mouse.click(vp.width*.5,vp.height*.45);};
 await page.goto(process.env.TOWN_URL||'http://localhost:8091/');
 await page.waitForFunction(()=>window.__town&&document.getElementById('loading').hidden,null,{timeout:90000});
 await page.evaluate(()=>{window.__town.life.setTime(10*60);window.__town.life.run(180);window.__town.life.speed(0);});
 assert(await page.evaluate(()=>window.__town.enterShop('pub')));
 await page.waitForTimeout(500);
 for(const key of ['pub:services','pub:kitchen','pub:toilet']){
  assert(await page.evaluate(key=>window.__town.approach(key),key),'approach '+key);
  await page.waitForTimeout(200);await page.keyboard.down('e');await page.waitForTimeout(180);await page.keyboard.up('e');
  await page.waitForFunction(()=>document.getElementById('panel-title')?.textContent.includes('connected utilities'));
  await page.getByRole('button',{name:'Flush toilet',exact:true}).waitFor({state:'visible'});
  await page.getByRole('button',{name:'Flush toilet',exact:true}).click();
  await page.getByRole('button',{name:'Overlay: water',exact:true}).click();
  await page.screenshot({path:`audit/pub-utilities/${mobile?'mobile':'desktop'}-${key.split(':')[1]}.png`});
  await closePanel();await page.waitForTimeout(150);
 }
 await page.evaluate(()=>window.__town.approach('pub:services'));await page.waitForTimeout(200);await page.keyboard.down('e');await page.waitForTimeout(180);await page.keyboard.up('e');
 await page.getByRole('button',{name:'Trip / reset pub breaker',exact:true}).click();
 assert((await page.locator('#panel-body').innerText()).includes('Power off'));
 await page.getByRole('button',{name:'Check internet / phone',exact:true}).click();
 assert((await page.locator('#panel-body').innerText()).includes('upstream link available'));
 await page.getByRole('button',{name:'Fail / restore upstream internet',exact:true}).click();
 assert((await page.locator('#panel-body').innerText()).includes('internet offline'));
 await page.screenshot({path:`audit/pub-utilities/${mobile?'mobile':'desktop'}-outage.png`});
 await closePanel();
 // Start the movement probe in the clear aisle, not against service plant.
 await page.evaluate(()=>window.__town.place(0,-2,0));
 const before=await page.evaluate(()=>window.__town.state().pos);
 await page.keyboard.down('s');await page.waitForTimeout(600);await page.keyboard.up('s');
 const after=await page.evaluate(()=>window.__town.state().pos);assert(Math.hypot(after.x-before.x,after.z-before.z)>.05,'keyboard movement');
 assert.deepEqual(errors,[]);console.log('PASS browser '+(mobile?'emulated Android':'desktop')+': fixtures, actions, overlays, breaker, UPS/upstream, movement, no page errors');await page.close();
}
await browser.close();
