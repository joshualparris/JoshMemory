import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir=process.argv.includes('--before')?'audit/lighting/before':'audit/lighting/after';
await fs.mkdir(dir,{recursive:true});
const server=spawn(process.execPath,['tools/serve.mjs','dist/public','8094'],{stdio:['ignore','pipe','inherit']});
await new Promise(resolve=>server.stdout.once('data',resolve));
const browser=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const report=[];
try {
 for(const mobile of [false,true]){
  const ctx=await browser.newContext({viewport:mobile?{width:393,height:851}:{width:1100,height:700},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/WebGLProgram|shader error/i.test(m.text()))errors.push(m.text());});
  await page.goto('http://localhost:8094');
  await page.waitForFunction(()=>window.__town&&document.getElementById('loading').hidden,null,{timeout:90000});
  await page.evaluate(()=>window.__town.life.speed(0));
  const prefix=mobile?'mobile':'desktop';
  for(const hour of [12,19.5,0]){
   await page.evaluate(h=>{window.__town.life.setTime(h*60);window.__town.meetGuide();},hour);
   await page.waitForTimeout(700);
   await page.screenshot({path:`${dir}/${prefix}-street-${hour}.png`});
   report.push({viewport:prefix,scene:'street',hour,...await page.evaluate(()=>{const s=window.__town.state();return {fps:s.fps,calls:s.calls,minute:s.minute,version:document.querySelector('#version-link')?.textContent}})});
  }
  const all=await page.evaluate(()=>window.__town.shops());
  for(const id of ['university','tafe','hardware','trades','store','pub','school','clinic']){
   await page.evaluate(()=>{window.__town.life.setTime(600);window.__town.life.run(90);});
   const entered=await page.evaluate(id=>window.__town.enterShop(id),id);
   if(!entered){
     console.log('ENTRY RETRY',id,await page.locator('#status').textContent());
     await page.evaluate(()=>{window.__town.life.setTime(6*60);window.__town.life.run(7*60);});
   }
   const admitted=entered||await page.evaluate(id=>window.__town.enterShop(id),id);
   if(!admitted){report.push({viewport:prefix,scene:id,blocked:await page.locator('#status').textContent()});continue;}
   await page.evaluate(()=>window.__town.life.setTime(19*60));
   await page.waitForTimeout(500);
   await page.screenshot({path:`${dir}/${prefix}-${id}-night.png`});
   // Walking and looking out exercise the two-pass interior/window renderer.
   const before=await page.evaluate(()=>window.__town.state().pos);
   await page.keyboard.down('w');await page.waitForTimeout(300);await page.keyboard.up('w');
   const after=await page.evaluate(()=>window.__town.state().pos);
   assert(Math.hypot(after.x-before.x,after.z-before.z)>.1,`${prefix} walked inside ${id}`);
   await page.evaluate(()=>window.__town.lookOut(0));await page.waitForTimeout(250);
   await page.screenshot({path:`${dir}/${prefix}-${id}-window.png`});
   report.push({viewport:prefix,scene:id,moved:Math.hypot(after.x-before.x,after.z-before.z),...await page.evaluate(()=>{const s=window.__town.state();return {mode:s.mode,fps:s.fps,calls:s.calls}})});
   await page.evaluate(()=>window.__town.meetGuide());
  }
  // Audit shop signs and lamp coverage along the actual High Street.
  for(const id of ['store','pub','university']){
   const shop=all.find(s=>s.id===id);
   await page.evaluate(({shop})=>{window.__town.life.setTime(19.5*60);window.__town.place(shop.door.x,shop.door.z+(shop.side==='south'?-9:9),shop.side==='south'?Math.PI:0);},{shop});
   await page.waitForTimeout(500);await page.screenshot({path:`${dir}/${prefix}-${id}-front.png`});
  }
  // Walk a real footpath segment on each of the eight built east-west streets.
  for(let row=0;row<8;row++){
    await page.evaluate(row=>{window.__town.life.setTime(19.5*60);window.__town.place(-50,row*46-3.5*46+16+5.3,-Math.PI/2);},row);
    const start=await page.evaluate(()=>window.__town.state().pos);
    await page.keyboard.down('w');await page.waitForTimeout(400);await page.keyboard.up('w');
    await page.waitForTimeout(350);
    const end=await page.evaluate(()=>window.__town.state().pos);
    assert(Math.hypot(end.x-start.x,end.z-start.z)>.1,`${prefix} street ${row+1} walk`);
    await page.screenshot({path:`${dir}/${prefix}-row-${row+1}-night.png`});
    report.push({viewport:prefix,scene:'street-row-'+(row+1),walked:true});
  }
  assert.deepEqual(errors,[],`${prefix} no runtime errors`);await ctx.close();
 }
 const release=JSON.parse(await fs.readFile('dist/public/release.json','utf8'));
 await fs.writeFile(`${dir}/metadata.json`,JSON.stringify({sourceCommit:release.sourceCommit,contentHash:release.contentHash,browser:browser.version(),contexts:['desktop','emulated Android'],scenarios:report.length,blocked:report.filter(x=>x.blocked),runtimeErrors:0},null,2));
 await fs.writeFile(`${dir}/report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();server.kill();}
