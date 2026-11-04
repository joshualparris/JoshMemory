// NR-REAL-002 — actually attempt ten Narromine walking segments in real Chromium WebGL.
// These are TEN local physical on-foot segments. Teleports BETWEEN test segments are
// staging and must never be counted as the route being physically traversed.
// Browser-discovered navigation defects are recorded with exact end positions;
// do not falsify evidence by forcing the player into a destination on failure.
// Usage: npm run build && node tests/narromine-real-002-walking-audit-browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startStaticServer } from '../tools/narromine-visual-qa/run.mjs';

const args = process.argv;
const i = args.indexOf('--url');
const requestedUrl = i >= 0 ? args[i + 1] : process.env.TOWN_URL || '';
const outDir = process.env.NARROMINE_REAL_002_OUTPUT || 'test-results/narromine-real-002';
const onlyMobile = args.includes('--mobile');
fs.mkdirSync(outDir, { recursive: true });
const server = requestedUrl ? null : await startStaticServer(path.resolve('dist/public'));
const url = requestedUrl || server.url;
const hasSystemChrome = fs.existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe');
const browser = await chromium.launch({
  channel: process.env.PW_CHANNEL || (hasSystemChrome ? 'chrome' : undefined),
  args: hasSystemChrome ? [] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

const round = (n) => Number(Number(n).toFixed(3));
const yaw = ([x, z], [tx, tz]) => Math.atan2(-(tx - x), -(tz - z));
const routeId = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function routeManifest(page) {
  return page.evaluate(async () => {
    // These coordinates are taken from previously verified scene tests and the
    // canonical geospatial modules. Do not assign invented addresses.
    const { KIERATHS_ROUTE, siteToGeo } = await import('./world/narromine-kieraths-data.js');
    const { geoToWorld, STREETS, PLACES } = await import('./world/narromine-layout.js');
    const { royalToWorld } = await import('./world/narromine-royal-hotel.js');
    const footClear = (p) => !window.__town.probeStatic(p[0], p[1], .36);
    const approach = (destination, preferred = 6) => {
      for (const d of [preferred, 4, 8, 2]) {
        for (const angle of [0, Math.PI, Math.PI / 2, -Math.PI / 2, Math.PI / 4, -Math.PI / 4]) {
          const pt = [destination[0] + d * Math.cos(angle), destination[1] + d * Math.sin(angle)];
          if (footClear(pt)) return pt;
        }
      }
      return [destination[0] + 4, destination[1]];
    };
    const loc = (name) => PLACES.find(p => p.name.toLowerCase() === name.toLowerCase());
    const placePt = (name) => {
      const p = loc(name);
      if (!p) return null;
      return [p.x, p.z];
    };
    const parish = window.__town.stMarysEntrance();
    const post = window.__town.narrominePostOfficeEntrance();
    const coles = window.__town.narromineColesEntrance();
    const kieraths = [...KIERATHS_ROUTE].reverse().map(p => geoToWorld(...siteToGeo(p)));
    // A residential street segment is chosen from OSM roads; before movement
    // all endpoints are checked against live collision data. No real-world
    // footpath is implied merely because a road centreline is clear.
    let residential = null;
    for (const s of STREETS) {
      if (!/residential|living_street/i.test(s.kind || '')) continue;
      if (!s.pts || s.pts.length < 2) continue;
      for (let j = 1; j < s.pts.length; j++) {
        const a = s.pts[j - 1], b = s.pts[j];
        const length = Math.hypot(a[0] - b[0], a[1] - b[1]);
        if (length < 11) continue;
        const start = [a[0] + (b[0] - a[0]) * .2, a[1] + (b[1] - a[1]) * .2];
        const end = [a[0] + (b[0] - a[0]) * .55, a[1] + (b[1] - a[1]) * .55];
        const nearCentre = Math.hypot(start[0] + 4760, start[1] + 1050);
        if (nearCentre < 170 || nearCentre > 1900) continue;
        if (Math.hypot(...start) < 100 || !footClear(start) || !footClear(end)) continue;
        residential = { id: 'NR-WALK-009', label: 'Mapped residential street', start, points: [end],
          source: 'OSM highway=residential geometry; road centreline only, not verified pavement',
          street: s.name || s.kind, photo: null };
        break;
      }
      if (residential) break;
    }
    const hotel = placePt('Narromine Hotel');
    const hotelTarget = hotel ? approach(hotel, 6) : [-4770, -715];
    const postTarget = [post.outside.x, post.outside.z];
    const colesTarget = [coles.outside.x, coles.outside.z];
    const mapped = [
      { id:'NR-WALK-001', label:"St Mary's Anglican Church approach", start:approach([parish.outside.x, parish.outside.z]), points:[[parish.outside.x, parish.outside.z]], source:"Modelled entrance + real-world local approach (candidate unsurveyed)", photo:null },
      { id:'NR-WALK-002', label:'Royal Hotel Dandaloo veranda', start:royalToWorld(2,-1.85), points:[royalToWorld(8,-1.85),royalToWorld(15,-1.85)], source:'LiDAR/cadastre-based Royal Hotel veranda local frame', photo:'Owner comparison #1 is Narromine Hotel, not Royal Hotel; use hotel-specific references' },
      { id:'NR-WALK-003', label:'Narromine Railway Station forecourt', start:[-4722.0,-711.5], points:[[-4712.4,-710.8],[-4708.8,-710.2]], source:'Railway browser test previously verified station access road', photo:null },
      { id:'NR-WALK-004', label:'Narromine Hotel streetside', start:approach(hotelTarget,5), points:[hotelTarget], source:'Named OSM hotel place + estimated nearby candidate sidewalk, not survey', photo:'Owner comparison #1' },
      { id:'NR-WALK-005', label:'Narromine Post Office approach', start:approach(postTarget,5), points:[postTarget], source:'Actual in-game public post office entrance and outside point', photo:null },
      { id:'NR-WALK-006', label:'Kierath Square both entrances and Coles approach', start:kieraths[0], points:kieraths.slice(1), source:'Canonical KIERATHS_ROUTE Dandaloo entrance through arcade to rear, and independently staged Coles public approach', photo:'Owner 55-view main street collection; exact viewpoint calibration pending', colesOutside:colesTarget, colesStart:approach(colesTarget,5) },
      { id:'NR-WALK-007', label:'North-west Dandaloo footpath', start:[-4770,-980], points:[[-4768,-996]], source:'Existing north-west Dandaloo Chromium verification test', photo:'Owner comparisons #34–50' },
      { id:'NR-WALK-008', label:'Civic former courthouse approach', start:[-4595,-760], points:[[-4590.5,-766.5]], source:'Existing courthouse Chromium verification test, 35 Burraway Street', photo:null },
      residential || { id:'NR-WALK-009', label:'Residential street route candidate not found', start:[0,0], points:[], source:'No collision-clear OSM residential centreline segment located', photo:null },
      { id:'NR-WALK-010', label:'Aviation Museum visitor entrance', start:[-5726.5,-2040.5], points:[[-5722.5,-2052.5]], source:'Existing Aviation Museum Chromium visitor-entry test', photo:null },
    ];
    return mapped;
  });
}

async function executeRoute(page, route, tag, errors) {
  const record = {
    id: route.id, label: route.label, source: route.source, comparison: route.photo,
    viewport: tag, startedByTeleport: true, physicalLegsAttempted: 0, physicalLegsPassed: 0,
    start: route.start, intendedWaypoints: route.points, path: [],
    status: 'PENDING', defect: null, browserErrors: [], screenshot: null,
  };
  const errorsBefore = errors.length;
  const name = tag + '-' + routeId(route.id + '-' + route.label);
  const shot = path.posix.join(outDir, name + '.png');
  try {
    if (!route.points.length) throw new Error('No evidenced residential street candidate');
    // Scene streaming/mesh visibility updates on later animation frames.
    // St Mary's screenshot showed actual geometry even when the same-frame
    // narromineVisible flag was false, so wait before classifying a defect.
    await page.evaluate(([x,z,y]) => window.__town.place(x,z,y), [...route.start, yaw(route.start,route.points[0])]);
    await page.waitForFunction(() => window.__town.narromineVisible(), null, { timeout: 12000 }).catch(() => {});
    const initial = await page.evaluate(([x, z, y]) => {
      window.__town.closePanel?.();
      const s=window.__town.state();
      return { pos:s.pos, mode:s.mode, visible:window.__town.narromineVisible(),
        triangles:s.triangles || 0, originBlocked:!!window.__town.probeStatic(x,z,.36) };
    },[...route.start, yaw(route.start,route.points[0])]);
    record.initial = initial;
    if (!initial.visible || initial.triangles < 1000) throw new Error('Live Narromine WebGL scene is not visible');
    if (initial.mode !== 'town') throw new Error('Staging position automatically entered interior: '+initial.mode);
    if (initial.originBlocked) throw new Error('Staging position is inside collider');

    for (let leg=0;leg<route.points.length;leg++) {
      const target=route.points[leg];
      const before=await page.evaluate(() => {
        const p=window.__town.state().pos; return {x:p.x,z:p.z,mode:window.__town.state().mode};
      });
      const step={leg:leg+1,from:[round(before.x),round(before.z)],to:target,distance:round(Math.hypot(before.x-target[0],before.z-target[1])),accepted:null,reached:false,observedMovementM:0};
      record.physicalLegsAttempted++;
      step.accepted=await page.evaluate(([x,z])=>window.__town.walkTo(x,z),target);
      if(step.accepted!==null){record.path.push(step);throw new Error('walkTo refused leg '+(leg+1)+': '+step.accepted);}
      const startTime=Date.now();
      try {
        await page.waitForFunction(([x,z])=>{
          const state=window.__town.state(),p=state.pos;
          return Math.hypot(p.x-x,p.z-z)<1.25;
        },target,{timeout: Math.min(33000,Math.max(9500,Math.ceil(step.distance*2000)))});
        step.reached=true;
        record.physicalLegsPassed++;
      } catch {
        step.reached=false;
      }
      const after=await page.evaluate(() => {
        const s=window.__town.state();return {pos:s.pos,mode:s.mode,autoWalk:window.__town.autoWalk()};
      });
      step.durationMs=Date.now()-startTime;
      step.actual=[round(after.pos.x),round(after.pos.z)];
      step.observedMovementM=round(Math.hypot(after.pos.x-before.x,after.pos.z-before.z));
      step.finalErrorM=round(Math.hypot(after.pos.x-target[0],after.pos.z-target[1]));
      step.finalMode=after.mode;
      step.autoWalkActive=!!after.autoWalk;
      record.path.push(step);
      if(!step.reached)throw new Error('Player failed to reach leg '+(leg+1)+', remaining '+step.finalErrorM+'m');
      if(step.distance>2.5 && step.observedMovementM<Math.min(1,step.distance*.2))
        throw new Error('Destination reached without physical player movement');
      if (after.mode !== 'town') {
        // Aviation entry legitimately enters a public walkable hangar, but the
        // strict audit records transitions rather than masking them.
        record.modeTransition = after.mode;
      }
    }
    // Coles is not on the Kierath's through-walk: stage a second local
    // pedestrian subroute and do NOT count the intervening teleport as walked.
    if (route.colesOutside) {
      const extra = {
        leg:'Coles public approach (independently staged)', stagedByTeleport:true,
        from:route.colesStart, to:route.colesOutside,
        distance:round(Math.hypot(route.colesOutside[0]-route.colesStart[0],route.colesOutside[1]-route.colesStart[1])),
        accepted:null, reached:false,
      };
      record.independentSubroute='Coles nearby footpath to actual public entrance';
      await page.evaluate(([x,z,y])=>window.__town.place(x,z,y),[...route.colesStart,yaw(route.colesStart,route.colesOutside)]);
      await page.waitForFunction(()=>window.__town.narromineVisible(),null,{timeout:5000}).catch(()=>{});
      const p0=await page.evaluate(()=>window.__town.state().pos);
      record.physicalLegsAttempted++;
      extra.accepted=await page.evaluate(([x,z])=>window.__town.walkTo(x,z),route.colesOutside);
      if(extra.accepted!==null) {
        record.path.push(extra);
        throw new Error('Coles approach refused: '+extra.accepted);
      }
      try {
        await page.waitForFunction(([x,z])=>{const p=window.__town.state().pos;return Math.hypot(p.x-x,p.z-z)<1.25;},
          route.colesOutside,{timeout:16000});
        extra.reached=true;record.physicalLegsPassed++;
      } catch {}
      const p1=await page.evaluate(()=>window.__town.state().pos);
      extra.observedMovementM=round(Math.hypot(p1.x-p0.x,p1.z-p0.z));
      extra.finalErrorM=round(Math.hypot(p1.x-route.colesOutside[0],p1.z-route.colesOutside[1]));
      record.path.push(extra);
      if(!extra.reached||extra.observedMovementM<1)throw new Error('Coles public entrance approach failed: '+extra.finalErrorM+'m remaining');
    }
    record.status='PASS_PHYSICALLY_WALKED';
  } catch(e) {
    record.status='DEFECT_OR_UNVERIFIED';
    record.defect=String(e?.message || e);
  }
  record.browserErrors=errors.slice(errorsBefore);
  if(record.browserErrors.length) {
    record.status='DEFECT_OR_UNVERIFIED';
    record.defect=(record.defect?record.defect+'; ':'')+'Browser page errors: '+record.browserErrors.join('; ');
  }
  try {
    if (route.id === 'NR-WALK-006') {
      // Face BACK along Kierath's after successful transit; a final camera
      // pointed at the adjacent empty lane hid the very arcade under review.
      // Rotate only, don't move; screenshot is supplemental visual evidence.
      const target = route.start;
      if (record.status==='PASS_PHYSICALLY_WALKED') {
        const actual=await page.evaluate(()=>window.__town.state().pos);
        const lookPoint=route.colesOutside ? route.colesStart : target;
        await page.evaluate(([x,z,y])=>window.__town.place(x,z,y),
          [actual.x,actual.z,yaw([actual.x,actual.z],lookPoint)]);
        record.cameraRotationOnly = true;
        await page.waitForTimeout(200);
      }
    }
    await page.screenshot({path:shot,timeout:15000});
    record.screenshot=shot;
  } catch(e) {
    record.status='DEFECT_OR_UNVERIFIED';
    record.defect=(record.defect?record.defect+'; ':'')+'Screenshot: '+String(e.message);
  }
  return record;
}

const report = {
  schemaVersion:1, task:'NR-REAL-002', outcome:'UNVERIFIED', environment:'Chromium WebGL',
  sourceCommit:process.env.GITHUB_SHA || process.env.SOURCE_SHA || 'local-unrecorded',
  browserUrl:requestedUrl ? 'user-provided-hosted-url' : 'local-built-dist',
  method:'Each area teleports to a test start; physically walks each local path with game walkTo; inter-area traversal NOT tested',
  resultDisclaimer:'A 393x852 Chromium viewport is not real Android hardware; photography is an external review reference, no Google imagery copied.',
  viewports:[],
};
try {
  for(const mobile of onlyMobile?[true]:[false,true]){
    const tag=mobile?'android-size-chromium':'desktop-chromium';
    const page=await browser.newPage(mobile
      ? {viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:1}
      : {viewport:{width:1280,height:800},deviceScaleFactor:1});
    const errors=[];
    page.on('pageerror',e=>errors.push(String(e.message)));
    await page.addInitScript(()=>sessionStorage.setItem('town-cheats','1'));
    await page.route('**/api/npc-chat',r=>r.abort('connectionrefused'));
    const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
    assert.equal(response?.status(),200,'game build serves HTTP 200');
    await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,null,{timeout:90000});
    await page.evaluate(()=>{
      window.__town.life.setTime(10.5*60);
      const toggle=document.getElementById('btn-hud-toggle');
      if(toggle&&toggle.getAttribute('aria-expanded')==='true')toggle.click();
    });
    const routes=await routeManifest(page);
    assert.equal(routes.length,10,'exactly ten geographically sourced audit segments');
    const viewport={name:tag,size:mobile?[393,852]:[1280,800],results:[]};
    report.viewports.push(viewport);
    for (const route of routes) {
      const result=await executeRoute(page,route,tag,errors);
      viewport.results.push(result);
      const summary=result.status==='PASS_PHYSICALLY_WALKED'?'PASS':'GAP';
      console.log(summary+' '+tag+' '+route.id+' '+route.label+(result.defect?' — '+result.defect:''));
    }
    viewport.pageErrors=errors;
    await page.close();
  }
  const all=report.viewports.flatMap(v=>v.results);
  report.passed=all.filter(r=>r.status==='PASS_PHYSICALLY_WALKED').length;
  report.gaps=all.filter(r=>r.status!=='PASS_PHYSICALLY_WALKED').length;
  report.outcome=report.gaps===0?'10/10 LOCAL ROUTES PASS ON BOTH CHROMIUM VIEWPORTS':'PARTIAL; REVIEW RECORDED WALK DEFECTS';
  console.log(JSON.stringify({outcome:report.outcome,passed:report.passed,gaps:report.gaps,total:all.length},null,2));
} finally {
  fs.writeFileSync(path.join(outDir,'audit.json'),JSON.stringify(report,null,2)+'\n');
  await browser.close();
  if(server)await server.close();
}
// An audited defect should not make CI discard the report; artifact is required
// for triage and a separate strict gate can enforce zero defects once fixed.
// Catastrophic browser/runtime startup errors still fail via thrown assertion.
