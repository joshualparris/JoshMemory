import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('audit/pub/venue',{recursive:true});
const options={args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']};
if(process.env.TOWN_PROXY&&process.env.HTTPS_PROXY){const u=new URL(process.env.HTTPS_PROXY);options.proxy={server:u.protocol+'//'+u.hostname+':'+u.port,username:decodeURIComponent(u.username),password:decodeURIComponent(u.password)}}
const browser=await chromium.launch(options);
try{for(const mobile of [false,true]){const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile,ignoreHTTPSErrors:!!process.env.TOWN_PROXY}),errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));
await page.goto(process.env.TOWN_URL||'http://localhost:8091/');await page.waitForFunction(()=>window.__town&&document.getElementById('loading').hidden,null,{timeout:90000,polling:500});
await page.evaluate(()=>{window.__town.meetGuide();window.__town.life.setTime(600);for(let i=0;i<6;i++)window.__town.life.run(30);window.__town.life.speed(0);window.__town.enterShop('pub')});
const approach=async key=>{assert(await page.evaluate(k=>window.__town.approach(k),key),key+' reachable');await page.waitForTimeout(250);await page.keyboard.down('e');await page.waitForTimeout(200);await page.keyboard.up('e');};
const close=async()=>{await page.locator('#panel-close').click();await page.waitForTimeout(200)};
await page.waitForTimeout(500);await page.screenshot({path:`audit/pub/venue/${mobile?'phone':'desktop'}-layout.png`});
await approach('pub:pool');await page.locator('#pool-shoot').click();await page.waitForFunction(()=>document.querySelector('#pool-status')?.textContent.includes('1 shots'),null,{timeout:90000,polling:200}).catch(async e=>{console.log('POOL FAILURE',await page.locator('#pool-status').innerText(),errors);await page.screenshot({path:'audit/pub/venue/pool-failure.png'});throw e});await page.screenshot({path:`audit/pub/venue/${mobile?'phone':'desktop'}-pool.png`});await close();
await approach('pub:operations');await page.getByRole('button',{name:'Confirm character is 18+',exact:true}).click();await close();
await approach('pub:keno');await page.locator('[data-n="7"]').click();await page.getByRole('button',{name:'Record free demonstration ticket',exact:true}).click();assert((await page.locator('#panel-body').innerText()).includes('Ticket waiting'));
await page.evaluate(()=>window.__town.life.run(3));await page.getByRole('button',{name:'Refresh scheduled draw',exact:true}).click();assert(!(await page.locator('#panel-body').innerText()).includes('Ticket waiting'));assert((await page.locator('#panel-body').innerText()).includes('Matches:'));await page.screenshot({path:`audit/pub/venue/${mobile?'phone':'desktop'}-keno.png`});await close();
await approach('pub:counter');const beer=page.getByRole('button',{name:/Order .*beer/i}).first();await beer.click();assert((await page.locator('#panel-body').innerText()).match(/You order tap beer/));await close();await page.waitForTimeout(300);await page.screenshot({path:`audit/pub/venue/${mobile?'phone':'desktop'}-bar.png`});
assert.deepEqual(errors,[]);const release=await page.evaluate(async()=>await(await fetch('release.json')).json());console.log('PASS venue gameplay',mobile?'phone emulation':'desktop',release.sourceCommit,release.contentHash);await page.close();}}finally{await browser.close()}
