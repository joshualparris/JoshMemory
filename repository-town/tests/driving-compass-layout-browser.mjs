// Real WebGL browser layout regression for the driving dashboard toggle and compass.
// CSS visibility fixture for four viewports; the separate mobile-driving test
// physically buys/enters a vehicle and verifies the true driving lifecycle.
import assert from 'node:assert/strict';
import { chromium, devices } from 'playwright';

const URL = process.env.TOWN_URL || 'http://127.0.0.1:8091/';
const browser = await chromium.launch({
  args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],
});
const scenarios = [
  ['desktop', { viewport: { width:1150,height:770 } }],
  ['android', { ...devices['Pixel 7'] }],
  ['small-phone', { viewport:{width:320,height:568},isMobile:true,hasTouch:true,deviceScaleFactor:1 }],
  ['touch-tablet', { viewport:{width:820,height:1060},hasTouch:true,deviceScaleFactor:1 }],
];
const placement = () => {
  const box = id => {
    const e=document.getElementById(id);
    const r=e.getBoundingClientRect();
    return { left:r.left,right:r.right,top:r.top,bottom:r.bottom,
      width:r.width,height:r.height,visible:!!(r.width&&r.height) };
  };
  const overlap=(a,b,gap=4)=> a.visible&&b.visible
    && a.left<b.right+gap&&a.right+gap>b.left
    && a.top<b.bottom+gap&&a.bottom+gap>b.top;
  const toggle=box('drive-dash-toggle'),dash=box('driving-dashboard'),
    compass=box('game-compass'),minimap=box('minimap');
  const control=document.getElementById('drive-dash-toggle');
  return {
    toggle,dash,compass,minimap,
    compassOn:document.body.classList.contains('compass-on'),
    collisions:{
      toggleCompass:overlap(toggle,compass),
      toggleMinimap:overlap(toggle,minimap),
      dashCompass:overlap(dash,compass),
      dashMinimap:overlap(dash,minimap),
    },
    toggleAccessible:document.elementFromPoint((toggle.left+toggle.right)/2,
      (toggle.top+toggle.bottom)/2)===control,
  };
};
try {
  for(const [name,options] of scenarios){
    const context=await browser.newContext(options);
    const page=await context.newPage(), errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/api/npc-chat',r=>r.abort('connectionrefused'));
    await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,
      null,{timeout:90000});
    await page.waitForFunction(()=>Number.isFinite(window.__town.compass()?.heading),
      null,{timeout:15000});
    // Real dashboard and its real CSS, temporarily displayed without altering
    // funds, movement, car ownership or persistent save state.
    await page.evaluate(()=>{
      document.getElementById('drive-dash-toggle').hidden=false;
      document.getElementById('driving-dashboard').hidden=false;
    });
    let s=await page.evaluate(placement);
    console.log(name+' compass-on layout '+JSON.stringify(s));
    assert(s.compassOn&&s.compass.visible,name+': compass should be on by default');
    assert(s.toggle.visible&&s.dash.visible,name+': driving controls must be visible');
    for(const [key,value] of Object.entries(s.collisions))
      assert(!value,name+': '+key+' must not overlap');
    assert(s.toggleAccessible,name+': show/hide dashboard button must be clickable');
    assert(s.toggle.left>=0&&s.toggle.right<=await page.evaluate(()=>innerWidth),
      name+': toggle remains inside horizontal viewport');
    // Compass-off preference should re-use the right edge without masking the map.
    await page.evaluate(()=>{
      const check=document.getElementById('settings-compass');
      check.checked=false;check.dispatchEvent(new Event('change',{bubbles:true}));
    });
    s=await page.evaluate(placement);
    console.log(name+' compass-off layout '+JSON.stringify(s));
    assert(!s.compassOn&&!s.compass.visible,name+': switching compass off should hide it');
    assert(!s.collisions.toggleMinimap,name+': toggle must not cover minimap when compass off');
    assert(s.toggleAccessible,name+': button stays clickable without compass');
    await page.evaluate(()=>{
      const check=document.getElementById('settings-compass');
      check.checked=true;check.dispatchEvent(new Event('change',{bubbles:true}));
    });
    assert(!errors.length,name+': no browser errors: '+errors.join('; '));
    await context.close();
  }
  console.log('PASS desktop/Android/small-phone/touch-tablet: compass and vehicle dashboard toggle do not collide with navigation; toggle remains usable');
} finally {
  await browser.close();
}
