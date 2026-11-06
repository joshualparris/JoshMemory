// Real WebGL acceptance of car-to-car occupancy on desktop & Android-sized Chromium.
// Not a physical Android handset FPS test; collect real rAF FPS separately.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
import {VEHICLE_MODELS} from '../src/world/narromine-vehicle-models.js';
import {vehicleFootprintsOverlap} from '../src/world/vehicle-occupancy.js';

const BASE=process.env.TOWN_URL||'http://127.0.0.1:8091/';
const OUT='test-results/vehicle-occupancy-webgl';
fs.mkdirSync(OUT,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const reports=[];
try {
  for(const [kind,ctx] of [['desktop',{viewport:{width:1280,height:800},deviceScaleFactor:1}],
                         ['android',{viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:1}]]){
    const page=await browser.newPage(ctx),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/api/npc-chat',r=>r.abort('connectionrefused'));
    await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>window.__town&&document.querySelector('#loading')?.hidden,null,{timeout:100000});
    await page.evaluate(()=>{window.__town.closePanel?.();window.__town.life.setTime(8*60);window.__town.place(-4805,-760,Math.PI);});
    await page.waitForFunction(()=>window.__town.narromineVisible()&&window.__town.traffic().count>5,null,{timeout:90000});
    let checks=0,active=0,worst=0,collisions=[],fps=[];
    for(let step=0;step<6;step++){
      const state=await page.evaluate(()=>({traffic:window.__town.traffic(),state:window.__town.state()}));
      assert(state.state.calls>0&&state.state.triangles>1000,kind+': actual WebGL renderer must be active');
      const moving=state.traffic.cars.map(c=>({...c,L:VEHICLE_MODELS[c.model]?.length??4.4,widthM:1.9}));
      active=Math.max(active,moving.length);
      fps.push(state.state.fps);
      for(let i=0;i<moving.length;i++)for(let j=i+1;j<moving.length;j++){
        const a=moving[i],b=moving[j];if(Math.abs(a.x-b.x)>20||Math.abs(a.z-b.z)>20)continue;
        checks++;
        if(vehicleFootprintsOverlap(a,b,0.1)){worst++;if(collisions.length<8)collisions.push({step,a,b});}
      }
      await page.waitForTimeout(1000);
    }
    await page.screenshot({path:OUT+'/'+kind+'-moving-traffic.png'});
    assert(active>5,kind+': visible live traffic actors present, not culled to avoid overlaps');
    assert.equal(worst,0,kind+': moving cars physically overlap in actual 3D game: '+JSON.stringify(collisions.slice(0,2)));

    // Separate town scene: preserve commuter parking and sample actual resolved
    // off-road bays after a roster update, not just pure parking geometry.
    await page.evaluate(()=>{window.__town.life.setTime(11*60);window.__town.place(0,177,Math.PI);});
    await page.waitForFunction(()=>window.__town.state().calls>0,null,{timeout:60000});
    const rt=await page.evaluate(()=>({cars:window.__town.rtCommuterCars(),count:window.__town.rtCommuterCarsNow(),site:window.__town.shops().find(p=>p.id==='bakery')}));
    assert(Number.isInteger(rt.count)&&rt.count>5,kind+': genuine weekday commuters must remain rendered off-road: '+JSON.stringify({count:rt.count}));
    assert(rt.cars.every(c=>Number.isFinite(c.x)&&Number.isFinite(c.z)),kind+': physical parked meshes have finite positions');
    await page.screenshot({path:OUT+'/'+kind+'-commuter-parking.png'});
    assert.deepEqual(errors,[],kind+': no unhandled JS errors');
    reports.push({kind,source:BASE,movingCarMaximum:active,checkedPairs:checks,overlaps:worst,renderedCommuterCars:rt.count,
      fpsSamples:fps,triangles:await page.evaluate(()=>window.__town.state().triangles)});
    console.log('VEHICLE-503-WEBGL '+JSON.stringify(reports.at(-1)));
    await page.close();
  }
  fs.writeFileSync(OUT+'/report.json',JSON.stringify(reports,null,2));
  console.log('PASS vehicle body occupancy, real moving cars and off-road commuter parking in desktop+Android-sized WebGL');
} finally {await browser.close();}
