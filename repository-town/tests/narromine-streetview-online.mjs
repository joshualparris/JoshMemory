import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';
import { buildOnline } from '../tools/narromine-visual-qa/live-streetview/build-online.mjs';

const publicRoot=fs.mkdtempSync(path.join(os.tmpdir(),'narromine-streetview-online-'));
const write=(name,content)=>{const p=path.join(publicRoot,name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,content);};
write('index.html', '<html><head><title>Test game</title></head><body><canvas id="scene"></canvas><script>window.__town={state:()=>({pos:{x:-1,z:-2}}),place:()=>{},life:{speed:()=>{},setTime:()=>{}}};</script></body></html>');
let browser,server;
try {
  const result=buildOnline({publicRoot});
  assert.equal(result.cameraPresets,6);
  for(const asset of ['index.html','styles.css','app.js','api/presets.json']){
    const p=path.join(publicRoot,'_streetview',asset);
    assert(fs.statSync(p).isFile(),asset+' exists in hosted output');
    assert(!/AIza[0-9A-Za-z_-]{30,}/.test(fs.readFileSync(p,'utf8')),asset+' contains no browser API key');
  }
  const data=JSON.parse(fs.readFileSync(path.join(publicRoot,'_streetview/api/presets.json'),'utf8'));
  assert.equal(data.presets.length,6);
  const contentType={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
  server=http.createServer((req,res)=>{
    const url=new URL(req.url,'http://localhost');
    const rel=url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname;
    const root=path.resolve(publicRoot);
    const file=path.resolve(root,'.'+rel);
    if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
    try{const buf=fs.readFileSync(file);res.writeHead(200,{'content-type':contentType[path.extname(file)]||'application/octet-stream'});res.end(buf);}
    catch{res.writeHead(404);res.end();}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const page=await browser.newPage();
  const thirdPartyRequests=[],errors=[];
  page.on('request',q=>{if(q.url().startsWith('https://maps.googleapis.com'))thirdPartyRequests.push(q.url());});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/_streetview/index.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.getElementById('location').options.length===6);
  assert.equal(thirdPartyRequests.length,0,'hosted public page makes no Google requests without consent');
  assert.match(await page.locator('#cost-summary').textContent(),/0 panorama instantiations/);
  assert.match(await page.locator('#status').textContent(),/Google has NOT been contacted/);
  assert.deepEqual(errors,[],'static hosted app initialises without browser errors');
  console.log('PASS: static hosted comparison builds 6 camera presets and serves the actual UI alongside game; zero Google requests before consent.');
} finally {
  if(browser)await browser.close();
  if(server)await new Promise(resolve=>server.close(resolve));
  fs.rmSync(publicRoot,{recursive:true,force:true});
}
