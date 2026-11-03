// Actual WebGL Compass gameplay and Settings persistence on desktop + Android-sized viewport.
import assert from 'node:assert/strict';
import { chromium, devices } from 'playwright';

const URL=process.argv.includes('--url')?process.argv[process.argv.indexOf('--url')+1]:(process.env.TOWN_URL||'http://localhost:8091/');
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 for(const [device,options] of [['desktop',{viewport:{width:1150,height:770}}],['android',{...devices['Pixel 7']}]]) {
  const context=await browser.newContext(options),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/npc-chat',r=>r.abort('connectionrefused'));
  await page.goto(URL);
  await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,null,{timeout:90000});
  await page.waitForFunction(()=>Number.isFinite(window.__town.compass().heading),null,{timeout:12000});
  let c=await page.evaluate(()=>window.__town.compass());
  assert(c.enabled,device+': compass defaults to on');
  assert(['N','NE','E','SE','S','SW','W','NW'].includes(c.direction),device+': initial direction follows saved/spawn camera, not assumed north');
  const positioned=await page.evaluate(()=>{
   const compass=document.getElementById('game-compass').getBoundingClientRect();
   const hud=document.getElementById('hud').getBoundingClientRect();
   const first=document.getElementById('first-day');
   const fr=first&&!first.hidden?first.getBoundingClientRect():null;
   return {right:window.innerWidth-compass.right,top:compass.top,
     overlapsHud:!(compass.left>=hud.right+4||hud.left>=compass.right+4||compass.top>=hud.bottom+4||hud.top>=compass.bottom+4),
     overlapsFirst:fr?!(compass.left>=fr.right+4||fr.left>=compass.right+4||compass.top>=fr.bottom+4||fr.top>=compass.bottom+4):false};
  });
  assert(positioned.right>=0&&positioned.right<30&&positioned.top>=0&&positioned.top<100,device+': compact top-right safe placement');
  assert(!positioned.overlapsHud&&!positioned.overlapsFirst,device+': compass does not cover HUD or first-day tracker');
  const turn=async(yaw,heading,letter)=>{
   await page.evaluate(yaw=>{const s=window.__town.state();window.__town.place(s.pos.x,s.pos.z,yaw);},yaw);
   await page.waitForFunction(h=>window.__town.compass().heading===h,heading,{timeout:7000});
   const c=await page.evaluate(()=>window.__town.compass());
   assert.equal(c.direction,letter,device+': '+letter+' direction after turning');
  };
  await turn(-Math.PI/2,90,'E');
  await turn(Math.PI,180,'S');
  await turn(Math.PI/2,270,'W');
  await turn(0,0,'N');
  const openSettings=async()=>{
    const expanded=await page.locator('#btn-hud-toggle').getAttribute('aria-expanded');
    if(expanded==='false')await page.locator('#btn-hud-toggle').click();
    await page.locator('#btn-settings').click();
    await page.locator('#settings-compass').waitFor({state:'visible'});
  };
  await openSettings();
  await page.locator('#settings-compass').uncheck();
  assert(await page.locator('#game-compass').isHidden(),device+': Settings hides compass immediately');
  assert.equal(await page.evaluate(()=>localStorage.getItem('repository-town.compass-visible.v1')),'false',device+': off preference stored');
  await page.locator('#settings-close').click();
  await page.reload();
  await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,null,{timeout:90000});
  assert(await page.locator('#game-compass').isHidden(),device+': hidden choice survives refresh');
  await openSettings();
  await page.locator('#settings-compass').check();
  assert(await page.locator('#game-compass').isVisible(),device+': Settings restores compass immediately');
  await page.locator('#settings-close').click();
  await turn(-Math.PI/2,90,'E');
  await page.reload();
  await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,null,{timeout:90000});
  assert(await page.locator('#game-compass').isVisible(),device+': shown choice survives refresh');
  assert(!errors.length,device+': no runtime JS errors: '+errors.join('; '));
  console.log('PASS '+device+': top-right compass, N/E/S/W, Settings hide/show, refresh persistence, no HUD overlap');
  await context.close();
 }
}finally{await browser.close();}
