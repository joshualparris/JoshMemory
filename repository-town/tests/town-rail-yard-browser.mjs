// Real 3D rendering + controls for the fictional shunting yard, desktop and Pixel 7.
// Run after build+serve on port 8091; not a railway-safety certification.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, devices } from 'playwright';
const URL=process.env.TOWN_URL||'http://127.0.0.1:8091/';
fs.mkdirSync('test-results',{recursive:true});
const browser=await chromium.launch({channel:process.env.PW_CHANNEL||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
try{
for(const [name,opts] of [['desktop',{viewport:{width:1280,height:800}}],['android',devices['Pixel 7']]]){
  const context=await browser.newContext(opts),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(URL);
  await page.waitForFunction(()=>window.__town?.yardTrain&&document.querySelector('#loading')?.hidden,null,{timeout:90000});
  const initial=await page.evaluate(()=>window.__town.yardTrain());
  assert.equal(initial.limitKmh,8);
  assert.equal(initial.wagons.length,2);
  assert.equal(initial.z,-209);
  assert.equal(await page.evaluate(()=>window.__town.yardColliders().length),3,'shunter plus two solid wagons');
  await page.evaluate(()=>window.__town.place(99,-212.5,0));
  await page.waitForFunction(()=>window.__town.yardTrain().x>80,null,{timeout:3000});
  const prompt=await page.textContent('#prompt');
  assert.match(prompt,/Repository Town shunter/,name+' boarding prompt');
  await page.evaluate(()=>window.__town.yardBoard());
  assert.equal(await page.evaluate(()=>window.__town.yardTrain().driving),true);
  if(name==='android'){
    const buttons=await page.getByRole('group',{name:'Rail yard shunting controls'}).getByRole('button').count();
    assert.equal(buttons,2,'two phone-visible controls');
  }
  // Keyboard commands must reach the canvas/game, not an autofocus search
  // field or a button left focused by the HUD. The input handler deliberately
  // ignores typing in text fields; exercising that is not a traction failure.
  await page.evaluate(()=>document.activeElement?.blur?.());
  await page.keyboard.down('w');
  const inputReady=await page.evaluate(()=>window.__town.driveDiagnostics().input);
  await page.waitForTimeout(2400);
  const telemetry=await page.evaluate(()=>({
    train:window.__town.yardTrain(),input:window.__town.driveDiagnostics().input,
    state:window.__town.state(),focused:document.activeElement?.id||document.activeElement?.tagName,
    prompt:document.querySelector('#prompt')?.textContent,
  }));
  await page.keyboard.up('w');
  const moving=telemetry.train;
  assert(inputReady.z<-.5 || telemetry.input.z<-.5,
    name+' W reaches input handler: '+JSON.stringify(telemetry));
  assert(moving.x>initial.x+0.2,
    name+' shunter accelerates on its own siding: '+JSON.stringify(telemetry));
  assert(moving.speedKmh<=8,'8km/h yard cap');
  await page.screenshot({path:`test-results/town-rail-yard-${name}.png`});
  await page.keyboard.down(' ');await page.waitForFunction(()=>window.__town.yardTrain().speedKmh===0,null,{timeout:9000});await page.keyboard.up(' ');
  const still=await page.evaluate(()=>window.__town.yardTrain());
  assert.match(await page.evaluate(()=>window.__town.yardExit()),/step down/);
  assert.equal(await page.evaluate(()=>window.__town.yardTrain().driving),false);
  assert(await page.evaluate(()=>{const s=window.__town.yardTrain();return window.__town.probeWithMoving(s.x,s.z,.3);}),
    'stopped shunter has a physical collision footprint');
  assert.deepEqual(errors,[],name+' WebGL page errors');
  console.log(name+': moved '+(still.x-initial.x).toFixed(1)+'m; speed='+moving.speedKmh+'km/h');
  await context.close();
}
}finally{await browser.close();}
console.log('PASS: desktop and Android browser yard rendering, boarding, traction, braking, touch buttons, collision and exit.');
