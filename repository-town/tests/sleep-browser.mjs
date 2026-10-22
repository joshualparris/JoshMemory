// Real WebGL interaction test: hotel bed -> choose duration -> lie down ->
// fade to black -> town clock advances -> fade back, also emulated Android.
// Run after build and local server: node tests/sleep-browser.mjs [--mobile] [--url URL]
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const arg=(key, fallback)=>{const i=process.argv.indexOf(key);return i<0?fallback:process.argv[i+1];};
const mobile=process.argv.includes('--mobile');
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await browser.newContext(mobile?{viewport:{width:412,height:915},hasTouch:true,isMobile:true,deviceScaleFactor:2}:{viewport:{width:1100,height:700}});
const page=await ctx.newPage(),errors=[];
page.on('pageerror',err=>errors.push(err.message));
try{
  await page.goto(arg('--url','http://localhost:8091/'));
  await page.waitForFunction(()=>window.__town&&document.getElementById('loading').hidden,null,{timeout:90000});
  await page.evaluate(()=>window.__town.life.setTime(14*60));
  let allowed=false;
  for(let i=0;i<40;i++){
    allowed=await page.evaluate(()=>window.__town.facilityState('hotel').allowed);
    if(allowed)break;
    await page.evaluate(()=>window.__town.life.run(5));
  }
  assert(allowed,'hotel must be staffed at 14:00');
  assert(await page.evaluate(()=>window.__town.enterShop('hotel')),'real hotel entrance must work');
  const bed=await page.evaluate(()=>window.__town.state().interactables.find(e=>e.do==='sleep'&&/room 1/i.test(e.label)));
  assert(bed,'real guest room 1 bed must be interactable');
  await page.evaluate(()=>{
    const civic=window.__town.life.ledger().civic;
    civic.player.hotelBooking={day:window.__town.state().day,room:1};
    civic.player.fatigue=85;
  });
  const enterBed=async()=>{
    assert(await page.evaluate(k=>window.__town.approach(k),bed.key),'approach the actual bed safely');
    await page.waitForFunction(k=>window.__town.state().near===k,bed.key,{timeout:5000});
    await page.keyboard.press('e');
    await page.waitForFunction(()=>window.__town.state().panel?.buttons?.some(b=>b.includes('30 minutes')),null,{timeout:5000});
  };
  await enterBed();
  const before=await page.evaluate(()=>window.__town.state());
  await page.getByRole('button',{name:/Power nap · 30 minutes/}).click();
  await page.waitForFunction(()=>window.__town.state().sleeping,null,{timeout:5000});
  await page.waitForFunction(()=>document.getElementById('sleep-screen').classList.contains('sleep-dark'),null,{timeout:5000});
  assert.equal(await page.evaluate(()=>document.getElementById('sleep-screen').hidden),false,'black transition displayed');
  await page.waitForFunction(()=>!window.__town.state().sleeping,null,{timeout:20000});
  const after=await page.evaluate(()=>window.__town.state());
  assert(Math.abs(after.minute-(before.minute+30))<0.5,'chosen 30-minute nap advances town time (allowing ordinary fractional clock ticks)');
  assert(after.needs.fatigue<before.needs.fatigue,'fatigue recovers after sleep');
  assert.equal(after.needs.booking.room,1,'nap keeps paid key');
  assert.equal(after.mode,'house','player wakes beside the same bed');
  assert.equal(await page.evaluate(()=>document.getElementById('sleep-screen').hidden),true,'black overlay clears after wake-up');
  await enterBed();
  await page.getByRole('button',{name:/Full night · 8 hours/}).click();
  await page.waitForFunction(()=>window.__town.state().sleeping,null,{timeout:5000});
  await page.waitForFunction(()=>!window.__town.state().sleeping,null,{timeout:30000});
  const full=await page.evaluate(()=>window.__town.state());
  assert(Math.abs(full.minute-((after.minute+480)%1440))<0.5,'eight-hour sleep advances town time (allowing ordinary fractional clock ticks)');
  assert(full.needs.fatigue<after.needs.fatigue,'full sleep recovers more energy');
  assert(!errors.length,'No uncaught browser errors: '+errors.join('; '));
  console.log('PASS: '+(mobile?'Android':'desktop')+' bed view, full-screen fade, chosen time, recovery, room persistence, wake-up');
}finally{await browser.close();}
