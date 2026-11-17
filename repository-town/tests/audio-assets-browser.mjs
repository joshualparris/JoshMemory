import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ids=['whispering-wilds-web','midnight-line'];
try{
for(const id of ids){
const page=await browser.newPage({viewport:{width:1200,height:800}});
const http=[],exceptions=[];
page.on('response',r=>{if(r.status()>=400&&r.url().startsWith('http://127.0.0.1:8734'))http.push(r.status()+' '+new URL(r.url()).pathname);});
page.on('pageerror',e=>exceptions.push(e.message));
try{
 const resp=await page.goto('http://127.0.0.1:8734/games/'+id+'/index.html',{waitUntil:'domcontentloaded',timeout:30000});
 assert.equal(resp.status(),200,id+' HTTP 200');
 await page.waitForTimeout(2300);
 const body=await page.locator('body').innerText();
 assert.ok(body.length>25,id+' content rendered');
 assert.deepEqual(http,[],id+' requested missing static resources');
 assert.deepEqual(exceptions,[],id+' has uncaught exceptions');
 console.log('PASS '+id+' — game loads without nonexistent audio files, service worker or runtime exceptions');
}finally{await page.close()}
}
}finally{await browser.close()}
