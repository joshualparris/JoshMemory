import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {TOWN_RECORDINGS,RECORDED_ACTORS} from '../src/ui/recorded-dialogue.js';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 for(const width of [1280,390]){
 const page=await browser.newPage({viewport:{width,height:844}});
 let aiCalls=0;const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/npc-chat',route=>{aiCalls++;return route.abort();});
 await page.addInitScript(()=>{
  window.__recordingsPlayed=[];window.__ttsCalls=0;
  const play=HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play=function(...args){this.addEventListener('playing',()=>window.__recordingsPlayed.push(this.currentSrc),{once:true});return play.apply(this,args);};
  if(window.speechSynthesis){const speak=window.speechSynthesis.speak.bind(window.speechSynthesis);window.speechSynthesis.speak=u=>{window.__ttsCalls++;return speak(u);};}
 });
 const base=(process.env.TOWN_BASE_URL||'http://127.0.0.1:8091').replace(/\/$/,'');
 await page.goto(base+'/people.html',{waitUntil:'networkidle'});
 for(const [actor,roles] of Object.entries(RECORDED_ACTORS)){
  await page.locator('[data-npc-id="'+actor+'"]').click();
  await page.locator('#npc-activities summary').filter({hasText:'Recorded conversations'}).click();
  for(const clip of TOWN_RECORDINGS.filter(c=>roles.includes(c.role))){
   await page.locator('[data-recorded-topic="'+clip.id+'"]').click();
   const message=page.locator('#npc-messages .npc-line.npc').last();
   assert.equal((await message.locator('.npc-bubble').innerText()).trim(),clip.text);
   const listen=message.getByRole('button',{name:'Play ElevenLabs recording'});
   await listen.click();
   await page.waitForFunction(id=>window.__recordingsPlayed.some(u=>u.endsWith('/'+id+'.mp3')),clip.id,{timeout:15000});
   await message.locator('button.town-voice-button').click();
  }
  await page.locator('#npc-close').click();
 }
 assert.equal(new Set((await page.evaluate(()=>window.__recordingsPlayed)).map(u=>u.split('/').pop())).size,20);
 assert.equal(await page.evaluate(()=>window.__ttsCalls),0);
 assert.equal(aiCalls,0,'scripted dialogue must not require AI/network generation');
 assert.deepEqual(errors,[]);
 console.log('PASS: '+width+'px character roster -> topic -> exact caption -> real MP3 -> stop/close; all 20 clips, zero TTS or AI calls');
 await page.close();
 }
}finally{await browser.close();}
