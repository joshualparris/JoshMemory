import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium, devices } from 'playwright';
const base=process.env.TOWN_URL || 'http://localhost:8127/';
const out='test-results/narromine-regulatory-signs';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[];
try {
 for(const [device,options] of [['desktop',{viewport:{width:1100,height:760}}],['android',devices['Pixel 7']]]) {
  const context=await browser.newContext(options),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/__qa-signs',route=>route.fulfill({contentType:'text/html',body:`<style>body{margin:0}</style><script type="importmap">{"imports":{"three":"/vendor/three.module.min.js","three/addons/utils/BufferGeometryUtils.js":"/vendor/BufferGeometryUtils.js"}}</script>`}));
  await page.goto(new URL('__qa-signs',base).href);
  const init=await page.evaluate(async()=>{
   const THREE=await import('/vendor/three.module.min.js');
   const {buildNarromineMapillaryObjects}=await import('/world/narromine-mapillary-objects.js');
   const {NARROMINE_MAPILLARY_OBJECTS:objects}=await import('/world/narromine-mapillary-data.js');
   const {drawRegulatorySignAtlas}=await import('/world/narromine-regulatory-signs.js');
   const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
   renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(1); document.body.append(renderer.domElement);
   const scene=new THREE.Scene();scene.background=new THREE.Color('#8fa5b0');
   scene.add(new THREE.AmbientLight(0xffffff,2));
   const root=new THREE.Group();scene.add(root);const counts=buildNarromineMapillaryObjects(root);
   const camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.05,20000);
   const canvas=drawRegulatorySignAtlas(document.createElement('canvas'));
   const g=canvas.getContext('2d');
   const pixel=(x,y)=>Array.from(g.getImageData(x,y,1,1).data);
   // Semantic colour anchors: stop field, give-way interior, no-entry white bar/red disk.
   const pixels={stop:pixel(256,100),giveway:pixel(768,100),bar:pixel(768,840),disk:pixel(768,940)};
   window.signQA=(type,rear=false)=>{
    const o=objects.find(o=>o.type===type),yaw=Math.atan2(o.ux*o.facing,o.uz*o.facing);
    const y=(['keepLeft','noEntry'].includes(type)?1.6:2.2)+.1;
    const dir=rear?-1:1;camera.position.set(o.x+Math.sin(yaw)*2.8*dir,y,o.z+Math.cos(yaw)*2.8*dir);
    camera.lookAt(o.x,y,o.z);renderer.render(scene,camera);
    return {id:o.id,type,sourceDate:o.seen,x:o.x,z:o.z,yaw,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
   };
   return {counts,pixels};
  });
  assert(init.pixels.stop[0]>150 && init.pixels.stop[1]<70,'STOP red field');
  assert(init.pixels.giveway[0]>200 && init.pixels.giveway[1]>200,'GIVE WAY white interior');
  assert(init.pixels.bar[0]>200 && init.pixels.bar[1]>200,'NO ENTRY white bar');
  assert(init.pixels.disk[0]>150 && init.pixels.disk[1]<70,'NO ENTRY red disc');
  for(const type of ['stop','giveway','keepLeft','noEntry']) {
   const result=await page.evaluate(t=>window.signQA(t),type);
   await page.screenshot({path:`${out}/${device}-${type}.png`});results.push({device,...result});
  }
  await page.evaluate(()=>window.signQA('stop',true));
  await page.screenshot({path:`${out}/${device}-stop-rear.png`});
  assert.deepEqual(errors,[],device+' no page errors');
  await context.close();
 }
 await fs.writeFile(out+'/manifest.json',JSON.stringify({scope:'Existing observation-data objects rendered through the actual merged world builder; close-up source-sign views, not a continuous town walk or photo-match',results},null,2));
 console.log('PASS actual WebGL: 8 sign fronts + 2 unlettered rear views; desktop and Pixel 7 emulation; atlas colour checks; no page errors');
}finally{await browser.close();}
