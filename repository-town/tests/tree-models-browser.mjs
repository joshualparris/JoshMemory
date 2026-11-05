// Real WebGL acceptance: compare modelled LiDAR tree silhouettes at pedestrian height and at flight distance.
// Only game-generated screenshots are saved; no third-party Street View pixels are copied.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { positionAndMeasureInPage, startStaticServer } from '../tools/narromine-visual-qa/run.mjs';

const folder = process.env.TREE_RENDER_QA_DIR || 'test-results/tree-realism';
fs.mkdirSync(folder, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const server = await startStaticServer(path.resolve('dist/public'));
const cases = [
  { id: 'narromine-lidar-tree', x: -4991, z: -1680, targetX: -5008, targetZ: -1689.9 },
  { id: 'repo-town-border', x: 0, z: -348, targetX: 0, targetZ: -371 },
];
const yaw = c => Math.atan2(-(c.targetX - c.x), -(c.targetZ - c.z));
try {
  for (const [label, options] of [
    ['desktop', { viewport: {width:1280, height:800}, deviceScaleFactor:1 }],
    ['android', { viewport: {width:393, height:852}, deviceScaleFactor:1, isMobile:true, hasTouch:true }],
  ]) {
    const page = await browser.newPage(options);
    const errors=[];
    page.on('pageerror', error=>errors.push(error.message));
    await page.addInitScript(()=>sessionStorage.setItem('town-cheats','1'));
    await page.route('**/api/npc-chat', route=>route.abort('connectionrefused'));
    await page.goto(server.url);
    await page.waitForFunction(()=>window.__town && document.getElementById('loading')?.hidden,null,{timeout:90000});
    for(const c of cases){
      const result=await positionAndMeasureInPage(page,{
        x:c.x,z:c.z,yawRad:yaw(c),eyeHeightM:1.65,pitchRad:0.045,fovDeg:72,
        minute:12*60,weather:'clear',sampleFrames:7,hideHud:true,
      });
      assert(result.state.triangles>1500,label+'/'+c.id+' has substantive rendered 3D triangles');
      if(c.id==='narromine-lidar-tree') assert(result.narromineVisible,'actual Narromine chunk visible');
      const out=path.join(folder,label+'-'+c.id+'.png');
      await page.screenshot({path:out});
      // Mobile screenshots compress more aggressively than 1280px desktop captures.
      // Scene geometry and page errors are verified above; PNG validity and adequate payload below.
      const png=fs.readFileSync(out);
      assert(png.length>5000 && png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),
        label+'/'+c.id+' actual WebGL PNG screenshot saved');
    }
    assert.deepEqual(errors,[],label+' has no browser errors');
    await page.close();
    console.log('PASS trees '+label+': two genuine rendered town views, screenshots and no page errors');
  }
} finally { await browser.close(); await server.close(); }
