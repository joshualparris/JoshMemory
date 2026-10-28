import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const url=process.env.TOWN_URL||'http://localhost:8091/';
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
  for(const mobile of [false,true]){
    const context=await browser.newContext({viewport:{width:mobile?390:640,height:mobile?844:480},deviceScaleFactor:.5,isMobile:mobile,hasTouch:mobile});
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url);const ready=()=>page.waitForFunction(()=>window.__town&&document.querySelector('#loading').hidden,null,{timeout:120000});await ready();
    assert.equal(await page.locator('#settings').isHidden(),true,'instant start, no settings gate');
    const inv=()=>page.evaluate(()=>window.__town.inventory());
    const ground=()=>page.evaluate(()=>window.__town.groundItems());
    const use=async()=>{if(mobile)await page.locator('#t-use').tap();else{await page.evaluate(()=>document.activeElement?.blur());await page.keyboard.press('e');}};
    const approach=async item=>{
      await page.evaluate(i=>{window.__town.closePanel();window.__town.place(i.x,i.z+1.1,0);},item);
      await page.waitForFunction(()=>!document.querySelector('#prompt').hidden&&/Pick up the torch/.test(document.querySelector('#prompt').textContent),null,{timeout:15000});
    };
    const openBag=async()=>{await page.evaluate(()=>document.querySelector('#btn-bag').click());await page.waitForFunction(()=>!document.querySelector('#panel').hidden&&/Your bag/.test(document.querySelector('#panel-title').textContent));};
    const clickAction=async text=>{const button=page.locator('#panel-actions button').filter({hasText:text});if(mobile)await button.tap();else await button.click();};
    const starter=(await ground())[0];assert(starter);await approach(starter);await use();
    await page.waitForFunction(()=>window.__town.inventory().items.length===1);
    assert.equal((await ground()).length,0);assert.equal((await inv()).held,'torch');
    // Repeated Use cannot grant another copy.
    await use();assert.equal((await inv()).items.length,1);
    await openBag();await clickAction('Switch torch on');assert.equal((await inv()).torchOn,true);
    // Stand on open street so Drop has clear, supported ground.
    await page.evaluate(()=>{window.__town.closePanel();window.__town.place(10,9,0);});
    await openBag();await clickAction('Drop the torch');
    assert.equal((await inv()).items.length,0);assert.equal((await inv()).held,null);assert.equal((await inv()).torchOn,false);
    const dropped=(await ground())[0];assert.equal(dropped.id,starter.id);assert.equal(dropped.location,'town');
    // The actual simulation save is already written, not dependent on its periodic timer.
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('repository-town.life.v1')).life.civic.player.groundItems.length),1);
    await page.reload();await ready();assert.deepEqual(await ground(),[dropped]);assert.equal((await inv()).items.length,0);
    await approach(dropped);await use();await page.waitForFunction(()=>window.__town.inventory().items.length===1);assert.equal((await ground()).length,0);
    // Put away is also saved immediately, and no starter respawns on reload.
    await openBag();await clickAction('Put away');await page.reload();await ready();
    assert.equal((await inv()).items.length,1);assert.equal((await inv()).held,null);assert.equal((await ground()).length,0);
    // Drop into A1, exit and re-enter: the item belongs to that location, not town coordinates.
    await page.evaluate(()=>{window.__town.closePanel();window.__town.enterHome('A1');});
    const placed=await page.evaluate(()=>{const t=window.__town;const s=t.state();for(let z=-5;z<5;z+=.5)for(let x=-5;x<5;x+=.5){if(!t.probeStatic(x,z,.4)&&!t.probeStatic(x,z-.85,.2)){t.place(x,z,0);return true;}}return false;});assert(placed);
    await openBag();await clickAction('Drop the torch');
    const indoor=(await ground())[0];assert.equal(indoor.location,'house:A1:floor:0');
    await page.evaluate(()=>{window.__town.closePanel();window.__town.exitShop?.();window.__town.travel('B1');});
    assert.equal((await inv()).items.length,0);
    await page.evaluate(()=>window.__town.enterHome('A1'));await approach(indoor);await use();
    await page.waitForFunction(()=>window.__town.inventory().items.length===1);
    assert.equal((await ground()).length,0);
    assert.deepEqual(errors,[]);console.log('PASS item foundation '+(mobile?'phone':'desktop')+': instant play, real Use/Bag, torch, conserved drop/pickup, immediate save, reload, interior ownership');
    await context.close();
  }
}finally{await browser.close();}
