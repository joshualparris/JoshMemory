import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const ids=['hub-max','hub-simple-rpg-gh','hub-classic-dnd-text','hub-tile-game','ptshub-aa-game-adventure','ptshub-classic-dnd-text','hub-boundary-road','sylvie-phonetics'];
try{
 for(const id of ids){
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  const missing=new Set();const runtime=[];
  page.on('response',response=>{if(response.status()===404&&/joshhub-header|\/panos\/|content\/bundle\.json|\/src\/map\.json/.test(response.url()))missing.add(new URL(response.url()).pathname)});
  page.on('pageerror',err=>runtime.push(err.message));
  try{
    const response=await page.goto('http://127.0.0.1:8733/games/'+id+'/index.html',{waitUntil:'domcontentloaded',timeout:30000});
    assert.equal(response.status(),200,'Game loads '+id);
    await page.waitForTimeout(id==='hub-boundary-road'?1800:900);
    if(id==='hub-tile-game'){
      await page.locator('#btn-start').click();await page.waitForTimeout(650);
      assert.equal(await page.locator('#ui').evaluate(el=>getComputedStyle(el).display==='none'),true,'Tile Game enters play mode');
      assert.equal(await page.locator('#error').evaluate(el=>getComputedStyle(el).display==='none'),true,'No map load error');
    }
    assert.deepEqual([...missing],[],id+' should not request absent shared assets');
    assert.deepEqual(runtime,[],id+' should not throw');
    console.log('PASS '+id+': no missing resources or exceptions');
  }finally{await page.close();}
 }
}finally{await browser.close();}
