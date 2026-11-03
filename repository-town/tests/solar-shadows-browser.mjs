// Actual rendered Three.js sun/shadow browser smoke test.
// Exercises the real town sky and WebGL shadow target on desktop + Android.
import assert from 'node:assert/strict';
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const URL=process.argv.includes('--url')
  ? process.argv[process.argv.indexOf('--url')+1]
  : process.env.TOWN_URL||'http://localhost:8091/';
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
mkdirSync('artifacts',{recursive:true});
try{
 for(const [device,options] of [
   ['desktop',{viewport:{width:1150,height:760}}],
   ['android',{...devices['Pixel 7']}],
 ]){
  const context=await browser.newContext(options),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e.message)));
  await page.route('**/api/npc-chat',r=>r.abort('connectionrefused'));
  await page.goto(URL);
  await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,null,{timeout:90000});
  await page.waitForFunction(()=>Number.isFinite(window.__town.solar().elevation),null,{timeout:15000});
  const init=await page.evaluate(()=>window.__town.solar());
  assert(init.shadowMeshes.casters>100,'hundreds of buildings and trees cast shadows');
  assert(init.shadowMeshes.receivers>100,'roads/grounds are marked to receive shadows');
  assert.equal(init.shadows.choice,'auto','default shadow preference');
  assert.equal(init.shadows.pixels,device==='android'?512:1024,'adaptive starting resolution');

  const setDate=async(day,minute)=>{
    await page.evaluate(([d,m])=>{window.__town.life.setDay(d);window.__town.life.setTime(m);},[day,minute]);
    await page.waitForFunction(([d,m])=>{
      const x=window.__town.solar(),v=window.__town.state();
      return Math.abs(v.day-d)<.01&&Math.abs(v.minute-m)<5&&Number.isFinite(x.elevation);
    },[day,minute],{timeout:15000});
    return page.evaluate(()=>window.__town.solar());
  };
  const summer=await setDate(57,13*60);
  assert(summer.elevation>75&&summer.elevation<85,device+': summer noon sun nearly overhead');
  assert(summer.direction.z<0,device+': midday sun from north in NSW');
  assert(summer.sunlight.casting,device+': buildings cast sunlight at noon');
  await page.waitForFunction(()=>window.__town.solar().sunlight.shadowMapAllocated,null,{timeout:20000});
  const allocated=await page.evaluate(()=>window.__town.solar());
  assert.equal(allocated.sunlight.shadowMapSize,device==='android'?512:1024,device+': GPU shadow texture allocated');
  await page.screenshot({path:'artifacts/sun-'+device+'-summer.png'});
  const winter=await setDate(239,12*60);
  assert(winter.elevation>31&&winter.elevation<38,device+': winter sun much lower');
  assert(winter.azimuth<30||winter.azimuth>330,device+': winter midday sun to north');
  assert(winter.sunlight.casting,device+': winter shadows enabled');
  await page.screenshot({path:'artifacts/sun-'+device+'-winter.png'});
  const dawn=await setDate(239,7*60);
  assert(dawn.elevation> -5 && dawn.elevation<8,device+': sun near winter sunrise');
  const night=await setDate(239,23*60);
  assert(night.elevation<0&&!night.sunlight.casting,device+': no sunlight shadows after sunset');
  assert(night.sunlight.intensity<0.03,device+': night sky is not day-lit');

  // Settings must work on a real phone and preserve quality after a refresh.
  const expanded=await page.locator('#btn-hud-toggle').getAttribute('aria-expanded');
  if(expanded==='false')await page.locator('#btn-hud-toggle').click();
  await page.locator('#btn-settings').click();
  await page.locator('#settings-shadows').selectOption('off');
  assert(!(await page.evaluate(()=>window.__town.solar().shadows.enabled)),device+': shadows off');
  assert.equal(await page.evaluate(()=>localStorage.getItem('repository-town.sun-shadows.v1')),'off');
  const chosen=device==='android'?'low':'high';
  await page.locator('#settings-shadows').selectOption(chosen);
  const state=await page.evaluate(()=>window.__town.solar().shadows);
  assert(state.enabled,device+': shadows re-enabled');
  assert.equal(state.level,chosen,device+': requested quality applied');
  await page.locator('#settings-close').click();
  await page.reload();
  await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,null,{timeout:90000});
  assert.equal((await page.evaluate(()=>window.__town.solar().shadows)).choice,chosen,
    device+': saved quality restored on reload');
  assert.equal(errors.length,0,device+': no JS runtime errors: '+errors.join('; '));
  console.log('PASS '+device+': Narromine solar rise/noon/set, true shadow texture, summer/winter, user quality setting, reload');
  await context.close();
 }
}finally{await browser.close();}
