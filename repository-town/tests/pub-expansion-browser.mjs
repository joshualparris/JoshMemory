import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('audit/pub/expansion',{recursive:true});
const options={args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']};if(process.env.TOWN_PROXY&&process.env.HTTPS_PROXY){const u=new URL(process.env.HTTPS_PROXY);options.proxy={server:u.protocol+'//'+u.hostname+':'+u.port,username:decodeURIComponent(u.username),password:decodeURIComponent(u.password)}}
const browser=await chromium.launch(options);try{for(const mobile of [false,true]){const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile,ignoreHTTPSErrors:!!process.env.TOWN_PROXY}),errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));await page.goto(process.env.TOWN_URL||'http://localhost:8091/');await page.waitForFunction(()=>window.__town&&document.getElementById('loading').hidden,null,{timeout:90000,polling:500});
const press=async key=>{await page.keyboard.down(key);await page.waitForTimeout(220);await page.keyboard.up(key);await page.waitForTimeout(250)},approach=async key=>{assert(await page.evaluate(k=>window.__town.approach(k),key),key+' reachable');const v=page.viewportSize();await page.mouse.click(v.width*.5,v.height*.45);await press('e')},close=async()=>{await page.locator('#panel-close').click();await page.waitForTimeout(200)};
// Evaluate parameter is passed explicitly below (the helper keeps keyboard/touch Use real).
const waitFloor=async n=>page.waitForFunction(n=>window.__town.state().floor===n,n,{timeout:30000,polling:200});
await page.evaluate(()=>{window.__town.meetGuide();window.__town.life.setTime(600);for(let i=0;i<6;i++)window.__town.life.run(30);window.__town.life.speed(0);window.__town.enterShop('pub')});await page.waitForTimeout(400);let s=await page.evaluate(()=>window.__town.state());assert.equal(s.floors,3);assert.equal(s.seats.length,19);if(!mobile)await page.locator('#btn-hud-toggle').click();await page.screenshot({path:`audit/pub/expansion/${mobile?'phone':'desktop'}-ground.png`});
await approach('pub:stairs-up');await waitFloor(1);s=await page.evaluate(()=>window.__town.state());assert.equal(s.floorElevation,4.8);assert.equal(s.seats.length,32);await page.evaluate(()=>window.__town.place(-1.1,.8,0));await page.screenshot({path:`audit/pub/expansion/${mobile?'phone':'desktop'}-dining.png`});
assert(await page.evaluate(key=>window.__town.approachSeat(key),s.seats[0].key));await press('e');assert((await page.evaluate(()=>window.__town.state())).seated);await press('e');
await approach('pub:office');await page.getByRole('button',{name:'Isolate / restore passenger lift',exact:true}).click();await close();await approach('pub:lift');await page.getByRole('button',{name:'Ground floor · bar and bistro',exact:true}).click();assert((await page.locator('#panel-body').innerText()).includes('unavailable'));assert.equal((await page.evaluate(()=>window.__town.state())).floor,1);await close();await approach('pub:stairs-ground');await waitFloor(0);
await approach('pub:services');await page.getByRole('button',{name:'Cellar, lift and upper-floor services',exact:true}).click();await page.getByRole('button',{name:'Isolate / restore passenger lift',exact:true}).click();await close();
await approach('pub:lift');await page.getByRole('button',{name:'Cellar · kegs, wine and services',exact:true}).click();await waitFloor(2);s=await page.evaluate(()=>window.__town.state());assert.equal(s.floorElevation,-3.2);await page.evaluate(()=>window.__town.place(-1.1,.8,0));await page.screenshot({path:`audit/pub/expansion/${mobile?'phone':'desktop'}-cellar.png`});
await approach('pub:cellar-services');await page.getByRole('button',{name:'Move six wine bottles to bar',exact:true}).click();assert((await page.locator('#panel-body').innerText()).includes('30 cellar / 6 bar'));await page.getByRole('button',{name:'Use cellar hand basin',exact:true}).click();assert((await page.locator('#panel-body').innerText()).includes('2.0/60'));await page.getByRole('button',{name:'Start / stop beverage-gas leak scenario',exact:true}).click();await page.evaluate(()=>window.__town.life.run(20));await page.getByRole('button',{name:'Refresh cellar instruments',exact:true}).click();assert((await page.locator('#panel-body').innerText()).includes('LATCHED'));await page.screenshot({path:`audit/pub/expansion/${mobile?'phone':'desktop'}-gas-alarm.png`});await close();
await approach('pub:stairs-ground');await waitFloor(0);await approach('pub:stairs-cellar');assert.equal((await page.evaluate(()=>window.__town.state())).floor,0,'unsafe cellar entry is refused, escape remained possible');
await approach('pub:services');await page.getByRole('button',{name:'Cellar, lift and upper-floor services',exact:true}).click();await page.getByRole('button',{name:'Start / stop beverage-gas leak scenario',exact:true}).click();await page.evaluate(()=>window.__town.life.run(40));await page.getByRole('button',{name:'Reset gas alarm after assessment',exact:true}).click();assert((await page.locator('#panel-body').innerText()).includes('cleared'));await close();
await approach('pub:services');await page.getByRole('button',{name:'Trip / reset pub breaker',exact:true}).click();await close();await approach('pub:lift');await page.getByRole('button',{name:'Upstairs · dining and office',exact:true}).click();assert((await page.locator('#panel-body').innerText()).includes('unavailable'));await close();await approach('pub:stairs-up');await waitFloor(1);await approach('pub:refuge');await page.getByRole('button',{name:'Request staff-assisted evacuation to ground',exact:true}).click();await waitFloor(0);
await approach('pub:services');await page.getByRole('button',{name:'Trip / reset pub breaker',exact:true}).click();await close();await approach('pub:stairs-up');await waitFloor(1);await approach('pub:upper-emergency-exit');await page.waitForFunction(()=>window.__town.state().mode==='town',null,{timeout:30000,polling:200});let out=await page.evaluate(()=>({state:window.__town.state(),pub:window.__town.shops().find(x=>x.id==='pub')}));assert(out.state.pos.z<out.pub.door.z-18);assert(!await page.evaluate(()=>{const p=window.__town.state().pos;return window.__town.probeStatic(p.x,p.z,.4)}),'escape lands on the rear escape stair head, clear of its handrail at body radius');await page.screenshot({path:`audit/pub/expansion/${mobile?'phone':'desktop'}-escape-yard.png`});
// Travel the elevated rear-door balcony, turn right onto the east-side stairs,
// then descend physically toward the street and away from the railway.
await page.evaluate(()=>{const p=window.__town.state().pos;window.__town.place(p.x,p.z,-Math.PI/2);});
const beforeMove=await page.evaluate(()=>window.__town.state().pos);
// Walk until the head of the stair flight (8.5 m east of the pub's centreline), not for a fixed
// time: on slow software rendering a fixed press stops short and walks into the balcony rail.
const flightX=(await page.evaluate(()=>window.__town.shops().find(x=>x.id==='pub').door.x))+8.5;
await page.keyboard.down('w');for(let i=0;i<40&&(await page.evaluate(()=>window.__town.state().pos.x))<flightX-.05;i++)await page.waitForTimeout(100);await page.keyboard.up('w');
const balcony=await page.evaluate(()=>window.__town.state());
assert(balcony.pos.x>beforeMove.x+1,'raised balcony traversable');
assert(balcony.walkElevation>=4.6,'raised balcony must not fall to ground level');
await page.evaluate(()=>{const p=window.__town.state().pos;window.__town.place(p.x,p.z,Math.PI);});
await page.keyboard.down('w');for(let i=0;i<40;i++){await page.waitForTimeout(100);const e=await page.evaluate(()=>window.__town.state().walkElevation);if(e>0&&e<4.2)break;}await page.keyboard.up('w');
await page.waitForTimeout(250);
const descended=await page.evaluate(()=>window.__town.state());
assert(descended.walkElevation>0&&descended.walkElevation<4.6,'actual east-side tread descent');
const yard=await page.evaluate(()=>{const p=window.__town.shops().find(x=>x.id==='pub');return {x:p.door.x+8.5,z:p.door.z-7.5-2.9};});
await page.evaluate(p=>window.__town.place(p.x,p.z,Math.PI),yard);
await page.waitForTimeout(500);
assert(!await page.evaluate(p=>window.__town.probeStatic(p.x,p.z,.4),yard),'rear stair foot is clear of obstacles');
assert.equal((await page.evaluate(()=>window.__town.state())).nearPerson,'pub:rear-stair-foot','rear stair marker accessible from service path');
await press('e');await waitFloor(1);
const upperReturn=await page.evaluate(()=>window.__town.state());
assert.equal(upperReturn.floorElevation,4.8);
assert(Math.hypot(upperReturn.pos.x-5.65,upperReturn.pos.z+10.6)<.2,'return to upper door, not ground wall');
assert.deepEqual(errors,[]);const m=await page.evaluate(async()=>await(await fetch('release.json')).json());console.log('PASS pub expansion live gameplay',mobile?'phone emulation':'desktop',m.sourceCommit,m.contentHash);await page.close();}}finally{await browser.close()}
