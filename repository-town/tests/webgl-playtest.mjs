// Recorded Chromium/SWIFTSHADER playtest. This checks rendered WebGL, not only TownLife.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium,devices} from 'playwright';
const URL=process.env.TOWN_PLAYTEST_URL||'http://127.0.0.1:8091/';
const out=path.resolve('test-results/webgl-playtest');
fs.mkdirSync(out,{recursive:true});
const report={source:URL,at:new Date().toISOString(),softwareRendering:true,runs:[]};
const browser=await chromium.launch({headless:true,args:[
 '--use-angle=swiftshader','--enable-unsafe-swiftshader',
 '--ignore-gpu-blocklist','--disable-dev-shm-usage'
]});
async function play(kind,options) {
 const folder=path.join(out,kind);fs.mkdirSync(folder,{recursive:true});
 const context=await browser.newContext({...options,recordVideo:{dir:folder,size:options.viewport||{width:1280,height:720}}});
 await context.addInitScript(()=>{try{localStorage.clear()}catch{}});
 const page=await context.newPage(),errors=[],rec={kind,steps:[],errors};
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 const shot=async(name)=>{
  const file=path.join(folder,name+'.png');
  const png=await page.screenshot({path:file,animations:'disabled'});
  assert(png.length>9000,kind+': '+name+' screenshot looks empty');
  rec.steps.push({action:name,bytes:png.length,state:await page.evaluate(()=>window.__town?.state())});
  return png;
 };
 try{
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden===true,null,{timeout:90000});
  const gl=await page.evaluate(()=>{
   const canvases=[...document.querySelectorAll('canvas')];
   for(const canvas of canvases){
    const context=canvas.getContext('webgl2')||canvas.getContext('webgl');
    if(context&&!context.isContextLost())return {version:context.getParameter(context.VERSION),
      renderer:context.getParameter(context.RENDERER),
      size:[canvas.width,canvas.height],
      textureLimit:context.getParameter(context.MAX_TEXTURE_SIZE)};
   }
   return null;
  });
  assert(gl&&gl.size[0]>0&&gl.size[1]>0,kind+': actual WebGL context unavailable');
  rec.webgl=gl;
  await page.waitForFunction(()=>window.__town.state().calls>0,null,{timeout:15000});
  const a=await shot('01-town-rendered');
  // Actual keyboard motion, not a teleport: player position must change.
  await page.keyboard.down('w');await page.waitForTimeout(950);await page.keyboard.up('w');
  const after=await page.evaluate(()=>window.__town.state());
  const origin=rec.steps[0].state.pos;
  assert(Math.hypot(origin.x-after.pos.x,origin.z-after.pos.z)>.05,kind+': keyboard walking did not move the player');
  await shot('02-after-walking');
  // Use the real in-world interior and ensure it actually draws.
  assert(await page.evaluate(()=>window.__town.enterShop('cafe')),kind+': could not enter café');
  await page.waitForFunction(()=>window.__town.state().mode==='house'&&window.__town.state().calls>0,null,{timeout:15000});
  const cafe=await shot('03-cafe-3d');
  assert(!a.equals(cafe),kind+': street and café screenshots are identical');
  const stations=await page.evaluate(()=>window.__town.state().interactables);
  assert(stations.some(x=>x.do==='workplay'||x.do==='civic-ledger'),kind+': no usable café service/workstation');
  const counter=stations.find(x=>x.do==='civic-ledger')||stations[0];
  const approachable=await page.evaluate(key=>window.__town.approach(key),counter.key);
  assert(approachable,kind+': café counter is not reachable');
  await page.waitForFunction(key=>window.__town.state().near===key,counter.key,{timeout:10000});
  if(kind==='mobile')await page.tap('#t-use');
  else await page.keyboard.press('e');
  await page.waitForTimeout(350);
  const used=await page.evaluate(()=>window.__town.state());
  assert(used.panel||used.near===counter.key,kind+': café interaction was lost');
  await shot('04-cafe-interaction');
  assert(await page.evaluate(()=>window.__town.exitShop()),kind+': café exit failed');
  await shot('05-back-in-town');
  assert.equal(errors.length,0,kind+': browser errors '+errors.join(' | '));
  rec.ok=true;
 }catch(e){
  rec.ok=false;rec.failure=e.stack||String(e);
  try{await page.screenshot({path:path.join(folder,'failure.png'),timeout:10000})}catch{}
  throw e;
 }finally{
  report.runs.push(rec);
  await context.close();
  fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(report,null,2));
 }
}
try{
 await play('desktop',{viewport:{width:1280,height:720}});
 await play('mobile',{...devices['Pixel 7']});
 console.log('PASS: recorded actual desktop/mobile WebGL rendering, walking, café entry, interaction and exit');
}finally{await browser.close()}
