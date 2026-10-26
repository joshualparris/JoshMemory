import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try { for (const mobile of [false,true]) {
 const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.TOWN_URL||'http://localhost:8097/');
 await page.waitForFunction(()=>window.__town&&document.getElementById('loading').hidden,null,{timeout:90000});
 await page.evaluate(()=>{window.__town.meetGuide();window.__town.life.setTime(600);for(let i=0;i<6;i++)window.__town.life.run(30);window.__town.life.speed(0);window.__town.enterShop('pub');window.__town.approach('pub:counter');});
 await page.keyboard.press('e');
 const confirm=page.locator('#panel-primary-actions').getByRole('button',{name:'Confirm character is 18+',exact:true});
 await confirm.waitFor();
 const visible=await confirm.evaluate(el=>{const r=el.getBoundingClientRect(),p=document.getElementById('panel').getBoundingClientRect();return r.top>=p.top&&r.bottom<=p.bottom&&r.bottom<=innerHeight;});
 assert(visible,'ID confirmation visible without scrolling');
 await confirm.click();assert.match(await page.locator('#panel-body').innerText(),/Adult ID: confirmed/);
 assert.equal(await page.getByRole('button',{name:'Confirm character is 18+',exact:true}).count(),0);
 await page.getByRole('button',{name:'Pub service controls',exact:true}).click();
 await page.getByRole('button',{name:'Back to pub menu',exact:true}).click();
 assert.match(await page.locator('#panel-body').innerText(),/Adult ID: confirmed/);
 fs.mkdirSync('test-results/pub-id',{recursive:true});await page.screenshot({path:`test-results/pub-id/${mobile?'phone':'desktop'}.png`});
 assert.deepEqual(errors,[]);console.log('PASS pub ID controls',mobile?'phone':'desktop');await page.close();
}} finally {await browser.close();}
