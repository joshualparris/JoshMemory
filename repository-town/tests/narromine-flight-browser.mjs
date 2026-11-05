// Real Chromium/WebGL acceptance for Narromine aircraft on desktop and phone.
// Build first: npm run build. Local server is started automatically.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium,devices} from 'playwright';
import {startStaticServer} from '../tools/narromine-visual-qa/run.mjs';

const out=process.env.FLIGHT_SCREENSHOT_DIR||'test-results/narromine-flight';
fs.mkdirSync(out,{recursive:true});
const ext=process.env.TOWN_URL||'';
const server=ext?null:await startStaticServer(path.resolve('dist/public'));
const url=ext||server.url;
const browser=await chromium.launch({
  channel:process.env.PW_CHANNEL||undefined,
  args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],
});

try {
  for(const [device,opts] of [
    ['desktop',{viewport:{width:1280,height:800},deviceScaleFactor:1}],
    ['android',{...devices['Pixel 7']}],
  ]){
    const context=await browser.newContext(opts);
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',err=>errors.push(err.message));
    await page.route('**/api/npc-chat',route=>route.abort('connectionrefused'));
    await page.goto(url);
    await page.waitForFunction(()=>window.__town?.airport&&document.querySelector('#loading')?.hidden,
      null,{timeout:90000});
    const airport=await page.evaluate(()=>window.__town.airport());
    assert.equal(airport.icao,'YNRM');
    assert.deepEqual(airport.runways.map(r=>[r.id,r.length,r.width]),[['11/29',1521,30],['04/22',1100,30]]);
    assert.equal(airport.parking.length,2);
    assert.ok(airport.flightLandscape.patches>300,device+': agricultural underlay under flight corridor');

    // Actual game search. Phones start with town controls minimised, so a
    // user must expand the menu before the search input becomes visible.
    if(device==='android')await page.getByRole('button',{name:'Expand town controls'}).click();
    await page.locator('#search').fill('Narromine Aerodrome · YNRM');
    await page.locator('#search-form').evaluate(form=>form.requestSubmit());
    await page.waitForFunction(()=>window.__town.state().pos.x< -5700,null,{timeout:12000});
    if(device==='android')await page.getByRole('button',{name:'Minimise town controls'}).click();
    const start=await page.evaluate(()=>window.__town.state().pos);
    assert(Math.hypot(start.x+5806,start.z+2174)<2,device+': search travels to YNRM apron');
    await page.screenshot({path:path.join(out,device+'-01-airport-apron.png')});

    // Walking up and pressing E boards the actual airport parked trainer.
    await page.evaluate(()=>{window.__town.closePanel?.();window.__town.place(-5816,-2175,Math.PI);});
    await page.evaluate(()=>document.activeElement?.blur?.());
    await page.keyboard.press('e');
    await page.waitForFunction(()=>window.__town.flight()?.flying,null,{timeout:12000});
    assert.equal(await page.locator('#narromine-flight-hud').isVisible(),true);
    assert.match(await page.locator('#flight-instruments').textContent(),/High-wing flight trainer/);
    if(device==='android'){
      assert.equal(await page.getByRole('button',{name:'Throttle +'}).isVisible(),true);
      assert.equal(await page.getByRole('button',{name:'↑ Nose'}).isVisible(),true);
    }
    await page.screenshot({path:path.join(out,device+'-02-cockpit-boarding.png')});

    // Chromium's touch protocol exercises held phone controls without a keyboard.
    const cdp=device==='android'?await context.newCDPSession(page):null;
    async function touchHold(names){
      if(!cdp)return;
      const points=[];
      for(const [id,name] of names.entries()){
        const box=await page.getByRole('button',{name,exact:true}).boundingBox();
        assert.ok(box,'Touch control is laid out: '+name);
        points.push({id,x:box.x+box.width/2,y:box.y+box.height/2});
      }
      await cdp.send('Input.dispatchTouchEvent',{type:points.length?'touchStart':'touchEnd',touchPoints:points});
      const expected={throttle:0,pitch:0,roll:0};
      for(const name of names){
        if(name==='Throttle +')expected.throttle=1;
        if(name==='Throttle −')expected.throttle=-1;
        if(name==='↑ Nose')expected.pitch=1;
        if(name==='↓ Nose')expected.pitch=-1;
      }
      await page.waitForFunction(expected=>{
        const actual=window.__town.flight().controls;
        return Object.keys(expected).every(k=>actual[k]===expected[k]);
      },expected,{timeout:10000});
    }

    // Reproduce the real phone report: full-throttle travel from the apron,
    // 0 ft AGL at high speed and no runway beneath the aircraft. The pilot
    // must be able to recover with the actual HUD even while still moving.
    if(cdp)await touchHold(['Throttle +','↑ Nose']);
    else {await page.keyboard.down('w');await page.keyboard.down('ArrowUp');}
    const offRunway=await page.evaluate(()=>window.__town.stepFlight(12));
    if(cdp)await touchHold([]);
    else {await page.keyboard.up('w');await page.keyboard.up('ArrowUp');}
    assert(offRunway.state.airspeed>28,device+': reproduced fast off-runway taxi');
    assert.equal(offRunway.state.onGround,true,device+': apron does not magically permit takeoff');
    assert.match(await page.locator('#flight-instruments').textContent(),/OFF RUNWAY/,device+': actionable HUD warning');
    const lineup=page.getByRole('button',{name:'↗ Line up 11'});
    assert.equal(await lineup.isDisabled(),false,device+': on-ground runway assist available while rolling');
    await lineup.click();
    const reset=await page.evaluate(()=>window.__town.flight().state);
    assert.equal(reset.airspeed,0,device+': assisted runway reset stops aircraft');
    assert.equal(reset.onGround,true,device+': reset is on ground');
    assert.match(await page.locator('#flight-instruments').textContent(),/OFF RUNWAY|GROUND \/ TAXI/);

    // Real UI assisted runway alignment, then accelerated Input-driven game frames.
    await page.getByRole('button',{name:'↗ Line up 11'}).click();
    await page.waitForFunction(()=>document.querySelector('#flight-instruments').textContent.includes('Assisted game line-up'));
    let before=await page.evaluate(()=>window.__town.flight().state);
    assert.equal(before.onGround,true,device+': on runway');
    await page.evaluate(()=>document.activeElement?.blur?.());
    if(cdp)await touchHold(['Throttle +','↑ Nose']);
    else { await page.keyboard.down('w'); await page.keyboard.down('ArrowUp'); }
    const airborne=await page.evaluate(()=>window.__town.stepFlight(28));
    if(cdp)await touchHold([]);
    else await page.keyboard.up('ArrowUp');
    assert(airborne.state.altitude>20,device+': actual browser actor takes off');
    assert(airborne.state.airspeed>=28,device+': airspeed reaches rotation velocity');
    assert(airborne.state.x>before.x+100,device+': aircraft actually travels down the runway');
    await page.waitForTimeout(450);
    await page.screenshot({path:path.join(out,device+'-03-airborne-over-narromine.png')});

    // The model must remain visible after crossing into the fictional town's
    // eastern scene, even though Narromine neighbourhood meshes are culled.
    const crossing=await page.evaluate(()=>window.__town.stepFlight(103));
    await page.keyboard.up('w');
    assert(crossing.state.x> -2600,device+': real flight actor reaches eastern corridor');
    assert.equal(crossing.flying,true);
    await page.waitForTimeout(450);
    await page.screenshot({path:path.join(out,device+'-04-above-repository-town-corridor.png')});
    assert.match(await page.evaluate(()=>window.__town.exitFlight()),/Land and stop/,device+': airborne exit blocked');
    // Change camera while airborne (actual keyboard event, not test hook).
    if(cdp)await page.getByRole('button',{name:/View/}).click();
    else await page.keyboard.press('v');
    await page.waitForFunction(()=>window.__town.flight().view===1,null,{timeout:10000});
    await page.screenshot({path:path.join(out,device+'-05-cockpit-in-flight.png')});
    // Descend through the same game dynamics, then stop and leave the plane.
    // This tests ground contact, not a surveyed runway approach or landing skill.
    if(cdp)await touchHold(['Throttle −','↓ Nose']);
    else { await page.keyboard.down('s'); await page.keyboard.down('ArrowDown'); }
    let landed;
    for(let i=0;i<4;i++){
      landed=await page.evaluate(()=>window.__town.stepFlight(120));
      if(landed.state.onGround&&landed.state.airspeed<0.1)break;
    }
    if(cdp)await touchHold([]);
    else { await page.keyboard.up('s'); await page.keyboard.up('ArrowDown'); }
    assert.equal(landed.state.onGround,true,device+': landed');
    assert.equal(landed.state.altitude,0,device+': grounded');
    assert.ok(landed.state.airspeed<0.1,device+': stopped');
    await page.screenshot({path:path.join(out,device+'-06-landed-stopped.png')});
    await page.locator('#narromine-flight-hud').getByRole('button',{name:/Exit/}).click();
    await page.waitForFunction(()=>!window.__town.flight().flying);
    assert.equal(await page.locator('#narromine-flight-hud').isVisible(),false);
    const parked=await page.evaluate(()=>window.__town.flight().parking.find(p=>p.id==='trainer'));
    assert.ok(Math.hypot(parked.x-landed.state.x,parked.z-landed.state.z)<1,device+': parked at landing position');
    await page.screenshot({path:path.join(out,device+'-07-exited.png')});
    assert.deepEqual(errors,[],device+' WebGL page errors');
    console.log('PASS '+device+' YNRM airport search / enter / controls / takeoff / flight across corridor / cockpit / in-air exit lock / landing / stop / exit');
    await context.close();
  }
}finally {
  await browser.close();
  if(server)await server.close();
}
