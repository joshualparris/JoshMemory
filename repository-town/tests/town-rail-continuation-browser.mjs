// Actual Chromium/WebGL at three physical railway seams.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const url=process.env.TOWN_URL||'http://127.0.0.1:8091/';
const folder=process.env.REPO_RAIL_QA_DIR||'test-results/regional-rail-continuation';
fs.mkdirSync(folder,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const capture=async(mobile)=>{
 const tag=mobile?'mobile':'desktop',page=await browser.newPage(
  mobile?{viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:1}
   :{viewport:{width:1280,height:800},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>sessionStorage.setItem('town-cheats','1'));
 await page.route('**/api/npc-chat',r=>r.abort('connectionrefused'));
 try{
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,null,{timeout:110000});
  await page.waitForFunction(()=>window.__town.regionalRail()?.chunks>12,null,{timeout:20000});
  const report=await page.evaluate(()=>window.__town.regionalRail());
  assert(report.totalMetres>5000&&report.totalMetres<6500,tag+': physically connected route, '+report.totalMetres);
  assert(report.sleepers>5000&&report.chunks>20,tag+': real sleeper instancing and cullable chunks');
  const seams=[
   {key:'repo-main-west',x:-394,z:-202,target:[-580,-185]},
   {key:'repo-loop-east',x:395,z:-201,target:[460,-218]},
   {key:'narromine-osm-join',x:-3206,z:-60,target:[-3110,-30]},
  ];
  const appearances=[];
  for(const pose of seams){
   const yaw=Math.atan2(-(pose.target[0]-pose.x),-(pose.target[1]-pose.z));
   await page.evaluate(({x,z,yaw})=>{
    window.__town.closePanel?.();
    window.__town.life.setTime(11*60);
    window.__town.place(x,z,yaw);
   },{x:pose.x,z:pose.z,yaw});
   await page.waitForFunction(()=>window.__town.state().triangles>1000,null,{timeout:25000});
   await page.waitForTimeout(300);
   const state=await page.evaluate(()=>window.__town.state());
   assert(state.calls>0&&state.triangles>1000,tag+': live rail scene WebGL draw '+pose.key);
   const targetFile=folder+'/'+tag+'-'+pose.key+'.png';
   await page.screenshot({path:targetFile});
   appearances.push({key:pose.key,x:pose.x,z:pose.z,callCount:state.calls,triangleCount:state.triangles,
    fpsSoftwareWebGL:state.fps,screenshot:targetFile});
  }
  assert.deepEqual(errors,[],tag+': no page errors');
  fs.writeFileSync(folder+'/'+tag+'-report.json',JSON.stringify({source:url,rail:report,appearances,errors},null,2));
  console.log(tag+' rail connection live WebGL '+JSON.stringify({metres:report.totalMetres,drawables:report.drawables,appearances}));
 }finally{await page.close();}
};
try{await capture(false);await capture(true);console.log('PASS three connected 3D railway seams desktop/Android Chromium, 0 JS errors');}
finally{await browser.close();}
