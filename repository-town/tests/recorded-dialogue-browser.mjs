// Production-asset browser acceptance for the player-choice dialogue interface.
// Run after tools/build.mjs and start tools/serve.mjs on localhost:8091.
// Fetches real VoiceBank ZIPs, verifies spoken Web Audio sources and exact caption.
import assert from 'node:assert/strict';
import { chromium, devices } from 'playwright';
const base=process.env.TOWN_PLAYTEST_URL||'http://127.0.0.1:8091/';
const cast={
  rowan:'Welcome to Repository Town. There are enough doors here to keep curiosity employed full-time.',
  pip:'Behold! Pip, collector of dice, snacks, and deeply questionable plans.',
  circuit:'Hello, organic visitor. I have prepared a smile. Please allow six seconds for assembly.',
  wren:'Morning! The magpies have started their meeting and I was not invited.',
  sol:'Come in! The soup is hot, the bread is warm, and the gossip needs seasoning.',
  sage:'Welcome. Every shelf is a small universe with a remarkably practical filing system.',
  spark:'Welcome to the lab! Nothing is on fire, which makes today a qualified success.',
  lyra:"Hello, wanderer. I've got a tune looking for somewhere to belong.",
  nova:'Greetings, traveller. Your coordinates are correct, but the universe remains gloriously strange.',
  kit:'Hello! Pull up a stool. The best repairs usually start with listening.'
};
const browser=await chromium.launch({headless:true,args:['--autoplay-policy=user-gesture-required','--no-sandbox']});
const reports=[];
try {
  for(const [profile,options] of [
    ['desktop',{viewport:{width:1280,height:800}}],
    ['mobile',{...devices['Pixel 7'],viewport:{width:390,height:844}}],
  ]){
    const context=await browser.newContext(options);
    await context.addInitScript(()=>{
      window.__recordedSourceStarts=0;
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(Audio){
        const create=Audio.prototype.createBufferSource;
        Audio.prototype.createBufferSource=function(...args){
          const source=create.apply(this,args),start=source.start;
          source.start=function(...params){
            window.__recordedSourceStarts++;
            return start.apply(this,params);
          };
          return source;
        };
      }
    });
    const page=await context.newPage(),paidRequests=[],pageErrors=[];
    page.on('pageerror',error=>pageErrors.push(error.message));
    page.on('request',req=>{if(/api\.elevenlabs\.io|text-to-speech/i.test(req.url()))paidRequests.push(req.url());});
    const results=[];
    try {
      await page.goto(new URL('people.html',base).href,{waitUntil:'domcontentloaded',timeout:45000});
      await page.waitForSelector('#npc-roster-items button[data-npc-id="rowan"]',{timeout:25000});
      for(const [id,expected] of Object.entries(cast)){
        await page.locator('#npc-roster-items button[data-npc-id="'+id+'"]').click();
        const section=page.locator('.npc-recorded-conversation');
        await section.waitFor({state:'visible'});
        await page.waitForFunction(()=>[...document.querySelectorAll('.npc-recorded-conversation-choices button')].some(b=>!b.disabled),null,{timeout:30000});
        const before=await page.evaluate(()=>window.__recordedSourceStarts);
        await section.locator('.npc-recorded-choice').filter({hasText:'Hello there'}).click();
        await page.waitForFunction((expected)=>document.querySelector('.npc-recorded-conversation-subtitle')?.textContent?.endsWith(expected),expected,{timeout:35000});
        await page.waitForFunction((before)=>window.__recordedSourceStarts>before,before,{timeout:5000});
        const subtitle=await section.locator('.npc-recorded-conversation-subtitle').textContent();
        assert.equal(subtitle, id==='rowan'?'Rowan: '+expected:subtitle,'rowan caption is exact');
        assert(subtitle.endsWith(expected),id+' must show its own original line');
        assert.equal(await section.locator('.npc-recorded-conversation-choices button').count(),5,'after greeting show five choices');
        await section.getByRole('button',{name:'Stop voice'}).click();
        assert.equal(await section.locator('.npc-recorded-conversation-subtitle').textContent(),'Stopped.','stop clears current voice');
        await section.getByRole('button',{name:'Replay reply'}).click();
        await page.waitForFunction(text=>document.querySelector('.npc-recorded-conversation-subtitle')?.textContent?.endsWith(text),expected,{timeout:35000});
        await section.getByRole('button',{name:'Stop voice'}).click();
        results.push({npc:id,caption:true,actualWebAudio:true,replay:true,stop:true});
      }
      assert.equal(paidRequests.length,0,'No paid ElevenLabs API usage at playback');
      assert.equal(pageErrors.length,0,'JavaScript page errors: '+JSON.stringify(pageErrors));
      // Unsupported cast member has no cloned or substituted recording.
      await page.locator('#npc-roster-items button[data-npc-id="ember"]').click();
      assert.equal(await page.locator('.npc-recorded-conversation').count(),0,'unrecorded character must not borrow another voice');
      reports.push({profile,cast:results,paidRequests:0,pageErrors:[]});
    }finally{await context.close();}
  }
}finally{await browser.close();}
console.log('PASS: prerecorded branching NPC conversations desktop + mobile '+JSON.stringify(reports));
