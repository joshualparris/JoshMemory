'use strict';
const assert=require('node:assert/strict');
const { chromium }=require(process.env.PLAYWRIGHT_PATH||'/tmp/arcade-browser/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
 for(const c of [
  {name:'Patch Tuesday',url:'https://patch-tuesday-game.vercel.app/',title:'Patch Tuesday',button:'#startBtn',play:'#game',hide:'#titleScreen',pause:'#pauseBtn'},
  {name:'Throughput',url:'https://throughput-factory-game.vercel.app/',title:'Throughput',button:'#newBtn',play:'#floor',hide:'#titleScreen',pause:null}
 ]){
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const resp=await page.goto(c.url,{waitUntil:'domcontentloaded',timeout:60000});
  assert.equal(resp?.status(),200,c.name+' must serve HTTP 200');
  assert.match(await page.title(),new RegExp(c.title,'i'));
  await page.locator(c.button).waitFor({state:'visible',timeout:15000});
  const canvas=page.locator(c.play);
  assert.equal(await canvas.count(),1,c.name+' canvas present');
  await page.locator(c.button).click();
  await page.waitForTimeout(1250);
  assert.equal(await page.locator(c.hide).evaluate(e=>e.hidden),true,c.name+' title overlay should hide after start');
  assert.equal(await canvas.evaluate(e=>e.width>300&&e.height>200),true,c.name+' playfield must initialise');
  const errBox=page.locator('#err');
  assert.equal(await errBox.evaluate(e=>e.hidden||!e.textContent.trim()),true,c.name+' error panel empty');
  if(c.pause){
   await page.locator(c.pause).click();
   assert.equal(await page.locator('#pauseScreen').evaluate(e=>!e.hidden),true,'Pause screen visible');
   await page.locator('#resumeBtn').click();
   assert.equal(await page.locator('#pauseScreen').evaluate(e=>e.hidden),true,'Resume returns to game');
  } else {
   assert.equal(await page.locator('#goal').evaluate(e=>!e.hidden),true,'Throughput goal visible');
   assert.equal(await page.locator('#tools').evaluate(e=>!e.hidden),true,'Throughput construction tools visible');
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('#continueBtn').waitFor({state:'visible',timeout:15000});
   await page.locator('#continueBtn').click();
   assert.equal(await page.locator('#titleScreen').evaluate(e=>e.hidden),true,'Factory saved/continued');
  }
  assert.deepEqual(errors,[],c.name+' browser JS must have no uncaught errors');
  console.log('PASS '+c.name+' '+c.url+' — HTTP 200, title, render, play controls, no JS errors');
  await page.close();
 }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});