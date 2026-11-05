// DANDALOO-001.2: real in-game sedan physics at six named Narromine street positions.
// Never disable a collider or bypass car physics; stage a car before EACH local drive only.
// Test does NOT assert one continuous journey between sites, surveyed road widths or a real Android handset.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium, devices } from 'playwright';
import { startStaticServer } from '../tools/narromine-visual-qa/run.mjs';
import { STREETS } from '../src/world/narromine-layout.js';
import { NARROMINE_QA_LOCATIONS } from '../tools/narromine-visual-qa/locations.mjs';

const output = path.resolve(process.env.NARROMINE_PASSAGE_DIR || 'test-results/narromine-1-2-passage');
fs.mkdirSync(output, { recursive: true });
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const qa = new Map(NARROMINE_QA_LOCATIONS.map(x => [x.id, x]));
const targets = [
  { id: 'royal-hotel', street: 'Dandaloo Street', x: qa.get('royal-hotel-dandaloo').target.x, z: qa.get('royal-hotel-dandaloo').target.z },
  { id: 'narromine-hotel', street: 'Dandaloo Street', x: qa.get('narromine-hotel-corner').target.x, z: qa.get('narromine-hotel-corner').target.z },
  { id: 'post-office', street: 'Dandaloo Street', x: qa.get('post-office-entrance').target.x, z: qa.get('post-office-entrance').target.z },
  { id: 'coles-kieraths', street: 'Dandaloo Street', x: qa.get('coles-kieraths-dandaloo').target.x, z: qa.get('coles-kieraths-dandaloo').target.z },
  { id: 'burraway', street: 'Burraway Street', x: -4595, z: -760 },
];
const dist = (x,z,a,b) => Math.hypot(x-a,z-b);
const round = n => Math.round(n*100)/100;
function candidateRoadStarts(target) {
  const options = [];
  for (let ri=0;ri<STREETS.length;ri++) {
    const st=STREETS[ri];
    if (st.name !== target.street || st.width < 6) continue;
    for(let j=1;j<st.pts.length;j++) {
      const [ax,az]=st.pts[j-1],[bx,bz]=st.pts[j];
      const len=dist(ax,az,bx,bz);
      if(len<12)continue;
      const ux=(bx-ax)/len,uz=(bz-az)/len;
      for(const frac of [0.15,0.4,0.65]) {
        const shift=Math.min(1.1,Math.max(0,st.width/2-2.0));
        const x=ax+ux*len*frac-uz*shift,z=az+uz*len*frac+ux*shift;
        const distance=dist(x,z,target.x,target.z);
        if(distance>110)continue;
        if(len*(1-frac)<11)continue;
        options.push({x,z,dx:ux,dz:uz,yaw:Math.atan2(-ux,-uz),nearestLandmarkM:round(distance),
          road:st.name,roadIndex:ri,roadWidth:st.width,segment:j,
          endX:x+ux*10,endZ:z+uz*10,kind:st.kind});
      }
    }
  }
  return options.sort((a,b)=>a.nearestLandmarkM-b.nearestLandmarkM).slice(0,90);
}
function crossingCandidates(crossing) {
  const out=[];
  for(const st of STREETS) {
    if(st.name !== 'Dandaloo Street' || st.width<6)continue;
    for(let j=1;j<st.pts.length;j++) {
      const [ax,az]=st.pts[j-1],[bx,bz]=st.pts[j],dx=bx-ax,dz=bz-az,len=Math.hypot(dx,dz);
      if(len<1)continue;
      const t=Math.max(0,Math.min(1,((crossing.x-ax)*dx+(crossing.z-az)*dz)/(len*len)));
      const x=ax+dx*t,z=az+dz*t;
      const perpendicular=dist(x,z,crossing.x,crossing.z);
      if(perpendicular>6)continue;
      const ux=dx/len,uz=dz/len;
      for(const side of [-1,1]) {
        const shift=Math.min(1.1,Math.max(0,st.width/2-2));
        // Move 9m either side of real modelled crossing. Opposite candidate reverses road direction.
        const vx=ux*side,vz=uz*side;
        const sx=crossing.x-vx*9-vz*shift,sz=crossing.z-vz*9+vx*shift;
        out.push({x:sx,z:sz,dx:vx,dz:vz,yaw:Math.atan2(-vx,-vz),
          endX:sx+vx*18,endZ:sz+vz*18,nearestLandmarkM:0,road:st.name,
          roadWidth:st.width,roadIndex:STREETS.indexOf(st),crossingRef:crossing.ref,
          crossing:{x:crossing.x,z:crossing.z,control:crossing.control,closed:crossing.closed},
          crossRail:true,perpendicular});
      }
    }
  }
  return out.sort((a,b)=>a.perpendicular-b.perpendicular);
}
const urlArg=process.argv.indexOf('--url');
const server=urlArg>=0||process.env.TOWN_URL?null:await startStaticServer(path.resolve('dist/public'));
const url=urlArg>=0?process.argv[urlArg+1]:(process.env.TOWN_URL||server.url);
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={schemaVersion:1,task:'DANDALOO-001.2',sha,
  description:'six separately staged real sedan physics drives near landmark sites; no continuous multi-site drive claimed',
  viewports:[],outcome:'UNVERIFIED'};
try {
  for(const [device,contextOptions] of [
    ['desktop',{viewport:{width:1280,height:800},deviceScaleFactor:1}],
    ['pixel7-emulated',{...devices['Pixel 7']}],
  ]) {
    const context=await browser.newContext(contextOptions);
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(String(e?.message||e)));
    await page.addInitScript(()=>sessionStorage.setItem('town-cheats','1'));
    await page.route('**/api/npc-chat',r=>r.abort('connectionrefused'));
    const res=await page.goto(url,{waitUntil:'domcontentloaded',timeout:110000});
    assert.equal(res?.status(),200);
    await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,null,{timeout:110000});
    await page.evaluate(()=>{
      window.__town.life.setTime(13*60+15);
      // The tested cheat contract requires choosing an existing town-road staging
      // position before summoning. Every later Narromine drive uses a separately
      // staged registered car and the actual vehicle controls.
      window.__town.cheats.open();
      window.__town.cheats.run('goNew');
      const r=window.__town.cheats.run('carHere');
      window.__town.cheats.close();
      if(!window.__town.vehicles().some(x=>x.cheat&&x.model==='sedan'))throw Error('No registered QA sedan: '+JSON.stringify({cheatMessage:document.querySelector('#cheat-menu .msg')?.textContent,vehicles:window.__town.vehicles().map(v=>({registration:v.registration,model:v.model})),state:window.__town.state().mode,cheatsUnlocked:window.__town.cheats.isUnlocked()}));
      if(window.__town.state().driving)window.__town.leaveVehicle();
    });
    const crossing=await page.evaluate(()=>window.__town.train().crossings.find(c=>c.ref==='717'));
    const all=[...targets,{id:'dandaloo-rail-crossing',street:'Dandaloo Street',x:crossing?.x,z:crossing?.z,crossing:true}];
    const run={device,sourceSha:sha,crossingInitial:crossing,
      model:'sedan',actualVehiclePhysics:true,stagedBetweenLocalLegs:true,results:[],pageErrors:errors};
    report.viewports.push(run);
    for(const target of all) {
      const opts=target.crossing?crossingCandidates(crossing):candidateRoadStarts(target);
      const candidate=await page.evaluate((options)=>{
        const t=window.__town;
        for(const p of options) {
          if(!t.onRoad(p.x,p.z) || t.probeStatic(p.x,p.z,1.12))continue;
          let clear=true;
          for(let n=1;n<=20;n++){
            const x=p.x+(p.endX-p.x)*n/20,z=p.z+(p.endZ-p.z)*n/20;
            if(!t.onRoad(x,z) || t.probeStatic(x,z,1.12)){clear=false;break;}
          }
          if(clear)return p;
        }
        return null;
      },opts);
      const result={id:target.id,site:[target.x,target.z],candidates:opts.length,
        candidate,passed:false,blockedBy:'',distanceM:0,frames:0,offRoadFrames:0,staticHitFrames:0,
        minDistanceToRailM:null,vehicleRegistration:null};
      run.results.push(result);
      if(!candidate){result.blockedBy='no modelled 10m collision-clear mapped-street segment near site';continue;}
      if(target.crossing&&crossing.closed){result.blockedBy='crossing closed; never drive through a closed boom';continue;}
      // Stage a registered real car at the mapped road start. This is a test setup ONLY:
      // player and car position are set before driving; no direct position mutations during drive.
      const stage=await page.evaluate(p=>{
        const t=window.__town;
        if(t.state().driving)t.leaveVehicle();
        const civic=t.life.ledger().civic;
        const v=civic.motor.owned.find(x=>x.cheat&&x.model==='sedan');
        if(!v)throw Error('missing registered QA car');
        Object.assign(v,{x:p.x,z:p.z,yaw:p.yaw,speed:0,fuel:55,condition:100,roadworthy:true,parkingPending:false});
        t.place(p.x,p.z,p.yaw);
        const entered=t.enterVehicle(v.registration);
        return {message:entered,driving:t.state().driving,registration:v.registration,
          pos:{x:v.x,z:v.z,yaw:v.yaw},staticBlocked:!!t.probeStatic(v.x,v.z,1.12)};
      },candidate);
      result.stage=stage;result.vehicleRegistration=stage.registration;
      if(!stage.driving||stage.staticBlocked) {result.blockedBy='car failed to enter at staged clear road start: '+stage.message;continue;}
      await page.keyboard.down('w');
      const trajectory=await page.evaluate(({p,target})=>{
        const t=window.__town,initial=t.state().pos,steps=[];
        const dist=(x,z,a,b)=>Math.hypot(x-a,z-b);
        let minDistanceToRailM=Infinity,offRoadFrames=0,staticHitFrames=0;
        for(let i=0;i<180;i++){
          t.stepVehicle(1/30);
          const v=t.driveDiagnostics().vehicle,s=t.state(),onRoad=t.onRoad(s.pos.x,s.pos.z);
          const hit=!!t.probeStatic(s.pos.x,s.pos.z,1.12);
          if(!onRoad)offRoadFrames++;
          if(hit)staticHitFrames++;
          if(target.crossing)minDistanceToRailM=Math.min(minDistanceToRailM,dist(s.pos.x,s.pos.z,target.x,target.z));
          steps.push({x:round(s.pos.x),z:round(s.pos.z),speed:round(v?.speed||0),onRoad,hit});
          if(dist(s.pos.x,s.pos.z,initial.x,initial.z)>=(p.crossRail?18:10))break;
          if(i>30 && (v?.speed||0)<0.02)break;
        }
        const final=t.state().pos;
        return {start:[initial.x,initial.z],end:[final.x,final.z],
          distanceM:dist(initial.x,initial.z,final.x,final.z),frames:steps.length,
          offRoadFrames,staticHitFrames,
          minDistanceToRailM:Number.isFinite(minDistanceToRailM)?round(minDistanceToRailM):null,
          samples:steps.filter((_,i)=>i%8===0)};
      },{p:candidate,target});
      await page.keyboard.up('w');
      Object.assign(result,trajectory);
      result.passed=trajectory.distanceM>= (target.crossing?17:9.5) &&
        trajectory.offRoadFrames===0 && trajectory.staticHitFrames===0 &&
        (!target.crossing||trajectory.minDistanceToRailM<2);
      if(!result.passed)result.blockedBy='car did not physically traverse the planned road, or touched a collider/off-road patch';
      const screenshot=path.join(output,device+'-'+target.id+'.png');
      await page.screenshot({path:screenshot});
      result.screenshot=path.basename(screenshot);
      await page.evaluate(()=>window.__town.leaveVehicle());
      console.log((result.passed?'PASS':'GAP')+' '+device+' '+target.id+
        ' driven='+round(result.distanceM)+'m steps='+result.frames+
        ' offroad='+result.offRoadFrames+' static='+result.staticHitFrames+
        (result.blockedBy?' '+result.blockedBy:''));
    }
    run.passed=run.results.filter(x=>x.passed).length;
    run.failed=run.results.length-run.passed;
    run.errors=[...errors];
    await context.close();
  }
  report.passed=report.viewports.reduce((n,r)=>n+r.passed,0);
  report.total=12;
  report.outcome=report.passed===report.total&&report.viewports.every(x=>x.errors.length===0)
    ?'12/12 ACTUAL LOCAL CAR DRIVES PASSED' : 'PARTIAL - REVIEW CAR-DRIVE DEFECTS';
}finally{
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
  await browser.close();
  if(server)await server.close();
}
assert.equal(report.passed,12,report.outcome+'; '+JSON.stringify(report.viewports.map(v=>v.results.filter(x=>!x.passed).map(x=>({id:x.id,error:x.blockedBy})))));
for(const x of report.viewports)assert.deepEqual(x.errors,[],x.device+': page errors');
console.log('PASS DANDALOO-001.2: 12 separately staged real sedan drives on mapped Narromine streets; legitimate collider and crossing protection preserved');
