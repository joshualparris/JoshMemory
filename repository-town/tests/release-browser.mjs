import assert from 'node:assert/strict';
import {chromium,devices} from 'playwright';
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
try {
  for(const options of [{viewport:{width:1000,height:750}},devices['Pixel 7']]) {
    const context=await browser.newContext(options);
    const page=await context.newPage();
    await page.goto('http://localhost:8091/release.html');
    await page.waitForFunction(()=>document.getElementById('version').textContent.startsWith('Version '));
    await page.evaluate(()=>{localStorage.setItem('repository-town.groq-keys','never-export');localStorage.setItem('unrelated','keep');localStorage.setItem('repository-town.save.v2',JSON.stringify({pos:{x:1,z:2},yaw:0}));});
    const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Download saved progress'}).click();
    const download=await downloaded;assert.match(download.suggestedFilename(),/repository-town-progress/);
    const snapshot={format:'repository-town-progress',version:1,entries:{'repository-town.save.v2':JSON.stringify({pos:{x:6,z:7},yaw:1})}};
    await page.locator('#file').setInputFiles({name:'progress.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(snapshot))});
    await page.waitForFunction(()=>!document.getElementById('import').disabled);
    await page.getByRole('button',{name:'Back up current progress and import'}).click();
    await page.waitForFunction(()=>document.getElementById('message').textContent.startsWith('Imported'));
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('repository-town.save.v2')).pos.x),6);
    assert.equal(await page.evaluate(()=>localStorage.getItem('unrelated')),'keep');
    await page.locator('#file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...snapshot,entries:{'repository-town.groq-keys':'"bad"'}}))});
    await page.waitForFunction(()=>document.getElementById('message').textContent.includes('unsupported'));
    assert.equal(await page.evaluate(()=>localStorage.getItem('repository-town.groq-keys')),'never-export');
    assert(await page.locator('#import').isDisabled());
    await page.goto('http://localhost:8091/backup-unified/');
    assert.equal(await page.getByRole('heading').textContent(),'Repository Town has one main home');
    const legacyDownload=page.waitForEvent('download');await page.getByRole('button',{name:'Download saved progress'}).click();await legacyDownload;
    await context.close();
  }
  console.log('PASS: desktop and Android version display, export, import, credential rejection and archived-path handover');
} finally {await browser.close();}
