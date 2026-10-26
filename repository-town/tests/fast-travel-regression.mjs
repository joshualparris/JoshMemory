import { chromium, devices } from 'playwright';
const target = process.env.TOWN_TEST_URL || 'http://127.0.0.1:8080/';
const browser = await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
let failed = false;
for (const [name, options] of [['desktop',{viewport:{width:1280,height:800}}],['mobile',{...devices['Pixel 7']}]]) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.stack || e.message));
  page.on('console', m => {if(m.type()==='error') console.log(name,'console:',m.text().slice(0,500));});
  try {
    const response = await page.goto(target,{waitUntil:'domcontentloaded',timeout:45000});
    console.log(name,'HTTP',response?.status());
    await page.waitForFunction(()=>window.__town && document.getElementById('loading')?.hidden,{timeout:60000});
    await page.evaluate(()=>window.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true})));
    await page.fill('#search','Repo Public Library');
    await page.locator('#search-form').evaluate(form=>form.requestSubmit());
    await page.waitForTimeout(800);
    if(errors.length) throw Error(errors.join('\n'));
    const fatal = await page.locator('#loading.error').isVisible();
    if(fatal) throw Error(await page.locator('#loading-text').innerText());
    const state=await page.evaluate(()=>window.__town.state());
    console.log(name,'library travel state',JSON.stringify(state).slice(0,800));
    if(!state || !Number.isFinite(state.pos?.x ?? state.position?.x)) console.log(name,'position schema requires manual inspection');
    await page.screenshot({path:'test-results/fast-travel-'+name+'.png'});
  } catch(e) {
    failed=true;
    console.error(name,'FAILED',e.stack||e,errors);
    await page.screenshot({path:'test-results/fast-travel-'+name+'-failure.png'}).catch(()=>{});
  } finally {await context.close();}
}
await browser.close();
if(failed) process.exitCode=1;
