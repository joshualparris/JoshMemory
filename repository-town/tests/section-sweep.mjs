// Resumable browser inspection. Teleport only between addresses/fixture approach
// points; doors/exits use real movement, actions use the game's input handlers.
// Report preserves every failed/blocked case; a completed run is not bug-free proof.
import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const args=process.argv.slice(2),opt=(k,d)=>args.includes(k)?args[args.indexOf(k)+1]:d;
const origin=opt('--url','http://localhost:8091/'),kind=opt('--kind','homes');
const rows=opt('--rows','1,2').split(',').map(Number),device=opt('--device','desktop');
const out=opt('--out',`test-results/section-${kind}-${rows.join('-')}-${device}.json`);
const only=opt('--only','').split(',').filter(Boolean),sample=args.includes('--sample-actions');
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
let report={schemaVersion:1,kind,rows,device,source:fs.existsSync('dist/public/release.json')?JSON.parse(fs.readFileSync('dist/public/release.json')).sourceCommit:null,
 runtimeFiles:Object.fromEntries(['main.js','engine/input.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync('dist/public/'+p)).digest('hex')])),
 method:'Address setup via test hooks; actual front-door/exit movement; collision-clear fixture approach hook; real keyboard/touch Use; all floor fixtures unless sample-actions requested.',sampleActions:sample,complete:false,cases:[],pageErrors:[],networkFailures:[]};
fs.mkdirSync(path.dirname(out),{recursive:true});
if(args.includes('--resume')&&fs.existsSync(out)){const old=JSON.parse(fs.readFileSync(out));if(old.source===report.source&&old.kind===kind&&old.device===device&&JSON.stringify(old.rows)===JSON.stringify(rows)){report=old;report.complete=false;report.previousAttempts=[...(report.previousAttempts||[]),...report.cases.filter(x=>x.status!=='passed')];report.cases=report.cases.filter(x=>x.status==='passed');}}
const save=()=>fs.writeFileSync(out,JSON.stringify(report,null,2));
const context=await browser.newContext({viewport:device==='phone'?{width:390,height:844}:{width:640,height:480},hasTouch:device==='phone',isMobile:device==='phone',deviceScaleFactor:device==='phone'?1:.5});
const page=await context.newPage();
page.on('pageerror',e=>{report.pageErrors.push(e.message);save();});
page.on('requestfailed',r=>{const u=new URL(r.url());report.networkFailures.push({origin:u.origin,path:u.pathname,error:r.failure()?.errorText});});
const state=()=>page.evaluate(()=>window.__town.state());
const frames=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)));
const wait=async(fn,timeout=5000)=>page.waitForFunction(fn,null,{timeout,polling:'raf'}).then(()=>true).catch(()=>false);
async function use(){
 if(device==='phone')await page.tap('#t-use');
 else await page.keyboard.press('e');
 await frames();
}
async function walkUntil(test,timeout=10000){
 await page.evaluate(()=>document.activeElement?.blur());
 if(device==='phone'){
  await page.evaluate(()=>{const c=document.querySelector('canvas:not(#minimap)'),t=(y)=>new Touch({identifier:77,target:c,clientX:40,clientY:y});
   for(const [type,y] of [['touchstart',500],['touchmove',450]])c.dispatchEvent(new TouchEvent(type,{changedTouches:[t(y)],bubbles:true,cancelable:true}));});
 }else await page.keyboard.down('w');
 const done=await wait(test,timeout);
 if(device==='phone')await page.evaluate(()=>{const c=document.querySelector('canvas:not(#minimap)');c.dispatchEvent(new TouchEvent('touchend',{changedTouches:[new Touch({identifier:77,target:c,clientX:40,clientY:450})],bubbles:true}));});
 else await page.keyboard.up('w');
 return done;
}
try {
 await page.goto(origin,{waitUntil:'domcontentloaded'});
 await wait(()=>window.__town&&document.getElementById('loading').hidden,90000);
 await page.evaluate(()=>{window.__town.life.speed(0);window.__town.life.setTime(9*60);window.__town.advanceSimulation(90);window.__town.life.speed(0);});
 const all=await page.evaluate(kind=>kind==='homes'?window.__town.houses:kind==='estate'?window.__town.countryHomes():kind==='campuses'?window.__town.campuses():window.__town.shops(),kind);
 if(kind==='shops')report.sites=all.map(x=>({id:x.id,kind:x.kind,side:x.side,door:x.door}));
 const targets=all.filter(x=>only.length?only.includes(x.coordinate||x.id):kind==='homes'?rows.includes(Number(x.coordinate.slice(1))):kind==='shops'&&args.includes('--by-row')?rows.includes(Math.max(1,Math.min(8,Math.round((x.door.z+145)/46)+1))):true);
 report.expected=targets.map(x=>x.coordinate||x.id);save();
 for(const target of targets){
  if(report.cases.some(x=>x.id===(target.coordinate||target.id)&&x.status==='passed'))continue;
  const began=Date.now();
  const id=target.coordinate||target.id,result={id,status:'running',floors:[],issues:[],accessAttempts:[]};report.cases.push(result);save();
  try{
   console.log('START',id);result.stage='address';save();
   // Start each address outdoors with fresh UI/input state.
   await page.evaluate(()=>{window.__town.closePanel();document.querySelector('#btn-exit')?.click();document.activeElement?.blur();});
   if(kind==='homes')await page.evaluate(id=>window.__town.travel(id),id);
   else if(kind==='estate')await page.evaluate(h=>window.__town.place(h.x,h.frontZ+(h.facesNorth?-2:2),h.facesNorth?Math.PI:0),target);
   else if(kind==='campuses'){
    await page.evaluate(h=>window.__town.place(h.door.x-2,h.door.z, -Math.PI/2),target);
   }else{
    // Public entry must stay subject to staff/visitor rules.
    let access=await page.evaluate(id=>window.__town.facilityState(id),id);
    if(!access?.allowed){
     for(const minute of [8*60,11*60,13*60,15*60,18*60]){
      await page.evaluate(m=>{window.__town.life.setTime(m);window.__town.advanceSimulation(60);window.__town.life.speed(0);},minute);
      access=await page.evaluate(id=>window.__town.facilityState(id),id);result.accessAttempts.push({minute,access});if(access?.allowed)break;
     }
    }
    const direction=target.side==='south'||target.side==='north'?-1:1;
    await page.evaluate(([h,d])=>window.__town.place(h.door.x,h.door.z+d*2.2,d<0?Math.PI:0),[target,direction]);
   }
   if(kind==='shops'&&target.kind==='park'){
    await page.evaluate(id=>window.__town.goPlace(id),id);
    await wait(`window.__town.state().nearPerson===${JSON.stringify('place:'+id)}`);
    await use();const outdoor=await state();
    result.outdoorVisit=outdoor.mode==='town'&&!!outdoor.panel?.text?.trim();
    result.status=result.outdoorVisit?'passed':'failed';
    if(!result.outdoorVisit)result.issues.push('outdoor public-space information did not open');
    await page.evaluate(()=>window.__town.closePanel());continue;
   }
   result.stage='door';save();
   const entered=await walkUntil(()=>window.__town.state().mode==='house');
   let s=await state();result.enteredByWalking=entered;result.enteredCoordinate=s.coordinate;
   if(!entered){result.status=kind==='shops'?'blocked':'failed';result.issues.push('front-door walk did not enter');if(kind==='shops')result.access=await page.evaluate(id=>window.__town.facilityState(id),id);continue;}
   if(kind==='homes'&&s.coordinate!==id){result.issues.push('entered wrong address');continue;}
   result.stage='fixtures';save();
   const floorCount=s.floors;
   for(let floor=0;floor<floorCount;floor++){
    if(floor)await page.evaluate(i=>window.__town.setFloor(i),floor);
    await frames();s=await state();
    const f={floor,rooms:s.rooms,fixtures:[],issues:[]};result.floors.push(f);
    if(s.rooms<1)f.issues.push('no rooms');
    f.approaches=await page.evaluate(keys=>keys.map(key=>({key,clear:window.__town.approach(key)})),s.interactables.map(x=>x.key));
    for(const a of f.approaches)if(!a.clear)f.issues.push(a.key+': no clear approach');
    const seen=new Set();
    for(const x of s.interactables){
     if(sample&&seen.has(x.do))continue;seen.add(x.do);
     const a={key:x.key,action:x.do,reachable:false,prompted:false,worked:false};f.fixtures.push(a);result.currentFixture=x.key;save();
     await page.evaluate(()=>{window.__town.closePanel();document.activeElement?.blur();});
     a.reachable=await page.evaluate(k=>window.__town.approach(k),x.key);
     if(!a.reachable){f.issues.push(x.key+': no clear approach');continue;}
     a.prompted=await wait(`window.__town.state().near===${JSON.stringify(x.key)}`,2000);
     if(!a.prompted&&a.reachable){a.repositioned=true;a.reachable=await page.evaluate(k=>window.__town.approach(k),x.key);a.prompted=await wait(`window.__town.state().near===${JSON.stringify(x.key)}`,2000);}
     if(!a.prompted){f.issues.push(x.key+': no Use prompt');continue;}
     const beforeStatus=await page.evaluate(()=>document.getElementById('status')?.textContent||'');
     await use();let after=await state();
     let afterStatus=await page.evaluate(()=>document.getElementById('status')?.textContent||'');
     // Archive entries resolve an async fetch before mounting their panel. Wait
     // for that result, without repeating a potentially transactional action.
     if(!after.panel&&afterStatus===beforeStatus&&!x.nav&&!['pickup','npc','workplay'].includes(x.do)){
      await wait(()=>!!window.__town.state().panel,2500);after=await state();
     }
     if(['pub-rear-exit','pub-secondary-exit'].includes(x.do)){
      a.worked=after.mode==='town';a.outcome='physical escape to outdoors';
      if(a.worked){await page.evaluate(id=>window.__town.enterShop(id),target.id);if(floor)await page.evaluate(i=>window.__town.setFloor(i),floor);}
     }else if(x.nav){
      a.worked=x.nav==='lift'?/^Lift/.test(after.panel?.title||''):after.floor!==floor;
      await page.evaluate(()=>window.__town.closePanel());await page.evaluate(i=>window.__town.setFloor(i),floor);
     }else if(x.do==='pickup'){
      const picked=await page.evaluate(k=>window.__town.thing(k)?.carried===true,x.key);
      if(picked)await use();a.worked=picked&&await page.evaluate(k=>window.__town.thing(k)?.carried===false,x.key);
     }else if(x.do==='npc'){
      a.worked=!!after.panel||await page.evaluate(()=>window.__town.npcChat().open);
      await page.keyboard.press('Escape');await frames();
     }else{
      afterStatus=await page.evaluate(()=>document.getElementById('status')?.textContent||'');
      a.worked=!!after.panel?.text?.trim()||afterStatus!==beforeStatus;
      if(!after.panel&&a.worked)a.outcome='status/refusal feedback; service prerequisites remain enforced';
     }
     if(!a.worked)f.issues.push(x.key+': action produced no expected UI/state');
     await page.evaluate(()=>window.__town.closePanel());
    }
   }
   await page.evaluate(()=>{window.__town.closePanel();window.__town.setFloor(0);window.__town.toExit();});
   result.stage='exit';save();
   result.leftByWalking=await walkUntil(()=>window.__town.state().mode==='town');
   if(!result.leftByWalking){
    const exit=await state();result.exitState={mode:exit.mode,coordinate:exit.coordinate,pos:exit.pos,yaw:exit.yaw,near:exit.near,seated:exit.seated,panel:exit.panel?.title,npcChat:await page.evaluate(()=>window.__town.npcChat())};
    result.issues.push('front-door exit did not return outdoors');
   }
   result.status=result.issues.length||result.floors.some(x=>x.issues.length)?'failed':'passed';
  }catch(e){result.status='failed';result.issues.push(e.message.slice(0,500));}
  finally{
   if(result.status==='running')result.status='failed';
   result.elapsedMs=Date.now()-began;
   console.log(`${kind} ${id}: ${result.status}; floors=${result.floors.length}; issues=${result.issues.length+result.floors.reduce((n,f)=>n+f.issues.length,0)}`);
   if(result.status==='failed')await page.screenshot({path:out.replace(/\.json$/,'')+'-'+id.replace(/[^a-z0-9-]/gi,'_')+'.png'}).catch(()=>{});
   save();
  }
 }
 report.complete=true;save();
 const counts=Object.fromEntries(['passed','failed','blocked'].map(k=>[k,report.cases.filter(x=>x.status===k).length]));console.log(JSON.stringify(counts));
 process.exitCode=counts.failed||counts.blocked||report.pageErrors.length?1:0;
}finally{save();await browser.close();}
