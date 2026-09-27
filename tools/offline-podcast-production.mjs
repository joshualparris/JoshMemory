// Run in GitHub Actions against production, never a substituted localhost page.
import { chromium } from 'playwright';
import { mkdir, writeFile, mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import vm from 'node:vm';
const execute = promisify(execFile);

const url = 'https://joshualparris.github.io/JoshMemory/podcasts.html';
const sourceHtml = await readFile('docs/podcasts.html', 'utf8');
const catalogueMatch = sourceHtml.match(/const podcasts=(\[[\s\S]*?\]);\nconst cats=/);
if (!catalogueMatch) throw new Error('Could not read local podcast catalogue');
const localCatalogue = vm.runInNewContext(catalogueMatch[1], Object.create(null));
const titles = localCatalogue.filter((episode) => episode && episode.audio).map((episode) => episode.n);
const requestedTitle = process.env.EPISODE_TITLE || '';
const selected = requestedTitle ? titles.filter((title) => title === requestedTitle) : (process.env.ALL_EPISODES === '1' ? titles : titles.slice(0, 1));
if (!selected.length) throw new Error(requestedTitle ? 'Requested direct-audio episode not found: ' + requestedTitle : 'No direct-audio episodes found');
const output = 'offline-evidence';
await mkdir(output, { recursive: true });
const results = [];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const options = {
  headless: true,
  ignoreDefaultArgs: ['--mute-audio'],
  viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625,
  isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (Linux; Android 16; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
  serviceWorkers: 'allow',
};
const card = (page, title) => page.locator('article').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
async function isolation(context, page, label, evidence) {
  await context.setOffline(true);
  const failed = await page.evaluate(async () => {
    try { await fetch('https://example.com/?offline-probe=' + crypto.randomUUID(), { mode: 'no-cors', cache: 'no-store' }); return false; }
    catch { return true; }
  });
  assert(failed, 'Uncached network probe unexpectedly succeeded');
  for (const worker of context.serviceWorkers()) {
    assert(await worker.evaluate(async () => {
      try { await fetch('https://example.com/?worker-probe=' + crypto.randomUUID(), {mode:'no-cors', cache:'no-store'}); return false; }
      catch { return true; }
    }), 'Service worker still has network access');
  }
  evidence.push({ step: label, networkProbeFailed: failed, workerNetworkProbeFailed: true });
}
async function state(page) {
  return page.locator('audio').evaluate(a => ({time:a.currentTime,duration:a.duration,paused:a.paused,readyState:a.readyState,src:a.currentSrc,error:a.error?.message || null}));
}
async function playback(page, title, evidence, label) {
  await card(page,title).getByRole('button', {name:'▶ Play here',exact:true}).click();
  const audio = page.locator('audio');
  await audio.waitFor();
  await audio.evaluate(async a => { await a.play(); });
  const before=await state(page);
  await sleep(12000);
  const after=await state(page);
  assert(!after.paused && !after.error && after.readyState>=2 && after.time-before.time>9, 'Offline playback did not progress');
  evidence.push({step:label+' play',before,after});
  const target=Math.min(after.duration*.65, after.duration-30);
  assert(target>120, 'Episode too short for substantial seek');
  await audio.evaluate((a,t)=>{a.currentTime=t;},target);
  await sleep(8000);
  const sought=await state(page);
  assert(sought.time>target+5 && !sought.error && !sought.paused,'Playback failed after seek');
  evidence.push({step:label+' seek',target,after:sought});
  await audio.evaluate(a=>a.pause());
  const paused=await state(page); await sleep(3000); const held=await state(page);
  assert(held.paused && Math.abs(held.time-paused.time)<.2,'Pause failed');
  await audio.evaluate(a=>a.play()); await sleep(6000); const resumed=await state(page);
  assert(!resumed.paused && !resumed.error && resumed.time-held.time>4,'Resume failed');
  evidence.push({step:label+' pause/resume',paused,held,resumed});
  // Stronger decoded-signal evidence where cross-origin policy permits capture.
  const signal=await audio.evaluate(async a=>{
    try {
      const stream=a.captureStream();
      const ctx=new AudioContext(); await ctx.resume();
      const input=ctx.createMediaStreamSource(stream), analyser=ctx.createAnalyser(); input.connect(analyser);
      const data=new Float32Array(analyser.fftSize); let peak=0;
      for(let i=0;i<30;i++){analyser.getFloatTimeDomainData(data); for(const v of data)peak=Math.max(peak,Math.abs(v)); await new Promise(r=>setTimeout(r,100));}
      await ctx.close(); return {tracks:stream.getAudioTracks().length,peak};
    } catch(e){return {unsupported:e.message};}
  });
  evidence.push({step:label+' decoded signal',signal});
  if(resumed.src.startsWith('blob:')) assert(signal.peak>0.00001,'Local Blob produced no decoded audio signal');
  const recording=join(output,label.replaceAll(' ','-')+'.wav');
  await execute('ffmpeg',['-y','-f','pulse','-i','offline_test.monitor','-t','5',recording]);
  const {stderr}=await execute('ffmpeg',['-i',recording,'-af','volumedetect','-f','null','-']);
  const peak=stderr.match(/max_volume: ([-\d.]+) dB/);
  assert(peak && Number(peak[1])>-85,'No non-silent system audio captured offline');
  evidence.push({step:label+' system audio',recording,maxDb:Number(peak[1])});
  await page.screenshot({path:join(output,label.replaceAll(' ','-')+'.png')});
}
for(const [index,title] of selected.entries()) {
  const evidence=[];
  const result={title,url,viewport:options.viewport,evidence,status:'FAIL'}; results.push(result);
  let context;
  try {
    const profile=await mkdtemp(join(tmpdir(),'podcast-profile-'));
    context=await chromium.launchPersistentContext(profile,options);
    let page=await context.newPage();
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.evaluate(()=>navigator.serviceWorker.ready);
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    const download=card(page,title).getByRole('button',{name:/Download offline/});
    await download.scrollIntoViewIfNeeded();
    await page.screenshot({path:join(output,`download-${index}.png`)});
    await download.click();
    await card(page,title).getByRole('button',{name:/Offline saved|Available offline|Remove download/}).waitFor({timeout:240000});
    const storage=await page.evaluate(async title=>{
      const entry=podcasts.find(p=>p.n===title);
      const cache=await caches.open('joshmemory-podcast-audio-v1');
      const response=await cache.match(entry.audio,{ignoreVary:true});
      if(!response)return {missing:true};
      const bytes=await response.arrayBuffer();
      return {type:response.type,size:bytes.byteLength,contentLength:response.headers.get('content-length'),mime:response.headers.get('content-type'),sha256:[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('')};
    },title);
    evidence.push({step:'stored bytes',storage});
    await isolation(context,page,'network disabled',evidence);
    await page.reload({waitUntil:'domcontentloaded'});
    await card(page,title).getByRole('button',{name:/Offline saved|Available offline|Remove download/}).waitFor();
    await playback(page,title,evidence,`episode-${index} offline`);
    await context.close(); context=null;
    // A dead proxy prevents network access from browser launch, before setOffline.
    context=await chromium.launchPersistentContext(profile,{...options,offline:true,proxy:{server:'http://127.0.0.1:9'}});
    page=await context.newPage();
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await isolation(context,page,'restart remains offline',evidence);
    await card(page,title).getByRole('button',{name:/Offline saved|Available offline|Remove download/}).waitFor();
    await playback(page,title,evidence,`episode-${index} restarted`);
    if(storage.type==='opaque') {
      // JS cannot inspect an opaque body. Decode the ENTIRE episode offline
      // after restarting, rather than pretending a byte-size/hash is available.
      const audio=page.locator('audio');
      await audio.evaluate(a=>{a.pause();a.currentTime=0;a.playbackRate=16;});
      await audio.evaluate(a=>a.play());
      const duration=(await state(page)).duration;
      await page.waitForFunction(()=>document.querySelector('audio').ended,{},{timeout:duration/16*1000+60000});
      const end=await state(page);
      assert(Math.abs(end.time-duration)<1 && !end.error,'Full offline decode did not reach the end');
      evidence.push({step:'complete opaque episode decoded offline after restart',duration,end,hashUnavailable:true});
    } else {
      assert(storage.size>100000,'Complete readable stored file not verified');
      if(storage.contentLength)assert.equal(storage.size,Number(storage.contentLength),'Stored length mismatch');
    }
    result.status='PASS';
  } catch(e) { result.error=e.stack; console.error(title,e); }
  finally { if(context)await context.close(); await writeFile(join(output,'results.json'),JSON.stringify(results,null,2)); }
}
console.log(JSON.stringify(results,null,2));
if(results.some(r=>r.status!=='PASS'))process.exitCode=1;
