import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const url='http://127.0.0.1:8733/games/hub-amodule-dnd/index.html';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1024,height:768}});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.url().includes('tutorial.json')&&r.status()!==200)errors.push('Map '+r.status());});
try{
  const resp=await page.goto(url,{waitUntil:'domcontentloaded'});
  assert.equal(resp.status(),200);
  await page.locator('#btn-new-game').click();
  await page.waitForTimeout(1500);
  assert.equal(await page.locator('#start-screen').evaluate(e=>e.classList.contains('hidden')),true,'Title screen hides');
  assert.equal(await page.locator('#game-screen').evaluate(e=>!e.classList.contains('hidden')),true,'Game screen opens');
  assert.equal(await page.locator('#error-panel').evaluate(e=>e.classList.contains('hidden')),true,'Game displays no error');
  assert.equal(await page.locator('#game-canvas').evaluate(e=>e.width>0&&e.height>0),true,'Canvas initialized');
  assert.deepEqual(errors,[],'No runtime exceptions or failed map loads');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(200);
  assert.equal(await page.locator('#error-panel').evaluate(e=>e.classList.contains('hidden')),true);
  console.log('PASS Tile RPG tutorial: map loads, game starts, canvas renders and movement input is accepted');
}finally{await browser.close();}
