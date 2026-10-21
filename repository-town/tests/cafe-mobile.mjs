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
 const started=await page.evaluate(()=>{
  const t=window.__town.life;t.setTime(11*60+30);t.place('cafe').till=500;
  window.__town.enterShop('cafe');t.playerAt='cafe';
  for(const v of t.villagers)if(v.work==='cafe'){v.step={kind:'work',at:'cafe'};v.path=[];}
  const hired=t.startJob('cafe-all-rounder');if(!hired.ok)return hired.message;
  for(const g of ['coffee','milk','oatmilk','soymilk','gfbread','bread','eggs','veg','pie','tea'])t.place('cafe').stock[g]=40;
  const v=t.villagers.find(v=>v.work!=='cafe');v.wallet=100;v.path=[];v.inside=true;
  v.step={kind:'eatout',at:'cafe',dur:100,workTicket:1,queue:{joined:t.day*1440+t.minute}};
  t.civic.workplay??={store:{shelves:{},carton:null},cafe:{next:2,tickets:[],selected:null,held:null,served:0,cleared:0}};
  t.civic.workplay.cafe={next:2,selected:null,held:null,served:0,cleared:0,tickets:[{id:1,customer:v.id,name:v.name,item:'latte',items:['latte','toast'],table:1,state:'queue',step:0,quality:[],created:t.day*1440+t.minute,patience:75,diet:'dairy-free',milk:'oat',bread:'regular',chosenMilk:null,chosenBread:null}]};
  return 'ok';
 });
 assert.equal(started,'ok','start café shift: '+started);
 await page.waitForFunction(()=>window.__town.state().mode==='house');
 await tapStation('workplay:cafe:orders');
 assert.equal((await state()).workplay.cafe.tickets[0].state,'accepted');
 await tapStation('workplay:cafe:barista');
 await page.waitForFunction(()=>window.__town.state().panel?.title?.includes('milk'),null,{timeout:6500});
 await page.locator('#panel-actions button').filter({hasText:/oat milk/i}).first().tap();
 let traced=false;
 for(let n=0;n<7;n++){
  if((await state()).workplay.cafe.tickets[0].step>=5)break;
  await tapStation('workplay:cafe:barista');
  await page.waitForFunction(()=>document.getElementById('work-skill-assisted')||document.getElementById('latte-assist'),null,{timeout:7500});
  if(await page.locator('#latte-assist').isVisible()){traced=true;await page.tap('#latte-assist');}
  else await page.tap('#work-skill-assisted');
  await page.waitForTimeout(150);
 }
 assert(traced,'latte-art gesture panel and assisted touch choice available');
 for(let n=0;n<6;n++){
  if((await state()).workplay.cafe.tickets[0].state==='ready')break;
  await tapStation('workplay:cafe:kitchen');
  await page.waitForFunction(()=>document.getElementById('work-skill-assisted'),null,{timeout:7500});
  await page.tap('#work-skill-assisted');await page.waitForTimeout(150);
 }
 assert.equal((await state()).workplay.cafe.tickets[0].state,'ready','mixed ticket prepared');
 await tapStation('workplay:cafe:pass');
 assert.equal((await state()).workplay.cafe.held,1,'tray carried');
 await tapStation('workplay:cafe:table-1');
 const s=await state();assert.equal(s.workplay.cafe.tickets[0].state,'served','touch table service');
 assert.equal(s.workplay.cafe.tips,1,'tip conserved and recorded');
 assert(!errors.length,'browser errors: '+errors.join('; '));
 console.log('PASS: emulated Android touchscreen café, oat request, latte art, food, tray and paid table');
}finally{await browser.close();}
