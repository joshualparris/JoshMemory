// End-to-end multiplayer presence in two independent real WebGL browser sessions.
// Requires Playwright Chromium and the built static game served at localhost:8091.
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {chromium} from 'playwright';

const url=process.argv.includes('--url')?process.argv[process.argv.indexOf('--url')+1]:'http://127.0.0.1:8091/';
const suffix=randomBytes(4).toString('hex');
const users=[
  {username:'rtweb_'+suffix+'a',password:randomBytes(18).toString('base64url')},
  {username:'rtweb_'+suffix+'b',password:randomBytes(18).toString('base64url')}
];
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const contexts=[];
try{
  for(const item of users){
    item.context=await browser.newContext({viewport:{width:1100,height:740}});
    contexts.push(item.context);
    item.page=await item.context.newPage();
    item.errors=[];
    item.page.on('pageerror',error=>item.errors.push(error.message));
    await item.page.route('**/api/npc-chat',route=>route.abort('connectionrefused'));
  }
  await Promise.all(users.map(item=>item.page.goto(url)));
  await Promise.all(users.map(item=>item.page.waitForFunction(()=>
    window.__town?.multiplayer && document.getElementById('loading')?.hidden,
  null,{timeout:120000})));
  async function register(item){
    const page=item.page;
    await page.locator('#btn-multiplayer').evaluate(button=>button.click());
    await page.locator('#rt-mp-username').fill(item.username);
    await page.locator('#rt-mp-password').fill(item.password);
    await page.locator('#rt-mp-register').click();
    await page.waitForFunction(()=>window.__town.multiplayer().connected,null,{timeout:25000});
    assert.equal(await page.locator('#rt-mp-name').textContent(),item.username);
    await page.locator('#rt-mp-close').click();
  }
  await register(users[0]);
  await register(users[1]);
  await Promise.all(users.map(item=>item.page.waitForFunction(
    ()=>window.__town.multiplayer().players===2&&window.__town.multiplayer().visible===1,
    null,{timeout:15000}
  )));
  const before=await Promise.all(users.map(item=>item.page.evaluate(()=>({
    multiplayer:window.__town.multiplayer(),state:window.__town.state()
  }))));
  assert.equal(before[0].multiplayer.connected,true);
  assert.equal(before[1].multiplayer.connected,true);
  assert.equal(before[0].multiplayer.visible,1,'account A sees the B avatar');
  assert.equal(before[1].multiplayer.visible,1,'account B sees the A avatar');
  assert.notEqual(before[0].multiplayer.username,before[1].multiplayer.username,'account names are independent');
  const moved=await users[1].page.evaluate(()=>{
    const p=window.__town.state().pos;
    window.__town.place(p.x+3,p.z,0.35);
    return window.__town.state().pos;
  });
  assert(Number.isFinite(moved.x));
  await new Promise(resolve=>setTimeout(resolve,1500));
  assert.equal(await users[0].page.evaluate(()=>window.__town.multiplayer().visible),1,'remote avatar stays visible after movement');
  for(const item of users){
    assert.equal(await item.page.evaluate(()=>
      localStorage.getItem('repo-town-multiplayer-session-v1')),null,
      'account token must not leak into persistent guest game save');
    assert.equal(item.errors.length,0,'no page errors: '+item.errors.join('; '));
  }
  // v2 social layer: chat log, speech bubble, emote and roster in real browsers.
  const health=await fetch('https://repo-town-multiplayer.parris-neathaustralia.workers.dev/health',
    {headers:{origin:'https://repository-town-claude-complete.vercel.app'}}).then(r=>r.json()).catch(()=>null);
  if(!health||Number(health.protocol)<2){
    console.log('SKIP: chat/emote browser checks need the deployed multiplayer worker v2 (health says protocol '+(health?.protocol??'unreachable')+')');
  }else{
    await users[0].page.keyboard.press('t');
    await users[0].page.locator('#rt-chat-input').fill('browser chat hello');
    await users[0].page.keyboard.press('Enter');
    await users[1].page.waitForFunction(()=>document.querySelector('#rt-chat-log')?.textContent?.includes('browser chat hello'),null,{timeout:15000});
    await users[1].page.waitForFunction(()=>window.__town.multiplayer().bubbling?.length===1,null,{timeout:15000});
    await users[0].page.keyboard.press('t');
    await users[0].page.locator('#rt-chat-input').fill('/wave');
    await users[0].page.keyboard.press('Enter');
    await users[1].page.waitForFunction(info=>info.emoting?.length===1,()=>window.__town.multiplayer(),{timeout:15000});
    await users[1].page.locator('#btn-multiplayer').click();
    assert.equal(await users[1].page.locator('#rt-mp-roster li').count(),2,'roster lists both online players');
    await users[1].page.locator('#rt-mp-close').click();
    console.log('PASS: chat log, speech bubble, emote animation and roster in two browsers');
  }
  await users[1].context.close();
  await users[0].page.waitForFunction(()=>window.__town.multiplayer().players===1,null,{timeout:15000});
  assert.equal(await users[0].page.evaluate(()=>window.__town.multiplayer().visible),0,'disconnected avatar disappears');
  await users[0].page.locator('#btn-multiplayer').evaluate(button=>button.click());
  await users[0].page.locator('#rt-mp-logout').click();
  await users[0].page.waitForFunction(()=>!window.__town.multiplayer().connected,null,{timeout:7000});
  console.log('PASS: two independent WebGL browser sessions, two registered accounts, reciprocal visible 3D avatars, movement, disconnect and logout');
} finally {
  for(const c of contexts)try{await c.close();}catch{}
  await browser.close();
}
