// Real, unmocked broadcaster playback. Run against a built local or hosted release.
import {chromium,devices} from 'playwright';
import assert from 'node:assert/strict';
const url=process.env.TOWN_URL||'http://127.0.0.1:8097/';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 for(const mobile of [false,true]){
  const context=await browser.newContext(mobile?{...devices['Pixel 7']}:{});
  const page=await context.newPage();
  await page.goto(new URL('release.html',url).href);
  await page.evaluate(async()=>{
   const NativeContext=window.AudioContext;window.AudioContext=class extends NativeContext{createGain(){const node=super.createGain();if(!window.radioMeter){window.radioMeter=super.createAnalyser();node.connect(window.radioMeter);}return node;}};
   const NativeAudio=window.Audio;window.radioAudios=[];window.Audio=class extends NativeAudio{constructor(...args){super(...args);window.radioAudios.push(this);}};
   const {createDrivingDashboard}=await import('./ui/driving-dashboard.js');
   window.dashboard=createDrivingDashboard();
   // Keep original generated music ticking just as the game loop does.
   window.timer=setInterval(()=>window.dashboard.update({model:'Test car',fuel:20,fuelCapacity:30,condition:100,speed:0}),50);
  });
  await page.waitForSelector('#driving-dashboard',{state:'visible'});
  const stations=await page.evaluate(async()=> (await import('./ui/car-radio.js')).LIVE_STATIONS.map(s=>s.name));
  await page.locator('#drive-radio-power').click();
  for(let i=0;i<3;i++){
   assert.equal(await page.evaluate(()=>window.dashboard.getState().station),i+1);
   await page.waitForFunction(()=>{const m=window.radioMeter;if(!m)return false;const samples=new Float32Array(m.fftSize);m.getFloatTimeDomainData(samples);return samples.some(v=>Math.abs(v)>.0001);},null,{timeout:10000});
   console.log('AUDIBLE',mobile?'mobile':'desktop',['Country Road FM','High Street Jazz','Night Drive'][i]);
   await page.locator('#drive-radio-next').click();
  }
  for(const name of stations){
   await page.waitForFunction(name=>document.querySelector('#drive-radio-station').textContent===name+' · LIVE',name,{timeout:45000});
   const before=await page.evaluate(()=>window.radioAudios.at(-1).currentTime);
   await page.waitForTimeout(2000);
   assert(await page.evaluate(before=>{const a=window.radioAudios.at(-1);return !a.paused&&a.currentTime>before+1&&a.readyState>=2;},before),'decoded audio must keep advancing: '+name);
   assert.equal(await page.locator('#drive-radio-station').innerText(),name+' · LIVE');
   console.log('PLAYING',mobile?'mobile':'desktop',name);
   if(name!==stations.at(-1))await page.locator('#drive-radio-next').click();
  }
  await page.locator('#drive-radio-power').click();
  assert.equal(await page.locator('#drive-radio-station').innerText(),'Radio off');
  await page.evaluate(()=>window.dashboard.destroy());
  assert(await page.evaluate(()=>window.radioAudios.every(a=>a.paused&&!a.getAttribute('src'))));
  await context.close();
 }
}finally{await browser.close();}
