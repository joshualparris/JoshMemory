// Full-catalogue remote browser smoke test.
// This deliberately records observable defects; an automated click sequence is
// not evidence of game completion or balance.
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const argv=process.argv.slice(2),arg=(k,f)=>argv.includes(k)?argv[argv.indexOf(k)+1]:f;
const [part,total]=arg('--shard','0/8').split('/').map(Number);
if(!(total>0&&Number.isInteger(part)&&part>=0&&part<total))throw Error('Expected --shard 0/8');
const mobile=argv.includes('--mobile');
const size=mobile?{width:390,height:844}:{width:1280,height:900};
const origin=arg('--origin','https://repository-town-claude-complete.vercel.app').replace(/\/$/,'');
const all=JSON.parse(await fs.readFile(path.join(root,'data','games.json'),'utf8')).games;
const games=all.filter((_,i)=>i%total===part);
const publishedOnly=argv.includes('--published-only');
let published=null;
if(publishedOnly){
 const response=await fetch(origin+'/houses.json');
 if(!response.ok)throw Error('Cannot verify published games: houses.json HTTP '+response.status);
 const body=await response.json();
 published=new Set((body.houses||[]).flatMap(h=>(h.int?.rooms||[])
  .flatMap(r=>(r.props||[]).filter(p=>p[2]?.do==='game').map(p=>p[2].game))));
}

const folder=path.join(root,'test-results','all-games',mobile?'mobile':'desktop',String(part));
await fs.mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const records=[];
for(const g of games){
 const record={id:g.id,title:g.title,kind:g.kind,platform:mobile?'mobile':'desktop',status:'UNKNOWN',url:origin+'/games/'+encodeURIComponent(g.id)+'/index.html',
   errors:[],warnings:[],steps:[],initial:{},final:{},http:[],screenshots:[]};
 if(published&&!published.has(g.id)){record.status='UNPUBLISHED';record.warnings.push('Not part of deployed public-house game set; audited via local source suite.');records.push(record);console.log('GAME '+JSON.stringify({id:record.id,platform:record.platform,status:record.status}));continue;}
 const page=await browser.newPage({viewport:size,deviceScaleFactor:1,hasTouch:mobile,isMobile:mobile,locale:'en-AU',reducedMotion:'reduce'});
 const pageErrors=new Set(),failures=new Set();
 page.on('pageerror',err=>pageErrors.add(err.message.slice(0,300)));
 page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(origin)&&!r.url().includes('favicon'))failures.add(r.status()+' '+new URL(r.url()).pathname);});
 page.on('console',m=>{if(m.type()==='error'&&!/fonts\.google|favicon|AudioContext|ERR_BLOCKED_BY_CLIENT|Permissions-Policy/i.test(m.text()))pageErrors.add('console: '+m.text().slice(0,200));});
 let initialShot=null;
 try{
  const response=await page.goto(record.url,{waitUntil:'domcontentloaded',timeout:30000});
  if(!response||response.status()>=400)throw Error('Game HTTP '+(response?.status()??'no response'));
  await page.waitForTimeout(g.kind==='godot'?3000:1200);
  record.initial=await page.evaluate(()=>({
    title:document.title,
    text:(document.body?.innerText||'').trim().slice(0,500),
    chars:(document.body?.innerText||'').trim().length,
    controls:[...document.querySelectorAll('button,input,select,[role="button"]')].filter(e=>{
      const st=getComputedStyle(e);return st.display!=='none'&&st.visibility!=='hidden'&&e.getBoundingClientRect().width>0;
    }).length,
    canvas:[...document.querySelectorAll('canvas')].map(c=>({w:c.width,h:c.height,display:getComputedStyle(c).display})),
    bodyNodes:document.body?.querySelectorAll('*').length??0,
    err:document.querySelector('#err:not([hidden]),.fatal-error,.error-screen')?.textContent?.slice(0,250)||''
  }));
  const i=record.initial;
  if(i.err.trim())record.errors.push('Game displays error: '+i.err.trim());
  if(i.chars<12&&!i.canvas.length&&i.controls<1)record.errors.push('Blank game: no meaningful visible text, controls or canvas');
  if(i.canvas.length&&i.canvas.every(c=>c.w===0||c.h===0))record.errors.push('Every canvas has zero dimensions');
  // Capture screenshots only for genuine browser evidence; source names are stable.
  const before=path.join(folder,g.id+'-before.png');
  await page.screenshot({path:before,timeout:15000});record.screenshots.push(path.relative(root,before));
  initialShot=createHash('sha256').update(await fs.readFile(before)).digest('hex');
  // Start gameplay if a visible, enabled, safe game-start button is present.
  const buttons=page.locator('button:not([disabled]), [role="button"]:not([aria-disabled="true"])');
  const buttonCount=Math.min(await buttons.count(),90);
  for(let i=0;i<buttonCount;i++){
    const b=buttons.nth(i);if(!await b.isVisible().catch(()=>false))continue;
    const label=((await b.innerText().catch(()=>''))||await b.getAttribute('aria-label')||'').trim();
    if(/^(start( shift| a new factory| game| playing)?|new game|begin|play now|play|continue|enter|start adventure|launch|resume)$/i.test(label)){
      await b.click({timeout:3000}).then(()=>record.steps.push('Clicked '+label)).catch(e=>record.warnings.push('Start click blocked: '+e.message.split('\n')[0]));
      break;
    }
  }
  for(const key of ['ArrowRight','ArrowUp','Enter']){
    await page.keyboard.press(key).then(()=>record.steps.push('Pressed '+key)).catch(()=>{});
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(900);
  record.final=await page.evaluate(()=>({
    text:(document.body?.innerText||'').trim().slice(0,500),
    chars:(document.body?.innerText||'').trim().length,
    visibleDialog:!!document.querySelector('dialog[open]'),
    err:document.querySelector('#err:not([hidden]),.fatal-error,.error-screen')?.textContent?.slice(0,250)||''
  }));
  if(record.final.err.trim())record.errors.push('Game displayed error after interactions: '+record.final.err.trim());
  const after=path.join(folder,g.id+'-after.png');
  await page.screenshot({path:after,timeout:15000});record.screenshots.push(path.relative(root,after));
  const afterHash=createHash('sha256').update(await fs.readFile(after)).digest('hex');
  if(initialShot===afterHash)record.warnings.push('Pixel-identical before/after; gameplay progression not confirmed');
  if(i.chars===record.final.chars&&!record.steps.length)record.warnings.push('No safe start action identified; gameplay progression not confirmed');
 }catch(e){record.errors.push('Browser: '+e.message.split('\n')[0].slice(0,300));}
 record.errors.push(...pageErrors);
 record.http=[...failures];record.errors.push(...record.http.map(x=>'HTTP: '+x));
 record.errors=[...new Set(record.errors)];
 record.status=record.errors.length?'FAIL':'SMOKE_PASS';
 records.push(record);
 console.log('GAME '+JSON.stringify({id:record.id,title:record.title,platform:record.platform,status:record.status,errors:record.errors,warnings:record.warnings.slice(0,2),steps:record.steps}));
 await page.close();
}
await browser.close();
const report={generatedAt:new Date().toISOString(),origin,part,total,platform:mobile?'mobile':'desktop',
 catalogEntries:all.length,assigned:games.length,checked:records.filter(x=>x.status!=='UNPUBLISHED').length,skipped:records.filter(x=>x.status==='UNPUBLISHED').length,passed:records.filter(x=>x.status==='SMOKE_PASS').length,
 failed:records.filter(x=>x.status==='FAIL').length,games:records};
await fs.writeFile(path.join(folder,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log('SHARD '+JSON.stringify({platform:report.platform,part,assigned:report.assigned,checked:report.checked,skipped:report.skipped,passed:report.passed,failed:report.failed}));
if(report.failed)process.exitCode=1;
