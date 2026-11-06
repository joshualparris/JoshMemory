// Real WebGL screenshot check for the user-reported Narromine Hotel trees.
// The matching tree-position assertion is in narromine-hotel-tree-sightlines.mjs.
// Screenshots show the actual game view; Google Street View pixels are never copied.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { positionAndMeasureInPage, startStaticServer } from '../tools/narromine-visual-qa/run.mjs';

const dest = process.env.NARROMINE_HOTEL_TREE_QA_DIR || 'test-results/narromine-hotel-trees';
fs.mkdirSync(dest, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const server = await startStaticServer(path.resolve('dist/public'));
// Baseline #489 mobile screenshot was almost entirely the near wall (22 KB); roof branch 17 KB.
// Move this staged viewpoint 12 m east to the open street approach without relaxing image acceptance.
const cameraLocations = [
  { id: 'south-east-corner', x: -4791, z: -703, targetX: -4824.5, targetZ: -721.5 },
  { id: 'hotel-dandaloo-front', x: -4800, z: -716, targetX: -4825, targetZ: -716 },
  { id: 'hotel-dandaloo-north', x: -4802, z: -729, targetX: -4825, targetZ: -729 },
];
const lookAtYaw = (a) => Math.atan2(-(a.targetX-a.x), -(a.targetZ-a.z));
try {
  for (const [label, options] of [
    ['desktop',{viewport:{width:1280,height:800},deviceScaleFactor:1}],
    ['android',{viewport:{width:393,height:852},deviceScaleFactor:1,isMobile:true,hasTouch:true}],
  ]) {
    const page=await browser.newPage(options), errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>sessionStorage.setItem('town-cheats','1'));
    await page.route('**/api/npc-chat',route=>route.abort('connectionrefused'));
    await page.goto(server.url);
    await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,null,{timeout:90000});
    for(const camera of cameraLocations) {
      const result=await positionAndMeasureInPage(page,{
        x:camera.x,z:camera.z,yawRad:lookAtYaw(camera),
        eyeHeightM:1.65,pitchRad:0.07,fovDeg:72,
        minute:12.5*60,weather:'clear',sampleFrames:6,hideHud:true,
      });
      assert(result.narromineVisible,label+'/'+camera.id+' actual Narromine 3D chunk is visible');
      assert(result.state.triangles>1500,label+'/'+camera.id+' scene is not empty');
      const shot=path.join(dest,label+'-'+camera.id+'.png');
      await page.screenshot({path:shot});
      assert(fs.statSync(shot).size>20000,'real WebGL frame screenshot '+shot);
    }
    assert.deepEqual(errors,[],label+' has no Chromium page errors');
    await page.close();
    console.log('PASS Narromine Hotel roadside '+label+': three rendered viewpoints, zero browser errors');
  }
} finally {
  await browser.close();
  await server.close();
}
