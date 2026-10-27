import assert from 'node:assert/strict';
import {chromium,devices} from 'playwright';
const origin=process.env.TOWN_PLAYTEST_URL||'http://127.0.0.1:8091/';
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
try {
 for(const kind of ['desktop','phone']){
  const context=await browser.newContext(kind==='phone'?devices['Pixel 7']:{viewport:{width:1280,height:740}});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(origin,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden===true,null,{timeout:90000});
   assert.equal(await page.locator('#cheat-unlock-form').count(),0,'console hidden initially');
   if(kind==='phone')for(let i=0;i<5;i++)await page.locator('#hud .hud-heading h1').tap();
   else await page.keyboard.press('Control+Shift+9');
   await page.locator('#cheat-pass').waitFor({timeout:10000});
   await page.locator('#cheat-pass').fill('WRONG');
   await page.locator('#cheat-unlock-form button').click();
   assert.match(await page.locator('#cheat-error').textContent(),/Incorrect/);
   await page.locator('#cheat-pass').fill('CHEAT123');
   await page.locator('#cheat-unlock-form button').click();
   await page.getByText('Developer cheat console',{exact:true}).waitFor();
   const picker=page.locator('#cheat-title-picker');
   assert(await picker.locator('option').count()>=12);
   await picker.selectOption('SUB:0:0');
   await page.getByRole('button',{name:'Claim selected property immediately'}).click();
   assert.match(await page.locator('#panel-body').textContent(),/Claimed 2 Wattle Street/);
   await page.getByRole('button',{name:'Travel to Wattle Street'}).click();
   const near=await page.evaluate(()=>window.__town.state().pos);
   assert(Math.hypot(near.x+508,near.z-220)<1,'teleport landed on Wattle street');
   if(kind==='phone')for(let i=0;i<5;i++)await page.locator('#hud .hud-heading h1').tap();
   else await page.keyboard.press('Control+Shift+9');
   await page.getByRole('button',{name:'Summon & drive hatchback'}).click();
   const info=await page.evaluate(()=>({state:window.__town.state(),active:window.__town.driveDiagnostics().vehicle}));
   assert(info.active?.registration?.startsWith('RT-DEBUG-'),'player entered a real summoned 3D hatch');
   assert(info.state.driving,'vehicle is the active driving controller');
   const before={x:info.active.x,z:info.active.z};
   // Release keyboard focus from HUD before exercising real movement.
   await page.evaluate(()=>document.activeElement?.blur?.());
   await page.keyboard.down('w');await page.waitForTimeout(1800);await page.keyboard.up('w');
   const after=await page.evaluate(()=>window.__town.driveDiagnostics().vehicle);
   assert(Math.hypot(after.x-before.x,after.z-before.z)>0.6,'vehicle actually drives on the new street');
   assert.equal(errors.length,0,'browser JS errors: '+errors.join('|'));
   console.log('PASS '+kind+' cheat: hidden gesture, password gate, unlisted deed claim, teleport and driveable Wattle car');
  }finally{await context.close();}
 }
}finally{await browser.close();}
