// Chromium phone-sized TOUCH playthrough; not a physical Android handset test.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await browser.newContext({viewport:{width:412,height:915},hasTouch:true,isMobile:true,deviceScaleFactor:2.5});
const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const state=()=>page.evaluate(()=>window.__town.state());
async function tapStation(key){
 assert(await page.evaluate(k=>window.__town.approach(k),key),'reachable '+key);
 await page.waitForFunction(k=>window.__town.state().near===k,key,{timeout:12000});
 await page.tap('#t-use');
}
try{
 await page.goto(process.env.TOWN_URL||'http://127.0.0.1:8091/',{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>window.__town&&document.getElementById('loading').hidden,null,{timeout:90000});
 assert(await page.isVisible('#t-use'),'touch Use button visible');

 await page.evaluate(()=>window.__town.life.setTime(11*60+30));
 // Let genuine staff settle into their duty before entering the café.
 for(let i=0;i<24;i++){
  const working=await page.evaluate(()=>window.__town.state().people.some(q=>window.__town.life.route(q.name)?.step?.kind==='work'&&window.__town.life.route(q.name)?.step?.at==='cafe'));
  if(working)break;
  await page.evaluate(()=>window.__town.life.run(5));
 }
 assert(await page.evaluate(()=>window.__town.enterShop('cafe')),'enter café');
 await page.waitForFunction(()=>window.__town.state().mode==='house');
 const desk=(await state()).interactables.find(x=>x.do==='civic-ledger');
 assert(desk,'counter has work board');
 await tapStation(desk.key);
 await page.locator('#panel-actions button').filter({hasText:/work a shift/i}).first().tap();
 await page.locator('#panel-actions button').filter({hasText:/Start .*café/i}).first().tap();
 const pending=await page.evaluate(()=>window.__town.queueCafeTestPatron?.());
 assert(pending,'local acceptance fixture registered a real villager via the normal café order system');
 await page.evaluate(()=>window.__town.closePanel?.());
 await tapStation('workplay:cafe:orders');
 assert.equal((await state()).workplay.cafe.tickets.find(o=>o.id===pending.id).state,'accepted');
 await tapStation('workplay:cafe:barista');
 await page.waitForFunction(()=>window.__town.state().panel?.title?.includes('milk'),null,{timeout:6500});
 await page.locator('#panel-actions button').filter({hasText:/oat milk/i}).first().tap();
 let traced=false;
 for(let n=0;n<7;n++){
  if((await state()).workplay.cafe.tickets.find(o=>o.id===pending.id).step>=5)break;
  await tapStation('workplay:cafe:barista');
  await page.waitForFunction(()=>document.getElementById('work-skill-assisted')||document.getElementById('latte-assist'),null,{timeout:7500});
  if(await page.locator('#latte-assist').isVisible()){traced=true;await page.tap('#latte-assist');}
  else await page.tap('#work-skill-assisted');
  await page.waitForTimeout(150);
 }
 assert(traced,'latte-art gesture panel and assisted touch choice available');
 for(let n=0;n<6;n++){
  if((await state()).workplay.cafe.tickets.find(o=>o.id===pending.id).state==='ready')break;
  await tapStation('workplay:cafe:kitchen');
  await page.waitForFunction(()=>document.getElementById('work-skill-assisted'),null,{timeout:7500});
  await page.tap('#work-skill-assisted');await page.waitForTimeout(150);
 }
 assert.equal((await state()).workplay.cafe.tickets.find(o=>o.id===pending.id).state,'ready','mixed ticket prepared');
 await tapStation('workplay:cafe:pass');
 assert.equal((await state()).workplay.cafe.held,pending.id,'tray carried');
 await tapStation('workplay:cafe:table-'+pending.table);
 const s=await state();assert.equal(s.workplay.cafe.tickets.find(o=>o.id===pending.id).state,'served','touch table service');
 assert.equal(s.workplay.cafe.tips,1,'tip conserved and recorded');
 assert(!errors.length,'browser errors: '+errors.join('; '));
 console.log('PASS: emulated Android touchscreen café, oat request, latte art, food, tray and paid table');
}finally{await browser.close();}
