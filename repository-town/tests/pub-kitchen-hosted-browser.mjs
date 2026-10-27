// Hosted, browser-real acceptance for the pub kitchen, deliberately independent
// of unrelated WC panels, job rosters and town monetary systems.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
const URL=process.env.TOWN_URL||'http://localhost:8091/';
const expected=process.env.EXPECTED_TOWN_SOURCE||null;
mkdirSync('audit/pub/kitchen-hosted',{recursive:true});
const browser=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>window.__town&&document.getElementById('loading').hidden,null,{timeout:90000});
  const manifest=await page.evaluate(async()=>await(await fetch('release.json',{cache:'no-store'})).json());
  if(expected)assert.equal(manifest.sourceCommit,expected,'hosted source is not the accepted kitchen build');
  assert(typeof manifest.contentHash==='string'&&manifest.contentHash.length===64);
  await page.evaluate(()=>{window.__town.life.setTime(13*60);window.__town.life.run(60);window.__town.life.speed(0);});
  assert(await page.evaluate(()=>window.__town.enterShop('pub')),'actual pub interior unavailable');
  await page.waitForFunction(()=>window.__town.state().mode==='house',null,{timeout:10000});
  const key='pub:kitchen';
  assert((await page.evaluate(()=>window.__town.state().interactables)).some(x=>x.key===key),'working commercial kitchen services missing');
  await page.evaluate(()=>{window.__town.place(-5.52,-7.55,0);document.activeElement?.blur?.();});
  await page.waitForTimeout(250);
  const from=await page.evaluate(()=>window.__town.state().pos);
  await page.screenshot({path:`audit/pub/kitchen-hosted/${mobile?'android':'desktop'}-before.png`});
  if(mobile){
    const cdp=await context.newCDPSession(page),{width,height}=page.viewportSize(),x=width*.2,y=height*.72;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-45,id:1}]});
    await page.waitForTimeout(520);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }else{
    await page.keyboard.down('w');await page.waitForTimeout(790);await page.keyboard.up('w');
  }
  const after=await page.evaluate(()=>window.__town.state().pos);
  await page.screenshot({path:`audit/pub/kitchen-hosted/${mobile?'android':'desktop'}-after.png`});
  assert(after.z<from.z-.2,'physical kitchen aisle advance blocked: '+JSON.stringify({from,after}));
  assert(after.x>-6.15&&after.x<-4.85&&after.z>-11.87&&after.z<-7.65,'player outside clear kitchen aisle: '+JSON.stringify(after));
  assert.equal((await page.evaluate(()=>window.__town.state().mode)),'house','lost pub interior while walking');
  assert.deepEqual(errors,[],'unhandled page errors on real hosted game');
  console.log('PASS live pub kitchen',mobile?'Android touch':'desktop keyboard',manifest.sourceCommit,manifest.contentHash,JSON.stringify({from,after}));
  await context.close();
 }
}finally{await browser.close();}
