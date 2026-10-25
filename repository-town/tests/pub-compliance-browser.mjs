import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('audit/pub/completion',{recursive:true});
const browser=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{for(const mobile of [false,true]){
 const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.TOWN_URL||'http://localhost:8091/');await page.waitForFunction(()=>window.__town&&document.getElementById('loading').hidden,null,{timeout:90000});
 const manifest=await page.evaluate(async()=>await(await fetch('release.json',{cache:'no-store'})).json());
 await page.evaluate(()=>{window.__town.life.setTime(600);window.__town.life.run(180);window.__town.life.speed(0);});
 assert(await page.evaluate(()=>window.__town.enterShop('pub')));
 const press=async key=>{await page.keyboard.down(key);await page.waitForTimeout(200);await page.keyboard.up(key);await page.waitForTimeout(250);};
 const approach=async key=>{assert(await page.evaluate(key=>window.__town.approach(key),key),key+' reachable');await page.waitForTimeout(200);await press('e');};
 for(const key of ['pub:toilet','pub:ambulant-wc','pub:cold-room','pub:kitchen']){await approach(key);await page.getByRole('button',{name:'Flush second WC',exact:true}).waitFor();await page.screenshot({path:`audit/pub/completion/${mobile?'phone':'desktop'}-${key.split(':')[1]}.png`});await press('Escape');}
 await approach('pub:operations');await page.getByRole('button',{name:'Simulated functional inspection',exact:true}).click();assert((await page.locator('#panel-body').innerText()).includes('functional inspection passed'));
 await page.getByRole('button',{name:'Isolate / restore grease arrestor',exact:true}).click();await page.getByRole('button',{name:'Simulated functional inspection',exact:true}).click();assert((await page.locator('#panel-body').innerText()).includes('FAILED'));await page.getByRole('button',{name:'Isolate / restore grease arrestor',exact:true}).click();
 await page.getByRole('button',{name:'Check adult ID',exact:true}).click();await page.getByRole('button',{name:'Flag / clear intoxication',exact:true}).click();assert((await page.locator('#panel-body').innerText()).includes('refuse service'));
 await page.getByRole('button',{name:'Start evacuation drill',exact:true}).click();assert((await page.locator('#panel-body').innerText()).includes('ACTIVE'));await page.screenshot({path:`audit/pub/completion/${mobile?'phone':'desktop'}-safety.png`});await page.getByRole('button',{name:'Clear emergency after assessment',exact:true}).click();await press('Escape');
 // Actual keyboard rear-exit transition, not merely a successful test-hook return.
 await page.evaluate(()=>window.__town.place(0,-9.3,0));await page.keyboard.down('w');await page.waitForFunction(()=>window.__town.state().mode==='town',null,{timeout:8000});await page.keyboard.up('w');
 const outside=await page.evaluate(()=>({state:window.__town.state(),site:window.__town.shops().find(x=>x.id==='pub')}));assert(outside.state.pos.z<outside.site.door.z-18,'rear discharge is behind the building');assert(!await page.evaluate(()=>{const s=window.__town.state();return window.__town.probeStatic(s.pos.x,s.pos.z,.6);}));
 // Sample the full 1.2m-wide side route back to the street against actual town colliders.
 const x=outside.site.door.x,oz=outside.site.door.z-7.5;const points=[[x,oz-13.2],[x+8,oz-14],[x+8,oz+12.2],[x,oz+12.2],[x,oz+7.5]];
 const blocked=await page.evaluate(points=>{const hits=[];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.2);for(let k=0;k<=n;k++){const x=a[0]+(b[0]-a[0])*k/n,z=a[1]+(b[1]-a[1])*k/n;if(window.__town.probeStatic(x,z,.6))hits.push([x,z]);}}return hits;},points);assert.deepEqual(blocked,[],'continuous street discharge route');
 await page.screenshot({path:`audit/pub/completion/${mobile?'phone':'desktop'}-rear-yard.png`});assert.deepEqual(errors,[]);console.log('PASS hosted-capable pub compliance gameplay',mobile?'phone emulation':'desktop',manifest.sourceCommit,manifest.contentHash);await page.close();
}}finally{await browser.close();}
