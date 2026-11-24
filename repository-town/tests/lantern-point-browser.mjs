// Actual Three.js/Chromium test of the southern road and fictional Parristan village.
// Test on desktop and Pixel 7 dimensions; no paid AI or live external service required.
import assert from 'node:assert/strict';
import {chromium,devices} from 'playwright';
const base=process.env.TOWN_PLAYTEST_URL||'http://127.0.0.1:8091/';
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
try{
  for (const mobile of [false,true]){
    const context=await browser.newContext(mobile?{...devices['Pixel 7']}:{viewport:{width:1240,height:800}});
    await context.addInitScript(() => sessionStorage.setItem('town-cheats','1'));
    const page=await context.newPage(), errors=[];
    page.on('pageerror', e=>errors.push(e.message));
    // The live D1 world is independently tested; local browser tests use fixed
    // publicly fictional data to ensure results don't depend on internet or time.
    await page.route('**/api/world',route=>route.fulfill({
      status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},
      body:JSON.stringify({
        fictional:true,updatedAt:Date.now(),settlements:[{id:11,name:'Lantern Point'}],
        citizens:[{id:12,name:'Test Resident',homeTown:11,occupation:'Librarian',
          activity:'socialising',goal:'Make friends',memories:['Opened a library']}],
      }),
    }));
    await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden===true,null,{timeout:90000});
    const tag=mobile?'mobile':'desktop';
    const initial=await page.evaluate(()=>window.__town.state().pos);
    assert(Math.abs(initial.z)<450,'original Repository Town spawn unchanged');
    // The complete south route must be free of static wall colliders.
    const corridor=await page.evaluate(async()=>{
      const {LANTERN_ROAD_CENTRELINE:polyline}=await import('./world/lantern-point-layout.js');
      const blocked=[],offRoad=[];
      for(let i=0;i<polyline.length;i++){
        const {x,z}=polyline[i];
        if(window.__town.probeStatic(x,z,.35))blocked.push({i,x,z});
        if(!window.__town.onRoad(x,z))offRoad.push({i,x,z});
      }
      return {blocked,offRoad,road:window.__town.onRoad(338,560),
        turning:window.__town.onRoad(170,665),villageRoad:window.__town.onRoad(0,2800)};
    });
    assert.deepEqual(corridor.blocked,[],tag+': blocked southern road at '+corridor.blocked.join(','));
    assert.deepEqual(corridor.offRoad,[],tag+': visual road leaves the drivable collision footprint');
    assert(corridor.road && corridor.turning && corridor.villageRoad,tag+': southern road and connecting bend not drivable');
    // Map and keyboard search resolve Lantern Point by name.
    await page.evaluate(()=>document.getElementById('btn-townmap').click());
    await page.waitForFunction(()=>window.__town.townMap?.isOpen?.());
    const region=await page.evaluate(()=>{
      const selected=window.__town.townMap.select('Lantern Point');
      document.getElementById('town-map-lantern').click();
      return {selected:selected?.name,center:window.__town.townMap.view.z,buttonSelected:window.__town.townMap.selected()?.name};
    });
    assert.equal(region.selected,'Lantern Point');
    assert.equal(region.center,2870);
    assert.equal(region.buttonSelected,'Lantern Point');
    await page.evaluate(()=>{window.__town.townMap.close();document.getElementById('search').value='Lantern Point';document.getElementById('search-form').requestSubmit();});
    await page.waitForTimeout(1200);
    const arrived=await page.evaluate(()=>({pos:window.__town.state().pos,lantern:window.__town.lantern()}));
    assert(Math.abs(arrived.pos.z-2810)<3 && Math.abs(arrived.pos.x)<3,tag+': fast travel did not arrive: '+JSON.stringify(arrived.pos));
    assert.equal(arrived.lantern.fictional,true);
    assert.equal(arrived.lantern.renderSystem,'Repository Town detailed resident figures',tag+': must reuse native NPC models');
    await page.waitForFunction(()=>window.__town.lantern().citizens>=1,null,{timeout:12000});
    const figures=await page.evaluate(()=>window.__town.lantern());
    assert.equal(figures.citizens,1,'deterministic simulated resident was imported');
    // Walking via the real movement handler; avoid writing player coordinates
    // for the measured movement itself.
    await page.evaluate(()=>{document.activeElement?.blur?.();window.__town.place(0,800,Math.PI);});
    if(!mobile){
      await page.mouse.click(600,300);
      await page.keyboard.down('w');await page.waitForTimeout(1100);await page.keyboard.up('w');
      const pos=await page.evaluate(()=>window.__town.state().pos);
      assert(pos.z>801,tag+': pressing W failed to walk along south road '+JSON.stringify(pos));
    }else{
      // Real Android-size touch joystick, not a coordinate teleport.
      const before=await page.evaluate(()=>window.__town.state().pos.z);
      const cdp=await context.newCDPSession(page);
      const {width,height}=page.viewportSize(),x=width*.2,y=height*.75;
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-45,id:1}]});
      await page.waitForTimeout(1150);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      const after=await page.evaluate(()=>window.__town.state().pos.z);
      assert(Math.abs(after-before)>.1,tag+': touch joystick failed to move player');
    }
    // Drive a real simulated sedan on the straight Lantern Road using the
    // same throttle/input and collision physics as normal gameplay. A test
    // garage cheat provisions the car; actual driving is not teleported.
    if(!mobile){
      const setup=await page.evaluate(()=>{
        window.__town.place(0,1300,Math.PI);
        window.__town.cheats.open();
        document.getElementById('cheat-vehicle').value='sedan';
        window.__town.cheats.run('carHere');
        window.__town.cheats.close();
        return window.__town.state();
      });
      assert(setup.driving,tag+': no sedan was entered for driving test');
      assert(Math.hypot(setup.pos.x,setup.pos.z-1300)<10,tag+': summoned sedan was not parked on Lantern Road '+JSON.stringify(setup.pos));
      const z0=setup.pos.z;
      await page.evaluate(()=>document.activeElement?.blur?.());
      await page.mouse.click(600,300);
      await page.keyboard.down('w');
      await page.evaluate(()=>{for(let i=0;i<170;i++)window.__town.stepVehicle(1/30);});
      await page.keyboard.up('w');
      const moved=await page.evaluate(()=>({pos:window.__town.state().pos,road:window.__town.onRoad(window.__town.state().pos.x,window.__town.state().pos.z)}));
      assert(moved.pos.z>z0+12,tag+': sedan did not move south on Lantern Road '+JSON.stringify(moved));
      assert(moved.road,tag+': sedan left the south road unexpectedly '+JSON.stringify(moved));
    }
    assert.deepEqual(errors,[],tag+': uncaught browser exceptions');
    console.log('PASS Lantern Point '+tag+': south road walkable, drivable, map/search, fictional citizen synced');
    await context.close();
  }
}finally{await browser.close();}
