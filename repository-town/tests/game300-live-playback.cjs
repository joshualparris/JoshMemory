// Live, read-only browser verification of Repository Town's 100 Game300 recordings.
// Run: CHROME_PATH=/usr/bin/google-chrome node tests/game300-live-playback.cjs
// Requires the existing devDependency "playwright". Makes no paid speech API requests.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const ROOT=process.env.TOWN_URL||'https://repository-town-claude-complete.vercel.app';
const expected=['rowan','pip','circuit','wren','sol','sage','spark','lyra','nova','kit'];
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']});
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const pageErrors=[], unexpectedSpeechRequests=[];
  page.on('pageerror',e=>pageErrors.push(e.message));
  page.on('request',r=>{if(/api\.elevenlabs\.io|text-to-speech/i.test(r.url()))unexpectedSpeechRequests.push(r.url());});
  try{
    // Same live origin and production modules, without starting memory-intensive 3D rendering.
    const response=await page.goto(ROOT+'/ui/voicebank.js',{waitUntil:'domcontentloaded',timeout:30000});
    assert.equal(response.status(),200);
    const roster=await page.evaluate(async()=>{
      const {NPCS}=await import('/ui/npc-data.js');
      return NPCS.map(n=>n.id);
    });
    for(const id of expected)assert(roster.includes(id),'NPC missing from Town roster: '+id);
    const realAudio=await page.evaluate(async()=>{
      const engine=await import('https://parris-voicebank.vercel.app/src/game300.js');
      const counts={},failures=[],ids=new Set();
      for(const speaker of engine.game300Speakers('repo_town')){
        let n=0;
        for(const event of engine.GAME300_EVENTS){
          const result=await engine.playGame300('repo_town',speaker,event);
          if(result.status!=='playing'||!result.text||!result.id.startsWith('RT-'+speaker.toUpperCase()+'-'))failures.push({speaker,event,status:result.status});
          else{n++;ids.add(result.id);}
          engine.stopGame300();
        }
        counts[speaker]=n;
      }
      return {count:ids.size,counts,failures};
    });
    assert.equal(realAudio.count,100,'Not all 100 recordings started through Web Audio');
    assert.equal(realAudio.failures.length,0,JSON.stringify(realAudio.failures));
    assert.deepEqual(Object.keys(realAudio.counts),expected);
    for(const id of expected)assert.equal(realAudio.counts[id],10,'Incomplete sound playback: '+id);
    const controlCount=await page.evaluate(async()=>{
      const {makeTownRecordedLines}=await import('/ui/voicebank.js');
      const wrap=document.createElement('div');
      wrap.id='game300-browser-qa';
      wrap.style='position:fixed;inset:0;z-index:99999;overflow:auto;background:white;padding:12px';
      document.body.append(wrap);
      for(const id of ['rowan','pip','circuit','wren','sol','sage','spark','lyra','nova','kit']){
        const s=document.createElement('section');s.dataset.npc=id;
        s.append(makeTownRecordedLines(id,document));wrap.append(s);
      }
      return wrap.querySelectorAll('details').length;
    });
    assert.equal(controlCount,10);
    let tested=0;
    for(const id of expected){
      const section=page.locator('section[data-npc="'+id+'"]');
      await section.locator('summary').click();
      await section.locator('button').nth(0).click();
      await page.waitForFunction(n=>{
        const p=document.querySelector('section[data-npc="'+n+'"] p[role=status]');
        return Boolean(p&&p.textContent.length>35&&!/^(Loading|Recorded player|Recording unavailable)/.test(p.textContent));
      },id,{timeout:15000});
      const first=await section.locator('p[role=status]').textContent();
      await section.locator('button').nth(1).click();
      await page.waitForFunction(n=>{
        const p=document.querySelector('section[data-npc="'+n+'"] p[role=status]');
        return Boolean(p&&p.textContent.length>35&&!/^(Loading|Recorded player|Recording unavailable)/.test(p.textContent));
      },id,{timeout:15000});
      const second=await section.locator('p[role=status]').textContent();
      assert.notEqual(first,second,'Next line did not change recording: '+id);
      await section.locator('button').nth(2).click();
      assert.equal(await section.locator('p[role=status]').textContent(),'Stopped');
      await section.locator('summary').click();
      tested++;
    }
    assert.equal(pageErrors.length,0,'Browser page errors: '+pageErrors);
    assert.equal(unexpectedSpeechRequests.length,0,'Unexpected paid speech API requests');
    console.log(JSON.stringify({result:'PASS',production:ROOT,viewport:'390x844',verifiedRecordings:realAudio.count,characterCounts:realAudio.counts,characterControlsTested:tested,actions:['Listen','Next line','Stop','Close'],pageErrors,paidApiCalls:unexpectedSpeechRequests.length,note:'WebAudio start/decoder + actual live gallery controls. Not a complete town walking/quest playtest.'},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error('Game300 live browser QA failed:',e);process.exitCode=1;});