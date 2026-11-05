// DANDALOO-001.6: continuous on-foot corridor acceptance, NOT staged 10-area legs.
// One initial placement per viewport, then real game walkTo + observed player position.
// The separate comparison camera page is NEVER counted as walking.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startStaticServer } from '../tools/narromine-visual-qa/run.mjs';

const output = 'test-results/narromine-dandaloo-continuous';
fs.mkdirSync(output, { recursive: true });
const hosted = process.env.TOWN_URL || '';
const server = hosted ? null : await startStaticServer(path.resolve('dist/public'));
const url = hosted || server.url;
const browser = await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const near=(a,b,d=2)=>Math.hypot(a[0]-b[0],a[1]-b[1])<d;
const rounded=n=>Math.round(n*100)/100;
const report={
  schema:1,task:'DANDALOO-001.6',sourceCommit:process.env.GITHUB_SHA||process.env.SOURCE_SHA||'unknown',
  mode:hosted?'hosted release':'local source build',
  reference:'OpenStreetMap export dated 2026-11-03, game coordinates; NOT surveyed continuous pedestrian path',
  route:'West side Dandaloo Street, north end split carriageway to south of rail approach, single physical journey per viewport',
  limitations:'Emulated touchscreen Chromium, not physical Android; source road-line offset does not establish precise 2026 kerb/footpath position; geocoded photo captures are separate positioned views.',
  viewports:[],referenceViews:[],passed:false
};
async function manifest(page){
 return page.evaluate(async()=>{
  const {STREETS,geoToWorld}=await import('./world/narromine-layout.js');
  const {NARROMINE_TREES}=await import('./world/narromine-trees-data.js');
  const near=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<2;
  const find=(a,b)=>{
   const s=STREETS.find(x=>x.name==='Dandaloo Street'&&x.pts.some(p=>near(p,a))&&x.pts.some(p=>near(p,b)));
   if(!s)throw Error('Pinned OSM Dandaloo segment absent; re-survey path, do not assume geometry');
   const pts=s.pts.slice();
   return near(pts[0],a)?pts:pts.reverse();
  };
  // These three contiguous road centrelines are source geometry, not invented shop locations:
  // west carriageway south end, the split merge and railway-crossing approach.
  const pieces=[
    find([-4735.5,-1186.5],[-4775.9,-853.2]),
    find([-4775.9,-853.2],[-4786.6,-798.2]),
    find([-4786.6,-798.2],[-4802.9,-689.4]),
  ];
  // An approximate 5.8m WEST-side road offset. This MUST be confirmed by photo,
  // paver and kerb evidence; passing a game walk does not verify as-built alignment.
  const step=7.5,offset=5.8,points=[];
  let cumulative=0;
  for(const segment of pieces){
   for(let i=1;i<segment.length;i++){
    const a=segment[i-1],b=segment[i],dx=b[0]-a[0],dz=b[1]-a[1];
    const len=Math.hypot(dx,dz);
    if(len<0.001)continue;
    const n=Math.ceil(len/step);
    for(let j=i===1?0:1;j<=n;j++){
     const t=j/n,x=a[0]+t*dx,z=a[1]+t*dz;
     const p=[x-(dz/len)*offset,z+(dx/len)*offset];
     // An OSM centreline offset is NOT a surveyed pedestrian centreline.
     // Keep actual 2023 LiDAR tree trunks and walk around them, not through
     // them. The west-side mapped-tree near (-4769.5,-998.5) coincided with
     // test waypoint 27 and caused a real 'unreachable' result. Approach
     // along the mapped shop-side strip and move 2.3m toward the shop side
     // only for a genuinely intersected LiDAR trunk; pathfinder/collision
     // must still accept the resulting walk. Never remove a tree to pass QA.
     let detour=null;
     for(const tree of NARROMINE_TREES){
       if(Math.hypot(p[0]-tree[0],p[1]-tree[1])>=1.25)continue;
       p[0]+=(dz/len)*2.3;p[1]-=(dx/len)*2.3;
       detour={tree:[tree[0],tree[1]],heightM:tree[2],offsetM:2.3,source:'NSW Spatial Services 2023 LiDAR'};
       break;
     }
     // Each OSM carriageway is individually recorded and its normal changes
     // at the split. The join's raw 5.8m offsets can reverse z by ~3m even
     // though the street continues north. Never command a player to walk
     // backwards into a kerb/tree solely because two segment normals differ.
     // Retain forward movement; this is NOT skipping physical travel or
     // inventing an observed footpath (the interpolated join is still tested).
     if(points.length&&p[1]<points.at(-1).p[1]-0.15)continue;
     if(points.length&&!near(points.at(-1).p,p))cumulative+=Math.hypot(points.at(-1).p[0]-p[0],points.at(-1).p[1]-p[1]);
     if(!points.length||!near(points.at(-1).p,p))points.push({p,at:cumulative,segment:pieces.indexOf(segment)+1,detour});
    }
   }
  }
  const views=[
   {id:'01',lat:-32.234269,lon:148.238730,heading:9,reference:'Narromine Hotel and road approach'},
   {id:'14',lat:-32.233452,lon:148.239363,heading:306,reference:'Railway bridge, pedestrian approach and path'},
   {id:'28',lat:-32.232258,lon:148.239487,heading:306,reference:'West Dandaloo heritage shop and parking frontage'},
   {id:'42',lat:-32.231093,lon:148.239683,heading:306,reference:'Northern shop facade, awning and ramp'},
   {id:'55',lat:-32.230733,lon:148.239745,heading:157,reference:'Northern median planting and white road paint'}
  ].map(x=>({...x,world:geoToWorld(x.lat,x.lon)}));
  return {points,length:cumulative,offset,views};
 });
}
async function walk(page,label,info){
 const data={label,status:'RUNNING',start:info.points[0].p,end:info.points.at(-1).p,
  intendedLengthM:rounded(info.length),waypointCount:info.points.length,
  initialPlacementCount:1,midRouteTeleports:0,completed:0,coveredM:0,steps:[],screenshots:[],error:null};
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  const start=info.points[0].p;
  await page.evaluate(p=>window.__town.place(p[0],p[1],-0.15),start);
  await page.waitForFunction(()=>window.__town.narromineVisible()&&window.__town.state().mode==='town',null,{timeout:18000});
  const origin=await page.evaluate(()=>window.__town.state().pos);
  assert(near([origin.x,origin.z],start,2),'initial physical position does not match staging point');
  await page.evaluate(()=>{
    const samples=[];const audit={samples,stop:false,maxJump:0,measuredM:0};
    window.__dandalooMotion=audit;
    let prev=null,lastTime=0;
    function observe(time){
      if(audit.stop)return;
      const s=window.__town.state(),p=[s.pos.x,s.pos.z];
      if(prev){
        const d=Math.hypot(p[0]-prev[0],p[1]-prev[1]);
        audit.measuredM+=d;audit.maxJump=Math.max(audit.maxJump,d);
        if(time-lastTime>250){samples.push({t:Math.round(time),x:p[0],z:p[1],mode:s.mode});lastTime=time;}
      }
      prev=p;
      requestAnimationFrame(observe);
    }
    requestAnimationFrame(observe);
  });
  // NO place, goto, goPlace, teleport, or coordinate mutation after this point.
  for(let i=1;i<info.points.length;i++){
    const target=info.points[i].p,before=await page.evaluate(()=>window.__town.state().pos);
    const d=Math.hypot(before.x-target[0],before.z-target[1]);
    const item={n:i,to:target.map(rounded),from:[rounded(before.x),rounded(before.z)],directDistanceM:rounded(d),accepted:null,reached:false};
    item.accepted=await page.evaluate(p=>window.__town.walkTo(p[0],p[1]),target);
    if(item.accepted!==null){
      // Diagnose a real street gap without teleporting, bypassing a collider or
      // weakening the acceptance. Calling walkTo sets a path but does not step
      // the player until the next animation frame; sample hit-test alternatives
      // synchronously in one evaluate, then stop the test as a genuine GAP.
      item.diagnostic = await page.evaluate(({target,from})=>{
        const dx=target[0]-from[0],dz=target[1]-from[1],len=Math.hypot(dx,dz);
        const nx=-dz/len,nz=dx/len;
        const trials=[];
        for(const lateral of [-6,-4,-2,0,2,4,6]){
          const x=target[0]+nx*lateral,z=target[1]+nz*lateral;
          const result=window.__town.walkTo(x,z);
          trials.push({lateralM:lateral,target:[x,z],result:result===null?'path-planned':result});
        }
        return {current:window.__town.state().pos,trials,
          note:'Diagnostic candidate pathfinder result only: unverified kerb/path alignment; no candidate is counted as walked'};
      },{target,from:[before.x,before.z]});
      data.steps.push(item);
      throw Error('walkTo rejected waypoint '+i+': '+item.accepted);
    }
    try{
      await page.waitForFunction(p=>{
        const s=window.__town.state(),a=s.pos;
        return s.mode==='town'&&Math.hypot(a.x-p[0],a.z-p[1])<1.3;
      },target,{timeout:Math.max(8000,Math.min(24000,Math.ceil(d*2000)+3500))});
      item.reached=true;
    }catch{}
    const after=await page.evaluate(()=>window.__town.state());
    item.actual=[rounded(after.pos.x),rounded(after.pos.z)];
    item.remainingM=rounded(Math.hypot(after.pos.x-target[0],after.pos.z-target[1]));
    item.movedM=rounded(Math.hypot(after.pos.x-before.x,after.pos.z-before.z));
    data.steps.push(item);
    if(!item.reached||item.remainingM>1.3)throw Error('On-foot waypoint '+i+' not reached, remaining '+item.remainingM+' m');
    if(d>2.5&&item.movedM<0.8)throw Error('Waypoint '+i+' reached without physical displacement');
    data.completed=i;data.coveredM=rounded(info.points[i].at);
    if(i===Math.round(info.points.length*.25)||i===Math.round(info.points.length*.5)||i===Math.round(info.points.length*.75)){
      const shot=output+'/'+label+'-walk-'+i+'.png';
      await page.screenshot({path:shot,timeout:15000});data.screenshots.push(shot);
    }
  }
  data.status='PASS_CONTINUOUS_WALK';
 }catch(err){data.status='GAP';data.error=String(err?.message||err);}
 const motion=await page.evaluate(()=>{
  const a=window.__dandalooMotion;
  if(a)a.stop=true;
  return a?{maxFrameJumpM:a.maxJump,measuredM:a.measuredM,frameSamples:a.samples}:null;
 }).catch(()=>null);
 data.motion=motion;
 data.browserErrors=errors;
 if(data.browserErrors.length){data.status='GAP';data.error=(data.error||'')+'; '+data.browserErrors.join('; ');}
 const finish=output+'/'+label+'-final.png';
 try{await page.screenshot({path:finish});data.screenshots.push(finish)}catch{}
 if(motion&&motion.maxFrameJumpM>4){data.status='GAP';data.error=(data.error||'')+'; frame jump '+motion.maxFrameJumpM+'m, possible teleport';}
 return data;
}
try{
 for(const mobile of [false,true]){
  const label=mobile?'android-size':'desktop';
  const context=await browser.newContext(mobile?{viewport:{width:412,height:915},hasTouch:true,isMobile:true,deviceScaleFactor:1}:{viewport:{width:1280,height:800},deviceScaleFactor:1});
  const page=await context.newPage();
  await page.route('**/api/npc-chat',r=>r.abort('connectionrefused'));
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  assert.equal(response.status(),200);
  await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,null,{timeout:90000});
  await page.evaluate(()=>window.__town.life.setTime(10.5*60));
  const info=await manifest(page);
  assert(info.length>460&&info.length<600,'corridor OSM length unexpectedly changed; stop rather than claim wrong route');
  const walked=await walk(page,label,info);
  report.viewports.push(walked);
  console.log(label+' '+walked.status+' '+walked.completed+'/'+(info.points.length-1)+' waypoints, '+walked.coveredM+'m / '+rounded(info.length)+'m '+(walked.error||''));
  // Independent fixed-pose visual captures; these DO teleport. They do NOT
  // count towards the continuous walking record above.
  const photoPage=await context.newPage();
  await photoPage.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await photoPage.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,null,{timeout:90000});
  for(const v of info.views){
    await photoPage.evaluate(p=>window.__town.place(p[0],p[1],p[2]),[v.world[0],v.world[1],-v.heading*Math.PI/180]);
    await photoPage.waitForFunction(()=>window.__town.narromineVisible(),null,{timeout:10000}).catch(()=>{});
    await photoPage.waitForTimeout(250);
    const screenshot=output+'/'+label+'-reference-'+v.id+'.png';
    await photoPage.screenshot({path:screenshot,timeout:7000,animations:'disabled'});
    report.referenceViews.push({viewport:label,id:v.id,world:v.world,geolocation:[v.lat,v.lon],heading:v.heading,screenshot,
      comparisonMethod:'Geocoded separately staged game camera; reference is owner 4 Nov 2026 screenshot with Street View panorama of UNCONFIRMED capture date, not raster imported into public game'});
  }
  await context.close();
 }
 report.passed=report.viewports.length===2&&report.viewports.every(v=>v.status==='PASS_CONTINUOUS_WALK');
}finally{
 fs.writeFileSync(output+'/audit.json',JSON.stringify(report,null,2)+'\n');
 await browser.close();if(server)await server.close();
}
assert(report.passed,'Continuous Dandaloo walk GAP: inspect audit.json and screenshots; no between-leg teleport is permitted');
console.log('PASS DANDALOO-001.6 west-side continuous core corridor on desktop and phone-size Chromium WebGL');
