// Real desktop/mobile WebGL acceptance for the St Augustine's Catholic Church
// exterior; saves screenshots for review without using Google imagery.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import { startStaticServer } from '../tools/narromine-visual-qa/run.mjs';

const output=process.env.ST_AUGUSTINES_SCREENSHOT_DIR ||
  path.join(os.tmpdir(),'narromine-st-augustines-screenshots');
fs.mkdirSync(output,{recursive:true});
const explicit=process.env.TOWN_URL || '';
let server;
if(!explicit)server=await startStaticServer(path.resolve('dist/public'));
const url=explicit || server.url;
const browser=await chromium.launch({
  args:['--use-angle=swiftshader','--enable-unsafe-swiftshader'],
});
const stats=[];
try {
  for(const mobile of [false,true]){
    const tag=mobile?'mobile':'desktop';
    const page=await browser.newPage(mobile
      ? {viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:1}
      : {viewport:{width:1280,height:800},deviceScaleFactor:1});
    const errs=[];
    page.on('pageerror',e=>errs.push(e.message));
    await page.addInitScript(()=>sessionStorage.setItem('town-cheats','1'));
    await page.route('**/api/npc-chat',route=>route.abort('connectionrefused'));
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__town && document.getElementById('loading')?.hidden,
      null,{timeout:90000});
    await page.evaluate(()=>{
      const game=window.__town;
      game.closePanel?.();
      game.life.setTime(10.5*60);
      // Stand east (street side) of main façade looking west toward the church.
      const x=-4729,z=-1315,yaw=Math.PI/2;
      game.place(x,z,yaw);
      for(const id of ['hud','game-compass','minimap','prompt','expedition-toast','expedition-compass']){
        const node=document.getElementById(id);
        if(node)node.style.visibility='hidden';
      }
    });
    await page.waitForFunction(()=>window.__town.narromineVisible(),
      null,{timeout:15000});
    await page.waitForTimeout(550);
    const camera=await page.evaluate(()=>window.__town.state().pos);
    assert(Math.hypot(camera.x+4729,camera.z+1315)<1.5,tag+': camera at Dandaloo-side church view');
    const p=path.join(output,'st-augustines-'+tag+'.png');
    const image=await page.screenshot({path:p,fullPage:false});
    assert(image.length>13000,tag+': screenshot renders nonempty game');
    assert.equal(errs.length,0,tag+': no browser page errors: '+errs.join(' | '));
    stats.push({viewport:tag,path:p,bytes:image.length,pos:camera});
    await page.close();
  }
  console.log('PASS St Augustine church desktop/mobile real WebGL screenshots:',JSON.stringify(stats));
}finally{
  await browser.close();
  if(server)await new Promise(resolve=>server.server?.close?server.server.close(resolve):resolve());
}
