// Interactive Narromine evidence map: real Chromium, desktop + Android viewport.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';
const mobile=process.argv.includes('--mobile');
const i=process.argv.indexOf('--url');
const base=i>=0?process.argv[i+1]:process.env.TOWN_URL||'http://127.0.0.1:8091/';
const dir='test-results/narromine-progress';
fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
 const page=await browser.newPage(mobile?{viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:1}:{viewport:{width:1280,height:820},deviceScaleFactor:1});
 const errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',req=>{if(new URL(req.url()).origin!==new URL(base).origin)external.push(req.url())});
 const response=await page.goto(new URL('narromine-progress.html',base).href);
 assert.equal(response.status(),200);
 await page.waitForFunction(()=>document.querySelectorAll('svg polygon.building').length===227,{timeout:30000});
 assert.equal(await page.locator('svg polygon.building').count(),227,'219 OSM plus 8 detailed source records');
 assert((await page.locator('#stats').innerText()).includes('219'),'source count displayed');
 await page.selectOption('#filter','Modelled');
 await page.waitForFunction(()=>document.querySelector('#matches').textContent.includes('8 records'));
 assert.equal(await page.locator('svg polygon.building:not(.dim)').count(),8,'detailed sites filter');
 await page.selectOption('#filter','all');
 await page.locator('#search').fill('Narromine Post Office');
 await page.waitForFunction(()=>!document.querySelector('#matches').textContent.startsWith('0 records'));
 assert((await page.locator('#matches').innerText()).includes('matching'),'search reacts');
 await page.locator('#reset').click();
 await page.locator('svg polygon.modelled').first().click({force:true});
 assert((await page.locator('#details').innerText()).includes('Evidence gaps'),'select building opens detailed record');
assert.equal(await page.locator('#details a[href^="https://commons.wikimedia.org/"]').count(),1,'Royal Hotel has one licensed historical source link');
 assert((await page.locator('#details').innerText()).includes('not-reviewed'),'does not claim photo verification');
 await page.locator('#zoomIn').click();
 assert.equal(await page.locator('#map').evaluate(x=>x.style.width),'130%','map zoom functional');
 await page.screenshot({path:dir+'/'+(mobile?'android':'desktop')+'.png',fullPage:true});
 assert.deepEqual(errors,[],'no page errors');
 assert.deepEqual(external,[],'no external downloads or third-party photo requests');
 console.log('PASS Narromine progress map '+(mobile?'Android':'desktop')+': 227 footprints, modelled/search filters, selection, zoom, offline resources');
} finally {await browser.close()}
